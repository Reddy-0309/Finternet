# Contributing to Finternet

Thank you for your interest in contributing to the Finternet project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check if the bug has already been reported
2. Use the bug report template
3. Include detailed steps to reproduce the issue
4. Specify your environment (OS, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Please provide:

1. A clear description of the feature
2. The problem it solves
3. Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request using the PR template

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Go 1.19+
- Rust and Cargo
- Docker and Docker Compose
- PostgreSQL (or SQLite for development)
- Solidity compiler 0.8.17+

### Local Development

1. Clone your fork of the repository
   ```bash
   git clone https://github.com/your-username/finternet.git
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

## Coding Standards

### JavaScript/React
- Follow the ESLint configuration
- Use functional components with hooks
- Write meaningful component and function names
- Add JSDoc comments for complex functions

### Go
- Follow the Go standard formatting (gofmt)
- Write unit tests for all exported functions
- Use meaningful variable and function names
- Add comments for exported functions

### Rust
- Follow the Rust style guide
- Use meaningful variable and function names
- Write unit tests for all public functions
- Document public APIs

### Solidity
- Follow the Solidity style guide
- Use NatSpec comments for all public functions
- Write comprehensive tests for all contracts
- Follow security best practices

## Testing

- Write unit tests for all new features
- Ensure existing tests pass
- For frontend changes, test on multiple browsers
- For smart contracts, test on local blockchain before submitting

## Documentation

- Update documentation for all user-facing changes
- Document all new features and APIs
- Keep the README.md up to date

## License

By contributing to Finternet, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have any questions about contributing, please reach out to the maintainers.
