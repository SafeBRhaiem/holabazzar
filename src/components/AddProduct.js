import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const db = firebase.firestore();
      const snapshot = await db.collection('categories').get();
      const categoriesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (price < 0 || quantity < 0) {
      alert('Le prix et la quantité ne peuvent pas être négatifs');
      return;
    }

    const productData = {
      name,
      price: parseFloat(price),
      category: selectedCategory,
      description,
      quantity,
    };

    try {
      const db = firebase.firestore();
      const productRef = await db.collection('products').add(productData);

      // Téléchargement des images
      const uploadPromises = images.map((image) => {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`products/${productRef.id}/${image.name}`);
        return fileRef.put(image);
      });

      await Promise.all(uploadPromises);

      const imageUrls = await Promise.all(
        images.map((image) => {
          const storageRef = firebase.storage().ref();
          const fileRef = storageRef.child(`products/${productRef.id}/${image.name}`);
          return fileRef.getDownloadURL();
        })
      );

      await productRef.update({ imageUrls });

      alert('Produit ajouté avec succès !');
      setName('');
      setPrice('');
      setImages([]);
      setSelectedCategory('');
      setDescription('');
      setQuantity(1);

      navigate(`/product/${productRef.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit : ', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Ajouter un produit</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Nom du produit :</Form.Label>
          <Col sm={9}>
            <Form.Control 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Prix :</Form.Label>
          <Col sm={9}>
            <Form.Control 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              min="0" 
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Quantité :</Form.Label>
          <Col sm={9}>
            <Form.Control 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(0, e.target.value))} 
              required 
              min="0" 
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Catégorie :</Form.Label>
          <Col sm={9}>
            <Form.Select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Images :</Form.Label>
          <Col sm={9}>
            <Form.Control 
              type="file" 
              multiple 
              onChange={handleImageChange} 
              accept="image/*" 
              required 
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>Description :</Form.Label>
          <Col sm={9}>
            <Form.Control 
              as="textarea" 
              rows={4} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </Col>
        </Form.Group>

        <div className="text-center">
          <Button type="submit" variant="primary">Ajouter Produit</Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddProduct;