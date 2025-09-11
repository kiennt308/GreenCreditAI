const express = require('express');
const { spawnSync } = require('child_process');
const Web3 = require('web3');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
require('dotenv').config();
const cors = require('cors');
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Import authentication modules
const { register, login } = require('./userModel');
const { authenticateToken } = require('./authMiddleware');

// Thay bằng Infura key (tạo miễn phí tại https://app.infura.io/register)
const web3 = new Web3('https://sepolia.infura.io/v3/163d705cc5c14d53b5abc349908cb2c9');
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_esgScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_creditAmount",
				"type": "uint256"
			}
		],
		"name": "addRecord",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "esgScore",
				"type": "uint256"
			}
		],
		"name": "RecordAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getRecord",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "esgScore",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "creditAmount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"internalType": "struct GreenCredit.CreditRecord",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "recordCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "records",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "esgScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creditAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = process.env.CONTRACT_ADDRESS;
const account = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;
const contract = new web3.eth.Contract(abi, contractAddress);

// Authentication Routes
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await register(username, email, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});





app.post('/evaluate', authenticateToken, async (req, res) => {
    const { revenue, emissions } = req.body;

    // Đường dẫn tuyệt đối tới ai_model.py
    const pythonPath = path.join(__dirname, '../ai/ai_model.py');
    

    // Gọi Python AI
    const pyProcess = spawnSync('python', ['ai_model.py', revenue.toString(), emissions.toString()], {
        cwd: path.join(__dirname, '../ai'),  // Chuyển working directory về thư mục ai
        encoding: 'utf-8'
    });

    console.log("Python stdout:", pyProcess.stdout);
    console.log("Python stderr:", pyProcess.stderr);

    const rawOutput = pyProcess.stdout.toString().trim();
    const esgScore = Number(rawOutput);

    if (isNaN(esgScore)) {
        return res.status(500).json({ 
            error: "Python returned invalid number: " + rawOutput,
            stderr: pyProcess.stderr
        });
    }

    // Lưu vào Blockchain
    try {
        const tx = contract.methods.addRecord(Math.round(esgScore), 1000);
        const gas = await tx.estimateGas({ from: account });

        // Lấy gasPrice hiện tại và tăng 20%
        const gasPrice = Math.floor(Number(await web3.eth.getGasPrice()) * 1.2);

        // Lấy nonce mới nhất (bao gồm tx pending)
        const nonce = await web3.eth.getTransactionCount(account, 'pending');

        const txData = {
            from: account,
            to: contractAddress,
            data: tx.encodeABI(),
            gas,
            gasPrice,
            nonce
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ esgScore, txHash: receipt.transactionHash });
        
        // Emit real-time notification
        io.emit('transactionUpdate', {
            esgScore: Math.round(esgScore),
            txHash: receipt.transactionHash
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Additional API endpoints
app.get('/user-records', authenticateToken, async (req, res) => {
    try {
        const recordCount = await contract.methods.recordCount().call();
        const records = [];

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                id: i,
                user: record.user,
                esgScore: record.esgScore,
                creditAmount: record.creditAmount,
                approved: record.approved
            });
        }

        res.json(records);
    } catch (err) {
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
            esgScore: record.esgScore,
            creditAmount: record.creditAmount,
            approved: record.approved
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/redeem-token', authenticateToken, async (req, res) => {
    try {
        // Mock token redemption - in a real app, you'd check actual token balance
        const mockDiscount = "10% interest reduction";
        res.json({ 
            success: true, 
            discount: mockDiscount,
            message: "Token redeemed successfully!"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/esg-analytics', authenticateToken, async (req, res) => {
    try {
        const recordCount = await contract.methods.recordCount().call();
        const records = [];
        let totalESGScore = 0;

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount)
            });
            totalESGScore += parseInt(record.esgScore);
        }

        const averageESGScore = recordCount > 0 ? totalESGScore / recordCount : 0;

        res.json({
            totalRecords: parseInt(recordCount),
            averageESGScore: Math.round(averageESGScore * 100) / 100,
            records: records
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/webhook', (req, res) => {
    // Handle Etherscan webhook for transaction confirmations
    console.log('Webhook received:', req.body);
    res.json({ success: true });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));