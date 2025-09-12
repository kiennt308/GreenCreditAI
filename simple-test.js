const axios = require('axios');

async function testHealth() {
    try {
        console.log('Testing health endpoint...');
        const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
        console.log('✅ Health check successful:', response.data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testHealth();
