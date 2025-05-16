# Finternet Project

A scalable, secure, user-centric financial internet platform with tokenized assets, unified ledger backend, decentralized smart contracts, and strong security measures.

## Architecture

- **Frontend**: React.js + TailwindCSS (Web) + Flutter (Mobile)
- **API Gateway**: Windsurf API Manager
- **Backend Services**: Golang, Rust microservices
- **Blockchain Layer**: Solidity (Ethereum-compatible) + Rust (Wasm chains)
- **Secure Storage**: PostgreSQL with encryption
- **Security Layer**: Rust modules for crypto, Python for fraud detection

## Project Structure

```
finternet/
├── frontend/               # React.js web application
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── components/     # Reusable UI components
│       ├── features/       # Redux slices and state management
│       ├── pages/          # Application pages
│       ├── services/       # API services
│       └── styles/         # CSS and styling
├── mobile/                 # Flutter mobile application
├── backend/                # Backend services
│   ├── auth-service/       # User authentication (Go)
│   ├── asset-service/      # Asset management (Go)
│   ├── ledger-service/     # Unified ledger service (Rust)
│   └── payment-service/    # Payment gateway (Rust)
├── blockchain/             # Smart contracts
│   ├── solidity/           # Ethereum-compatible contracts
│   │   ├── FinToken.sol    # ERC-20 token implementation
│   │   ├── FinTokenAsset.sol # ERC-721 NFT implementation
│   │   └── FinTokenMarketplace.sol # Asset marketplace
│   └── rust/               # Wasm-based contracts
├── infrastructure/         # Infrastructure as code
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Go 1.19+
- Rust and Cargo
- Docker and Docker Compose
- PostgreSQL (or SQLite for development)
- Solidity compiler 0.8.17+

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/finternet.git
   cd finternet
   ```

2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Start the development environment
   ```bash
   # Windows
   .\run-dev.ps1
   
   # Linux/macOS
   ./run-dev.sh
   ```

4. Access the application at http://localhost:3000

## Key Features

### User Interface
- **Guided Onboarding Tour**: Interactive tour to help new users navigate the platform
- **Blockchain Explorer**: Explore blockchain transactions and smart contracts
- **Smart Contract Templates**: Create and deploy common smart contracts without coding
- **Saved Searches/Filters**: Save and manage search criteria for assets and transactions
- **Two-Factor Authentication**: Enhanced security for user accounts
- **Asset Management**: Create, transfer, and manage tokenized assets
- **Dark Mode**: Toggle between light and dark themes

### Backend Services
- **User authentication** with OAuth 2.0 + JWT and multi-factor authentication
- **Asset tokenization and management** with blockchain integration
- **Unified ledger** for immutable transaction records
- **Payment gateway** with fiat ↔ crypto interoperability
- **Secure wallet management** with multi-signature support
- **Fraud detection** and security measures

### Smart Contracts

#### FinTokenMarketplace
A secure marketplace for trading tokenized assets with the following features:
- Listing creation and management
- Secure purchase process with platform fees
- Pausable functionality for emergency situations
- Comprehensive access control
- Protection against common vulnerabilities
- Support for various NFT standards

#### FinTokenAsset
An ERC-721 implementation for tokenized assets with:
- Metadata support for asset details
- Transfer restrictions and compliance features
- Batch minting capabilities
- Royalty support for creators

#### FinToken
An ERC-20 implementation for the platform's utility token with:
- Governance functionality
- Staking mechanisms
- Fee reduction for token holders

## Development Mode

The application supports different operating modes:

- **Full Mode**: Connects to actual blockchain networks and backend services
- **Mock Mode**: Uses simulated blockchain interactions for development and testing
- **Offline Mode**: Functions without internet connectivity using cached data

## License

This project is proprietary and confidential.

## Contributors

The Finternet Team
