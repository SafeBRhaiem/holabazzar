import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card, Alert, Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { auth } from '../firebase'; // Vérifiez le chemin d'accès

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(7);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
    calculateTotal(cart);
  }, []);

  const calculateTotal = (cart) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(subtotal + (cart.length > 0 ? shippingCost : 0) - discount);
  };

  const handleQuantityChange = (id, quantity) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const handlePromoCode = () => {
    setDiscount(promoCode === 'DISCOUNT10' ? 10 : 0);
    calculateTotal(cartItems);
  };

  const handleRemoveItem = (id) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    if (!auth.currentUser) {
      alert('Veuillez vous connecter pour passer une commande.');
      return;
    }

    const { street, city, postalCode, country } = shippingAddress;
    if (!street || !city || !postalCode || !country) {
      alert('Veuillez remplir tous les champs d\'adresse.');
      return;
    }

    setIsProcessing(true);

    try {
      const db = firebase.firestore();
      const orderItems = [];

      for (const item of cartItems) {
        const productRef = db.collection('products').doc(item.id);
        const productDoc = await productRef.get();

        if (productDoc.data()?.quantity < item.quantity) {
          alert(`Le produit ${item.name} n'a pas suffisamment de stock.`);
          setIsProcessing(false);
          return;
        }

        orderItems.push(item);

        await productRef.update({
          quantity: firebase.firestore.FieldValue.increment(-item.quantity),
        });
      }

      await db.collection('orders').add({
        items: orderItems,
        total,
        userId: auth.currentUser.uid,
        date: firebase.firestore.Timestamp.fromDate(new Date()),
        status: 'En attente',
        shippingAddress,
        shippingCost,
      });

      // Envoi de l'email de confirmation
      await emailjs.send(
        'service_e5v6lcf',
        'template_ixkspgd',
        {
          order_details: orderItems.map((item) => `${item.name} (x${item.quantity})`).join(', '),
          total,
          from_name: 'Hola Bazzar',
          reply_to: auth.currentUser.email,
          to_email: auth.currentUser.email,
        },
        'c53oA2OznqplHSP3U'
      );

      alert('Commande réussie ! Un email de confirmation a été envoyé.');
      localStorage.removeItem('cart');
      setCartItems([]);
      setTotal(0);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert("Une erreur s'est produite.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Récupérer les données du formulaire de paiement
    const cardName = e.target.elements.cardName.value;
    const cardNumber = e.target.elements.cardNumber.value;
    const expirationDate = e.target.elements.expirationDate.value;
    const cvv = e.target.elements.cvv.value;

    // Vérifier si les informations sont complètes
    if (!cardName || !cardNumber || !expirationDate || !cvv) {
      alert("Veuillez remplir toutes les informations de paiement.");
      return;
    }

    // Sauvegarder les informations de paiement avec la commande dans Firebase
    try {
      const db = firebase.firestore();
      await db.collection('orders').add({
        items: cartItems,
        total,
        userId: auth.currentUser.uid,
        shippingAddress,
        paymentInfo: {
          cardName,
          cardNumber,
          expirationDate,
          cvv,
        },
        date: firebase.firestore.Timestamp.fromDate(new Date()),
        status: 'En attente',
      });

      // Envoi de l'email de confirmation
      await emailjs.send(
        'service_e5v6lcf',
        'template_ixkspgd',
        {
          order_details: cartItems.map((item) => `${item.name} (x${item.quantity})`).join(', '),
          total,
          from_name: 'Hola Bazzar',
          reply_to: auth.currentUser.email,
          to_email: auth.currentUser.email,
        },
        'c53oA2OznqplHSP3U'
      );

      alert('Commande réussie ! Un email de confirmation a été envoyé.');
      localStorage.removeItem('cart');
      setCartItems([]);
      setTotal(0);
      setShowPaymentForm(false); // Masquer le formulaire de paiement après soumission
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert("Une erreur s'est produite.");
    }
  };

  if (!auth.currentUser) {
    return <Navigate to="/signin" />;
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Panier</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <Alert variant="warning">Votre panier est vide.</Alert>
          ) : (
            cartItems.map((item) => (
              <Card key={item.id} className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <img
                        src={item.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="img-fluid"
                      />
                    </Col>
                    <Col md={9}>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>Prix : {item.price} TND</Card.Text>
                      <Form.Control
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value, 10))
                        }
                        className="mb-2"
                      />
                      <Button variant="danger" onClick={() => handleRemoveItem(item.id)}>
                        Supprimer
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Résumé</Card.Title>
              <Card.Text>Total : {total} TND</Card.Text>
              <Card.Text>Livraison : {cartItems.length > 0 ? shippingCost : 0} TND</Card.Text>
              <Form.Group className="mb-3">
                <Form.Label>Code Promo</Form.Label>
                <Form.Control
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Entrez le code promo"
                />
              </Form.Group>
              <Button onClick={handlePromoCode} className="mb-3" variant="primary">
                Appliquer
              </Button>
              <h5>Adresse de livraison</h5>
              <Form>
                {['street', 'city', 'postalCode', 'country'].map((field) => (
                  <Form.Group className="mb-3" key={field}>
                    <Form.Label>{field}</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingAddress[field]}
                      onChange={(e) => handleAddressChange(field, e.target.value)}
                      placeholder={`Entrez votre ${field}`}
                    />
                  </Form.Group>
                ))}
              </Form>
              <Button
                variant="success"
                onClick={() => setShowPaymentForm(true)}
                className="w-100"
              >
                Passer à la caisse
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Formulaire de paiement */}
      {showPaymentForm && (
        <Form onSubmit={handlePaymentSubmit}>
          <h4>Informations de paiement</h4>
          <Form.Group className="mb-3">
            <Form.Label>Nom sur la carte</Form.Label>
            <Form.Control type="text" name="cardName" placeholder="Entrez le nom sur la carte" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Numéro de la carte</Form.Label>
            <Form.Control type="text" name="cardNumber" placeholder="Entrez le numéro de la carte" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date d'expiration</Form.Label>
            <Form.Control type="text" name="expirationDate" placeholder="MM/AA" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Code de sécurité (CVV)</Form.Label>
            <Form.Control type="text" name="cvv" placeholder="CVV" required />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isProcessing} className="w-100">
            {isProcessing ? <Spinner animation="border" size="sm" /> : 'Confirmer la commande'}
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default Cart;
