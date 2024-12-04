import React from 'react';
import emailjs from 'emailjs-com'; // Import d'emailjs
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const CheckoutForm = ({ cartItems, totalAmount, handleOrderSuccess }) => {

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Créer la commande dans Firestore
      const db = firebase.firestore();
      const order = {
        items: cartItems,
        total: totalAmount,
        date: new Date(),
      };

      const orderRef = await db.collection('orders').add(order);

      // Mettre à jour le stock des produits
      for (let item of cartItems) {
        const productRef = db.collection('products').doc(item.id);
        await productRef.update({
          stock: firebase.firestore.FieldValue.increment(-item.quantity),
        });
      }

      // Envoi de l'email de confirmation
      const templateParams = {
        to_email: "client@example.com",  // Remplacez par l'email du client
        order_details: JSON.stringify(cartItems),  // Remplacez avec les détails de la commande
        total: totalAmount,  // Remplacez avec le total de la commande
      };

      // Envoi de l'email avec EmailJS
      emailjs.send(
        'service_e5v6lcf',  // ID du service (Gmail dans votre cas)
        'template_ixkspgd',  // Remplacez par l'ID de votre modèle d'email
        templateParams,
        'c53oA2OznqplHSP3U'  // Clé publique d'EmailJS
      )
      .then((response) => {
        console.log("Email envoyé avec succès", response);
        handleOrderSuccess(order); // Appeler la fonction de succès
      }, (error) => {
        console.error("Erreur lors de l'envoi de l'email", error);
      });

    } catch (error) {
      console.error("Erreur lors de la création de la commande", error);
      alert("Une erreur s'est produite.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Ici, nous n'avons plus de CardElement pour demander les informations de la carte */}
      <button type="submit">
        Confirmer la commande {totalAmount} TND
      </button>
    </form>
  );
};

export default CheckoutForm;
