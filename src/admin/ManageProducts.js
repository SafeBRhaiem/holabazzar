import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { db } from '../firebase'; // Assurez-vous d'importer la configuration Firebase

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      const productsSnapshot = await db.collection('products').get();
      setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      await db.collection('products').doc(id).delete();
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (selectedProduct.id) {
      await db.collection('products').doc(selectedProduct.id).update(selectedProduct);
    } else {
      await db.collection('products').add(selectedProduct);
    }
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <Button onClick={() => { setSelectedProduct({}); setShowModal(true); }}>
        Ajouter un produit
      </Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prix</th>
            <th>quantite</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price} TND</td>
              <td>{product.quantity}</td>
              <td>
                <Button variant="warning" onClick={() => { setSelectedProduct(product); setShowModal(true); }}>
                  Modifier
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(product.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal pour ajouter/modifier un produit */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.id ? 'Modifier le produit' : 'Ajouter un produit'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group controlId="name">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={selectedProduct?.name || ''}
                onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>Prix</Form.Label>
              <Form.Control
                type="number"
                value={selectedProduct?.price || ''}
                onChange={e => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>quantity</Form.Label>
              <Form.Control
                type="number"
                value={selectedProduct?.quantity || ''}
                onChange={e => setSelectedProduct({ ...selectedProduct, quantity: parseInt(e.target.value, 10) })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ManageProducts;

