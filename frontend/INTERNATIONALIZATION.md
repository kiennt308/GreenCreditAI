# Hướng dẫn Đa ngôn ngữ (Internationalization)

## Tổng quan
Website GreenCredit AI đã được việt hóa hoàn toàn với hỗ trợ 2 ngôn ngữ:
- 🇺🇸 English (Tiếng Anh)
- 🇻🇳 Tiếng Việt

## Tính năng
- ✅ Chuyển đổi ngôn ngữ real-time
- ✅ Lưu trữ ngôn ngữ đã chọn trong localStorage
- ✅ Tự động phát hiện ngôn ngữ trình duyệt
- ✅ Việt hóa toàn bộ giao diện
- ✅ Nút chuyển đổi ngôn ngữ trong navigation bar

## Cách sử dụng

### 1. Chuyển đổi ngôn ngữ
- Click vào dropdown ngôn ngữ ở góc phải navigation bar
- Chọn ngôn ngữ mong muốn (English/Tiếng Việt)
- Ngôn ngữ sẽ thay đổi ngay lập tức và được lưu tự động

### 2. Cấu trúc file ngôn ngữ
```
frontend/src/i18n/
├── index.js              # Cấu hình i18n
└── locales/
    ├── en.json           # Bản dịch tiếng Anh
    └── vi.json           # Bản dịch tiếng Việt
```

### 3. Thêm bản dịch mới
Để thêm bản dịch mới, chỉnh sửa các file JSON trong thư mục `locales/`:

```json
{
  "key": "value",
  "nested": {
    "key": "value"
  }
}
```

### 4. Sử dụng trong component
```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
};
```

### 5. Sử dụng với tham số
```jsx
// Trong file JSON
{
  "welcomeMessage": "Welcome, {{username}}!"
}

// Trong component
<h1>{t('welcomeMessage', { username: 'John' })}</h1>
```

## Các component đã được việt hóa
- ✅ App.js (Navigation)
- ✅ Login.js
- ✅ Register.js  
- ✅ Dashboard.js
- ✅ LanguageSwitcher.js

## Cấu hình
- **Fallback language**: English
- **Detection order**: localStorage → navigator → htmlTag
- **Storage**: localStorage với key `i18nextLng`

## Lưu ý
- Ngôn ngữ được lưu tự động khi người dùng thay đổi
- Lần truy cập tiếp theo sẽ tự động sử dụng ngôn ngữ đã chọn
- Nếu trình duyệt không hỗ trợ ngôn ngữ đã chọn, sẽ fallback về tiếng Anh
