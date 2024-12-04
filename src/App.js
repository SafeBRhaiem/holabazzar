import React, { useState, useEffect } from 'react';
import './App.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './Home';
import Header from './Header';
import Categories from './components/Categories';
import Cart from './components/Cart';
import AddProduct from './components/AddProduct';
import ProductPage from './components/ProductPage';
import { auth } from './firebase';
import MyOrders from './components/MyOrders';
import AdminDashboard from './admin/AdminDashboard';
import ManageProducts from './admin/ManageProducts';
import ManageSales from './admin/ManageSales';
import ManageUsers from './admin/ManageUsers';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Profile from './components/Profile'; // Importez votre composant Profile
import './i18n'; // Charger la configuration i18n
import { useTranslation } from 'react-i18next';

function App() {
  const [user, setUser] = useState(null); // Gérer l'état de l'utilisateur
  const { t, i18n } = useTranslation(); // Utiliser le hook i18n pour la traduction

  // Écouter les changements d'état de l'utilisateur (connexion/déconnexion)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const isAdmin = currentUser.email === "bensafa257@gmail.com"; // Remplacez par votre logique de validation
        setUser({ ...currentUser, isAdmin });
      } else {
        setUser(null);  // Si l'utilisateur se déconnecte, on réinitialise l'état
      }
    });

    return () => unsubscribe();  // Nettoyage de l'abonnement lors du démontage du composant
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);  // Mettre à jour l'état de l'utilisateur pour le déconnecter
    });
  };

  // Fonction pour changer la langue
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Changer la langue globale avec i18next
    if (window.Weglot) {
      window.Weglot.switchTo(lng); // Changer la langue via Weglot aussi
    }
  };

  return (
    <Router>
      <Header />
      {/* Navbar avec les liens de navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light p-3">
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Afficher les liens selon l'état de l'utilisateur */}
              {!user && (
                <>
                  <li className="nav-item">
                    <Link to="/signin" className="nav-link">{t('signin')}</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link">{t('signup')}</Link>
                  </li>
                </>
              )}
              {user && (
                <>
                  <li className="nav-item">
                    <Link to="/cart" className="nav-link">{t('cart')}</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/add-product" className="nav-link">{t('addProduct')}</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/my-orders" className="nav-link">{t('myOrders')}</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">{t('profile')}</Link>
                  </li>
                  <li className="nav-item">
                    <button onClick={handleLogout} className="btn btn-outline-danger">{t('logout')}</button>
                  </li>

                  {/* Liens admin uniquement si l'utilisateur est admin */}
                  {user?.isAdmin && (
                    <>
                      <li className="nav-item">
                        <Link to="/admin" className="nav-link">{t('adminDashboard')}</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/products" className="nav-link">{t('manageProducts')}</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/sales" className="nav-link">{t('manageSales')}</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/admin/users" className="nav-link">{t('manageUsers')}</Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Routes de l'application */}
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/admin" element={user && user.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/products" element={user && user.isAdmin ? <ManageProducts /> : <Navigate to="/" />} />
          <Route path="/admin/sales" element={user && user.isAdmin ? <ManageSales /> : <Navigate to="/" />} />
          <Route path="/admin/users" element={user && user.isAdmin ? <ManageUsers /> : <Navigate to="/" />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/signin" />} />
          <Route path="/add-product" element={user ? <AddProduct /> : <Navigate to="/signin" />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/signin" />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
