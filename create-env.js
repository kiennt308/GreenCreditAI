const fs = require('fs');
const path = require('path');

const envContent = `# Blockchain Configuration
CONTRACT_ADDRESS=0x102a95bf109E80D130858B19a5419e65f858583d
ACCOUNT=your_ethereum_account_address
PRIVATE_KEY=your_private_key

# Server Configuration
PORT=3001

# Database Configuration (for MongoDB integration)
MONGODB_URI=mongodb://localhost:27017/greencredit

# JWT Configuration
JWT_SECRET=greencreditsecret
JWT_EXPIRES_IN=1h

# API Keys (for production)
WORLD_BANK_API_KEY=your_world_bank_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created backend/.env file');
    console.log('⚠️  Please update the environment variables with your actual values');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
}
