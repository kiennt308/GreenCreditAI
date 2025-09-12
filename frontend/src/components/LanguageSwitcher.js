import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="language-switcher">
      <select 
        className="form-select form-select-sm" 
        value={currentLanguage} 
        onChange={handleLanguageChange}
        style={{ width: 'auto', display: 'inline-block' }}
      >
        <option value="en">🇺🇸 English</option>
        <option value="vi">🇻🇳 Tiếng Việt</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
