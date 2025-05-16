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
// Payment model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Payment {
    id: String,
    user_id: String,
    amount: f64,
    currency: String,
    payment_type: String, // "fiat_to_crypto" or "crypto_to_fiat"
    status: String,
    crypto_address: Option<String>,
    crypto_currency: Option<String>,
    crypto_amount: Option<f64>,
    exchange_rate: Option<f64>,
    timestamp: DateTime<Utc>,
    metadata: Option<serde_json::Value>,
}

// User model
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    name: Option<String>,
    email: Option<String>,
}

// Payment request model
#[derive(Debug, Deserialize)]
struct CreatePaymentRequest {
    amount: f64,
    currency: String,
    payment_type: String,
    crypto_address: Option<String>,
    crypto_currency: Option<String>,
    metadata: Option<serde_json::Value>,
}

// Application state
struct AppState {
    payments: Mutex<Vec<Payment>>,
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
        "service": "payment-service"
    }))
}

// Get all payments handler
async fn get_payments(req: HttpRequest, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    
    // Get payments from state
    let payments = data.payments.lock().unwrap();
    
    // Filter payments by user ID
    let user_payments: Vec<Payment> = payments.iter()
        .filter(|payment| payment.user_id == user.id)
        .cloned()
        .collect();
    
    Ok(HttpResponse::Ok().json(user_payments))
}

// Get payment by ID handler
async fn get_payment_by_id(req: HttpRequest, path: web::Path<String>, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    let payment_id = path.into_inner();
    
    // Get payments from state
    let payments = data.payments.lock().unwrap();
    
    // Find payment by ID
    let payment = payments.iter()
        .find(|payment| payment.id == payment_id && payment.user_id == user.id);
    
    match payment {
        Some(payment) => Ok(HttpResponse::Ok().json(payment)),
        None => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Payment not found"
        }))),
    }
}

// Create payment handler
async fn create_payment(req: HttpRequest, payload: web::Json<CreatePaymentRequest>, data: web::Data<Arc<AppState>>) -> Result<HttpResponse, Error> {
    let user = extract_user(&req).await?;
    
    // Validate payment type
    if payload.payment_type != "fiat_to_crypto" && payload.payment_type != "crypto_to_fiat" {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid payment type. Must be 'fiat_to_crypto' or 'crypto_to_fiat'"
        })));
    }
    
    // Calculate exchange rate and crypto amount (in a real implementation, this would use an exchange API)
    let exchange_rate = match payload.crypto_currency.as_deref() {
        Some("BTC") => 50000.0,
        Some("ETH") => 3000.0,
        Some("USDC") => 1.0,
        _ => 1.0,
    };
    
    let crypto_amount = if payload.payment_type == "fiat_to_crypto" {
        Some(payload.amount / exchange_rate)
    } else {
        Some(payload.amount * exchange_rate)
    };
    
    // Create new payment
    let payment = Payment {
        id: Uuid::new_v4().to_string(),
        user_id: user.id.clone(),
        amount: payload.amount,
        currency: payload.currency.clone(),
        payment_type: payload.payment_type.clone(),
        status: "pending".to_string(),
        crypto_address: payload.crypto_address.clone(),
        crypto_currency: payload.crypto_currency.clone(),
        crypto_amount,
        exchange_rate: Some(exchange_rate),
        timestamp: Utc::now(),
        metadata: payload.metadata.clone(),
    };
    
    // Add payment to state
    {
        let mut payments = data.payments.lock().unwrap();
        payments.push(payment.clone());
    }
    
    // In a real implementation, this would initiate the payment process
    // For demo purposes, we'll just log the payment creation
    info!("Payment created: {}, Type: {}, Amount: {} {}, Crypto: {} {}", 
          payment.id, payment.payment_type, payment.amount, payment.currency, 
          payment.crypto_amount.unwrap_or(0.0), payment.crypto_currency.clone().unwrap_or_else(|| "N/A".to_string()));
    
    // Process payment (simulate async processing)
    let payment_id = payment.id.clone();
    let app_state = data.clone();
    tokio::spawn(async move {
        // Simulate payment processing delay
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        
        // Update payment status
        let mut payments = app_state.payments.lock().unwrap();
        if let Some(payment) = payments.iter_mut().find(|p| p.id == payment_id) {
            payment.status = "completed".to_string();
            info!("Payment completed: {}", payment_id);
        }
    });
    
    Ok(HttpResponse::Created().json(payment))
}

// Get exchange rates handler
async fn get_exchange_rates() -> impl Responder {
    // In a real implementation, this would fetch real-time exchange rates from an API
    // For demo purposes, we'll return static rates
    HttpResponse::Ok().json(serde_json::json!({
        "rates": {
            "BTC": 50000.0,
            "ETH": 3000.0,
            "USDC": 1.0,
            "USD": 1.0,
            "EUR": 0.85,
            "GBP": 0.75
        },
        "timestamp": Utc::now()
    }))
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
    let port = env::var("PORT").unwrap_or_else(|_| "8003".to_string());
    let bind_address = format!("0.0.0.0:{}", port);
    
    // Create application state
    let app_state = Arc::new(AppState {
        payments: Mutex::new(Vec::new()),
    });
    
    info!("Payment service starting on {}", bind_address);
    
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
                    .route("/payments", web::get().to(get_payments))
                    .route("/payments", web::post().to(create_payment))
                    .route("/payments/{id}", web::get().to(get_payment_by_id))
                    .route("/exchange-rates", web::get().to(get_exchange_rates))
            )
            .route("/health", web::get().to(health_check))
    })
    .bind(bind_address)?
    .run()
    .await
}
