import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './Header.css';  // Importation des styles CSS

const Header = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/home">
          <img
            src="https://i.ibb.co/7Nkpx13/logo.png"
            alt="Logo HolaBazaar"
            className="logo d-inline-block align-top"
            style={{ height: '40px' }} // Ajustement de la taille du logo
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/Home">Accueil</Nav.Link>
            <Nav.Link href="/Categories">Catégories</Nav.Link>
            {/* Vous pouvez ajouter plus de liens ici si nécessaire */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
