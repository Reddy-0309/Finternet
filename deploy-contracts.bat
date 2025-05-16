@echo off
cd %~dp0blockchain\solidity
npx hardhat run scripts/deploy.js --network localhost
