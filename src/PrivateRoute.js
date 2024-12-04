// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';  // Assure-toi que le chemin vers Firebase est correct

// Composant pour protéger les routes privées
const PrivateRoute = ({ element, ...rest }) => {
  const user = auth.currentUser;  // Vérifie si un utilisateur est connecté

  return (
    <Route
      {...rest}
      element={user ? element : <Navigate to="/signin" />}  // Redirige vers la page de connexion si non authentifié
    />
  );
};

export default PrivateRoute;
