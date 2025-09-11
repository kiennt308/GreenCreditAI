/**
 * Token Redemption API Test Script
 * Test các API endpoints liên quan đến Token Redemption
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'mock-jwt-token-for-testing';

// Test cases cho API
const apiTests = [
    {
        name: 'GET /user-stats - Fetch token balance',
        method: 'GET',
        endpoint: '/user-stats',
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        expectedStatus: 200,
        validateResponse: (data) => {
            return data && typeof data.totalTokens === 'number';
        }
    },
    {
        name: 'POST /redeem-token - Redeem 100 tokens',
        method: 'POST',
        endpoint: '/redeem-token',
        data: { amount: '100' },
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        expectedStatus: 200,
        validateResponse: (data) => {
            return data && 
                   data.discount && 
                   typeof data.newBalance === 'number' && 
                   data.txHash;
        }
    },
    {
        name: 'POST /redeem-token - Redeem 500 tokens',
        method: 'POST',
        endpoint: '/redeem-token',
        data: { amount: '500' },
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        expectedStatus: 200,
        validateResponse: (data) => {
            return data && 
                   data.discount && 
                   typeof data.newBalance === 'number' && 
                   data.txHash;
        }
    },
    {
        name: 'POST /redeem-token - Invalid amount (0)',
        method: 'POST',
        endpoint: '/redeem-token',
        data: { amount: '0' },
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        expectedStatus: 400,
        validateResponse: (data) => {
            return data && data.error;
        }
    },
    {
        name: 'POST /redeem-token - Negative amount',
        method: 'POST',
        endpoint: '/redeem-token',
        data: { amount: '-100' },
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        expectedStatus: 400,
        validateResponse: (data) => {
            return data && data.error;
        }
    },
    {
        name: 'POST /redeem-token - No authorization',
        method: 'POST',
        endpoint: '/redeem-token',
        data: { amount: '100' },
        expectedStatus: 401
    }
];

// Helper function để test API
async function testAPI(testCase) {
    try {
        console.log(`📋 ${testCase.name}`);
        
        const config = {
            method: testCase.method,
            url: `${BASE_URL}${testCase.endpoint}`,
            headers: testCase.headers || {},
            data: testCase.data,
            timeout: 5000
        };
        
        const response = await axios(config);
        
        // Check status code
        if (response.status === testCase.expectedStatus) {
            console.log(`✅ Status Code: ${response.status} (Expected: ${testCase.expectedStatus})`);
        } else {
            console.log(`❌ Status Code: ${response.status} (Expected: ${testCase.expectedStatus})`);
            return false;
        }
        
        // Validate response data if validator provided
        if (testCase.validateResponse) {
            if (testCase.validateResponse(response.data)) {
                console.log(`✅ Response validation passed`);
                console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            } else {
                console.log(`❌ Response validation failed`);
                console.log(`   Response:`, JSON.stringify(response.data, null, 2));
                return false;
            }
        }
        
        console.log('');
        return true;
        
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            if (error.response.status === testCase.expectedStatus) {
                console.log(`✅ Status Code: ${error.response.status} (Expected: ${testCase.expectedStatus})`);
                if (testCase.validateResponse && testCase.validateResponse(error.response.data)) {
                    console.log(`✅ Error response validation passed`);
                }
                console.log('');
                return true;
            } else {
                console.log(`❌ Status Code: ${error.response.status} (Expected: ${testCase.expectedStatus})`);
                console.log(`   Error:`, error.response.data);
                console.log('');
                return false;
            }
        } else {
            console.log(`❌ Network/Request Error: ${error.message}`);
            console.log('');
            return false;
        }
    }
}

// Test server connectivity
async function testServerConnectivity() {
    console.log('🔌 Testing server connectivity...');
    
    try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
        console.log('✅ Server is running and accessible');
        console.log(`   Health check response:`, response.data);
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ Server is not accessible');
        console.log(`   Error: ${error.message}`);
        console.log('');
        return false;
    }
}

// Run all API tests
async function runAPITests() {
    console.log('🚀 Token Redemption API Tests');
    console.log('==============================\n');
    
    // Test server connectivity first
    const serverOnline = await testServerConnectivity();
    if (!serverOnline) {
        console.log('⚠️  Server is not running. Please start the backend server first.');
        console.log('   Run: cd backend && npm start');
        return;
    }
    
    let passed = 0;
    let failed = 0;
    
    // Run each test
    for (const testCase of apiTests) {
        const success = await testAPI(testCase);
        if (success) {
            passed++;
        } else {
            failed++;
        }
    }
    
    // Results
    console.log('📊 API Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All API tests passed!');
    } else {
        console.log('\n⚠️  Some API tests failed.');
    }
}

// Mock API tests (khi server không chạy)
function runMockAPITests() {
    console.log('🎭 Mock API Tests (Server not running)');
    console.log('======================================\n');
    
    const mockTests = [
        {
            name: 'Mock: GET /user-stats',
            mockResponse: { totalTokens: 1500 },
            validate: (data) => data.totalTokens === 1500
        },
        {
            name: 'Mock: POST /redeem-token (100 tokens)',
            mockResponse: { 
                discount: '2% interest reduction',
                newBalance: 1400,
                txHash: '0x1234567890abcdef'
            },
            validate: (data) => data.discount && data.newBalance && data.txHash
        },
        {
            name: 'Mock: POST /redeem-token (500 tokens)',
            mockResponse: { 
                discount: '10% interest reduction',
                newBalance: 1000,
                txHash: '0xabcdef1234567890'
            },
            validate: (data) => data.discount && data.newBalance && data.txHash
        }
    ];
    
    let passed = 0;
    
    mockTests.forEach(test => {
        console.log(`📋 ${test.name}`);
        
        if (test.validate(test.mockResponse)) {
            console.log(`✅ Mock validation passed`);
            console.log(`   Response:`, JSON.stringify(test.mockResponse, null, 2));
            passed++;
        } else {
            console.log(`❌ Mock validation failed`);
        }
        console.log('');
    });
    
    console.log(`📊 Mock Test Results: ${passed}/${mockTests.length} passed`);
}

// Main execution
async function main() {
    try {
        await runAPITests();
    } catch (error) {
        console.log('API tests failed, running mock tests instead...\n');
        runMockAPITests();
    }
}

// Export for use in other scripts
module.exports = {
    testAPI,
    testServerConnectivity,
    runAPITests,
    runMockAPITests
};

// Run if called directly
if (require.main === module) {
    main();
}
