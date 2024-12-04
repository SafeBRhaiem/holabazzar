import React from 'react';
import CheckoutForm from './CheckoutForm';

const Checkout = ({ cartItems, totalAmount, handleOrderSuccess }) => {
  return (
    <CheckoutForm 
      cartItems={cartItems} 
      totalAmount={totalAmount} 
      handleOrderSuccess={handleOrderSuccess} 
    />
  );
};

export default Checkout;
