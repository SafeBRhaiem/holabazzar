import React, { useEffect, useState } from 'react'; 
import { Container, Row, Col, Card, ListGroup, Button, Badge } from 'react-bootstrap'; 
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore'; 
import 'firebase/compat/auth'; // Importer le module auth pour vérifier l'utilisateur connecté

// Fonction pour normaliser les chaînes (supprimer les accents et mettre en minuscules)
const normalizeString = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);
  const [user, setUser] = useState(null); // État pour l'utilisateur connecté

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      const db = firebase.firestore();

      try {
        // Récupérer les catégories
        const categoriesCollection = await db.collection('categories').get();
        const categoriesData = categoriesCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);

        // Récupérer les produits
        const productsCollection = await db.collection('products').get();
        const productsData = productsCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Organiser les produits par catégorie
        const categorizedProducts = {};
        productsData.forEach(product => {
          const matchedCategory = categoriesData.find(
            cat => normalizeString(cat.name) === normalizeString(product.category)
          );
          if (matchedCategory) {
            const categoryName = matchedCategory.name;
            if (!categorizedProducts[categoryName]) {
              categorizedProducts[categoryName] = [];
            }
            categorizedProducts[categoryName].push(product);
          }
        });

        setProductsByCategory(categorizedProducts);
      } catch (error) {
        console.error('Erreur lors de la récupération des données Firestore :', error);
      }
    };

    fetchCategoriesAndProducts();

    // Vérifier l'état de connexion de l'utilisateur
    firebase.auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Mettre à jour l'état avec l'utilisateur connecté
    });
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setPriceFilter(null);
  };

  const handlePriceFilterClick = (range) => {
    setPriceFilter(range);
    setSelectedCategory(null);
  };

  const getFilteredProducts = () => {
    const products = selectedCategory
      ? productsByCategory[selectedCategory] || []
      : Object.values(productsByCategory).flat();

    if (priceFilter) {
      return products.filter(product => {
        if (priceFilter === "moins50") return product.price < 50;
        if (priceFilter === "50-100") return product.price >= 50 && product.price <= 100;
        if (priceFilter === "plus100") return product.price > 100;
        return true;
      });
    }

    return products;
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'livre':
        return <i className="bi bi-book-fill text-primary fs-3 mb-2"></i>;
      case 'mode':
        return <i className="bi bi-bag-fill text-danger fs-3 mb-2"></i>;
      case 'technologie':
        return <i className="bi bi-laptop-fill text-success fs-3 mb-2"></i>;
      default:
        return <i className="bi bi-question-circle-fill text-secondary fs-3 mb-2"></i>;
    }
  };

  // Fonction pour ajouter un produit au panier dans localStorage
  const handleAddToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

    // Vérifier si le produit est déjà dans le panier
    const productExists = currentCart.find(item => item.id === product.id);

    if (productExists) {
      alert(`${product.name} est déjà dans votre panier.`);
    } else {
      currentCart.push(product);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      alert(`${product.name} ajouté au panier !`);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        {/* Sidebar : Filtres */}
        <Col md={3} className="border-end pe-4">
          <h4 className="mb-4 text-primary">Filtres</h4>
          <ListGroup>
            <ListGroup.Item
              action
              className="d-flex justify-content-between align-items-center"
              onClick={() => handlePriceFilterClick("moins50")}
            >
              Prix: Moins de 50 TND
              <Badge bg="secondary">-50</Badge>
            </ListGroup.Item>
            <ListGroup.Item
              action
              className="d-flex justify-content-between align-items-center"
              onClick={() => handlePriceFilterClick("50-100")}
            >
              Prix: 50 - 100 TND
              <Badge bg="secondary">50-100</Badge>
            </ListGroup.Item>
            <ListGroup.Item
              action
              className="d-flex justify-content-between align-items-center"
              onClick={() => handlePriceFilterClick("plus100")}
            >
              Prix: Plus de 100 TND
              <Badge bg="secondary">+100</Badge>
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => setSelectedCategory(null)}>
              Toutes les catégories
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* Main content : Produits et Catégories */}
        <Col md={9}>
          <h2 className="mb-4 text-success">Catégories</h2>
          <Row>
            {categories.map(category => (
              <Col md={4} key={category.id} className="mb-4">
                <Card
                  onClick={() => handleCategoryClick(category.name)}
                  style={{ cursor: 'pointer', borderColor: 'lightgray' }}
                  className="shadow-sm text-center"
                >
                  <Card.Body>
                    {getCategoryIcon(category.name)}
                    <Card.Title className="text-primary mt-2">
                      {category.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <h2 className="mb-4 text-success">Produits</h2>
          <Row>
            {getFilteredProducts().map(product => (
              <Col md={4} key={product.id} className="mb-4">
                <Card className="shadow-sm">
                  <Card.Img
                    variant="top"
                    src={product.imageUrls && product.imageUrls.length > 0
                      ? product.imageUrls[0]
                      : 'https://via.placeholder.com/300x200?text=Image+non+disponible'}
                    alt={product.name}
                    className="rounded"
                  />
                  <Card.Body>
                    <Card.Title className="text-primary">{product.name}</Card.Title>
                    <Card.Text className="text-muted">
                      Prix: <strong>{product.price} TND</strong>
                    </Card.Text>
                    {user ? (
                      <Button
                        variant="success"
                        onClick={() => handleAddToCart(product)} // Appel de la fonction pour ajouter au panier
                        className="w-100"
                      >
                        Ajouter au panier
                      </Button>
                    ) : (
                      <Button variant="secondary" className="w-100" disabled>
                        Connectez-vous pour ajouter au panier
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Categories;