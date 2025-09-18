# Giải thích nguồn gốc của Records trong hệ thống GreenCredit AI

## 🔍 **Records được tạo ra từ đâu?**

### **1. Smart Contract (Blockchain)**
Records được lưu trữ trong **Ethereum Smart Contract** có tên `GreenCredit.sol`:

```solidity
// Trong GreenCredit.sol
struct CreditRecord {
    address user;           // Địa chỉ người dùng
    uint256 esgScore;      // Điểm ESG
    uint256 creditAmount;  // Số tiền tín dụng
    bool approved;         // Trạng thái phê duyệt
    uint256 timestamp;     // Thời gian tạo
    string projectDescription; // Mô tả dự án
    uint256 loanAmount;    // Số tiền vay
}

mapping(uint256 => CreditRecord) public records;
uint256 public recordCount;
```

### **2. Function tạo Record**
```solidity
function addRecord(
    uint256 _esgScore,
    uint256 _creditAmount,
    string memory _projectDescription,
    uint256 _loanAmount
) public {
    records[recordCount] = CreditRecord({
        user: msg.sender,
        esgScore: _esgScore,
        creditAmount: _creditAmount,
        approved: false,
        timestamp: block.timestamp,
        projectDescription: _projectDescription,
        loanAmount: _loanAmount
    });
    
    // Tự động mint token dựa trên ESG score
    uint256 tokensToMint = (_esgScore * _creditAmount) / 100;
    _mint(msg.sender, tokensToMint);
    
    emit RecordAdded(recordCount, msg.sender, _esgScore, _creditAmount);
    recordCount++;
}
```

---

## 🚨 **Vấn đề hiện tại**

### **❌ Không có endpoint để tạo records mới**
Trong backend server, **KHÔNG CÓ** endpoint nào để gọi function `addRecord` từ smart contract:

```javascript
// Các endpoint hiện có:
app.post('/register', ...)           // Đăng ký user
app.post('/login', ...)              // Đăng nhập
app.post('/evaluate', ...)           // Đánh giá ESG (chỉ trả về score)
app.get('/user-records', ...)        // Lấy records từ blockchain
app.post('/redeem-token', ...)       // Đổi token
app.post('/approve-credit', ...)     // Phê duyệt credit (admin only)
// ... KHÔNG CÓ endpoint tạo records mới
```

### **🔍 Endpoint `/evaluate` chỉ trả về ESG score**
```javascript
app.post('/evaluate', authenticateToken, async (req, res) => {
    // Chỉ chạy AI model và trả về ESG score
    // KHÔNG lưu vào blockchain
    return res.json({
        result: stdout,  // ESG score
        error: stderr
    });
});
```

---

## 🛠️ **Cách tạo Records mới**

### **Phương pháp 1: Tạo endpoint mới trong backend**

Tạo endpoint `/create-record` trong `backend/server.js`:

```javascript
app.post('/create-record', authenticateToken, async (req, res) => {
    try {
        const { esgScore, creditAmount, projectDescription, loanAmount } = req.body;
        
        // Gọi smart contract để tạo record
        const tx = contract.methods.addRecord(
            esgScore,
            creditAmount,
            projectDescription || 'ESG Project',
            loanAmount || creditAmount
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
        
        res.json({
            success: true,
            recordId: receipt.events.RecordAdded.returnValues.id,
            txHash: receipt.transactionHash,
            message: 'Record created successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

### **Phương pháp 2: Tạo script để ghi nhiều records**

Tạo file `create-records.js`:

```javascript
const axios = require('axios');
const Web3 = require('web3');

const API_BASE = 'http://localhost:3001';
const WEB3_URL = 'https://sepolia.infura.io/v3/163d705cc5c14d53b5abc349908cb2c9';

// Sample data để tạo records
const sampleRecords = [
    {
        esgScore: 85,
        creditAmount: 1000000000, // 1B VND
        projectDescription: 'Solar Energy Project',
        loanAmount: 500000000 // 500M VND
    },
    {
        esgScore: 92,
        creditAmount: 2000000000, // 2B VND
        projectDescription: 'Wind Power Installation',
        loanAmount: 1000000000 // 1B VND
    },
    // ... thêm nhiều records khác
];

async function createRecords() {
    // 1. Login để lấy token
    const loginResponse = await axios.post(`${API_BASE}/login`, {
        email: 'admin@greencredit.ai',
        password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    // 2. Tạo từng record
    for (const record of sampleRecords) {
        try {
            const response = await axios.post(`${API_BASE}/create-record`, record, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Record created:', response.data);
        } catch (error) {
            console.error('❌ Error creating record:', error.message);
        }
    }
}

createRecords();
```

---

## 📊 **Luồng hoạt động hiện tại**

### **1. User đánh giá ESG**
```
User nhập Revenue + Emissions
    ↓
API /evaluate chạy AI model
    ↓
Trả về ESG Score
    ↓
❌ KHÔNG lưu vào blockchain
```

### **2. Records hiện có**
```
Records được lấy từ blockchain
    ↓
API /user-records
    ↓
Hiển thị trong Dashboard
    ↓
❌ KHÔNG có cách tạo mới
```

---

## 🎯 **Giải pháp đề xuất**

### **1. Tạo endpoint `/create-record`**
- Kết nối với smart contract
- Cho phép tạo records mới
- Tự động mint tokens

### **2. Tích hợp vào frontend**
- Thêm form tạo record mới
- Kết nối với API `/create-record`
- Hiển thị kết quả

### **3. Tạo script demo**
- Tạo nhiều records mẫu
- Test hệ thống
- Hiển thị charts

---

## 📋 **Tóm tắt**

| Thành phần | Trạng thái | Mô tả |
|------------|------------|-------|
| **Smart Contract** | ✅ Có sẵn | Function `addRecord` hoạt động |
| **Backend API** | ❌ Thiếu | Không có endpoint tạo records |
| **Frontend** | ❌ Thiếu | Không có form tạo records |
| **Records hiện có** | ✅ Có | Lấy từ blockchain |

### **Kết luận:**
Records hiện tại được tạo từ **smart contract** nhưng **không có cách nào** để tạo records mới từ frontend hoặc API. Cần tạo endpoint `/create-record` để kết nối với smart contract.
