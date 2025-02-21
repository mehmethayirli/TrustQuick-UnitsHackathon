import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Service } from '../services/web3';
import { toast } from 'react-hot-toast';

interface Web3ContextType {
  web3Service: Web3Service | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  account: string | null;
  isAuthenticated: boolean;
  authenticate: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  web3Service: null,
  isConnected: false,
  connect: async () => {},
  account: null,
  isAuthenticated: false,
  authenticate: async () => {}
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3Service] = useState<Web3Service>(() => new Web3Service());
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const resetState = () => {
    setIsConnected(false);
    setIsAuthenticated(false);
    setAccount(null);
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      try {
        await web3Service.connect();
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Hesap değişimi hatası:', error);
        resetState();
      }
    } else {
      resetState();
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await handleAccountsChanged(accounts);
          }
        } catch (error) {
          console.error('Bağlantı kontrolü hatası:', error);
          resetState();
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('disconnect', resetState);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('disconnect', resetState);
      }
    };
  }, [web3Service]);

  const connect = async () => {
    try {
      await web3Service.connect();
      const address = await web3Service.getAddress();
      setAccount(address);
      setIsConnected(true);
      toast.success('Cüzdan bağlandı!');
    } catch (error: any) {
      console.error('Bağlantı hatası:', error);
      toast.error(error.message || 'Cüzdan bağlantısı başarısız!');
      resetState();
    }
  };

  const authenticate = async () => {
    try {
      if (!isConnected || !account) {
        await connect();
      }

      const timestamp = Date.now();
      const message = `TrustNet Authentication\nAddress: ${account}\nTimestamp: ${timestamp}`;
      const signature = await web3Service.signMessage(message);
      
      if (signature) {
        setIsAuthenticated(true);
        toast.success('Kimlik doğrulama başarılı!');
      }
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      setIsAuthenticated(false);
      toast.error('Kimlik doğrulama başarısız!');
    }
  };

  return (
    <Web3Context.Provider 
      value={{ 
        web3Service, 
        isConnected, 
        connect, 
        account, 
        isAuthenticated,
        authenticate
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};