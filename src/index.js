import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


// Importation de Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe avec votre clé Publishable Key
const stripePromise = loadStripe('pk_test_51QMsCWAC2Su0NHg8IHSt5RR0cJsq1xNaG7iTB6QIKDTGCkj1qhGlAw8Fb9zQdwm5YX2CQ7DZgQngE4QTqvxFWXcX007N9RblnE');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Fournir le contexte Stripe à toute l'application */}
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
