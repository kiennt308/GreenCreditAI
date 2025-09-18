# Giải thích các giá trị trong TokenRedemption Component

## 📊 **Các giá trị hiển thị**

### 1. **Current Balance: 500,000,000 GCT**

#### 🔍 **Nguồn gốc giá trị:**
```javascript
// Trong TokenRedemption.js, dòng 34-42
const fetchTokenBalance = async () => {
  try {
    const res = await axios.get(`${API_BASE}/user-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // try common property names, fallback to 0
    const total = Number(res.data?.totalTokens ?? res.data?.total ?? 0);
    setBalance(Number.isFinite(total) ? total : 0);
  } catch (err) {
    console.error('Error fetching balance:', err);
  }
};
```

#### 📈 **Cách hoạt động:**
1. **API Call**: Gọi endpoint `/user-stats` với JWT token
2. **Data Extraction**: Lấy `totalTokens` hoặc `total` từ response
3. **Fallback**: Nếu không có data, mặc định là 0
4. **Display**: Hiển thị với format `toLocaleString()` (500,000,000)

#### 🎯 **Ý nghĩa:**
- **GCT** = GreenCredit Token
- Đây là số token hiện tại của user trong hệ thống
- Được lưu trữ trong database và blockchain
- Có thể tăng khi user đánh giá ESG tốt
- Có thể giảm khi user đổi token để lấy lợi ích vay

---

### 2. **Available for HDBank: 500M VND Loan**

#### 🔍 **Nguồn gốc giá trị:**
```javascript
// Trong TokenRedemption.js, dòng 306-307
<h5 className="card-title">{t('tokens.availableForBank')}</h5>
<h3 className="text-success">500M VND Loan</h3>
```

#### 📈 **Cách hoạt động:**
- **Hardcoded Value**: Đây là giá trị cố định trong code
- **Không dynamic**: Không thay đổi theo user hoặc API
- **Display Only**: Chỉ để hiển thị thông tin

#### 🎯 **Ý nghĩa:**
- **500M VND** = 500 triệu đồng Việt Nam
- Đây là số tiền vay tối đa mà user có thể nhận từ HDBank
- Là một phần của chương trình hợp tác giữa GreenCredit AI và HDBank
- User có thể đổi token để nhận lợi ích vay với số tiền này

---

## 🔄 **Luồng hoạt động của hệ thống**

### **1. User đánh giá ESG:**
```
Revenue (VND) + Emissions (tons CO2) 
    ↓
AI Model tính toán ESG Score
    ↓
Nếu ESG Score ≥ 80 → User nhận GCT tokens
```

### **2. User đổi token:**
```
GCT Tokens → Lợi ích vay ngân hàng
    ↓
Giảm lãi suất: 2%, 5%, 10%, 15%
    ↓
Số tiền vay tối đa: 500M VND
```

### **3. Hệ thống tier đổi token:**
```javascript
const getDiscountTiers = () => [
  { min: 1000, discount: '15% interest reduction', color: 'success' },
  { min: 500,  discount: '10% interest reduction', color: 'primary' },
  { min: 100,  discount: '5% interest reduction',  color: 'warning' },
  { min: 1,    discount: '2% interest reduction',  color: 'secondary' },
];
```

---

## 💡 **Tại sao có những giá trị này?**

### **1. Current Balance (500,000,000 GCT):**
- **Demo Data**: Đây có thể là dữ liệu demo để test
- **Real Data**: Trong thực tế, giá trị này sẽ được lấy từ:
  - Database user records
  - Blockchain smart contract
  - API `/user-stats` endpoint

### **2. Available for HDBank (500M VND):**
- **Partnership**: HDBank và GreenCredit AI có hợp tác
- **Loan Limit**: 500M VND là giới hạn vay tối đa
- **Business Model**: Tạo động lực cho user tham gia ESG

---

## 🛠️ **Cách thay đổi các giá trị**

### **1. Thay đổi Current Balance:**
```javascript
// Trong backend, endpoint /user-stats
app.get('/user-stats', authenticateToken, async (req, res) => {
  // Lấy từ database hoặc blockchain
  const userStats = await getUserStats(req.user.id);
  res.json({
    totalTokens: userStats.balance, // Thay đổi giá trị này
    // ... other data
  });
});
```

### **2. Thay đổi Loan Amount:**
```javascript
// Trong TokenRedemption.js, dòng 307
<h3 className="text-success">500M VND Loan</h3>
// Thay đổi thành:
<h3 className="text-success">1B VND Loan</h3> // 1 tỷ VND
```

---

## 📋 **Tóm tắt**

| Giá trị | Nguồn | Ý nghĩa | Có thể thay đổi |
|---------|-------|---------|-----------------|
| **Current Balance** | API `/user-stats` | Số token hiện tại của user | ✅ Có (từ database/blockchain) |
| **Available for HDBank** | Hardcoded | Số tiền vay tối đa | ✅ Có (thay đổi trong code) |

### **Mục đích:**
- **Current Balance**: Hiển thị tài sản token của user
- **Available for HDBank**: Tạo động lực cho user tham gia chương trình ESG

### **Kết luận:**
Các giá trị này được thiết kế để tạo ra một hệ thống khuyến khích doanh nghiệp tham gia vào các hoạt động ESG (Environmental, Social, Governance) bằng cách:
1. **Thưởng token** cho việc đánh giá ESG tốt
2. **Đổi token** để nhận lợi ích vay ngân hàng
3. **Tạo động lực** cho việc cải thiện tính bền vững
