const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const Web3 = require('web3');
require('dotenv').config();

const { register, login } = require('./userModel');
const { authenticateToken } = require('./authMiddleware');

// Thay bằng Infura key (tạo miễn phí tại https://app.infura.io/register)
const web3 = new Web3('https://sepolia.infura.io/v3/163d705cc5c14d53b5abc349908cb2c9');
const simpleABI = require('../simple-abi.js');
const abi = simpleABI;

const contractAddress = process.env.CONTRACT_ADDRESS;
const account = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;
const contract = new web3.eth.Contract(abi, contractAddress);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const recordCount = await contract.methods.recordCount().call();
        res.json({
            status: 'healthy',
            blockchain: {
                connected: true,
                contractAddress: contractAddress,
                recordCount: parseInt(recordCount)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Authentication routes
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await register(username, email, password);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await login(email, password);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Protected routes
app.get('/user-records', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching user records for user:', req.user.username);
        const recordCount = await contract.methods.recordCount().call();
        console.log('Total records in contract:', recordCount);
        
        const records = [];

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                id: i,
                user: record.user,
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount),
                approved: record.approved,
                timestamp: Date.now(), // Use current timestamp as fallback
                projectDescription: 'Legacy record', // Default description
                loanAmount: parseInt(record.creditAmount) // Use creditAmount as loanAmount
            });
        }

        console.log('Returning', records.length, 'records');
        res.json(records);
    } catch (err) {
        console.error('Error fetching user records:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/records/:id', authenticateToken, async (req, res) => {
    try {
        const recordId = parseInt(req.params.id);
        const record = await contract.methods.getRecord(recordId).call();
        
        res.json({
            id: recordId,
            user: record.user,
            esgScore: parseInt(record.esgScore),
            creditAmount: parseInt(record.creditAmount),
            approved: record.approved,
            timestamp: Date.now(), // Use current timestamp as fallback
            projectDescription: 'Legacy record', // Default description
            loanAmount: parseInt(record.creditAmount) // Use creditAmount as loanAmount
        });
    } catch (err) {
        console.error('Error fetching record:', err);
        res.status(500).json({ error: err.message });
    }
});

// ESG Evaluation endpoint
app.post('/evaluate', authenticateToken, async (req, res) => {
    try {
        const { 
            emissions, 
            waterUsage, 
            wasteManagement, 
            renewableEnergy, 
            socialImpact,
            projectDescription = 'ESG Evaluation',
            loanAmount = 0
        } = req.body;

        // Call AI model
        const { spawn } = require('child_process');
        const python = spawn('python', ['../ai/ai_model.py'], { cwd: __dirname });
        
        let dataString = '';
        python.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        python.stdin.write(JSON.stringify({
            emissions: parseFloat(emissions) || 0,
            waterUsage: parseFloat(waterUsage) || 0,
            wasteManagement: parseFloat(wasteManagement) || 0,
            renewableEnergy: parseFloat(renewableEnergy) || 0,
            socialImpact: parseFloat(socialImpact) || 0
        }));
        python.stdin.end();

        python.on('close', async (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'AI model failed' });
            }

            try {
                const result = JSON.parse(dataString);
                const esgScore = Math.round(result.esg_score);
                const creditAmount = Math.round(esgScore * 100); // 100 tokens per ESG point

                // Add record to blockchain
                const tx = await contract.methods.addRecord(esgScore, creditAmount).send({
                    from: account,
                    gas: 300000
                });

                // Emit WebSocket event
                io.emit('transactionUpdate', {
                    esgScore: esgScore,
                    txHash: tx.transactionHash,
                    creditAmount: creditAmount,
                    user: req.user.username
                });

                res.json({
                    esgScore: esgScore,
                    creditAmount: creditAmount,
                    txHash: tx.transactionHash,
                    approved: esgScore > 70,
                    interestRate: esgScore > 70 ? 5.5 : 8.0,
                    projectDescription: projectDescription,
                    loanAmount: loanAmount
                });
            } catch (err) {
                console.error('Error processing AI result:', err);
                res.status(500).json({ error: err.message });
            }
        });

    } catch (err) {
        console.error('Error in evaluation:', err);
        res.status(500).json({ error: err.message });
    }
});

// Token redemption
app.post('/redeem-token', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const userAddress = account; // In real app, get from user's wallet
        
        const balance = await contract.methods.balanceOf(userAddress).call();
        if (parseInt(balance) < amount) {
            return res.status(400).json({ error: 'Insufficient token balance' });
        }

        // Simulate bank API call for discount
        const discount = Math.min(amount / 100, 0.15); // Max 15% discount
        const discountPercent = Math.round(discount * 100);
        
        res.json({
            success: true,
            redeemedAmount: amount,
            discount: `${discountPercent}% interest reduction`,
            message: `Successfully redeemed ${amount} tokens for ${discountPercent}% interest reduction`
        });
    } catch (err) {
        console.error('Error redeeming tokens:', err);
        res.status(500).json({ error: err.message });
    }
});

// Progress tracker
app.get('/progress-tracker', authenticateToken, async (req, res) => {
    try {
        const recordCount = await contract.methods.recordCount().call();
        const records = [];
        let totalESGScore = 0;
        let totalEmissions = 0;

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                id: i,
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount),
                timestamp: Date.now() - (recordCount - i) * 86400000 // Simulate historical data
            });
            totalESGScore += parseInt(record.esgScore);
            totalEmissions += 1000; // Simulate emissions data
        }

        const averageESG = records.length > 0 ? totalESGScore / records.length : 0;
        const carbonReduction = totalEmissions * 0.1; // 10% reduction estimate

        res.json({
            totalRecords: records.length,
            averageESGScore: Math.round(averageESG),
            carbonReduction: Math.round(carbonReduction),
            trends: records.map(r => ({
                date: new Date(r.timestamp).toISOString().split('T')[0],
                esgScore: r.esgScore
            }))
        });
    } catch (err) {
        console.error('Error fetching progress data:', err);
        res.status(500).json({ error: err.message });
    }
});

// ESG Analytics
app.get('/esg-analytics', authenticateToken, async (req, res) => {
    try {
        const { sector, startDate, endDate, minScore, maxScore } = req.query;
        const recordCount = await contract.methods.recordCount().call();
        const records = [];
        let totalESGScore = 0;
        let totalCreditAmount = 0;

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                id: i,
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount),
                timestamp: Date.now() - (recordCount - i) * 86400000
            });
            totalESGScore += parseInt(record.esgScore);
            totalCreditAmount += parseInt(record.creditAmount);
        }

        const averageESG = records.length > 0 ? totalESGScore / records.length : 0;
        const averageCredit = records.length > 0 ? totalCreditAmount / records.length : 0;

        res.json({
            totalRecords: records.length,
            averageESGScore: Math.round(averageESG),
            averageCreditAmount: Math.round(averageCredit),
            totalCreditAmount: totalCreditAmount,
            records: records
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: err.message });
    }
});

// Pending approvals
app.get('/pending-approvals', authenticateToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const recordCount = await contract.methods.recordCount().call();
        const pendingRecords = [];

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            if (!record.approved) {
                pendingRecords.push({
                    id: i,
                    user: record.user,
                    esgScore: parseInt(record.esgScore),
                    creditAmount: parseInt(record.creditAmount),
                    timestamp: Date.now() - (recordCount - i) * 86400000
                });
            }
        }

        res.json(pendingRecords);
    } catch (err) {
        console.error('Error fetching pending approvals:', err);
        res.status(500).json({ error: err.message });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
