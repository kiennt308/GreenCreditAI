# GreenCredit AI - Blockchain & AI Integration Platform

A comprehensive platform for green credit evaluation using AI for ESG scoring and Blockchain for transparent storage. This project combines machine learning, blockchain technology, and real-time data integration to provide sustainable finance solutions.

## 🌟 Features

### ✅ Implemented Features

1. **User Authentication with JWT**
   - Secure user registration and login
   - JWT token-based authentication
   - Password hashing with bcryptjs
   - Protected routes and middleware

2. **Management Dashboard**
   - Real-time data visualization with Chart.js
   - User records table with ESG scores and credit amounts
   - Interactive line charts for trend analysis
   - Responsive Bootstrap UI
   - **NEW**: User wallet display with balance and transaction history
   - **NEW**: Pending status tracking with transaction confirmation

3. **Real-World Data Integration**
   - World Bank API integration for CO2 emissions data
   - Auto-fetch ESG data option
   - Real-time data updates

4. **Real-Time Notifications**
   - WebSocket integration with Socket.io
   - Instant transaction notifications
   - Toast notifications for user feedback

5. **Advanced APIs**
   - GET /user-records - Fetch user's blockchain records
   - GET /records/:id - Get specific record details
   - POST /redeem-token - **ENHANCED**: Dynamic loan amount calculation
   - GET /esg-analytics - Aggregate analytics data
   - POST /webhook - Etherscan webhook handler
   - **NEW**: GET /wallet-details - User wallet information
   - **NEW**: POST /mint-tokens - Admin token minting
   - **NEW**: POST /transfer-tokens - User token transfers
   - **NEW**: GET /transaction-status/:txHash - Transaction confirmation status

6. **Token Management System**
   - **NEW**: Admin token minting with safety caps
   - **NEW**: User-to-user token transfers
   - **NEW**: Dynamic loan amount calculation based on ESG score and token balance
   - **NEW**: Real-time transaction status tracking

7. **Security & Performance**
   - Rate limiting (100 requests/15 minutes)
   - Input validation and sanitization
   - Error handling and logging
   - CORS configuration

## 🏗️ Architecture

```
GreenCreditAI/
├── ai/                    # AI/ML components
│   ├── ai_model.py       # RandomForest ESG prediction
│   ├── esg_data.csv      # Training data
│   └── esg_model.pkl     # Trained model
├── backend/              # Node.js/Express API
│   ├── server.js         # Main server with all endpoints
│   ├── userModel.js      # User authentication logic
│   ├── authMiddleware.js # JWT middleware
│   └── package.json      # Backend dependencies
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EvaluationForm.js
│   │   │   └── ProtectedRoute.js
│   │   └── App.js        # Main app with routing
│   └── package.json      # Frontend dependencies
├── blockchain/           # Smart contract info
│   └── contract_info.txt # Contract ABI and address
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.8+
- Git
- MetaMask (for blockchain interaction)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GreenCreditAI
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install AI Dependencies**
   ```bash
   cd ../ai
   pip install -r requirements.txt
   ```

5. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   CONTRACT_ADDRESS=0x102a95bf109E80D130858B19a5419e65f858583d
   ACCOUNT=your_ethereum_account_address
   PRIVATE_KEY=your_private_key
   PORT=3001
   ```

6. **Train the AI Model**
   ```bash
   cd ai
   python ai_model.py train
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on http://localhost:3001

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   Application will run on http://localhost:3000

3. **Access the Application**
   - Open http://localhost:3000 in your browser
   - Register a new account or login
   - Navigate to the dashboard to view your records
   - Use the evaluation form to submit ESG data

## 🪙 Token Management Features

### User Wallet
- **Balance Display**: Real-time token balance with transaction history
- **Transaction History**: Complete record of all token activities
- **Transfer Functionality**: Send tokens to other users with confirmation modal
- **Dynamic Updates**: Automatic balance refresh after transactions

### Admin Token Minting
- **Mint New Tokens**: Admin-only function to create new GreenCredit tokens
- **Safety Caps**: Maximum supply limit to prevent inflation
- **Recipient Selection**: Mint tokens to specific user addresses
- **Real-time Notifications**: Instant updates when tokens are minted

### Dynamic Loan Calculation
- **ESG Score Integration**: Loan amounts adjust based on user's ESG performance
- **Token Balance Multiplier**: Higher token balances increase loan eligibility
- **Real-time Preview**: Live calculation of estimated loan amounts and interest rates
- **Transparent Calculation**: Display of all multipliers and calculation factors

### Transaction Status Tracking
- **Pending Status**: Visual indicators for transactions awaiting confirmation
- **Real-time Polling**: Automatic status updates every 10 seconds
- **Confirmation Tracking**: Clear transition from pending to confirmed status
- **Error Handling**: Timeout handling for failed transactions

## 📊 API Documentation

### Authentication Endpoints

#### POST /register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "createdAt": "date"
  },
  "token": "jwt_token"
}
```

#### POST /login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "createdAt": "date"
  },
  "token": "jwt_token"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

#### POST /evaluate
Submit ESG evaluation data for AI processing and blockchain storage.

**Request Body:**
```json
{
  "revenue": "number",
  "emissions": "number"
}
```

**Response:**
```json
{
  "esgScore": "number",
  "txHash": "string"
}
```

#### GET /user-records
Fetch all user's blockchain records.

