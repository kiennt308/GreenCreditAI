const axios = require('axios');

async function testUserRecords() {
    try {
        console.log('1. Testing user registration...');
        const registerResponse = await axios.post('http://localhost:3001/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ User registered:', registerResponse.data.user.username);
        const token = registerResponse.data.token;

        console.log('\n2. Testing user-records endpoint...');
        const recordsResponse = await axios.get('http://localhost:3001/user-records', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ User records fetched:', recordsResponse.data.length, 'records');
        console.log('Sample record:', recordsResponse.data[0]);

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testUserRecords();
