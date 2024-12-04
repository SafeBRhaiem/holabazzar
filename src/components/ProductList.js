import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]); // Plage de prix par défaut
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8; // Nombre d'articles par page

  useEffect(() => {
    const fetchProducts = async () => {
      const db = firebase.firestore();
      const productsCollection = await db.collection('products').get();
      const productsData = productsCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setFilteredProducts(productsData);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const withinPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return withinPriceRange; // Ajoutez d'autres filtres ici si nécessaire
    });
    setFilteredProducts(filtered);
  }, [priceRange, products]);

  const handlePriceChange = (e) => {
    const { value } = e.target;
    setPriceRange(value.split(',').map(Number)); // Exemple: "20,50" => [20, 50]
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const displayedProducts = filteredProducts.slice(0, page * itemsPerPage);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      {/* Barre de filtre */}
      <Row className="mb-4">
        <Col md={4}>
          <h4>Filtrer par prix</h4>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Plage de prix (min,max)"
              onChange={handlePriceChange}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Grille des produits */}
      <Row>
        {displayedProducts.map((product) => (
          <Col md={6} lg={4} xl={3} key={product.id} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Img
                variant="top"
                src={product.image || 'https://via.placeholder.com/300x200?text=Image+non+disponible'}
                alt={product.name}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>Prix: {product.price} TND</Card.Text>
                <Button variant="primary">Ajouter au panier</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bouton Charger plus */}
      {displayedProducts.length < filteredProducts.length && (
        <div className="text-center mt-4">
          <Button onClick={handleLoadMore} variant="secondary">
            Charger plus
          </Button>
        </div>
      )}
    </Container>
  );
};

export default ProductList;
