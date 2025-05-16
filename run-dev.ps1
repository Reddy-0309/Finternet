# Finternet Development Startup Script

# Kill any existing processes that might be using the same ports
Write-Host "Stopping any existing services..." -ForegroundColor Yellow
$ports = @(3000, 8000, 8001, 8002, 8003, 8545)
foreach ($port in $ports) {
    $processInfo = netstat -ano | findstr ":$port"
    if ($processInfo) {
        $processPID = ($processInfo -split ' ')[-1]
        try {
            Stop-Process -Id $processPID -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process using port $port (PID: $processPID)" -ForegroundColor Green
        } catch {
            Write-Host "Could not stop process using port $port (PID: $processPID)" -ForegroundColor Red
        }
    }
}

# Set environment variables for development
$env:ENV = "development"
$env:JWT_SECRET = "finternet-auth-service-secret-key"
$env:Path += ";C:\Program Files\Go\bin"

# Start the auth service
Write-Host "Starting Auth Service on port 8000..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\backend\auth-service" -FilePath "go" -ArgumentList "run", "main.go"

# Start the asset service
Write-Host "Starting Asset Service on port 8001..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\backend\asset-service" -FilePath "go" -ArgumentList "run", "main.go"

# Start the ledger service
Write-Host "Starting Ledger Service on port 8002..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\backend\ledger-service" -FilePath "cargo" -ArgumentList "run"

# Start the payment service
Write-Host "Starting Payment Service on port 8003..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\backend\payment-service" -FilePath "cargo" -ArgumentList "run"

# Start the Hardhat blockchain node
Write-Host "Starting Hardhat Blockchain Node on port 8545..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\blockchain\solidity" -FilePath "powershell" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "npx hardhat node --hostname 0.0.0.0"

# Deploy smart contracts to the Hardhat network
Write-Host "Deploying smart contracts to Hardhat network..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\blockchain\solidity" -FilePath "powershell" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "npx hardhat run scripts/deploy.js --network localhost"

# Start the frontend development server
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Cyan
Start-Process -NoNewWindow -WorkingDirectory "$PSScriptRoot\frontend" -FilePath "powershell" -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", "npm start"

Write-Host "
Finternet development environment is starting up!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Auth Service: http://localhost:8000" -ForegroundColor White
Write-Host "- Asset Service: http://localhost:8001" -ForegroundColor White
Write-Host "- Ledger Service: http://localhost:8002" -ForegroundColor White
Write-Host "- Payment Service: http://localhost:8003" -ForegroundColor White
Write-Host "- Blockchain Node: http://localhost:8545" -ForegroundColor White
Write-Host "
MetaMask Connection Information:" -ForegroundColor Green
Write-Host "- Network Name: Finternet Local Network" -ForegroundColor White
Write-Host "- RPC URL: http://localhost:8545" -ForegroundColor White
Write-Host "- Chain ID: 1337" -ForegroundColor White
Write-Host "- Currency Symbol: ETH" -ForegroundColor White
Write-Host "
Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) { Start-Sleep -Seconds 10 }
} finally {
    # This block will execute when the script is interrupted (Ctrl+C)
    Write-Host "
Shutting down all services..." -ForegroundColor Yellow
    # The processes will be automatically terminated when the script exits
}
