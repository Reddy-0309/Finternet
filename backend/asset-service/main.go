package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
)

// Asset represents a tokenized asset
type Asset struct {
	ID          string    `json:"id"`
	OwnerID     string    `json:"ownerId"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Value       float64   `json:"value"`
	Metadata    string    `json:"metadata,omitempty"`
	TokenID     string    `json:"tokenId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt,omitempty"`
}

// CreateAssetRequest represents the create asset request
type CreateAssetRequest struct {
	Name        string  `json:"name" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Description string  `json:"description"`
	Value       float64 `json:"value" binding:"required"`
	Metadata    string  `json:"metadata"`
}

// TransferAssetRequest represents the transfer asset request
type TransferAssetRequest struct {
	RecipientAddress string `json:"recipientAddress" binding:"required"`
}

// User represents the authenticated user
type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// In-memory asset store (replace with a database in production)
var assets = []Asset{}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default environment variables")
	}

	// Set default port if not specified
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	// Initialize Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "healthy",
				"service": "asset-service",
			})
		})

		assets := api.Group("/assets")
		assets.Use(authMiddleware())
		{
			assets.GET("/", getAssets)
			assets.GET("/:id", getAssetById)
			assets.POST("/", createAsset)
			assets.POST("/:id/transfer", transferAsset)
		}
	}

	// Start server
	log.Printf("Asset service starting on port %s in %s mode\n", port, os.Getenv("ENV"))
	r.Run(":" + port)
}

// getAssets returns all assets owned by the authenticated user
func getAssets(c *gin.Context) {
	user, _ := c.Get("user")
	userObj := user.(*User)

	// Filter assets by owner ID
	userAssets := []Asset{}
	for _, asset := range assets {
		if asset.OwnerID == userObj.ID {
			userAssets = append(userAssets, asset)
		}
	}

	c.JSON(http.StatusOK, userAssets)
}

// getAssetById returns a specific asset by ID
func getAssetById(c *gin.Context) {
	assetID := c.Param("id")
	user, _ := c.Get("user")
	userObj := user.(*User)

	// Find asset by ID
	var foundAsset *Asset
	for _, asset := range assets {
		if asset.ID == assetID && asset.OwnerID == userObj.ID {
			assetCopy := asset // Create a copy to avoid modifying the original
			foundAsset = &assetCopy
			break
		}
	}

	if foundAsset == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	c.JSON(http.StatusOK, foundAsset)
}

// createAsset creates a new tokenized asset
func createAsset(c *gin.Context) {
	var req CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	userObj := user.(*User)

	// Create new asset
	newAsset := Asset{
		ID:          generateAssetID(),
		OwnerID:     userObj.ID,
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		Value:       req.Value,
		TokenID:     generateTokenID(),
		CreatedAt:   time.Now(),
		Metadata:    req.Metadata,
	}

	// Add asset to store
	assets = append(assets, newAsset)

	// Simulate blockchain interaction (in a real implementation, this would mint the token)
	log.Printf("Asset created: %s, TokenID: %s, Owner: %s", newAsset.ID, newAsset.TokenID, userObj.ID)

	c.JSON(http.StatusCreated, newAsset)
}

// transferAsset transfers an asset to another user
func transferAsset(c *gin.Context) {
	assetID := c.Param("id")
	var req TransferAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	userObj := user.(*User)

	// Find asset by ID
	var assetIndex = -1
	for i, asset := range assets {
		if asset.ID == assetID && asset.OwnerID == userObj.ID {
			assetIndex = i
			break
		}
	}

	if assetIndex == -1 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found or not owned by you"})
		return
	}

	// In a real implementation, this would be a blockchain address
	// For demo purposes, we'll just use the last 8 characters of the address
	newOwnerID := "user_" + req.RecipientAddress[len(req.RecipientAddress)-8:]

	// Update asset
	assets[assetIndex].OwnerID = newOwnerID
	assets[assetIndex].UpdatedAt = time.Now()

	log.Printf("Asset transferred: %s, TokenID: %s, From: %s, To: %s",
		assets[assetIndex].ID, assets[assetIndex].TokenID, userObj.ID, newOwnerID)

	c.JSON(http.StatusOK, assets[assetIndex])
}

// authMiddleware protects routes that require authentication
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Remove Bearer prefix
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(getJWTSecret()), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(*jwt.RegisteredClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// For demo purposes, we'll extract user info from the token subject
		// In a real implementation, we'd verify with the auth service
		userID := claims.Subject
		
		// Create a user object from the token
		user := &User{
			ID: userID,
			Name: "User", // In a real implementation, we'd get this from the auth service
			Email: "user@example.com", // In a real implementation, we'd get this from the auth service
		}

		// Set user in context
		c.Set("user", user)
		c.Next()
	}
}

// getJWTSecret returns the JWT secret key from environment or default
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "finternet-auth-service-secret-key"
	}
	return secret
}

// generateAssetID creates a simple ID for demo purposes
// In production, use a proper UUID library
func generateAssetID() string {
	return "asset_" + time.Now().Format("20060102150405")
}

// generateTokenID creates a simple token ID for demo purposes
// In production, this would be a blockchain token ID
func generateTokenID() string {
	return "token_" + time.Now().Format("20060102150405")
}
