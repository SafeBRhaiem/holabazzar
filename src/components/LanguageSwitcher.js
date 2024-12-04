// src/components/LanguageSwitcher.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation(); // Hook de traduction pour changer la langue

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang); // Change la langue globale
  };

  return (
    <div className="text-center my-3">
      <Button variant="secondary" onClick={() => switchLanguage('fr')}>Français</Button>
      <Button variant="secondary" onClick={() => switchLanguage('en')} className="ms-2">English</Button>
    </div>
  );
};

export default LanguageSwitcher;
