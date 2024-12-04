// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Détecte la langue du navigateur
  .use(initReactI18next) // Intégration avec React
  .init({
    fallbackLng: 'en', // Langue par défaut
    debug: true,
    interpolation: {
      escapeValue: false, // React gère l'échappement des valeurs
    },
    resources: {
      en: {
        translation: {
          "productName": "Product Name",
          "price": "Price",
          "quantity": "Quantity",
          "category": "Category",
          "selectCategory": "Select Category",
          "images": "Images",
          "description": "Description",
          "addProduct": "Add Product",
          "productAddedSuccess": "Product added successfully!",
          "invalidPriceOrQuantity": "Price or quantity cannot be negative.",
          "errorOccurred": "An error occurred. Please try again.",
          // Ajoutez ici toutes les autres chaînes de texte
        },
      },
      fr: {
        translation: {
          "productName": "Nom du Produit",
          "price": "Prix",
          "quantity": "Quantité",
          "category": "Catégorie",
          "selectCategory": "Sélectionner la catégorie",
          "images": "Images",
          "description": "Description",
          "addProduct": "Ajouter un Produit",
          "productAddedSuccess": "Produit ajouté avec succès !",
          "invalidPriceOrQuantity": "Le prix ou la quantité ne peut pas être négatif.",
          "errorOccurred": "Une erreur est survenue. Veuillez réessayer.",
          // Ajoutez ici toutes les autres chaînes de texte
        },
      },
    },
  });

export default i18n;
