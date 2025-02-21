import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { useWeb3 } from '../context/Web3Context';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import toast from 'react-hot-toast';

export type Profile = {
  name: string;
  ipfsHash: string;
  overallScore: number;
  financialScore: number;
  professionalScore: number;
  socialScore: number;
  isActive: boolean;
};

export function useProfile() {
  const contract = useContract();
  const { account } = useWeb3();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [contract, account]);

  async function loadProfile() {
    if (!contract || !account) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileData = await contract.getProfile(account);
      
      if (profileData.ipfsHash) {
        const ipfsData = await getFromIPFS(profileData.ipfsHash);
        setProfile({
          ...profileData,
          ...ipfsData,
        });
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(data: Partial<Profile>) {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const ipfsHash = await uploadToIPFS(data);
      if (!ipfsHash) {
        throw new Error('Failed to upload to IPFS');
      }

      const tx = await contract.updateProfile(data.name || '', ipfsHash);
      await tx.wait();
      
      await loadProfile();
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    refreshProfile: loadProfile,
  };
}