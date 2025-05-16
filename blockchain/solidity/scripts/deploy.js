const { ethers, network, run } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying Finternet smart contracts...");

  // Compile contracts first to ensure artifacts are up to date
  try {
    await run('compile');
    console.log("Contracts compiled successfully");
  } catch (error) {
    console.warn("Compilation failed or not needed, continuing with deployment");
  }

  // Get the contract factories
  const FinTokenAsset = await ethers.getContractFactory("FinTokenAsset");
  const FinTokenMarketplace = await ethers.getContractFactory("FinTokenMarketplace");

  // Deploy FinTokenAsset contract
  console.log("Deploying FinTokenAsset...");
  const finTokenAsset = await FinTokenAsset.deploy();
  await finTokenAsset.deployed();
  console.log("FinTokenAsset deployed to:", finTokenAsset.address);

  // Deploy FinTokenMarketplace contract
  console.log("Deploying FinTokenMarketplace...");
  const finTokenMarketplace = await FinTokenMarketplace.deploy();
  await finTokenMarketplace.deployed();
  console.log("FinTokenMarketplace deployed to:", finTokenMarketplace.address);

  console.log("Deployment complete!");

  // Save contract addresses to a file
  const deploymentInfo = {
    FinTokenAsset: finTokenAsset.address,
    FinTokenMarketplace: finTokenMarketplace.address,
    chainId: network.config.chainId,
    deploymentTime: new Date().toISOString()
  };

  // Save to the blockchain directory
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to ${deploymentPath}`);

  // Also save to the frontend directory for easy access
  const frontendPath = path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'contracts', 'deployment.json');
  
  // Create the directory if it doesn't exist
  const frontendDir = path.dirname(frontendPath);
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    frontendPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to ${frontendPath}`);

  // Create or update .env file in frontend with contract addresses
  const envPath = path.join(__dirname, '..', '..', '..', 'frontend', '.env');
  let envContent = `REACT_APP_FINTOKEN_ASSET_ADDRESS=${finTokenAsset.address}\nREACT_APP_FINTOKEN_MARKETPLACE_ADDRESS=${finTokenMarketplace.address}\n`;
  
  // Append to existing .env or create new one
  if (fs.existsSync(envPath)) {
    const currentEnv = fs.readFileSync(envPath, 'utf8');
    // Only add lines if they don't already exist
    if (!currentEnv.includes('REACT_APP_FINTOKEN_ASSET_ADDRESS')) {
      envContent = currentEnv + '\n' + envContent;
    }
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Environment variables updated in ${envPath}`);

  // Return the deployed contract addresses
  return deploymentInfo;
}

// Execute the deployment
main()
  .then((deploymentInfo) => {
    console.log("Deployed contracts:", deploymentInfo);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
