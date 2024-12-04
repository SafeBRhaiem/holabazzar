import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { db } from '../firebase';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Récupérer les utilisateurs depuis Firestore
      const usersSnapshot = await db.collection('users').get();
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id, isAdmin) => {
    // Mise à jour du rôle en fonction de 'isAdmin'
    await db.collection('users').doc(id).update({ isAdmin: !isAdmin });
    setUsers(users.map(user => (user.id === id ? { ...user, isAdmin: !isAdmin } : user)));
  };

  const handleDisable = async (id) => {
    // Suppression de l'utilisateur (désactivation)
    await db.collection('users').doc(id).delete();
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Email</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Téléphone</th>
          <th>Adresse</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.nom}</td>
            <td>{user.prenom}</td>
            <td>{user.tel}</td>
            <td>{user.adresse}</td>
            <td>{user.isAdmin ? 'Admin' : 'Utilisateur'}</td>
            <td>
              <Button
                variant="warning"
                onClick={() => handleRoleChange(user.id, user.isAdmin)}
              >
                {user.isAdmin ? 'Attribuer Utilisateur' : 'Attribuer Admin'}
              </Button>{' '}
              <Button variant="danger" onClick={() => handleDisable(user.id)}>
                Désactiver
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ManageUsers;
