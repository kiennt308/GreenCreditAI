# Debug Guide - GreenCredit AI

## 🔍 Troubleshooting "Failed to fetch records" Error

### Step 1: Check Backend Health

```bash
# Test backend health
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "blockchain": {
    "connected": true,
    "contractAddress": "0x...",
    "recordCount": 0
  }
}
```

### Step 2: Check Backend Logs

```bash
# Start backend with debug logging
cd backend
npm start
```

Look for these logs:
- "Backend running on port 3001"
- "User connected: [socket-id]"
- "Fetching user records for user: [username]"
- "Total records in contract: [number]"

### Step 3: Test API Endpoints

```bash
# Run the test script
node test-backend.js
```

### Step 4: Check Frontend Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages like:
   - "Failed to fetch records"
   - CORS errors
   - Network errors

### Step 5: Check Network Tab

1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests to `/user-records`
5. Check the response status and error message

## 🛠️ Common Issues and Solutions

### Issue 1: Blockchain Connection Failed

**Symptoms:**
- Health check returns "unhealthy"
- Error: "Error: could not detect network"

**Solutions:**
1. Check if Infura key is correct in `.env`
2. Check if contract address is correct
3. Verify network connectivity

```bash
# Check environment variables
cat backend/.env
```

### Issue 2: CORS Error

**Symptoms:**
- Browser console shows CORS error
- Request blocked by CORS policy

**Solutions:**
1. Restart backend server
2. Clear browser cache
3. Check CORS configuration in server.js

### Issue 3: Authentication Failed

**Symptoms:**
- 401 Unauthorized error
- "Access token required" message

**Solutions:**
1. Check if user is logged in
2. Verify JWT token is valid
3. Check token expiration

### Issue 4: Smart Contract Error

**Symptoms:**
- Error calling contract methods
- "Record does not exist" error

**Solutions:**
1. Check if contract is deployed
2. Verify contract ABI matches
3. Check if contract has records

## 🔧 Debug Commands

### Check Backend Status
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check backend logs
cd backend && npm start
```

### Check Frontend Status
```bash
# Check if frontend is running
curl http://localhost:3000

# Check frontend logs
cd frontend && npm start
```

### Test Database Connection
```bash
# Test blockchain connection
node -e "
const Web3 = require('web3');
const web3 = new Web3('https://sepolia.infura.io/v3/YOUR_KEY');
web3.eth.getBlockNumber().then(console.log);
"
```

### Check Environment Variables
```bash
# Check backend .env
cat backend/.env

# Check if variables are loaded
node -e "require('dotenv').config(); console.log(process.env.CONTRACT_ADDRESS);"
```

## 📋 Debug Checklist

- [ ] Backend server is running on port 3001
- [ ] Frontend server is running on port 3000
- [ ] Environment variables are set correctly
- [ ] Blockchain connection is working
- [ ] Smart contract is deployed and accessible
- [ ] CORS is configured correctly
- [ ] JWT authentication is working
- [ ] No console errors in browser
- [ ] Network requests are successful

## 🚨 Emergency Fixes

### Reset Everything
```bash
# Stop all services
pkill -f "node.*server.js"
pkill -f "react-scripts"

# Clear node_modules and reinstall
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# Restart services
cd backend && npm start &
cd ../frontend && npm start &
```

### Clear Browser Data
1. Open browser developer tools (F12)
2. Go to Application tab
3. Clear Local Storage
4. Clear Session Storage
5. Refresh page

### Check Port Availability
```bash
# Check if ports are available
netstat -an | grep :3001
netstat -an | grep :3000
```

## 📞 Getting Help

If issues persist:
1. Check the console logs for specific error messages
2. Run the test script and share the output
3. Check the network tab for failed requests
4. Verify all environment variables are set correctly
