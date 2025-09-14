// CustomToast.js
import React from 'react';
import '../css/CustomToast.css'; // Tạo file CSS cho kiểu dáng

const CustomToast = ({ message, type, onClose }) => {
  return (
    <div className={`custom-toast ${type}`} onClick={onClose}>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default CustomToast;