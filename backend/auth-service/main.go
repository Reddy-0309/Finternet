package main

import (
	"crypto/rand"
	"encoding/base32"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pquerna/otp/totp"
)

// User represents the user model
type User struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Email             string `json:"email"`
	Password          string `json:"password,omitempty"`
	MfaEnabled        bool   `json:"mfaEnabled"`
	MfaSecret         string `json:"mfaSecret,omitempty"`
	MfaVerified       bool   `json:"mfaVerified"`
	PreferredMfaType  string `json:"preferredMfaType,omitempty"` // "app", "email", or "sms"
}

// RegisterRequest represents the registration request
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest represents the login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	MfaCode  string `json:"mfaCode,omitempty"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token      string `json:"token"`
	User       User   `json:"user"`
	MfaRequired bool   `json:"mfaRequired,omitempty"`
}

// MfaSetupResponse represents the response for MFA setup
type MfaSetupResponse struct {
	Secret    string `json:"secret"`
	QrCodeUrl string `json:"qrCodeUrl"`
}

// MfaVerifyRequest represents the request to verify MFA code
type MfaVerifyRequest struct {
	Code string `json:"code" binding:"required"`
}

// MfaPreferenceRequest represents the request to update MFA preferences
type MfaPreferenceRequest struct {
	Enabled        bool   `json:"enabled"`
	PreferredType  string `json:"preferredType" binding:"required,oneof=app email sms"`
}

// In-memory user store (replace with a database in production)
var users = []User{}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default environment variables")
	}

	// Set default port if not specified
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
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
				"service": "auth-service",
			})
		})

		auth := api.Group("/auth")
		{
			auth.POST("/register", register)
			auth.POST("/login", login)
			auth.GET("/me", authMiddleware(), getMe)
			auth.POST("/mfa/setup", authMiddleware(), setupMfa)
			auth.POST("/mfa/verify", authMiddleware(), verifyMfa)
			auth.PATCH("/mfa/preferences", authMiddleware(), updateMfaPreferences)
		}
	}

	// Start server
	log.Printf("Auth service starting on port %s in %s mode\n", port, os.Getenv("ENV"))
	r.Run(":" + port)
}

// register handles user registration
func register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	for _, user := range users {
		if user.Email == req.Email {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create new user
	newUser := User{
		ID:       generateID(),
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	// Add user to store
	users = append(users, newUser)

	// Generate JWT token
	token, err := generateToken(newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return user without password and token
	newUser.Password = ""
	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  newUser,
	})
}

// login handles user login
func login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var foundUser *User
	for _, user := range users {
		if user.Email == req.Email {
			foundUser = &user
			break
		}
	}

	if foundUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if MFA is required
	if foundUser.MfaEnabled {
		c.JSON(http.StatusOK, AuthResponse{
			MfaRequired: true,
			User:        *foundUser,
		})
		return
	}

	// Generate JWT token
	token, err := generateToken(*foundUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return user without password and token
	foundUser.Password = ""
	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  *foundUser,
	})
}

// getMe returns the authenticated user
func getMe(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, user)
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

		// Find user by ID from token
		var foundUser *User
		for _, user := range users {
			if user.ID == claims.Subject {
				userCopy := user // Create a copy to avoid modifying the original
				userCopy.Password = ""
				foundUser = &userCopy
				break
			}
		}

		if foundUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", foundUser)
		c.Next()
	}
}

// setupMfa handles MFA setup
func setupMfa(c *gin.Context) {
	user, _ := c.Get("user")
	foundUser := user.(*User)

	// Generate MFA secret
	secret, err := generateMfaSecret()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate MFA secret"})
		return
	}

	// Update user with MFA secret
	foundUser.MfaSecret = secret
	foundUser.MfaEnabled = true

	// Create MFA setup response with a URL for QR code
	// In a real app, we would use the TOTP library to generate a proper key
	// For this demo, we'll create a URL that can be used with Google Authenticator
	qrCodeUrl := "otpauth://totp/Finternet:" + foundUser.Email + "?secret=" + secret + "&issuer=Finternet&algorithm=SHA1&digits=6&period=30"
	
	c.JSON(http.StatusOK, MfaSetupResponse{
		Secret:    secret,
		QrCodeUrl: qrCodeUrl,
	})
}

// verifyMfa handles MFA verification
func verifyMfa(c *gin.Context) {
	var req MfaVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	foundUser := user.(*User)

	// Verify MFA code
	if !totp.Validate(req.Code, foundUser.MfaSecret) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid MFA code"})
		return
	}

	// Update user with MFA verified
	foundUser.MfaVerified = true

	// Generate JWT token
	token, err := generateToken(*foundUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return user without password and token
	foundUser.Password = ""
	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  *foundUser,
	})
}

// updateMfaPreferences handles updating MFA preferences
func updateMfaPreferences(c *gin.Context) {
	var req MfaPreferenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	foundUser := user.(*User)

	// Update user with MFA preferences
	foundUser.MfaEnabled = req.Enabled
	foundUser.PreferredMfaType = req.PreferredType

	c.JSON(http.StatusOK, gin.H{"message": "MFA preferences updated successfully"})
}

// generateToken creates a new JWT token for a user
func generateToken(user User) (string, error) {
	// Create claims with user ID and expiration time
	claims := jwt.RegisteredClaims{
		Subject:   user.ID,
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token expires in 24 hours
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with secret key
	tokenString, err := token.SignedString([]byte(getJWTSecret()))
	return tokenString, err
}

// getJWTSecret returns the JWT secret key from environment or default
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "finternet-auth-service-secret-key"
	}
	return secret
}

// generateID creates a simple ID for demo purposes
// In production, use a proper UUID library
func generateID() string {
	return "user_" + time.Now().Format("20060102150405")
}

// generateMfaSecret generates a random MFA secret
func generateMfaSecret() (string, error) {
	secret := make([]byte, 16)
	_, err := rand.Read(secret)
	if err != nil {
		return "", err
	}
	return base32.StdEncoding.EncodeToString(secret), nil
}
