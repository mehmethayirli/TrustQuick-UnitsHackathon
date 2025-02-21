import { ethers } from 'ethers';
import TrustNetABI from '../contracts/TrustNet.json';

const CONTRACT_ADDRESS = '0xEc389dceb1d99fF6D84F64c23156f7d3051B6C0B';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connect() {
    try {
      if (!this.provider) {
        throw new Error('MetaMask yüklü değil');
      }

      // Hesap bağlantısını iste
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Signer'ı al
      this.signer = await this.provider.getSigner();
      
      // Kontratı başlat
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TrustNetABI.abi,
        this.signer
      );
      
      // Bağlantıyı test et
      await this.contract.getAddress();
      
      return true;
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      this.resetConnection();
      throw error;
    }
  }

  private resetConnection() {
    this.signer = null;
    this.contract = null;
  }

  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Cüzdan bağlı değil');
    }
    return await this.signer.getAddress();
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Cüzdan bağlı değil');
    }
    return await this.signer.signMessage(message);
  }

  async getProfile(address: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    try {
      return await this.contract.getProfile(address);
    } catch (error) {
      console.error('Profil alma hatası:', error);
      throw error;
    }
  }

  async updateProfile(name: string, ipfsHash: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.updateProfile(name, ipfsHash);
    await tx.wait();
    return tx;
  }

  async getReferences(address: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    return await this.contract.getReferences(address);
  }

  async addReference(name: string, relationshipType: string, ipfsHash: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.addReference(name, relationshipType, ipfsHash);
    await tx.wait();
    return tx;
  }

  async verifyReference(userAddress: string, referenceIndex: number) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.verifyReference(userAddress, referenceIndex);
    await tx.wait();
    return tx;
  }

  async updateScores(
    userAddress: string,
    overall: number,
    financial: number,
    professional: number,
    social: number
  ) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.updateScores(
      userAddress,
      overall,
      financial,
      professional,
      social
    );
    await tx.wait();
    return tx;
  }

  async authorizeAI(aiAddress: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.authorizeAI(aiAddress);
    await tx.wait();
    return tx;
  }

  async authorizeVerifier(verifierAddress: string) {
    if (!this.contract) {
      throw new Error('Kontrat bağlantısı yok');
    }
    const tx = await this.contract.authorizeVerifier(verifierAddress);
    await tx.wait();
    return tx;
  }

  isConnected(): boolean {
    return this.signer !== null && this.contract !== null;
  }
} 