import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../utils/web3';
import { ethers } from 'ethers';

export function useContract() {
  const { library, account, isActive } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (isActive && library && account) {
      getContract(library, account).then(setContract);
    } else {
      setContract(null);
    }
  }, [library, account, isActive]);

  return contract;
}