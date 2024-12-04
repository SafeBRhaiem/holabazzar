import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Card, Row, Col } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { auth } from './firebase';  // Importation de auth depuis firebase.js
import './Home.css';  // Importation du fichier CSS personnalisé

const Home = () => {
  const [products, setProducts] = useState([]);  // Liste des produits
  const [user, setUser] = useState(null);  // Gérer l'état de l'utilisateur
  const [searchTerm, setSearchTerm] = useState('');  // Gérer l'état de la recherche

  // Vérification de l'utilisateur authentifié
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);  // Mettre à jour l'utilisateur dans l'état
    });

    return () => unsubscribe();  // Nettoyage de l'abonnement lors du démontage du composant
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const db = firebase.firestore();  // Firebase firestore utilisé ici
      const storage = firebase.storage();  // Firebase storage utilisé ici
      const productsCollection = await db.collection('products').get();

      const productsData = await Promise.all(
        productsCollection.docs.map(async (doc) => {
          const product = doc.data();
          if (product.imageUrls && product.imageUrls.length > 0) {
            // Si le produit a des URLs d'images
            product.imageUrls = await Promise.all(
              product.imageUrls.map(async (imagePath) => {
                const imageRef = imagePath.startsWith('http') 
                  ? storage.refFromURL(imagePath)  // Utiliser refFromURL pour les URLs complets
                  : storage.ref(imagePath);        // Utiliser ref pour les chemins relatifs
                try {
                  return await imageRef.getDownloadURL(); // Obtenir l'URL publique
                } catch (error) {
                  console.error("Erreur lors du téléchargement de l'image:", error);
                  return 'https://via.placeholder.com/150'; // Fallback en cas d'erreur
                }
              })
            );
          } else if (product.image) {
            // Si le produit n'a qu'une seule image
            const imageRef = product.image.startsWith('http')
              ? storage.refFromURL(product.image)  // Utiliser refFromURL pour les URLs complets
              : storage.ref(product.image);         // Utiliser ref pour les chemins relatifs
            try {
              product.imageUrl = await imageRef.getDownloadURL(); // Obtenir l'URL publique
            } catch (error) {
              console.error("Erreur lors du téléchargement de l'image:", error);
              product.imageUrl = 'https://via.placeholder.com/150'; // Fallback en cas d'erreur
            }
          }
          return { id: doc.id, ...product };
        })
      );

      setProducts(productsData);
    };

    fetchProducts();
  }, []);

  // Filtrer les produits en fonction du terme de recherche
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) // Optionnel: chercher aussi dans la description
  );

  const handleAddToCart = (product) => {
    if (!user) {
      alert("Vous devez être connecté pour ajouter un produit au panier.");
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cartItems.find((item) => item.id === product.id);
    let updatedItems = [];

    if (existingItem) {
      // Si le produit existe déjà, on met à jour la quantité
      updatedItems = cartItems.map((item) => {
        if (item.id === product.id) {
          if (item.quantity < item.stock) { // Vérifier si la quantité ne dépasse pas le stock
            item.quantity += 1;
          }
        }
        return item;
      });
    } else {
      product.quantity = 1;
      updatedItems = [...cartItems, product];
    }

    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">HolaBazaar</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
            </Nav>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="form-control"
              value={searchTerm} // Lier la valeur de recherche à l'état
              onChange={(e) => setSearchTerm(e.target.value)} // Mettre à jour l'état de la recherche
            />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <header className="main-banner text-center text-white">
        <div className="banner-content">
          <h1>Bienvenue sur HolaBazaar</h1>
          <p>Découvrez les meilleures offres du moment</p>
          <Button variant="primary" size="lg">Découvrir</Button>
        </div>
      </header>

      <Container className="mt-4">
        <h2>Produits Populaires</h2>
        <Row>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Col md={4} key={product.id} className="mb-4">
                <Card>
                  <Card.Img
                    variant="top"
                    src={product.imageUrls ? product.imageUrls[0] : product.imageUrl || 'https://via.placeholder.com/150'}
                    alt={product.name}
                  />
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>Prix: {product.price} TND</Card.Text>
                    <Button
                      variant="success"
                      onClick={() => handleAddToCart(product)}
                      disabled={!user} // Désactiver le bouton si l'utilisateur n'est pas connecté
                    >
                      Ajouter au panier
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>Aucun produit trouvé.</p>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Home;
