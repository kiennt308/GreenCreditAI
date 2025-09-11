#!/bin/bash

echo "🚀 Setting up GreenCredit AI Platform..."

# Create .env file for backend
cat > backend/.env << EOF
CONTRACT_ADDRESS=0x102a95bf109E80D130858B19a5419e65f858583d
ACCOUNT=your_ethereum_account_address
PRIVATE_KEY=your_private_key
PORT=3001
MONGODB_URI=mongodb://localhost:27017/greencredit
JWT_SECRET=greencreditsecret
JWT_EXPIRES_IN=1h
EOF

echo "✅ Environment file created"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install AI dependencies
echo "📦 Installing AI dependencies..."
cd ai
pip install -r requirements.txt
cd ..

# Train the AI model
echo "🤖 Training AI model..."
cd ai
python ai_model.py train
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Update backend/.env with your Ethereum account details"
echo "2. Start backend: cd backend && npm start"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For Docker deployment:"
echo "1. Update .env variables in docker-compose.yml"
echo "2. Run: docker-compose up"
