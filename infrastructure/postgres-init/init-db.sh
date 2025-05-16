#!/bin/bash
set -e

# Function to create database if it doesn't exist
create_db() {
  local db=$1
  echo "Creating database: $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE $db;
    GRANT ALL PRIVILEGES ON DATABASE $db TO $POSTGRES_USER;
    \c $db
    
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable pgcrypto for encryption functions
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    -- Set timezone to UTC
    SET timezone = 'UTC';
EOSQL
}

# Create each database
for db in finternet_auth finternet_assets finternet_ledger finternet_payments; do
  create_db $db
done

# Initialize auth database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "finternet_auth" <<-EOSQL
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Sessions table
  CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  -- Create index on email for faster lookups
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  
  -- Create index on token for faster lookups
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
EOSQL

# Initialize assets database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "finternet_assets" <<-EOSQL
  -- Assets table
  CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    value DECIMAL(20, 2) NOT NULL,
    owner_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
  );
  
  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
  CREATE INDEX IF NOT EXISTS idx_assets_token_id ON assets(token_id);
EOSQL

# Initialize ledger database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "finternet_ledger" <<-EOSQL
  -- Transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id VARCHAR(255) NOT NULL,
    asset_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    from_id UUID,
    to_id UUID,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blockchain_data JSONB
  );
  
  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON transactions(asset_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_from_id ON transactions(from_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_to_id ON transactions(to_id);
EOSQL

# Initialize payments database schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "finternet_payments" <<-EOSQL
  -- Payments table
  CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    crypto_address VARCHAR(255),
    crypto_currency VARCHAR(10),
    crypto_amount DECIMAL(30, 8),
    exchange_rate DECIMAL(30, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
  );
  
  -- Exchange rates table
  CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(30, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
EOSQL

echo "Database initialization completed."
