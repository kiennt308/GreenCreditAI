const axios = require('axios');

async function testUserRecords() {
    try {
        console.log('1. Testing user login...');
        const loginResponse = await axios.post('http://localhost:3001/login', {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ User logged in:', loginResponse.data.user.username);
        const token = loginResponse.data.token;

        console.log('\n2. Testing user-records endpoint...');
        const recordsResponse = await axios.get('http://localhost:3001/user-records', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ User records fetched:', recordsResponse.data.length, 'records');
        if (recordsResponse.data.length > 0) {
            console.log('Sample record:', recordsResponse.data[0]);
        }

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testUserRecords();
