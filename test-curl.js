const axios = require('axios');

async function testWithCurl() {
    try {
        console.log('🧪 Testing API with curl commands...\n');

        // 1. Register user
        console.log('1. Registering user...');
        const registerResponse = await axios.post('http://localhost:3001/register', {
            username: 'testuser3',
            email: 'test3@example.com',
            password: 'password123'
        });
        console.log('✅ User registered:', registerResponse.data.user.username);
        const token = registerResponse.data.token;

        console.log('\n📋 CURL COMMANDS TO TEST:');
        console.log('='.repeat(50));

        // 2. Health check
        console.log('\n1. Health Check:');
        console.log('curl -X GET http://localhost:3001/health');

        // 3. Login
        console.log('\n2. Login:');
        console.log('curl -X POST http://localhost:3001/login \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email": "test3@example.com", "password": "password123"}\'');

        // 4. Evaluate
        console.log('\n3. Evaluate ESG:');
        console.log('curl -X POST http://localhost:3001/evaluate \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -H "Authorization: Bearer ' + token + '" \\');
        console.log('  -d \'{"revenue": 1000000, "emissions": 150, "projectDescription": "Test project", "loanAmount": 500000000}\'');

        // 5. User records
        console.log('\n4. Get User Records:');
        console.log('curl -X GET http://localhost:3001/user-records \\');
        console.log('  -H "Authorization: Bearer ' + token + '"');

        // 6. User stats
        console.log('\n5. Get User Stats:');
        console.log('curl -X GET http://localhost:3001/user-stats \\');
        console.log('  -H "Authorization: Bearer ' + token + '"');

        console.log('\n' + '='.repeat(50));
        console.log('💡 Copy and paste these commands to test the API!');

    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testWithCurl();
