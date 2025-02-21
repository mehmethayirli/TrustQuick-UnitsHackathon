import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

export type Reference = {
  name: string;
  relationshipType: string;
  isVerified: boolean;
  timestamp: number;
};

export function useReferences() {
  const contract = useContract();
  const { account } = useWeb3();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferences();
  }, [contract, account]);

  async function loadReferences() {
    if (!contract || !account) {
      setReferences([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const refs = await contract.getReferences(account);
      setReferences(refs);
    } catch (error) {
      console.error('Error loading references:', error);
      toast.error('Failed to load references');
    } finally {
      setLoading(false);
    }
  }

  async function addReference(name: string, relationshipType: string) {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const tx = await contract.addReference(name, relationshipType);
      await tx.wait();
      
      await loadReferences();
      toast.success('Reference added successfully');
      return true;
    } catch (error) {
      console.error('Error adding reference:', error);
      toast.error('Failed to add reference');
      return false;
    }
  }

  return {
    references,
    loading,
    addReference,
    refreshReferences: loadReferences,
  };
}