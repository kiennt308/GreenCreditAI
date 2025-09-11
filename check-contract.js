const { Web3 } = require('web3');

const web3 = new Web3('https://sepolia.infura.io/v3/163d705cc5c14d53b5abc349908cb2c9');
const contractAddress = '0x102a95bf109E80D130858B19a5419e65f858583d';

// ABI chỉ cho getRecord và recordCount
const abi = [
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
    }
];

async function checkContract() {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        
        console.log('Checking contract...');
        const recordCount = await contract.methods.recordCount().call();
        console.log('Record count:', recordCount);
        
        if (recordCount > 0) {
            console.log('Trying to get first record...');
            const record = await contract.methods.getRecord(0).call();
            console.log('First record:', record);
        }
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkContract();
