const mongoose = require('mongoose');

// Định nghĩa schema cho User
const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: false,
        unique: true, // Đảm bảo địa chỉ người dùng là duy nhất
        match: /^0x[a-fA-F0-9]{40}$/ // Kiểm tra định dạng địa chỉ Ethereum
    },
    email: {
        type: String,
        required: true,
        unique: true, // Đảm bảo email là duy nhất
        match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/ // Kiểm tra định dạng email
    },
    username: {
        type: String,
        required: true,
        unique: true, // Đảm bảo username là duy nhất
        trim: true,
        minlength: 3, // Độ dài tối thiểu
        maxlength: 30 // Độ dài tối đa
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Độ dài tối thiểu cho mật khẩu
    },
    esgScore: {
        type: Number,
        required: false,
        min: 0,
        max: 100 // Giả sử ESG score nằm trong khoảng 0-100
    },
    creditAmount: {
        type: Number,
        required: false,
        min: 0
    },
    approved: {
        type: Boolean,
        default: false // Mặc định là false
    },
    records: [{
        projectDescription: {
            type: String,
            required: true
        },
        loanAmount: {
            type: Number,
            required: true,
            min: 0
        },
        timestamp: {
            type: Number,
            required: true
        }
    }]
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

// Xuất model
module.exports = User;