**Response:**
```json
[
  {
    "id": "number",
    "user": "string",
    "esgScore": "number",
    "creditAmount": "number",
    "approved": "boolean"
  }
]
```

#### GET /records/:id
Get specific record by ID.

**Response:**
```json
{
  "id": "number",
  "user": "string",
  "esgScore": "number",
  "creditAmount": "number",
  "approved": "boolean"
}
```

#### POST /redeem-token
Redeem tokens for benefits with dynamic loan calculation.

**Request Body:**
```json
{
  "amount": "number",
  "loanAmount": "number (optional)",
  "esgScore": "number (optional)"
}
```

**Response:**
```json
{
  "success": "boolean",
  "discount": "string",
  "loanAmount": "string",
  "interestRate": "string",
  "message": "string",
  "txHash": "string",
  "newBalance": "number"
}
```

#### GET /wallet-details
Get user wallet information including balance and transaction history.

**Response:**
```json
{
  "balance": "number",
  "totalRecords": "number",
  "totalTokens": "number",
  "redeemedAmount": "number",
  "lastRedemption": "number",
  "transactionHistory": "array"
}
```

#### POST /mint-tokens (Admin Only)
Mint new tokens to a specific address.

**Request Body:**
```json
{
  "recipient": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": "boolean",
  "recipient": "string",
  "amount": "number",
  "txHash": "string",
  "message": "string"
}
```

#### POST /transfer-tokens
Transfer tokens to another user.

**Request Body:**
```json
{
  "recipient": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": "boolean",
  "recipient": "string",
  "amount": "number",
  "txHash": "string",
  "message": "string"
}
```

#### GET /transaction-status/:txHash
Check transaction confirmation status.

**Response:**
```json
{
  "status": "string (pending/confirmed)",
  "confirmations": "number",
  "blockNumber": "number",
  "gasUsed": "number",
  "message": "string"
}
```

#### GET /esg-analytics
Get aggregated analytics data.

**Response:**
```json
{
  "totalRecords": "number",
  "averageESGScore": "number",
  "records": "array"
}
```

## 🔧 Development

### Testing

1. **Backend API Testing**
   ```bash
   # Test authentication
   curl -X POST http://localhost:3001/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"password123"}'
   
   # Test evaluation (with token)
   curl -X POST http://localhost:3001/evaluate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"revenue":1000000,"emissions":500}'
   ```

2. **Frontend Testing**
   - Register a new account
   - Login and verify dashboard access
   - Submit evaluation form
   - Check real-time notifications

### Code Structure

- **Backend**: Express.js with middleware pattern
- **Frontend**: React with functional components and hooks
- **AI**: Python with scikit-learn for machine learning
- **Blockchain**: Web3.js for Ethereum interaction
- **Real-time**: Socket.io for WebSocket communication

## 🚀 Deployment

### Docker Deployment

1. **Create Dockerfile for Backend**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "3001:3001"
       environment:
         - CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
         - ACCOUNT=${ACCOUNT}
         - PRIVATE_KEY=${PRIVATE_KEY}
     
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       depends_on:
         - backend
   ```

### Production Considerations

1. **Security**
   - Use environment variables for sensitive data
   - Implement proper CORS policies
   - Use HTTPS in production
   - Regular security audits

2. **Performance**
   - Implement caching strategies
   - Use CDN for static assets
   - Database optimization
   - Load balancing

3. **Monitoring**
   - Application logging
   - Error tracking
   - Performance monitoring
   - Health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Nguyen Trung Kien
- Do Dang Trinh  
- Nguyen Kieu Bao Khanh

## 🌾 Vietnamese Agricultural Company Scenario

### Real-World Use Case: Company A Loan Application

**Scenario**: A Vietnamese agricultural company (Company A) seeks a 500 million VND loan from HDBank for sustainable irrigation, involving ESG evaluation, transparent storage with token rewards, and ongoing monitoring.

#### Complete Flow:

1. **Data Submission**
   - Company A registers on the platform
   - Submits loan application with project details
   - Provides financial data (revenue: 2B VND, emissions: 150 tons CO2)
   - Describes sustainable irrigation project

2. **AI Analysis**
   - RandomForest model analyzes ESG factors
   - Calculates ESG score based on revenue and emissions
   - Determines creditworthiness and interest rate

3. **Blockchain Storage & Reward**
   - ESG data stored on Ethereum blockchain
   - GreenCredit tokens minted based on ESG score
   - Transparent, immutable record of evaluation

4. **Results & Notifications**
   - Real-time WebSocket notifications
   - Approval status and interest rate display
   - Token balance and redemption options

5. **Dashboard Tracking**
   - Progress tracking with trend analysis
   - Enhanced analytics with filtering
   - Token redemption for bank benefits
   - Admin approval workflow

#### Test the Scenario:

```bash
# Run the complete scenario test
node test-scenario.js
```

Expected output:
- Company registration and authentication
- 500M VND loan application submission
- ESG score calculation and approval
- Token earning and redemption
- Progress tracking and analytics
- Real-time notifications

## 🔗 Links

- [Live Demo](http://localhost:3000)
- [API Documentation](http://localhost:3001/api-docs)
- [Smart Contract](https://sepolia.etherscan.io/address/0x102a95bf109E80D130858B19a5419e65f858583d)
- [Deployment Guide](DEPLOYMENT.md)

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a prototype for demonstration purposes. For production use, additional security measures, testing, and optimization are required.
