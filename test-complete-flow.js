const axios = require('axios');

async function testCompleteFlow() {
    try {
        console.log('🚀 Testing Complete Flow...\n');

        // 1. Register new user
        console.log('1. Registering new user...');
        const registerResponse = await axios.post('http://localhost:3001/register', {
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123'
        });
        console.log('✅ User registered:', registerResponse.data.user.username);
        const token = registerResponse.data.token;

        // 2. Test user-records
        console.log('\n2. Testing user-records endpoint...');
        const recordsResponse = await axios.get('http://localhost:3001/user-records', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ User records fetched:', recordsResponse.data.length, 'records');

        // 3. Test user-stats
        console.log('\n3. Testing user-stats endpoint...');
        const statsResponse = await axios.get('http://localhost:3001/user-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ User stats fetched:', statsResponse.data);

        // 4. Test health endpoint
        console.log('\n4. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ Health check:', healthResponse.data.status);

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testCompleteFlow();
