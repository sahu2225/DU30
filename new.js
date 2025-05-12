import { ethers } from "ethers";

// const { ethers } = require("ethers");

// BSC Mainnet RPC
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/";
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);

// Replace with actual contract address
const CONTRACT_ADDRESS = "0x178f3521240342c5A4df7482A28CFAb8397a9fD2";

// Minimal ABI with only the view functions
const CONTRACT_ABI = [
  "function swapCount() view returns (uint256)",
  "function uniqueSwapperCount() view returns (uint256)",
  "function timeUntilNextWithdraw() view returns (uint256)",
  "function isClaimAvailable() view returns (bool)",];

async function main() {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const swapCount = await contract.swapCount();
  const uniqueSwappers = await contract.uniqueSwapperCount();
  const timeUntilWithdraw = ethers.BigNumber.from(84000);
  // const timeUntilWithdraw = await contract.timeUntilNextWithdraw();
  //const locknUnclock = await contract.isClaimAvailable();
  const locknUnclock = true;
  const seconds = timeUntilWithdraw.toNumber();
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  console.log(`Total number of transactions: ${swapCount.toString()}`);
  console.log(`Total number of wallet holders: ${uniqueSwappers.toString()}`);
  console.log(locknUnclock ? "Unlocked" : "Locked");
  console.log(`LP Timelock Release ( Locked ): ${hours} hours ${minutes} minutes`);

}

main().catch(console.error);