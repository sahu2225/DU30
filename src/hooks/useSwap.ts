import { useState } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, SWAP_ABI } from '../contracts/abis';
import toast from 'react-hot-toast';

const SWAP_ADDRESS = 'x328c1fD9ca899e5547e0ca2d8c1AF972C5f91834';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

export const useSwap = (account: string | null, onSuccess: () => void) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const calculateTax = (amount: string, isDu30ToUsdt: boolean): number => {
    if (!isDu30ToUsdt) return 3;

    const usdtAmount = parseFloat(amount);
    if (usdtAmount < 1000) return 3;
    if (usdtAmount < 3000) return 2;
    if (usdtAmount < 5000) return 1;
    return 0;
  };

  const approve = async (tokenAddress: string, amount: string) => {
    if (!account || !window.ethereum) return;

    setIsApproving(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    try {
      const tx = await contract.approve(
        SWAP_ADDRESS,
        ethers.constants.MaxUint256
      );
      await tx.wait();
      toast.success('Approval successful');
    } catch (error) {
      toast.error('Approval failed');
    } finally {
      setIsApproving(false);
    }
  };

  const swap = async (tokenAddress: string, amount: string) => {
    if (!account || !window.ethereum) return;

    setIsSwapping(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, signer);

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await contract.swap(tokenAddress, amountWei);
      await tx.wait();
      toast.success('Swap successful');
      onSuccess();
    } catch (error) {
      toast.error('Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    isApproving,
    isSwapping,
    calculateTax,
    approve,
    swap
  };
};