import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 rounded-lg transition"
      >
        <Globe size={18} />
        <span className="hidden md:inline">{currentLang?.flag} {currentLang?.name}</span>
        <span className="md:hidden">{currentLang?.flag}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-neutral-50 transition ${
                  language === lang.code ? 'bg-neutral-100 font-medium' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
