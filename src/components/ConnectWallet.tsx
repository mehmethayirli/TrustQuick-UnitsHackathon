import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';

export const ConnectWallet = () => {
  const { web3Service, isConnected, connect } = useWeb3();
  const [address, setAddress] = useState<string>('');
  const [network, setNetwork] = useState<string>('');

  const UNITS_TESTNET_CHAIN_ID = '0x15b11'; // 88817 in hex
  const UNITS_TESTNET_CHAIN_ID_DECIMAL = 88817;

  const checkAndUpdateNetwork = (chainId: string | number) => {
    // If chainId comes as string, convert to decimal
    const chainIdDecimal = typeof chainId === 'string' 
      ? parseInt(chainId, 16)
      : chainId;

    const isUnitsNetwork = chainIdDecimal === UNITS_TESTNET_CHAIN_ID_DECIMAL;
    const networkName = isUnitsNetwork ? 'Units Network Testnet' : 'Wrong Network';
    setNetwork(networkName);
    return isUnitsNetwork;
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          checkAndUpdateNetwork(chainId);

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }

          window.ethereum.on('chainChanged', (newChainId: string) => {
            const isCorrectNetwork = checkAndUpdateNetwork(newChainId);
            if (!isCorrectNetwork) {
              toast.error('Please switch to Units Network Testnet!');
            }
          });

          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
              setAddress(accounts[0]);
            } else {
              setAddress('');
            }
          });
        } catch (error) {
          console.error('Connection check error:', error);
        }
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== UNITS_TESTNET_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: UNITS_TESTNET_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: UNITS_TESTNET_CHAIN_ID,
                  chainName: 'Units Network Testnet',
                  nativeCurrency: {
                    name: 'UNITS',
                    symbol: 'UNITS',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc-testnet.unit0.dev'],
                }],
              });
            } catch (addError) {
              toast.error('Network could not be added!');
              return;
            }
          } else {
            toast.error('Could not switch network!');
            return;
          }
        }
      }

      await connect();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection failed!');
    }
  };

  const formatAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <div className="fixed top-4 right-4 flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
      {network && (
        <div className={`text-sm ${network === 'Units Network Testnet' ? 'text-green-400' : 'text-red-400'}`}>
          {network}
        </div>
      )}
      {address ? (
        <div className="text-white bg-gray-700 px-4 py-2 rounded-lg">
          {formatAddress(address)}
        </div>
      ) : (
        <Button onClick={handleConnect} className="bg-[#A8E6CF] hover:bg-[#8CD3B4] text-black">
          Connect Wallet
        </Button>
      )}
    </div>
  );
};