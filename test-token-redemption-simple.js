#!/usr/bin/env node

/**
 * Simple Token Redemption Test Script
 * Chạy từ terminal: node test-token-redemption-simple.js
 */

console.log('🧪 Token Redemption Simple Test');
console.log('================================\n');

// Mock data
const mockBalance = 1500;

// Test cases
const tests = [
    { amount: '100', expected: 'success', description: 'Redeem 100 tokens' },
    { amount: '500', expected: 'success', description: 'Redeem 500 tokens' },
    { amount: '1000', expected: 'success', description: 'Redeem 1000 tokens' },
    { amount: '0', expected: 'fail', description: 'Redeem 0 tokens (should fail)' },
    { amount: '-100', expected: 'fail', description: 'Redeem negative amount (should fail)' },
    { amount: '2000', expected: 'fail', description: 'Redeem more than balance (should fail)' },
    { amount: '', expected: 'fail', description: 'Empty amount (should fail)' },
    { amount: 'abc', expected: 'fail', description: 'Non-numeric amount (should fail)' }
];

// Helper functions
function getDiscountTier(amount) {
    const num = parseInt(amount) || 0;
    if (num >= 1000) return '15% interest reduction';
    if (num >= 500) return '10% interest reduction';
    if (num >= 100) return '5% interest reduction';
    return '2% interest reduction';
}

function validateAmount(amount, balance) {
    if (!amount || amount.trim() === '') return { valid: false, error: 'Amount required' };
    
    const num = parseInt(amount);
    if (isNaN(num)) return { valid: false, error: 'Must be number' };
    if (num <= 0) return { valid: false, error: 'Must be positive' };
    if (num > balance) return { valid: false, error: 'Insufficient balance' };
    
    return { valid: true };
}

function simulateRedemption(amount, balance) {
    const validation = validateAmount(amount, balance);
    
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }
    
    const num = parseInt(amount);
    return {
        success: true,
        discount: getDiscountTier(amount),
        newBalance: balance - num,
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...`
    };
}

// Run tests
let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.description}`);
    
    const result = simulateRedemption(test.amount, mockBalance);
    
    if (test.expected === 'success') {
        if (result.success) {
            console.log(`   ✅ PASS - ${result.discount}, New balance: ${result.newBalance} GCT`);
            passed++;
        } else {
            console.log(`   ❌ FAIL - Expected success but got: ${result.error}`);
            failed++;
        }
    } else {
        if (!result.success) {
            console.log(`   ✅ PASS - Expected failure: ${result.error}`);
            passed++;
        } else {
            console.log(`   ❌ FAIL - Expected failure but got success`);
            failed++;
        }
    }
    console.log('');
});

// Results
console.log('📊 Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
    console.log('\n🎉 All tests passed!');
} else {
    console.log('\n⚠️  Some tests failed.');
}

// Performance test
console.log('\n⚡ Performance Test:');
const start = Date.now();
for (let i = 0; i < 1000; i++) {
    simulateRedemption('100', mockBalance);
}
const duration = Date.now() - start;
console.log(`Processed 1000 redemptions in ${duration}ms (${(duration/1000).toFixed(2)}ms each)`);
