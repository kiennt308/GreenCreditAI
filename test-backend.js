const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
    console.log('🔍 Testing Backend Health...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);

        // Test 2: Register a test user
        console.log('\n2. Testing user registration...');
        const testUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
            console.log('✅ User registered:', registerResponse.data.user.username);
            const token = registerResponse.data.token;

            // Test 3: Test user-records endpoint
            console.log('\n3. Testing user-records endpoint...');
            const recordsResponse = await axios.get(`${BASE_URL}/user-records`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ User records fetched:', recordsResponse.data.length, 'records');

            // Test 4: Test evaluation
            console.log('\n4. Testing evaluation endpoint...');
            const evaluateResponse = await axios.post(`${BASE_URL}/evaluate`, {
                revenue: 1000000,
                emissions: 100,
                projectDescription: 'Test project',
                loanAmount: 500000000
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Evaluation completed:', {
                esgScore: evaluateResponse.data.esgScore,
                approved: evaluateResponse.data.approved
            });

            // Test 5: Test user-records again after evaluation
            console.log('\n5. Testing user-records after evaluation...');
            const recordsResponse2 = await axios.get(`${BASE_URL}/user-records`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ User records after evaluation:', recordsResponse2.data.length, 'records');

        } catch (userError) {
            console.log('⚠️ User test failed (user might already exist):', userError.response?.data?.error || userError.message);
        }

    } catch (error) {
        console.error('❌ Backend test failed:', error.response?.data || error.message);
    }
}

// Run the test
testBackend();
