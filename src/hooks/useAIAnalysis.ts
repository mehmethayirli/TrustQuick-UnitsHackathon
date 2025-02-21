import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { AIService } from '../services/aiService';
import toast from 'react-hot-toast';

export function useAIAnalysis() {
  const { web3Service, isConnected, account } = useWeb3();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSocialProfiles = async (profiles: any) => {
    if (!isConnected || !web3Service || !account) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return null;
    }

    try {
      setIsAnalyzing(true);

      // İmza için mesaj oluştur
      const timestamp = Date.now();
      const message = `Profile Analysis Request\nTimestamp: ${timestamp}\nAddress: ${account}`;
      
      // İmza al
      const signature = await web3Service.signMessage(message);

      // Analiz isteği gönder
      const result = await AIService.analyzeProfile({
        ...profiles,
        address: account,
        timestamp,
        signature
      });

      if (result.success) {
        // Blockchain'e skorları kaydet
        await web3Service.updateScores(
          account,
          result.overall,
          result.details.financial_score || 0,
          result.details.professional_score || 0,
          result.details.social_score || 0
        );
      }

      return result;
    } catch (error) {
      console.error('Sosyal profil analizi hatası:', error);
      toast.error('Profil analizi başarısız oldu');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDocument = async (file: File) => {
    if (!isConnected || !web3Service) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return null;
    }

    try {
      setIsAnalyzing(true);
      const address = await web3Service.getAddress();
      const result = await AIService.analyzeDocument(file, address);
      return result;
    } catch (error) {
      console.error('Döküman analizi hatası:', error);
      toast.error('Döküman analizi başarısız oldu');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyzeSocialProfiles,
    analyzeDocument
  };
}