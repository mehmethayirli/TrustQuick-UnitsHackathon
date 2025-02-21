# TrustNet Full MVP - Setup and Documentation

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Project Setup](#project-setup)
3. [Environment Variables](#environment-variables)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Starting Services](#starting-services)
6. [MetaMask Configuration](#metamask-configuration)
7. [Important URLs](#important-urls)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Security Notes](#security-notes)
11. [Dependencies](#dependencies)
12. [System Architecture](#system-architecture)

## System Requirements

| Requirement | Version | Notes |
|------------|---------|--------|
| Node.js | v18 or higher | Runtime environment |
| Python | 3.11 or higher | For AI services |
| Git | Latest | Version control |
| MetaMask | Latest | Browser extension |

## Project Setup

```bash
# Clone the project
git clone https://github.com/yourusername/trustnet-full-mvp
cd trustnet-full-mvp

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Unix/macOS
# or
.venv\Scripts\activate    # Windows

# Install Python dependencies
cd ai
pip install -r requirements.txt

# Install Node.js dependencies
cd ..
npm install
```

## Environment Variables

### Root Directory `.env`

| Variable | Purpose |
|----------|----------|
| VITE_INFURA_PROJECT_ID | Infura authentication |
| VITE_INFURA_PROJECT_SECRET | Infura secret key |
| VITE_CONTRACT_ADDRESS | Deployed contract address |
| VITE_LINKEDIN_CLIENT_ID | LinkedIn OAuth |

### AI Directory `.env`

| Variable | Purpose |
|----------|----------|
| UNITS_RPC_URL | Units Network endpoint |
| PRIVATE_KEY | Wallet private key (Never share!) |
| TWITTER_CLIENT_ID | Twitter API auth |
| TWITTER_CLIENT_SECRET | Twitter API secret |
| LINKEDIN_CLIENT_ID | LinkedIn OAuth |
| LINKEDIN_CLIENT_SECRET | LinkedIn OAuth secret |
| JWT_SECRET_KEY | JWT authentication |
| API_HOST | API host address |
| API_PORT | API port number |

## Smart Contract Deployment

```bash
# Start Hardhat network
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network units
```

## Starting Services

### Terminal 1 (AI Service)
```bash
cd ai
python main.py
```

### Terminal 2 (Frontend)
```bash
npm run dev
```

## MetaMask Configuration

### Units Network Testnet Settings

| Setting | Value |
|---------|--------|
| Network Name | Units Network Testnet |
| RPC URL | https://rpc-testnet.unit0.dev |
| Chain ID | 88817 |
| Currency Symbol | UNITS |

### ✅Test Contract Trustnet✅
You can view the test token contract and transactions at:
[Units Network Testnet Explorer](https://explorer-testnet.unit0.dev/address/0xEc389dceb1d99fF6D84F64c23156f7d3051B6C0B?tab=txs)

## Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| AI Service | http://localhost:8000 |
| Units Explorer | https://explorer-testnet.unit0.dev |

## Testing Guide

1. Frontend Connection
   - Open frontend URL
   - Click "Connect Wallet"
   - Connect via MetaMask to Units Network Testnet

2. Social Media Analysis
   - Enter Twitter username
   - Connect with LinkedIn
   - Upload documents (PDF, DOCX, or TXT)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Twitter API Rate Limit | Wait 15 minutes and retry |
| LinkedIn Connection Error | Verify callback URL configuration and permissions |
| MetaMask Connection Error | Check network settings and switch to Units Network Testnet |

## Security Notes

- Never share `.env` files or private keys
- Keep all API keys and secrets secure
- Regularly rotate API keys and secrets
- Use environment variables for sensitive data
- Monitor contract interactions on the Units Explorer
- Implement proper access controls for API endpoints

## Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "ethers": "^6.0.0",
    "react": "^18.0.0",
    "framer-motion": "^10.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### Backend Dependencies

| Package | Version |
|---------|---------|
| fastapi | 0.110.0 |
| tweepy | 4.14.0 |
| tensorflow | 2.15.0 |
| transformers | 4.38.2 |

## System Architecture

```
trustnet-full-mvp/
├── ai/                    # AI service
│   ├── models/           # AI models
│   └── utils/            # Helper functions
├── contracts/            # Smart contracts
├── src/                  # Frontend
│   ├── components/       # React components
│   ├── context/         # Context API
│   └── services/        # Web3 services
└── scripts/             # Deployment scripts
```

This documentation provides a comprehensive guide for setting up and running the TrustNet Full MVP. All sensitive data has been removed and replaced with descriptive placeholders. The Units Network Testnet explorer link has been added for contract verification and interaction monitoring. Remember to follow security best practices when handling private keys and sensitive information.
