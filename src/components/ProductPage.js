import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const db = firebase.firestore();
      const productDoc = await db.collection('products').doc(id).get();

      if (productDoc.exists) {
        setProduct({ id: productDoc.id, ...productDoc.data() });
      } else {
        console.log('Produit non trouvé !');
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const db = firebase.firestore();
      const storage = firebase.storage();

      const imageUrls = product.imageUrls || [];
      imageUrls.forEach(async (url) => {
        const imageRef = storage.refFromURL(url);
        await imageRef.delete();
      });

      await db.collection('products').doc(id).delete();
      alert('Produit supprimé avec succès !');
      navigate('/products');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const db = firebase.firestore();
    const updatedProduct = {
      name: e.target.name.value,
      price: parseFloat(e.target.price.value),
      quantity: parseInt(e.target.quantity.value, 10),
      description: e.target.description.value,
    };

    await db.collection('products').doc(id).update(updatedProduct);
    setProduct({ ...product, ...updatedProduct });
    setIsEditing(false);
    alert('Produit mis à jour avec succès !');
  };

  if (!product) {
    return (
      <Container className="text-center mt-5">
        <h3>Chargement...</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <Card.Img
              variant="top"
              src={product.imageUrls?.[0] || 'https://via.placeholder.com/300x200?text=Aucune+Image'}
              alt={product.name}
            />
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>
                <strong>Prix :</strong> {product.price} TND
              </Card.Text>
              <Card.Text>
                <strong>Quantité :</strong> {product.quantity}
              </Card.Text>
              <Card.Text>
                <strong>Description :</strong> {product.description}
              </Card.Text>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <h3 className="mb-3">Galerie d'images</h3>
          <Row>
            {product.imageUrls && product.imageUrls.length > 0 ? (
              product.imageUrls.map((url, index) => (
                <Col xs={6} key={index} className="mb-3">
                  <Card>
                    <Card.Img variant="top" src={url} alt={`image-${index}`} />
                  </Card>
                </Col>
              ))
            ) : (
              <p>Aucune image disponible</p>
            )}
          </Row>
        </Col>
      </Row>

      {/* Modal d'édition */}
      <Modal show={isEditing} onHide={() => setIsEditing(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le produit</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                defaultValue={product.name}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                name="price"
                defaultValue={product.price}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                defaultValue={product.quantity}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                defaultValue={product.description}
                rows={3}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button variant="success" type="submit">
              Sauvegarder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductPage;
