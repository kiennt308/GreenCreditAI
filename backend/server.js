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
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

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
			},
			{
				"internalType": "string",
				"name": "_projectDescription",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_loanAmount",
				"type": "uint256"
			}
		],
		"name": "addRecord",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_recordId",
				"type": "uint256"
			}
		],
		"name": "approveCredit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "initialMint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "recordId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			}
		],
		"name": "CreditApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "esgScore",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "creditAmount",
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
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "redeemTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "discount",
				"type": "string"
			}
		],
		"name": "TokensRedeemed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
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
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
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
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "projectDescription",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "loanAmount",
						"type": "uint256"
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
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalRecords",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalTokens",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "redeemedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastRedemption",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastRedemptionTime",
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
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
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
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "projectDescription",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "redeemedTokens",
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
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
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
		"inputs": [],
		"name": "totalTokensMinted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
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





// ✅ Evaluate ESG score
app.post('/evaluate', authenticateToken, async (req, res) => {
    try {
        const { revenue, emissions } = req.body;

        // Debug log
        console.log("DEBUG /evaluate body:", req.body);

        // Validate input
        if (revenue === undefined || emissions === undefined) {
            return res.status(400).json({
                error: "Missing required fields: revenue and emissions"
            });
        }

        // Ensure numeric values
        const revenueStr = revenue.toString();
        const emissionsStr = emissions.toString();

        // Run Python model (cross-platform compatible)
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const pyProcess = spawnSync(pythonCommand, ['ai_model.py', revenueStr, emissionsStr], {
            cwd: path.join(__dirname, '../ai'),
            encoding: 'utf-8'
        });

        if (pyProcess.error) {
            console.error("Python error:", pyProcess.error);
            return res.status(500).json({ error: pyProcess.error.message });
        }

        // Clean outputs
        const stdout = (pyProcess.stdout || "").trim();
        const stderr = (pyProcess.stderr || "").trim();

        // Return result
        return res.json({
            result: stdout,
            error: stderr
        });

    } catch (err) {
        console.error("Error in /evaluate:", err);
        return res.status(500).json({ error: err.message });
    }
});

// Create new record endpoint
app.post('/create-record', authenticateToken, async (req, res) => {
    try {
        const { esgScore, creditAmount, projectDescription, loanAmount } = req.body;
        
        // Validate input
        if (!esgScore || !creditAmount) {
            return res.status(400).json({
                error: "Missing required fields: esgScore and creditAmount"
            });
        }
        
        // Call smart contract to create record
        const tx = contract.methods.addRecord(
            parseInt(esgScore),
            parseInt(creditAmount),
            projectDescription || 'ESG Project',
            parseInt(loanAmount) || parseInt(creditAmount)
        );
        
        const gas = await tx.estimateGas({ from: account });
        const gasPrice = Math.floor(Number(await web3.eth.getGasPrice()) * 1.2);
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
        
        console.log('Transaction receipt:', JSON.stringify(receipt, null, 2));
        
        // Get the record ID from the event (handle case where event might not be available)
        let recordId = null;
        if (receipt.events && receipt.events.RecordAdded) {
            recordId = receipt.events.RecordAdded.returnValues.id;
            console.log('Record ID from event:', recordId);
        } else {
            console.log('RecordAdded event not found, using fallback method');
            // Fallback: get record count from contract to determine new record ID
            try {
                const recordCount = await contract.methods.recordCount().call();
                recordId = recordCount - 1; // New record will be at index (count - 1)
                console.log('Record ID from contract count:', recordId);
            } catch (err) {
                console.log('Could not get record count, using fallback ID');
                recordId = 'unknown';
            }
        }
        
        res.json({
            success: true,
            recordId: recordId,
            txHash: receipt.transactionHash,
            message: 'Record created successfully',
            data: {
                esgScore: parseInt(esgScore),
                creditAmount: parseInt(creditAmount),
                projectDescription: projectDescription || 'ESG Project',
                loanAmount: parseInt(loanAmount) || parseInt(creditAmount)
            }
        });
        
    } catch (err) {
        console.error('Error creating record:', err);
        res.status(500).json({ error: err.message });
    }
});

