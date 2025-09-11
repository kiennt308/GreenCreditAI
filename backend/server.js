const express = require('express');
const { spawnSync } = require('child_process');
const Web3 = require('web3');
const path = require('path');
const app = express();
app.use(express.json());
require('dotenv').config(); 

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
const contract = new web3.eth.Contract(abi, contractAddress);

const contractAddress = process.env.CONTRACT_ADDRESS;
const account = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;



app.post('/evaluate', async (req, res) => {
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Backend running on port 3000'));