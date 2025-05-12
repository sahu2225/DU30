import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaWallet, FaUsers, FaShieldAlt, FaCogs, FaCoins, FaDollarSign, FaArrowCircleUp, FaArrowCircleDown, FaFire } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import { useWallet } from './hooks/useWallet';
import { useSwap } from './hooks/useSwap';
import logo from '../src/assets/a1.jpeg';
import { ethers } from 'ethers';

function App() {
  const [usdtAmount, setUsdtAmount] = useState('');
  const [du30Amount, setDu30Amount] = useState('');
  const [isUsdtToDu30, setIsUsdtToDu30] = useState(true);

  const { account, usdtBalance, du30Balance, connectWallet, getBalances } = useWallet();
  const { isApproving, isSwapping, calculateTax, approve, swap } = useSwap(account, getBalances);

  const [tokenMetrics, setTokenMetrics] = useState([
    {
      label: "Liquidity Pool 1 (USDT)",
      value: "Loading...",
      type: "Wallet BSSCAN Link",
      link: "https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955?a=0x178f3521240342c5A4df7482A28CFAb8397a9fD2",
    },
    { label: "Tokens Minted (DU30)", value: "Loading..." },
    { label: "Total number of wallet holders", value: "Loading..." },
    { label: "Total number of transactions", value: "Loading..." },
    {
      label: "DU30 Token Contract Address",
      type: "Contract BSSCAN Link",
      link: "https://bscscan.com/token/0x178f3521240342c5A4df7482A28CFAb8397a9fD2",
    },
    {
      label: "Smart Contract Address",
      type: "Smart Contract BSSCAN Link",
      link: "https://bscscan.com/address/0x178f3521240342c5A4df7482A28CFAb8397a9fD2#code",
    },
    {
      label: "LP Timelock Release ( Locked )",
      value: "Loading...",
      type: "Time Lock"
    }
  ]);

  const formatUnits = (value, decimals = 18) => {
    return (
      parseFloat(value) /
      Math.pow(10, decimals)
    ).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };
  

   // Replace your existing useEffect with this improved version
useEffect(() => {
  // Create an interval to fetch data periodically
  const fetchDataInOrder = async () => {
    try {
      console.log("Fetching contract data..."); // Add logging to track execution
      
      // Define constants
      const bscscanApiKey = "767BR2ATFM4WJPW87Q15EZ3JWRG99YFYZ6";
      const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955";
      const contractAddress = "0x178f3521240342c5A4df7482A28CFAb8397a9fD2";
      const walletAddress = "0x178f3521240342c5A4df7482A28CFAb8397a9fD2";

      // Initialize ethers provider - force a new connection each time
      const BSC_RPC_URL = "https://bsc-dataseed.binance.org/";
      const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);
      
      // Contract ABI for the required functions
      const CONTRACT_ABI = [
        "function swapCount() view returns (uint256)",
        "function uniqueSwapperCount() view returns (uint256)",
        "function timeUntilNextWithdraw() view returns (uint256)",
        "function isClaimAvailable() view returns (bool)"
      ];
      
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

      try {
        // Fetch contract data one by one with error handling for each call
        const swapCount = await contract.swapCount();
        console.log("Swap count:", swapCount.toString());
        
        const uniqueSwappers = await contract.uniqueSwapperCount();
        console.log("Unique swappers:", uniqueSwappers.toString());
        
        // For testing purposes, you can uncomment this line and comment the next
      // const timeUntilWithdraw = ethers.BigNumber.from(84000);
         const timeUntilWithdraw = await contract.timeUntilNextWithdraw();
        console.log("Time until withdraw:", timeUntilWithdraw.toString());

const locknUnclock = await contract.isClaimAvailable();
const statusLabel = locknUnclock ? "Unlocked" : "Locked";

        // Format time until next withdraw
const seconds = timeUntilWithdraw.toNumber();
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const timeString = `${hours} hours ${minutes} minutes`;

        // Use the functional update form of setState to ensure we're working with the latest state
        setTokenMetrics(prev => {
          // Create a new array to ensure React detects the change
          const newMetrics = [...prev];
          
          // Find and update specific entries
          const walletHolderIndex = newMetrics.findIndex(item => item.label === "Total number of wallet holders");
          if (walletHolderIndex >= 0) {
            newMetrics[walletHolderIndex] = {
              ...newMetrics[walletHolderIndex],
              value: uniqueSwappers.toString()
            };
          }
          
          const transIndex = newMetrics.findIndex(item => item.label === "Total number of transactions");
          if (transIndex >= 0) {
            newMetrics[transIndex] = {
              ...newMetrics[transIndex],
              value: swapCount.toString()
            };
          }
          


const timeIndex = newMetrics.findIndex(
  item => item.label === `LP Timelock Release ( ${statusLabel} )`);
          if (timeIndex >= 0) {
            newMetrics[timeIndex] = {
              ...newMetrics[timeIndex],
              value: timeString
            };
          }
          
          console.log("Updated metrics:", newMetrics);
          return newMetrics;
        });
      } catch (contractError) {
        console.error("Error calling contract methods:", contractError);
      }

      try {
        // Fetch Pool 1 data (USDT)
        const balanceResponse = await fetch(
          `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${usdtContractAddress}&address=${walletAddress}&tag=latest&apikey=${bscscanApiKey}`
        );
        const balanceData = await balanceResponse.json();
        
        if (balanceData.status === "1") {
          setTokenMetrics(prev => {
            const newMetrics = [...prev];
            const index = newMetrics.findIndex(item => item.label === "Liquidity Pool 1 (USDT)");
            if (index >= 0) {
              newMetrics[index] = {
                ...newMetrics[index],
                value: formatUnits(balanceData.result) + " USDT"
              };
            }
            return newMetrics;
          });
        }
      } catch (balanceError) {
        console.error("Error fetching balance data:", balanceError);
      }

      try {
        // Fetch Tokens Minted data (DU30) from BscScan
        const supplyResponse = await fetch(
          `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${bscscanApiKey}`
        );
        const supplyData = await supplyResponse.json();
        
        if (supplyData.status === "1") {
          setTokenMetrics(prev => {
            const newMetrics = [...prev];
            const index = newMetrics.findIndex(item => item.label === "Tokens Minted (DU30)");
            if (index >= 0) {
              newMetrics[index] = {
                ...newMetrics[index],
                value: formatUnits(supplyData.result) + " DU30"
              };
            }
            return newMetrics;
          });
        }
      } catch (supplyError) {
        console.error("Error fetching supply data:", supplyError);
      }

    } catch (err) {
      console.error("Error in fetchDataInOrder:", err);
    }
  };

  // Fetch immediately on component mount
  fetchDataInOrder();
  
  // Then set up interval for periodic updates (e.g., every 30 seconds)
  const intervalId = setInterval(fetchDataInOrder, 30000);
  
  // Clean up interval on component unmount
  return () => clearInterval(intervalId);
}, []); // Empty dependency array means this runs once on mount

  const handleSwap = async () => {
    if (!account) return;

    const amount = isUsdtToDu30 ? usdtAmount : du30Amount;
    const tokenAddress = isUsdtToDu30
      ? '0x55d398326f99059fF775485246999027B3197955'
      : '0x178f3521240342c5A4df7482A28CFAb8397a9fD2';

    await approve(tokenAddress, amount);
    await swap(tokenAddress, amount);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="space-y-0">
        {/* Hero + Wallet Section */}
        <section className="w-full bg-black text-white text-center py-16 px-4">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
            <img src={logo} alt="DU30 Logo" className="mx-auto items-center w-[400px] h-[400px]" />
            <p className="text-blue-200 text-lg">Inspired by Legacy, Powered by Code.</p>
            <p className="text-blue-300 max-w-2xl mx-auto">
              Created in honor of the 16th President of the Philippines, Rodrigo Roa Duterte (PRRD). DU30 Token empowers a decentralized barter economy and global remittance utility.
            </p>

            {/* Wallet Section */}
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto"
              >
                <FaWallet className="text-lg" />
                Start Swapping
              </button>
            ) : (
              <div>
                <p className="text-blue-200 mb-2">Connected Wallet</p>
                <p className="text-sm font-mono text-blue-300 break-all">{account}</p>
              </div>
            )}
          </div>
        </section>

        {/* Swap Interface */}
        {account && (
          <section className="w-full bg-[#172A46] rounded-2xl p-8 border border-[#234876] shadow-2xl max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-6 text-center mb-8">
              <div>
                <p className="text-blue-200">USDT Balance</p>
                <p className="text-2xl text-emerald-500 font-bold">{parseFloat(usdtBalance).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-blue-200">DU30 Balance</p>
                <p className="text-2xl text-emerald-500 font-bold">{parseFloat(du30Balance).toFixed(4)}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-blue-200 mb-2">
                  {isUsdtToDu30 ? 'USDT Amount' : 'DU30 Amount'}
                </label>
                <input
                  type="number"
                  value={isUsdtToDu30 ? usdtAmount : du30Amount}
                  onChange={(e) => isUsdtToDu30 ? setUsdtAmount(e.target.value) : setDu30Amount(e.target.value)}
                  className="w-full bg-[#1D3557] rounded-lg p-4 text-white border border-[#234876]"
                  placeholder="Enter amount"
                />
              </div>

              <button
                onClick={() => setIsUsdtToDu30(!isUsdtToDu30)}
                className="mx-auto block p-2 hover:bg-[#1D3557] bg-emerald-500 text-white rounded-full transition-colors"
              >
                <FaExchangeAlt className="text-xl" />
              </button>

              <div>
                <label className="block text-blue-200 mb-2">Tax Rate</label>
                <div className="bg-[#1D3557] rounded-lg p-4 text-white bg-opacity-10 border border-[#234876]">
                  {calculateTax(isUsdtToDu30 ? usdtAmount : du30Amount, !isUsdtToDu30)}%
                </div>
              </div>

              <button
                onClick={handleSwap}
                disabled={isApproving || isSwapping}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-blue-900 text-white font-bold py-4 rounded-lg"
              >
                {isApproving ? 'Approving...' : isSwapping ? 'Swapping...' : 'Swap'}
              </button>
            </div>
          </section>
        )}

        {/* Why DU30 Section */}
        <section className="w-full bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] text-white py-20 px-16">
          <section className='section-1'>
            <article className='article-1'>
              <p className=" pp data-text text-3xl font-bold mb-12 text-emerald-400 text-center">Why DU30?
                <span className='ss' data-text="Why DU30?"></span>
                <span className='ss' data-text="Why DU30?"></span>
              </p>
            </article>
          </section>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center border border-[#234876] p-6 rounded-xl bg-[#112240] text-blue-200 hover:scale-105 hover:shadow-lg transition-transform duration-300">
              <FaUsers className="text-emerald-400 text-3xl mb-2" />
              <p>Inclusive: Available to all Filipinos</p>
            </div>
            <div className="flex flex-col items-center text-center border border-[#234876] p-6 rounded-xl bg-[#112240] text-blue-200 hover:scale-105 hover:shadow-lg transition-transform duration-300">
              <FaShieldAlt className="text-emerald-400 text-3xl mb-2" />
              <p>Transparent: Backed 1:1 by USDT</p>
            </div>
            <div className="flex flex-col items-center text-center border border-[#234876] p-6 rounded-xl bg-[#112240] text-blue-200 hover:scale-105 hover:shadow-lg transition-transform duration-300">
              <FaCogs className="text-emerald-400 text-3xl mb-2" />
              <p>Rules-Based: Smart contract governed</p>
            </div>
          </div>
        </section>

        {/* Tokenomics Section */}
        <section className="w-full bg-white text-black py-16 px-4">
          <h2 className="hover-underline text-3xl font-bold mb-6 text-primary mx-auto text-center gap-4">
            Token Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1480px] mx-auto px-4">
            {/* Left: Tokenomics */}
            <div>
              <h3 className=" text-2xl font-semibold mb-6 text-center hover:text-green-500">Tokenomics</h3>
              <div className="space-y-6 text-left">
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaCoins className="text-xl text-blue-500" />
                  <p className="text-lg">• Supply Cap: 1,000,000,000 DU30</p>
                </div>
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaDollarSign className="text-xl text-green-500" />
                  <p className="text-lg">• Peg: 1 DU30 = 1 USDT</p>
                </div>
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaArrowCircleUp className="text-xl text-yellow-500" />
                  <p className="text-lg">• Buy Tax: 3% (in USDT)</p>
                </div>
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaArrowCircleDown className="text-xl text-red-500" />
                  <p className="text-lg">• Sell Tax: 3% (paid separately)</p>
                </div>
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaFire className="text-xl text-purple-500" />
                  <p className="text-lg">• Sell Tax Rebate: 3-tier aggregator rewards</p>
                </div>
                <div className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition">
                  <FaFire className="text-xl text-orange-500" />
                  <p className="text-lg">• Mint & Burn Model: Mint on buy, burn on sell</p>
                </div>
              </div>
            </div>

            {/* Right: Tokenmetrics */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-center hover:text-green-500">
                Tokenmetrics
              </h3>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tokenMetrics.map((item, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg shadow hover:shadow-md transition space-y-2"
                  >
                    <label className="block text-sm text-gray-600 font-medium">
                      {item.label}
                    </label>

                    {/* Display for read-only metrics */}
                    {item.label === "Liquidity Pool 1 (USDT)" ||
                    item.label === "Tokens Minted (DU30)" ||
                    item.label === "Total number of wallet holders" ||
                    item.label === "Total number of transactions" ||
                    item.label === "LP Timelock Release ( Locked )" ? (
                      <p className="text-gray-800 font-medium">
                        {item.value}
                      </p>
                    ) : null}

                    {/* Display for contract links */}
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm hover:text-blue-800"
                      >
                        {item.type || "View on BscScan"}
                      </a>
                    ) : null}
                  </div>
                ))}
              </form>
            </div>
          </div>
        </section>

        {/* Utility Section */}
        <section className="w-full bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] text-white text-center py-16 px-16">
          <section className='section-1'>
            <article className='article-1'>
              <p className="pp text-2xl font-bold mb-12 hidden md:block">
                Utility & Use Cases
                <span className='ss' data-text="Utility & Use Cases"></span>
                <span className='ss' data-text="Utility & Use Cases"></span>
              </p>
            </article>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#172A46] rounded-2xl p-8 border border-[#234876] transition-transform transform hover:scale-105 hover:border-emerald-400 duration-300 ease-in-out shadow-md hover:shadow-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">Barter Economy</h3>
              <p className="text-blue-200">
                Trade goods/services with DU30 via global Aggregators.<br />"We don't sell — we swap."
              </p>
            </div>
            <div className="bg-[#172A46] rounded-2xl p-8 border border-[#234876] transition-transform transform hover:scale-105 hover:border-emerald-400 duration-300 ease-in-out shadow-md hover:shadow-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-4">Remittance Tool</h3>
              <p className="text-blue-200">
                Send DU30 from anywhere in the world to family smartphones. Fast. Permissionless. No middlemen.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-black text-white text-center text-sm py-8 space-y-2 px-4">
          <p>
            Disclaimer: DU30 Token is a community-driven project. Not affiliated with President Duterte or his family. Use at your own risk.
          </p>
          <p>
            Website: www.DU30.io |{"  "}
            <a
              href="https://drive.google.com/drive/folders/161i_vy1WgXf1BQaJdqtJGO7a3wjHkQyl?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              White Paper
            </a>
          </p>
          <p>© 2025 DU30 Token. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;