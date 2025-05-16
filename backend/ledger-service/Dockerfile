FROM rust:1.67-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy Cargo.toml and Cargo.lock files
COPY Cargo.toml ./

# Create dummy source file to build dependencies
RUN mkdir -p src && \
    echo "fn main() { println!\"Hello, world!\"; }" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy actual source code
COPY . .

# Build the application
RUN cargo build --release

# Create a smaller runtime image
FROM debian:bullseye-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /app/target/release/ledger-service /app/ledger-service

# Copy .env file
COPY .env ./

# Expose port
EXPOSE 8002

# Run the application
CMD ["/app/ledger-service"]
