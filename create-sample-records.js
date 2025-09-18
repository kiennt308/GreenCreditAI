// Script để tạo nhiều records mẫu
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Dữ liệu mẫu để tạo records
const sampleRecords = [
    {
        esgScore: 85,
        creditAmount: 1000000000, // 1B VND
        projectDescription: 'Solar Energy Project - Phase 1',
        loanAmount: 500000000 // 500M VND
    },
    {
        esgScore: 92,
        creditAmount: 2000000000, // 2B VND
        projectDescription: 'Wind Power Installation',
        loanAmount: 1000000000 // 1B VND
    },
    {
        esgScore: 78,
        creditAmount: 800000000, // 800M VND
        projectDescription: 'Waste Management System',
        loanAmount: 400000000 // 400M VND
    },
    {
        esgScore: 88,
        creditAmount: 1500000000, // 1.5B VND
        projectDescription: 'Green Building Construction',
        loanAmount: 750000000 // 750M VND
    },
    {
        esgScore: 95,
        creditAmount: 3000000000, // 3B VND
        projectDescription: 'Carbon Capture Technology',
        loanAmount: 1500000000 // 1.5B VND
    },
    {
        esgScore: 82,
        creditAmount: 1200000000, // 1.2B VND
        projectDescription: 'Water Treatment Plant',
        loanAmount: 600000000 // 600M VND
    },
    {
        esgScore: 90,
        creditAmount: 2500000000, // 2.5B VND
        projectDescription: 'Electric Vehicle Charging Network',
        loanAmount: 1250000000 // 1.25B VND
    },
    {
        esgScore: 87,
        creditAmount: 1800000000, // 1.8B VND
        projectDescription: 'Sustainable Agriculture Initiative',
        loanAmount: 900000000 // 900M VND
    },
    {
        esgScore: 93,
        creditAmount: 2200000000, // 2.2B VND
        projectDescription: 'Ocean Cleanup Project',
        loanAmount: 1100000000 // 1.1B VND
    },
    {
        esgScore: 89,
        creditAmount: 1600000000, // 1.6B VND
        projectDescription: 'Forest Conservation Program',
        loanAmount: 800000000 // 800M VND
    }
];

async function createSampleRecords() {
    try {
        console.log('🚀 Bắt đầu tạo records mẫu...\n');

        // 1. Đăng ký user admin nếu chưa có
        console.log('1. Đăng ký/đăng nhập user admin...');
        let token;
        
        try {
            // Thử đăng nhập trước
            const loginResponse = await axios.post(`${API_BASE}/login`, {
                email: 'admin@greencredit.ai',
                password: 'admin123'
            });
            token = loginResponse.data.token;
            console.log('✅ Đăng nhập thành công');
        } catch (loginError) {
            // Nếu đăng nhập thất bại, thử đăng ký
            try {
                const registerResponse = await axios.post(`${API_BASE}/register`, {
                    username: 'admin',
                    email: 'admin@greencredit.ai',
                    password: 'admin123'
                });
                console.log('✅ Đăng ký admin thành công');
                
                // Đăng nhập sau khi đăng ký
                const loginResponse = await axios.post(`${API_BASE}/login`, {
                    email: 'admin@greencredit.ai',
                    password: 'admin123'
                });
                token = loginResponse.data.token;
                console.log('✅ Đăng nhập admin thành công');
            } catch (registerError) {
                console.error('❌ Lỗi đăng ký/đăng nhập:', registerError.response?.data || registerError.message);
                return;
            }
        }

        // 2. Tạo từng record
        console.log('\n2. Tạo records mẫu...');
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sampleRecords.length; i++) {
            const record = sampleRecords[i];
            try {
                console.log(`\n📝 Tạo record ${i + 1}/${sampleRecords.length}:`);
                console.log(`   ESG Score: ${record.esgScore}`);
                console.log(`   Credit Amount: ${record.creditAmount.toLocaleString()} VND`);
                console.log(`   Project: ${record.projectDescription}`);
                
                const response = await axios.post(`${API_BASE}/create-record`, record, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`   ✅ Thành công! Record ID: ${response.data.recordId}`);
                console.log(`   📄 Transaction Hash: ${response.data.txHash}`);
                successCount++;
                
                // Chờ một chút để tránh spam blockchain
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`   ❌ Lỗi tạo record ${i + 1}:`, error.response?.data || error.message);
                errorCount++;
            }
        }

        // 3. Tóm tắt kết quả
        console.log('\n📊 Tóm tắt kết quả:');
        console.log(`   ✅ Thành công: ${successCount} records`);
        console.log(`   ❌ Thất bại: ${errorCount} records`);
        console.log(`   📈 Tổng cộng: ${successCount + errorCount} records`);

        if (successCount > 0) {
            console.log('\n🎉 Hoàn thành! Bây giờ bạn có thể:');
            console.log('   1. Mở Dashboard để xem charts');
            console.log('   2. Kiểm tra Progress Tracker');
            console.log('   3. Xem Analytics với dữ liệu mới');
            console.log('   4. Test Token Redemption');
        }

    } catch (error) {
        console.error('❌ Lỗi chung:', error.message);
    }
}

// Chạy script
createSampleRecords();
