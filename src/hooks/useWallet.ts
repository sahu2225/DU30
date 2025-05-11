import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '../contracts/abis';
import toast from 'react-hot-toast';

const BSC_CHAIN_ID = '0x38';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const DU30_ADDRESS = 'x328c1fD9ca899e5547e0ca2d8c1AF972C5f91834';

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [du30Balance, setDu30Balance] = useState<string>('0');

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      // Switch to BSC network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          toast.error('Please add BSC network to MetaMask');
        }
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const getBalances = async () => {
    if (!account || !window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
    const du30Contract = new ethers.Contract(DU30_ADDRESS, ERC20_ABI, provider);

    try {
      const [usdtBal, du30Bal] = await Promise.all([
        usdtContract.balanceOf(account),
        du30Contract.balanceOf(account)
      ]);

      setUsdtBalance(ethers.utils.formatUnits(usdtBal, 18));
      setDu30Balance(ethers.utils.formatUnits(du30Bal, 18));
    } catch (error) {
      toast.error('Failed to fetch balances');
    }
  };

  useEffect(() => {
    if (account) {
      getBalances();
    }
  }, [account]);

  return {
    account,
    usdtBalance,
    du30Balance,
    connectWallet,
    getBalances
  };
};