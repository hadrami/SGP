// src/components/LanguageSelector.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const languages = [
    { code: 'fr',    label: 'FR' },
    { code: 'en-US', label: 'EN' },
    { code: 'ar',    label: 'AR' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="overflow-y-auto max-h-36">
      <div className="flex flex-col">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left p-2 rounded-md mb-1 ${
              i18n.language === lang.code ? 'bg-indigo-100 ring-2 ring-indigo-600' : 'hover:bg-indigo-50'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
