import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

export type TrustScore = {
  overall: number;
  financial: number;
  professional: number;
  social: number;
};

export function useTrustScore() {
  const contract = useContract();
  const { account } = useWeb3();
  const [scores, setScores] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [contract, account]);

  async function loadScores() {
    if (!contract || !account) {
      setScores(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await contract.getProfile(account);
      
      setScores({
        overall: Number(profile.overallScore),
        financial: Number(profile.financialScore),
        professional: Number(profile.professionalScore),
        social: Number(profile.socialScore),
      });
    } catch (error) {
      console.error('Error loading trust scores:', error);
      toast.error('Failed to load trust scores');
    } finally {
      setLoading(false);
    }
  }

  return {
    scores,
    loading,
    refreshScores: loadScores,
  };
}