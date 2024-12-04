import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [tel, setTel] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Création de l'utilisateur via Firebase Auth
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      // Ajouter les informations de l'utilisateur dans la base de données Firestore
      const user = firebase.auth().currentUser;
      await firebase.firestore().collection('users').doc(user.uid).set({
        nom,
        prenom,
        adresse,
        tel,
      });

      // Affichage du message de succès
      alert('Inscription réussie !');

      // Redirection vers la page de connexion après l'inscription réussie
      navigate('/signin');
    } catch (error) {
      console.error("Erreur d'inscription : ", error.message);
      alert(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
      navigate('/'); // Redirection après l'inscription via Google
    } catch (error) {
      console.error('Erreur d\'inscription avec Google', error);
      alert('Échec de l\'inscription avec Google.');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Inscription</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPrenom">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAdresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTel">
              <Form.Label>Numéro de téléphone</Form.Label>
              <Form.Control
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              S'inscrire
            </Button>
          </Form>

          <Button
            variant="outline-danger"
            className="w-100"
            onClick={handleGoogleSignUp}
          >
            <i className="bi bi-google me-2"></i> S'inscrire avec Google
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;
