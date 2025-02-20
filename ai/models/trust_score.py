import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import List, Tuple, Optional, Dict
import tensorflow as tf
from eth_account.messages import encode_defunct
from web3 import Web3
import json
import os

class TrustScoreCalculator:
    def __init__(self):
        self.model = self._build_model()
        self.scaler = MinMaxScaler()
        self.w3 = Web3(Web3.HTTPProvider(os.getenv("UNITS_RPC_URL")))
        
    def _build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model

    def verify_signature(self, message: str, signature: str, address: str) -> bool:
        message_hash = encode_defunct(text=message)
        try:
            signer = self.w3.eth.account.recover_message(message_hash, signature=signature)
            return signer.lower() == address.lower()
        except Exception as e:
            print(f"İmza doğrulama hatası: {e}")
            return False

    async def calculate_financial_score(self, financial_data: Optional[Dict]) -> float:
        if not financial_data:
            return 50.0

        try:
            features = self._extract_financial_features(financial_data)
            normalized_features = self.scaler.fit_transform(features.reshape(1, -1))
            score = float(self.model.predict(normalized_features)[0][0] * 100)
            
            # Skor doğrulama
            if not (0 <= score <= 100):
                print(f"Geçersiz skor hesaplandı: {score}")
                return 50.0
                
            return score
        except Exception as e:
            print(f"Finansal skor hesaplama hatası: {e}")
            return 50.0

    def _extract_financial_features(self, data: Dict) -> np.ndarray:
        features = []
        
        # Kredi geçmişi
        features.append(data.get('credit_score', 650) / 850)  # Kredi skoru
        features.append(data.get('payment_history', 0.8))     # Ödeme geçmişi
        
        # Gelir istikrarı
        features.append(data.get('income_stability', 0.7))    # Gelir istikrarı
        features.append(data.get('debt_to_income', 0.3))      # Borç/Gelir oranı
        
        # Hesap aktivitesi
        features.append(data.get('account_age', 5) / 20)      # Hesap yaşı
        features.append(data.get('transaction_consistency', 0.8))  # İşlem tutarlılığı
        
        # Risk faktörleri
        features.append(1 - data.get('default_risk', 0.1))    # Temerrüt riski
        features.append(1 - data.get('fraud_risk', 0.05))     # Dolandırıcılık riski
        
        # Ek metrikler
        features.append(data.get('savings_ratio', 0.2))       # Tasarruf oranı
        features.append(data.get('investment_diversity', 0.6)) # Yatırım çeşitliliği
        
        return np.array(features)

    def calculate_overall_score(self, component_scores: List[Tuple[float, float]]) -> float:
        """
        Bileşen skorlarının ağırlıklı ortalamasını hesapla
        Args:
            component_scores: (skor, ağırlık) tuple'larının listesi
        """
        if not component_scores:
            return 50.0

        total_score = 0
        total_weight = 0
        
        for score, weight in component_scores:
            if not (0 <= score <= 100):
                print(f"Geçersiz bileşen skoru: {score}")
                continue
                
            total_score += score * weight
            total_weight += weight
            
        if total_weight == 0:
            return 50.0
            
        final_score = total_score / total_weight
        return max(0, min(100, final_score))  # Skoru 0-100 aralığında sınırla