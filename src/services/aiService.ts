import axios, { AxiosError } from 'axios';
import { ethers } from 'ethers';

const AI_API_URL = 'http://localhost:8000';

interface APIErrorResponse {
  detail: string;
}

const axiosInstance = axios.create({
  baseURL: AI_API_URL,
  timeout: 60000,  // Timeout süresini 60 saniyeye çıkar
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Yeniden deneme yapılandırması
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError<APIErrorResponse>) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.log('İstek zaman aşımına uğradı, yeniden deneniyor...');
      try {
        // İsteği yeniden dene
        const response = await axiosInstance.request(error.config!);
        return response;
      } catch (retryError: unknown) {
        if (retryError instanceof Error) {
          throw new Error('Yeniden deneme başarısız oldu: ' + retryError.message);
        }
        throw new Error('Yeniden deneme başarısız oldu');
      }
    }
    
    if (error.response) {
      const message = error.response.data?.detail || error.message;
      throw new Error(`AI servisi hatası: ${message}`);
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('AI servisi bağlantısı başarısız. Lütfen servisin çalıştığından emin olun.');
    }
    
    throw error;
  }
);

export class AIService {
  static async analyzeProfile(profileData: any) {
    try {
      // Form verisi oluştur
      const formData = new FormData();
      
      // LinkedIn token'ı varsa ekle
      if (profileData.linkedin?.accessToken) {
        formData.append('linkedin_access_token', profileData.linkedin.accessToken);
      }
      
      // Twitter token'ı varsa ekle
      if (profileData.twitter?.accessToken) {
        formData.append('twitter_access_token', profileData.twitter.accessToken);
      }
      
      // Profil verilerini JSON olarak ekle
      const profileBlob = new Blob([JSON.stringify(profileData)], {
        type: 'application/json'
      });
      formData.append('profile_data', profileBlob, 'profile.json');

      const response = await axiosInstance.post('/analyze/profile', formData);
      
      if (response.data.errors?.length > 0) {
        throw new Error(response.data.errors[0]);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error analyzing profile:', error);
      throw new Error(error.message || 'Profil analizi sırasında bir hata oluştu');
    }
  }

  static async analyzeDocument(file: File, address: string) {
    try {
      const timestamp = Date.now();
      const message = `Document Verification Request\nTimestamp: ${timestamp}\nFile: ${file.name}`;
      
      // İmza al
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Form verisi oluştur
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('address', address);

      const response = await axiosInstance.post('/analyze/document', formData);
      return response.data;
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      throw new Error(error.message || 'Döküman analizi sırasında bir hata oluştu');
    }
  }
}