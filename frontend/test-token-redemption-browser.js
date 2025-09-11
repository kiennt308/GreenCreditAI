/**
 * Token Redemption Browser Test
 * Chạy test trực tiếp trong browser console
 */

// Test functions cho browser
window.TokenRedemptionTester = {
    
    // Test data
    mockBalance: 1500,
    
    // Test cases
    testCases: [
        {
            name: 'Redeem 100 tokens',
            amount: '100',
            shouldPass: true
        },
        {
            name: 'Redeem 500 tokens', 
            amount: '500',
            shouldPass: true
        },
        {
            name: 'Redeem 1000 tokens',
            amount: '1000', 
            shouldPass: true
        },
        {
            name: 'Redeem 0 tokens (should fail)',
            amount: '0',
            shouldPass: false
        },
        {
            name: 'Redeem negative amount (should fail)',
            amount: '-100',
            shouldPass: false
        },
        {
            name: 'Redeem more than balance (should fail)',
            amount: '2000',
            shouldPass: false
        },
        {
            name: 'Redeem with empty string (should fail)',
            amount: '',
            shouldPass: false
        }
    ],
    
    // Helper functions
    getDiscountTier: function(amount) {
        const amountNum = parseInt(amount) || 0;
        
        if (amountNum >= 1000) return { discount: '15% interest reduction', color: 'success' };
        if (amountNum >= 500) return { discount: '10% interest reduction', color: 'primary' };
        if (amountNum >= 100) return { discount: '5% interest reduction', color: 'warning' };
        return { discount: '2% interest reduction', color: 'secondary' };
    },
    
    validateAmount: function(amount, balance) {
        if (!amount || amount.trim() === '') {
            return { valid: false, error: 'Amount is required' };
        }
        
        const amountNum = parseInt(amount);
        if (isNaN(amountNum)) {
            return { valid: false, error: 'Amount must be a number' };
        }
        
        if (amountNum <= 0) {
            return { valid: false, error: 'Amount must be greater than 0' };
        }
        
        if (amountNum > balance) {
            return { valid: false, error: 'Insufficient balance' };
        }
        
        return { valid: true };
    },
    
    simulateRedemption: function(amount, balance) {
        const validation = this.validateAmount(amount, balance);
        
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        const amountNum = parseInt(amount);
        const tier = this.getDiscountTier(amount);
        
        return {
            success: true,
            result: {
                discount: tier.discount,
                newBalance: Math.max(0, balance - amountNum),
                txHash: '0x' + Math.random().toString(16).substr(2, 40),
                redeemAmount: amountNum
            }
        };
    },
    
    // Run tests
    runTests: function() {
        console.log('🚀 Token Redemption Browser Tests');
        console.log('==================================');
        
        let passed = 0;
        let failed = 0;
        
        this.testCases.forEach((testCase, index) => {
            console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
            
            const result = this.simulateRedemption(testCase.amount, this.mockBalance);
            
            if (testCase.shouldPass) {
                if (result.success) {
                    console.log('✅ PASS - Redemption successful');
                    console.log(`   Discount: ${result.result.discount}`);
                    console.log(`   New Balance: ${result.result.newBalance} GCT`);
                    console.log(`   Transaction: ${result.result.txHash}`);
                    passed++;
                } else {
                    console.log(`❌ FAIL - Expected success but got error: ${result.error}`);
                    failed++;
                }
            } else {
                if (!result.success) {
                    console.log(`✅ PASS - Expected failure: ${result.error}`);
                    passed++;
                } else {
                    console.log('❌ FAIL - Expected failure but got success');
                    failed++;
                }
            }
        });
        
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
        
        return { passed, failed };
    },
    
    // Test UI elements (nếu có)
    testUIElements: function() {
        console.log('\n🎨 UI Element Tests:');
        
        // Kiểm tra xem có component TokenRedemption không
        const tokenRedemptionElements = document.querySelectorAll('[data-testid="token-redemption"], .token-redemption, #token-redemption');
        console.log(`   Found ${tokenRedemptionElements.length} TokenRedemption elements`);
        
        // Kiểm tra input amount
        const amountInput = document.querySelector('input[type="number"]');
        if (amountInput) {
            console.log('✅ Amount input found');
            
            // Test input values
            const testValues = ['100', '500', '1000'];
            testValues.forEach(value => {
                amountInput.value = value;
                console.log(`   Input value "${value}" -> Display: ${amountInput.value}`);
            });
        } else {
            console.log('❌ Amount input not found');
        }
        
        // Kiểm tra redeem button
        const redeemButton = document.querySelector('button[type="submit"]');
        if (redeemButton) {
            console.log('✅ Redeem button found');
            console.log(`   Button text: "${redeemButton.textContent.trim()}"`);
            console.log(`   Button disabled: ${redeemButton.disabled}`);
        } else {
            console.log('❌ Redeem button not found');
        }
    },
    
    // Test với dữ liệu thực từ form
    testWithRealData: function() {
        console.log('\n🔍 Real Data Tests:');
        
        const amountInput = document.querySelector('input[type="number"]');
        if (amountInput) {
            const currentValue = amountInput.value;
            console.log(`   Current input value: "${currentValue}"`);
            
            if (currentValue) {
                const result = this.simulateRedemption(currentValue, this.mockBalance);
                if (result.success) {
                    console.log('✅ Current input is valid');
                    console.log(`   Would redeem: ${result.result.redeemAmount} tokens`);
                    console.log(`   Discount tier: ${result.result.discount}`);
                    console.log(`   New balance: ${result.result.newBalance} GCT`);
                } else {
                    console.log(`❌ Current input is invalid: ${result.error}`);
                }
            } else {
                console.log('ℹ️  No input value to test');
            }
        }
    }
};

// Auto-run tests khi load
console.log('🧪 Token Redemption Browser Test Suite Loaded');
console.log('Usage: TokenRedemptionTester.runTests()');

// Chạy tests tự động
if (typeof window !== 'undefined') {
    setTimeout(() => {
        TokenRedemptionTester.runTests();
        TokenRedemptionTester.testUIElements();
        TokenRedemptionTester.testWithRealData();
    }, 1000);
}
