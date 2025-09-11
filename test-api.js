const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test77@example.com',
    password: 'password123'
};

const testEvaluation = {
    revenue: 1000000,
    emissions: 500
};

let authToken = '';

async function runTests() {
    console.log('🧪 Starting API Tests...\n');

    try {
        // Test 1: User Registration
        console.log('1. Testing User Registration...');
        const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
        console.log('✅ Registration successful:', registerResponse.data.user.username);
        authToken = registerResponse.data.token;

        // Test 2: User Login
        console.log('\n2. Testing User Login...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data.user.username);

        // Test 3: ESG Evaluation
        console.log('\n3. Testing ESG Evaluation...');
        const evaluateResponse = await axios.post(`${BASE_URL}/evaluate`, testEvaluation, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Evaluation successful:', {
            esgScore: evaluateResponse.data.esgScore,
            txHash: evaluateResponse.data.txHash
        });

        // Test 4: Get User Records
        console.log('\n4. Testing User Records...');
        const recordsResponse = await axios.get(`${BASE_URL}/user-records`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Records retrieved:', recordsResponse.data.length, 'records');

        // Test 5: Get Specific Record
        console.log('\n5. Testing Specific Record...');
        const recordResponse = await axios.get(`${BASE_URL}/records/0`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Record retrieved:', recordResponse.data);

        // Test 6: ESG Analytics
        console.log('\n6. Testing ESG Analytics...');
        const analyticsResponse = await axios.get(`${BASE_URL}/esg-analytics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Analytics retrieved:', {
            totalRecords: analyticsResponse.data.totalRecords,
            averageESGScore: analyticsResponse.data.averageESGScore
        });

        // Test 7: Token Redemption
        console.log('\n7. Testing Token Redemption...');
        const redeemResponse = await axios.post(`${BASE_URL}/redeem-token`, {}, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('✅ Token redeemed:', redeemResponse.data.discount);

        // Test 8: Webhook
        console.log('\n8. Testing Webhook...');
        const webhookResponse = await axios.post(`${BASE_URL}/webhook`, {
            test: 'webhook data'
        });
        console.log('✅ Webhook successful:', webhookResponse.data);

        console.log('\n🎉 All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests
runTests();
