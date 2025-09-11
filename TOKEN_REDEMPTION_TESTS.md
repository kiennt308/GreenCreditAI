# Token Redemption Test Suite

Bộ test scripts để kiểm tra chức năng Token Redemption trong ứng dụng GreenCredit AI.

## 📁 Files

1. **`frontend/test-token-redemption.js`** - Comprehensive test suite (Node.js)
2. **`frontend/test-token-redemption-browser.js`** - Browser console tests
3. **`test-token-redemption-simple.js`** - Simple terminal tests
4. **`test-token-redemption-api.js`** - API endpoint tests

## 🚀 Cách sử dụng

### 1. Comprehensive Test Suite

```bash
# Chạy từ thư mục frontend
cd frontend
node test-token-redemption.js
```

**Test cases bao gồm:**
- ✅ Redeem 100 tokens (2% discount)
- ✅ Redeem 500 tokens (10% discount) 
- ✅ Redeem 1000 tokens (15% discount)
- ❌ Redeem 0 tokens (should fail)
- ❌ Redeem negative amount (should fail)
- ❌ Redeem more than balance (should fail)
- ❌ Empty amount (should fail)
- ❌ Non-numeric input (should fail)

### 2. Browser Console Tests

```javascript
// Mở browser console và chạy:
TokenRedemptionTester.runTests()
TokenRedemptionTester.testUIElements()
TokenRedemptionTester.testWithRealData()
```

**Hoặc load script trực tiếp:**
```html
<script src="test-token-redemption-browser.js"></script>
```

### 3. Simple Terminal Tests

```bash
# Chạy từ thư mục root
node test-token-redemption-simple.js
```

**Output mẫu:**
```
🧪 Token Redemption Simple Test
================================

1. Redeem 100 tokens
   ✅ PASS - 2% interest reduction, New balance: 1400 GCT

2. Redeem 500 tokens
   ✅ PASS - 10% interest reduction, New balance: 1000 GCT

📊 Results:
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100.0%
```

### 4. API Endpoint Tests

```bash
# Đảm bảo backend server đang chạy
cd backend && npm start

# Chạy API tests
node test-token-redemption-api.js
```

**Test endpoints:**
- `GET /user-stats` - Fetch token balance
- `POST /redeem-token` - Redeem tokens
- Error handling tests

## 🧪 Test Coverage

### ✅ Functional Tests
- [x] Amount validation
- [x] Balance checking
- [x] Discount tier calculation
- [x] Transaction simulation
- [x] Error handling

### ✅ UI Tests
- [x] Input validation
- [x] Button states
- [x] Form submission
- [x] Modal display

### ✅ API Tests
- [x] Authentication
- [x] Request/Response format
- [x] Error responses
- [x] Status codes

### ✅ Performance Tests
- [x] Response time
- [x] Memory usage
- [x] Concurrent requests

## 📊 Expected Results

### Discount Tiers
| Amount | Discount | Color |
|--------|----------|-------|
| ≥1000 tokens | 15% interest reduction | Success (green) |
| ≥500 tokens | 10% interest reduction | Primary (blue) |
| ≥100 tokens | 5% interest reduction | Warning (yellow) |
| ≥1 token | 2% interest reduction | Secondary (gray) |

### Validation Rules
- ✅ Amount must be numeric
- ✅ Amount must be positive
- ✅ Amount cannot exceed balance
- ✅ Amount is required

### Success Response Format
```json
{
  "discount": "10% interest reduction",
  "newBalance": 1000,
  "txHash": "0x1234567890abcdef...",
  "redeemAmount": 500
}
```

## 🔧 Troubleshooting

### Lỗi "Server not running"
```bash
# Start backend server
cd backend
npm install
npm start

# Start frontend
cd ../frontend
npm install
npm start
```

### Lỗi "Element not found" trong browser tests
- Đảm bảo đang ở trang Dashboard
- Chuyển sang tab "Token Redemption"
- Kiểm tra console errors

### Lỗi "Permission denied" khi chạy scripts
```bash
# Make executable
chmod +x test-token-redemption-simple.js
```

## 📝 Customization

### Thay đổi test data
```javascript
// Trong test files
const mockBalance = 2000; // Thay đổi balance
const testAmount = '750'; // Thay đổi amount test
```

### Thêm test cases mới
```javascript
const newTest = {
    name: 'Test: Custom scenario',
    amount: '1500',
    expectedDiscount: '15% interest reduction',
    expectedNewBalance: 500
};
```

## 🎯 Integration với CI/CD

```yaml
# .github/workflows/test.yml
- name: Run Token Redemption Tests
  run: |
    npm install
    node test-token-redemption-simple.js
    node test-token-redemption-api.js
```

## 📞 Support

Nếu gặp vấn đề với tests:
1. Kiểm tra console logs
2. Verify server status
3. Check network connectivity
4. Review test data validity

---

**Happy Testing! 🎉**
