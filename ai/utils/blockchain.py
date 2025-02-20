from web3 import Web3
from typing import Dict
import json
import os
from dotenv import load_dotenv

load_dotenv()

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(os.getenv('RPC_URL', 'http://localhost:8545')))
        
        # Kontrat ABI ve adresini yükle
        with open('../src/contracts/TrustNet.json') as f:
            contract_data = json.load(f)
            self.contract_abi = contract_data['abi']
            
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        if not self.contract_address:
            raise ValueError("CONTRACT_ADDRESS çevresel değişkeni bulunamadı")
            
        # Kontrat nesnesini oluştur
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        
        # Private key'i yükle
        self.private_key = os.getenv('PRIVATE_KEY')
        if not self.private_key:
            raise ValueError("PRIVATE_KEY çevresel değişkeni bulunamadı")
            
        # Hesabı oluştur
        self.account = self.w3.eth.account.from_key(self.private_key)

    async def update_scores(
        self,
        user_address: str,
        overall_score: float,
        financial_score: float,
        professional_score: float,
        social_score: float
    ) -> bool:
        try:
            # Convert scores to integers (contract expects uint256)
            scores = [
                int(overall_score),
                int(financial_score),
                int(professional_score),
                int(social_score)
            ]
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(self.w3.eth.account.from_key(self.private_key).address)
            
            tx = self.contract.functions.updateScores(
                user_address,
                *scores
            ).build_transaction({
                'chainId': 1001,  # Units Network chain ID
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return receipt.status == 1
        except Exception as e:
            print(f"Error updating scores on blockchain: {e}")
            return False
            
    async def verify_reference(self, user_address: str, reference_index: int) -> bool:
        try:
            nonce = self.w3.eth.get_transaction_count(self.w3.eth.account.from_key(self.private_key).address)
            
            tx = self.contract.functions.verifyReference(
                user_address,
                reference_index
            ).build_transaction({
                'chainId': 1001,
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return receipt.status == 1
        except Exception as e:
            print(f"Error verifying reference on blockchain: {e}")
            return False

async def update_blockchain_scores(address: str, overall_score: float, details: Dict) -> bool:
    """
    Analiz sonuçlarını blockchain'e kaydeder.
    
    Args:
        address: Kullanıcı adresi
        overall_score: Genel güven skoru
        details: Detaylı skor bilgileri
        
    Returns:
        bool: İşlem başarılı ise True, değilse False
    """
    try:
        service = BlockchainService()
        
        # Skorları normalize et (0-100 -> 0-1)
        normalized_scores = {
            'overall': overall_score / 100,
            'financial': details.get('financial', 0) / 100,
            'professional': details.get('professional', 0) / 100,
            'social': details.get('social', 0) / 100
        }
        
        # Transaction'ı oluştur
        tx = service.contract.functions.updateScores(
            address,
            int(normalized_scores['overall'] * 100),
            int(normalized_scores['financial'] * 100),
            int(normalized_scores['professional'] * 100),
            int(normalized_scores['social'] * 100)
        ).build_transaction({
            'from': service.account.address,
            'nonce': service.w3.eth.get_transaction_count(service.account.address),
            'gas': 2000000,
            'gasPrice': service.w3.eth.gas_price
        })
        
        # Transaction'ı imzala ve gönder
        signed_tx = service.w3.eth.account.sign_transaction(tx, service.private_key)
        tx_hash = service.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Transaction'ın onaylanmasını bekle
        receipt = service.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.status == 1
        
    except Exception as e:
        print(f"Blockchain güncelleme hatası: {e}")
        return False