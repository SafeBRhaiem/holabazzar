import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Form, Badge } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const Profile = () => {
  const [user, setUser] = useState(null); // Pour stocker l'utilisateur connecté
  const [userInfo, setUserInfo] = useState(null); // Pour stocker les informations de l'utilisateur
  const [userProducts, setUserProducts] = useState([]); // Pour stocker les produits ajoutés par l'utilisateur
  const [isEditing, setIsEditing] = useState(false); // Pour savoir si l'utilisateur est en mode édition
  const [image, setImage] = useState(null); // Pour stocker l'image choisie pour la photo de profil
  const [loading, setLoading] = useState(false); // Pour gérer le chargement de l'image

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Récupérer les informations de l'utilisateur depuis Firestore
        const userDoc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUserInfo(userDoc.data()); // Stocke toutes les informations de l'utilisateur
        }

        // Récupérer les produits ajoutés par cet utilisateur
        const productsSnapshot = await firebase.firestore().collection('products')
          .where('userId', '==', currentUser.uid) // Assurez-vous que les produits sont liés à l'utilisateur
          .get();
        
        const productsList = productsSnapshot.docs.map(doc => doc.data());
        setUserProducts(productsList);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const currentUser = firebase.auth().currentUser;

    try {
      if (image) {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`profile_pictures/${currentUser.uid}`);
        await imageRef.put(image);
        const photoURL = await imageRef.getDownloadURL();
        await currentUser.updateProfile({ photoURL });
        setUserInfo((prev) => ({ ...prev, photoURL }));
      }

      // Enregistrer les informations de l'utilisateur dans Firestore
      await firebase.firestore().collection('users').doc(currentUser.uid).set({
        name: userInfo.name,
        photoURL: userInfo.photoURL,
        email: currentUser.email,  // Exemple d'email de l'utilisateur
        adresse: userInfo.adresse, // Ajouter l'adresse de l'utilisateur
        tel: userInfo.tel, // Ajouter le téléphone de l'utilisateur
      }, { merge: true });

      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des informations :", error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <Container className="mt-5">
      {user ? (
        <Row>
          <Col md={8} lg={6} className="mx-auto">
            <Card>
              <Card.Body>
                <h3 className="text-center mb-4">Mon Profil</h3>

                {/* Photo de profil */}
                <div className="text-center mb-4">
                  <img
                    src={userInfo?.photoURL || 'https://via.placeholder.com/150'}
                    alt="Photo de profil"
                    className="rounded-circle"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                  {isEditing && (
                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Label>Changer la photo de profil</Form.Label>
                      <Form.Control type="file" onChange={handleFileChange} />
                    </Form.Group>
                  )}
                </div>

                {/* Informations utilisateur */}
                {userInfo && (
                  <div>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Nom:</strong> {isEditing ? (
                          <Form.Control
                            type="text"
                            value={userInfo.name || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          />
                        ) : (
                          userInfo.name
                        )}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Prénom:</strong> {userInfo.prenom || 'Non renseigné'}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Email:</strong> {userInfo.email || 'Non renseigné'}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Adresse:</strong> {userInfo.adresse || 'Non renseigné'}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Téléphone:</strong> {userInfo.tel || 'Non renseigné'}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Photo de profil:</strong> <br />
                        {userInfo.photoURL ? (
                          <img
                            src={userInfo.photoURL}
                            alt="Photo de profil"
                            className="rounded-circle"
                            style={{ width: 100, height: 100, objectFit: 'cover' }}
                          />
                        ) : (
                          'Aucune photo'
                        )}
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                )}

                {/* Boutons d'action */}
                {isEditing ? (
                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="success" onClick={handleSave} disabled={loading}>
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Modifier le profil
                    </Button>
                    <Button variant="danger" onClick={handleLogout}>
                      Se déconnecter
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Liste des produits ajoutés par l'utilisateur */}
            <Card className="mt-4">
              <Card.Body>
                <h5 className="text-center mb-4">Mes Produits</h5>
                {userProducts.length > 0 ? (
                  <ListGroup variant="flush">
                    {userProducts.map((product, index) => (
                      <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>{product.name}</h6>
                          <p>{product.description}</p>
                          <Badge pill bg="secondary">{product.category}</Badge> {/* Afficher la catégorie */}
                        </div>
                        <span className="badge bg-primary text-white">{product.price}€</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-center">Aucun produit ajouté pour le moment.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center">
          <h4>Veuillez vous connecter pour accéder à votre profil</h4>
        </div>
      )}
    </Container>
  );
};

export default Profile;