// Additional API endpoints
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

app.post('/redeem-token', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        // Check user's token balance
        const userAddress = req.user.walletAddress || account; // Fallback to contract account
        const balance = await contract.methods.balanceOf(userAddress).call();
        
        if (parseInt(balance) < parseInt(amount)) {
            return res.status(400).json({ error: 'Insufficient token balance' });
        }

        // Redeem tokens (burn them)
        const tx = contract.methods.redeemTokens(amount);
        const gas = await tx.estimateGas({ from: account });
        const gasPrice = Math.floor(Number(await web3.eth.getGasPrice()) * 1.2);
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

        // Simulate bank API call for interest discount
        const discountResponse = await simulateBankAPI(amount);
        
        // Emit real-time notification
        io.emit('tokenRedeemed', {
            user: req.user.username,
            amount: amount,
            discount: discountResponse.discount,
            txHash: receipt.transactionHash
        });

        res.json({
            success: true,
            discount: discountResponse.discount,
            message: "Tokens redeemed successfully!",
            txHash: receipt.transactionHash,
            newBalance: parseInt(balance) - parseInt(amount)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calculate interest rate based on ESG score
function calculateInterestRate(esgScore) {
    if (esgScore >= 90) return 6.5; // Excellent ESG
    if (esgScore >= 80) return 7.0; // Good ESG
    if (esgScore >= 70) return 7.5; // Fair ESG
    if (esgScore >= 60) return 8.0; // Below average
    return 8.5; // Poor ESG
}

// Simulate bank API call for interest discount
async function simulateBankAPI(tokenAmount) {
    try {
        // Mock bank API response based on token amount
        const amount = parseInt(tokenAmount);
        let discount = "2% interest reduction";
        
        if (amount >= 1000) {
            discount = "15% interest reduction on 500M VND loan";
        } else if (amount >= 500) {
            discount = "10% interest reduction on 500M VND loan";
        } else if (amount >= 100) {
            discount = "5% interest reduction on 500M VND loan";
        }
        
        return {
            discount: discount,
            loanAmount: "500,000,000 VND",
            interestRate: "8.5%",
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
    } catch (error) {
        return {
            discount: "2% interest reduction",
            loanAmount: "500,000,000 VND",
            interestRate: "8.5%",
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
    }
}

app.get('/progress-tracker', authenticateToken, async (req, res) => {
    try {
        const recordCount = await contract.methods.recordCount().call();
        const records = [];
        let totalESGScore = 0;
        let totalEmissions = 0;
        let totalRevenue = 0;

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            const recordData = {
                id: i,
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount),
                timestamp: parseInt(record.timestamp),
                projectDescription: record.projectDescription,
                loanAmount: parseInt(record.loanAmount),
                approved: record.approved
            };
            records.push(recordData);
            totalESGScore += parseInt(record.esgScore);
        }

        // Sort by timestamp for trend analysis
        records.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate trends
        const trends = calculateTrends(records);
        const averageESGScore = recordCount > 0 ? totalESGScore / recordCount : 0;

        res.json({
            totalRecords: parseInt(recordCount),
            averageESGScore: Math.round(averageESGScore * 100) / 100,
            records: records,
            trends: trends,
            progressMetrics: {
                esgImprovement: trends.esgImprovement,
                carbonReduction: trends.carbonReduction,
                sustainabilityScore: trends.sustainabilityScore
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/esg-analytics', authenticateToken, async (req, res) => {
    try {
        const { sector, startDate, endDate, minScore, maxScore } = req.query;
        const recordCount = await contract.methods.recordCount().call();
        const records = [];
        let totalESGScore = 0;
        let totalCreditAmount = 0;

        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
			const timestamp = parseInt(record.timestamp);
            const isValidTimestamp = !isNaN(timestamp) && timestamp > 0;
			const currentTime = Math.floor(Date.now() / 1000);
			
            const recordData = {
                id: i,
                esgScore: parseInt(record.esgScore),
                creditAmount: parseInt(record.creditAmount),
                timestamp: isValidTimestamp ? timestamp : currentTime, // Fallback to current time,
                projectDescription: record.projectDescription,
                loanAmount: parseInt(record.loanAmount),
                approved: record.approved,
                sector: determineSector(record.projectDescription || "")
            };

            // Apply filters
            let includeRecord = true;

            if (sector && recordData.sector !== sector) includeRecord = false;
            if (minScore && recordData.esgScore < parseInt(minScore)) includeRecord = false;
            if (maxScore && recordData.esgScore > parseInt(maxScore)) includeRecord = false;
            if (startDate && recordData.timestamp < new Date(startDate).getTime() / 1000) includeRecord = false;
            if (endDate && recordData.timestamp > new Date(endDate).getTime() / 1000) includeRecord = false;

            if (includeRecord) {
                records.push(recordData);
                totalESGScore += recordData.esgScore;
                totalCreditAmount += recordData.creditAmount;
            }
        }

        const averageESGScore = records.length > 0 ? totalESGScore / records.length : 0;
        const averageCreditAmount = records.length > 0 ? totalCreditAmount / records.length : 0;

        // Calculate sector-based analytics
        const sectorAnalytics = calculateSectorAnalytics(records);
        const timeSeriesData = calculateTimeSeriesData(records);

        res.json({
            totalRecords: records.length,
            averageESGScore: Math.round(averageESGScore * 100) / 100,
            averageCreditAmount: Math.round(averageCreditAmount * 100) / 100,
            records: records,
            sectorAnalytics: sectorAnalytics,
            timeSeriesData: timeSeriesData,
            filters: {
                sector: sector || 'all',
                startDate: startDate || null,
                endDate: endDate || null,
                minScore: minScore || null,
                maxScore: maxScore || null
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Determine sector based on project description
function determineSector(description) {
    const desc = description?.toLowerCase();
    if (desc.includes('agriculture') || desc.includes('farming') || desc.includes('irrigation')) return 'Agriculture';
    if (desc.includes('energy') || desc.includes('solar') || desc.includes('wind')) return 'Energy';
    if (desc.includes('manufacturing') || desc.includes('production')) return 'Manufacturing';
    if (desc.includes('transport') || desc.includes('logistics')) return 'Transportation';
    if (desc.includes('construction') || desc.includes('building')) return 'Construction';
    return 'Other';
}

// Calculate sector-based analytics
function calculateSectorAnalytics(records) {
    const sectors = {};
    
    records.forEach(record => {
        if (!sectors[record.sector]) {
            sectors[record.sector] = {
                count: 0,
                totalESG: 0,
                totalCredit: 0,
                records: []
            };
        }
        
        sectors[record.sector].count++;
        sectors[record.sector].totalESG += record.esgScore;
        sectors[record.sector].totalCredit += record.creditAmount;
        sectors[record.sector].records.push(record);
    });

    // Calculate averages
    Object.keys(sectors).forEach(sector => {
        sectors[sector].averageESG = Math.round((sectors[sector].totalESG / sectors[sector].count) * 100) / 100;
        sectors[sector].averageCredit = Math.round((sectors[sector].totalCredit / sectors[sector].count) * 100) / 100;
    });

    return sectors;
}

// Calculate time series data for charts
function calculateTimeSeriesData(records) {
    const monthlyData = {};
    
    records.forEach(record => {
        const date = new Date(record.timestamp * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                count: 0,
                totalESG: 0,
                totalCredit: 0
            };
        }
        
        monthlyData[monthKey].count++;
        monthlyData[monthKey].totalESG += record.esgScore;
        monthlyData[monthKey].totalCredit += record.creditAmount;
    });

    // Convert to array and calculate averages
    return Object.keys(monthlyData).map(month => ({
        month: month,
        count: monthlyData[month].count,
        averageESG: Math.round((monthlyData[month].totalESG / monthlyData[month].count) * 100) / 100,
        averageCredit: Math.round((monthlyData[month].totalCredit / monthlyData[month].count) * 100) / 100
    })).sort((a, b) => a.month.localeCompare(b.month));
}

// Calculate sustainability trends
function calculateTrends(records) {
    if (records.length < 2) {
        return {
            esgImprovement: 0,
            carbonReduction: 0,
            sustainabilityScore: 0,
            trendDirection: 'stable'
        };
    }

    // Calculate ESG improvement trend
    const firstESG = records[0].esgScore;
    const lastESG = records[records.length - 1].esgScore;
    const esgImprovement = lastESG - firstESG;

    // Calculate carbon reduction estimate (mock calculation)
    const carbonReduction = Math.max(0, esgImprovement * 0.1); // 0.1 tons per ESG point improvement

    // Calculate overall sustainability score
    const sustainabilityScore = Math.min(100, Math.max(0, lastESG + (esgImprovement * 0.5)));

    // Determine trend direction
    let trendDirection = 'stable';
    if (esgImprovement > 5) trendDirection = 'improving';
    else if (esgImprovement < -5) trendDirection = 'declining';

    return {
        esgImprovement: Math.round(esgImprovement * 100) / 100,
        carbonReduction: Math.round(carbonReduction * 100) / 100,
        sustainabilityScore: Math.round(sustainabilityScore * 100) / 100,
        trendDirection: trendDirection,
        records: records.map(r => ({
            x: new Date(r.timestamp * 1000).toISOString().split('T')[0],
            y: r.esgScore
        }))
    };
}

app.get('/user-stats', authenticateToken, async (req, res) => {
    try {
        // Simplified version - return mock data for now
        const recordCount = await contract.methods.recordCount().call();
        const userAddress = req.user.walletAddress || account;
        
        // Calculate total tokens from records
        let totalTokens = 0;
        for (let i = 0; i < recordCount; i++) {
            const record = await contract.methods.getRecord(i).call();
            if (record.user.toLowerCase() === userAddress.toLowerCase()) {
                totalTokens += parseInt(record.creditAmount);
            }
        }
        
        res.json({
            totalRecords: parseInt(recordCount),
            totalTokens: totalTokens,
            redeemedAmount: 0,
            lastRedemption: 0
        });
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/approve-credit', authenticateToken, async (req, res) => {
    try {
        const { recordId, finalLoanAmount, adminNotes } = req.body;
        
        // Check if user is admin (in production, use proper role-based access)
        const isAdmin = req.user.email === 'admin@greencredit.ai' || req.user.username === 'admin';
        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        if (!recordId) {
            return res.status(400).json({ error: 'Record ID is required' });
        }

        // Approve credit on blockchain
        const tx = contract.methods.approveCredit(recordId);
        const gas = await tx.estimateGas({ from: account });
        const gasPrice = Math.floor(Number(await web3.eth.getGasPrice()) * 1.2);
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

        // Emit real-time notification
        io.emit('creditApproved', {
            recordId: recordId,
            finalLoanAmount: finalLoanAmount || 500000000,
            adminNotes: adminNotes || 'Approved by admin',
            txHash: receipt.transactionHash,
            approvedBy: req.user.username
        });

        res.json({
            success: true,
            recordId: recordId,
            finalLoanAmount: finalLoanAmount || 500000000,
            txHash: receipt.transactionHash,
            message: 'Credit approved successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/pending-approvals', authenticateToken, async (req, res) => {
    try {
        const isAdmin = req.user.email === 'admin@greencredit.ai' || req.user.username === 'admin';
        if (!isAdmin) {
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
                    loanAmount: parseInt(record.loanAmount),
                    projectDescription: record.projectDescription,
                    timestamp: parseInt(record.timestamp)
                });
            }
        }

        res.json(pendingRecords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', async (req, res) => {
    try {
        // Test blockchain connection
        const recordCount = await contract.methods.recordCount().call();
        const contractAddress = await contract.options.address;
        
        res.json({
            status: 'healthy',
            blockchain: {
                connected: true,
                contractAddress: contractAddress,
                recordCount: parseInt(recordCount)
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            blockchain: {
                connected: false,
                error: err.message
            },
            timestamp: new Date().toISOString()
        });
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