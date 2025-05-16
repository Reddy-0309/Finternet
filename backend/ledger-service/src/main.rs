use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder, Result, Error, HttpRequest};
use chrono::{DateTime, Utc};
use dotenv::dotenv;
use hmac::{Hmac, Mac};
use jwt::VerifyWithKey;
use log::info;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::env;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

// Transaction model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Transaction {
    id: String,
    asset_id: String,
    asset_name: Option<String>,
    type_: String,
    from: Option<String>,
    to: Option<String>,
    status: String,
    timestamp: DateTime<Utc>,
    blockchain_data: Option<serde_json::Value>,
}

// User model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    name: Option<String>,
    email: Option<String>,
}

// Transaction request model
#[derive(Debug, Deserialize)]
struct CreateTransactionRequest {
    asset_id: String,
    asset_name: Option<String>,
    type_: String,
    from: Option<String>,
    to: Option<String>,
    blockchain_data: Option<serde_json::Value>,
}

// Application state
struct AppState {
    transactions: Mutex<Vec<Transaction>>,
}

// JWT claims
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

// Extract user from JWT token
async fn extract_user(req: &HttpRequest) -> Result<User, Error> {
    // Get token from Authorization header
    let auth_header = req.headers().get("Authorization")
        .ok_or_else(|| {
            actix_web::error::ErrorUnauthorized("Authorization header required")
        })?;
    
    let auth_str = auth_header.to_str().map_err(|_| {
        actix_web::error::ErrorUnauthorized("Invalid Authorization header")
    })?;
    
    // Remove "Bearer " prefix if present
    let token = if auth_str.starts_with("Bearer ") {
        &auth_str[7..]
    } else {
        auth_str
    };
    
    // Verify token
    let jwt_secret = get_jwt_secret();
    let key: Hmac<Sha256> = Hmac::new_from_slice(jwt_secret.as_bytes())
        .map_err(|_| actix_web::error::ErrorInternalServerError("Server error"))?;
    
    let claims: Claims = token.verify_with_key(&key)
        .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid token"))?;
    
    // Clone the subject ID to avoid ownership issues
    let user_id = claims.sub.clone();
    let user_id_suffix = if user_id.len() > 5 { &user_id[5..] } else { "unknown" };
    
    // In a real implementation, we would fetch the user from a database
    // For demo purposes, we'll create a user object from the token claims
    Ok(User {
        id: claims.sub,
        name: Some(format!("User {}", user_id_suffix)),
        email: Some(format!("user{}@example.com", user_id_suffix)),
    })
}

// Health check handler
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "ledger-service"
    }))
}

// Get all transactions handler
async fn get_transactions(req: HttpRequest, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    
    // Get transactions from state
    let transactions = data.transactions.lock().unwrap();
    
    // Filter transactions by user ID (from or to fields)
    let user_transactions: Vec<Transaction> = transactions.iter()
        .filter(|tx| {
            (tx.from.as_ref().map_or(false, |from| from == &user.id)) ||
            (tx.to.as_ref().map_or(false, |to| to == &user.id))
        })
        .cloned()
        .collect();
    
    Ok(HttpResponse::Ok().json(user_transactions))
}

// Get transaction by ID handler
async fn get_transaction_by_id(req: HttpRequest, path: web::Path<String>, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    let transaction_id = path.into_inner();
    
    // Get transactions from state
    let transactions = data.transactions.lock().unwrap();
    
    // Find transaction by ID
    let transaction = transactions.iter()
        .find(|tx| {
            tx.id == transaction_id && (
                (tx.from.as_ref().map_or(false, |from| from == &user.id)) ||
                (tx.to.as_ref().map_or(false, |to| to == &user.id))
            )
        });
    
    match transaction {
        Some(tx) => Ok(HttpResponse::Ok().json(tx)),
        None => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Transaction not found"
        }))),
    }
}

// Create transaction handler
async fn create_transaction(req: HttpRequest, payload: web::Json<CreateTransactionRequest>, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    
    // Create new transaction
    let transaction = Transaction {
        id: Uuid::new_v4().to_string(),
        asset_id: payload.asset_id.clone(),
        asset_name: payload.asset_name.clone(),
        type_: payload.type_.clone(),
        from: payload.from.clone().or(Some(user.id.clone())),
        to: payload.to.clone(),
        status: "completed".to_string(),
        timestamp: Utc::now(),
        blockchain_data: payload.blockchain_data.clone(),
    };
    
    // Add transaction to state
    {
        let mut transactions = data.transactions.lock().unwrap();
        transactions.push(transaction.clone());
    }
    
    // Log transaction creation
    info!("Transaction created: {}, Type: {}, Asset: {}", 
          transaction.id, transaction.type_, transaction.asset_id);
    
    Ok(HttpResponse::Created().json(transaction))
}

// Get JWT secret from environment or use default for development
fn get_jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| {
        // Default secret for development only - should match auth service
        "finternet-auth-service-dev-secret-key".to_string()
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();
    
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    
    // Get port from environment or use default
    let port = env::var("PORT").unwrap_or_else(|_| "8002".to_string());
    let bind_address = format!("0.0.0.0:{}", port);
    
    // Create application state
    let app_state = Arc::new(AppState {
        transactions: Mutex::new(Vec::new()),
    });
    
    info!("Ledger service starting on {}", bind_address);
    
    // Start HTTP server
    HttpServer::new(move || {
        // Configure CORS
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        
        App::new()
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .app_data(web::Data::new(app_state.clone()))
            .service(
                web::scope("/api")
                    .route("/transactions", web::get().to(get_transactions))
                    .route("/transactions", web::post().to(create_transaction))
                    .route("/transactions/{id}", web::get().to(get_transaction_by_id))
            )
            .route("/health", web::get().to(health_check))
    })
    .bind(bind_address)?
    .run()
    .await
}
