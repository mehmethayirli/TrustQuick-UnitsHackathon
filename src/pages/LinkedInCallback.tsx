import { useEffect } from 'react';
import axios from 'axios';

export const LinkedInCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        try {
          // LinkedIn token'ı al
          const response = await axios.post('/api/linkedin/token', { code });
          const { accessToken, profileId } = response.data;

          // Ana pencereye mesaj gönder
          window.opener.postMessage(
            {
              type: 'LINKEDIN_AUTH_SUCCESS',
              accessToken,
              profileId
            },
            window.location.origin
          );

          // Pencereyi kapat
          window.close();
        } catch (error) {
          console.error('LinkedIn callback hatası:', error);
          window.close();
        }
      } else {
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">LinkedIn Bağlantısı</h1>
        <p className="text-gray-400">LinkedIn hesabınız bağlanıyor, lütfen bekleyin...</p>
      </div>
    </div>
  );
}; 