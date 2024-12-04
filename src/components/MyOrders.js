import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { auth } from '../firebase'; // Assurez-vous que le chemin est correct
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const db = firebase.firestore();
      try {
        const ordersSnapshot = await db
          .collection('orders')
          .where('userId', '==', auth.currentUser.uid)
          .get();

        const fetchedOrders = ordersSnapshot.docs.map((doc) => {
          const orderData = doc.data();

          // Conversion correcte du Timestamp en Date
          const orderDate =
            orderData.createdAt && orderData.createdAt.toDate
              ? orderData.createdAt.toDate()
              : null;

          return {
            id: doc.id,
            ...orderData,
            createdAt: orderDate,
          };
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="text-primary mb-4">Mes Commandes</h2>
      {orders.length > 0 ? (
        <Row>
          {orders.map((order) => (
            <Col md={6} lg={4} key={order.id} className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  {/* En-tête de la commande */}
                  <h5 className="text-success">Commande #{order.id}</h5>
                  <Badge
                    bg={order.status === 'terminé' ? 'success' : 'warning'}
                    className="mb-3"
                  >
                    {order.status}
                  </Badge>
                  
                  {/* Adresse de livraison */}
                  <Card.Text>
                    <strong>Adresse de livraison :</strong>
                    <br />
                    {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                  </Card.Text>
                  
                  {/* Coût total */}
                  <Card.Text>
                    <strong>Coût de livraison :</strong> {order.shippingCost} TND
                  </Card.Text>
                  <Card.Text>
                    <strong>Total :</strong> {order.total} TND
                  </Card.Text>
                  
                  {/* Articles */}
                  <h6>Articles :</h6>
                  <ListGroup variant="flush" className="mb-3">
                    {order.items.map((item, index) => (
                      <ListGroup.Item key={index} className="d-flex justify-content-between">
                        <div>
                          <strong>{item.name}</strong>
                          <p className="text-muted mb-1">{item.description}</p>
                          Quantité : {item.quantity}
                        </div>
                        <span>{item.price} TND</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  
                  {/* Image produit */}
                  <Card.Img
                    src={
                      order.items[0]?.imageUrls?.[0] ||
                      'https://via.placeholder.com/300x200?text=Image+non+disponible'
                    }
                    alt="Image produit"
                    className="rounded mt-3"
                  />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-muted">Vous n'avez pas de commandes.</p>
      )}
    </Container>
  );
};

export default MyOrders;
