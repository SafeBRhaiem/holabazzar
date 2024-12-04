import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { db } from '../firebase';

const ManageSales = () => {
  const [sales, setSales] = useState([]);
  
  useEffect(() => {
    const fetchSales = async () => {
      const salesSnapshot = await db.collection('orders').get();
      const salesData = [];

      for (const doc of salesSnapshot.docs) {
        const sale = { id: doc.id, ...doc.data() };
        const userDoc = await db.collection('users').doc(sale.userId).get(); // Récupérer les infos utilisateur
        if (userDoc.exists) {
          sale.clientName = `${userDoc.data().prenom} ${userDoc.data().nom}`; // Nom du client
          sale.clientPhone = userDoc.data().tel; // Téléphone du client
        }
        salesData.push(sale);
      }
      
      setSales(salesData);
    };

    fetchSales();
  }, []);

  const handleStatusChange = async (id, status) => {
    await db.collection('orders').doc(id).update({ status });
    setSales(sales.map(sale => (sale.id === id ? { ...sale, status } : sale)));
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Client</th>
          <th>Numéro de Téléphone</th>
          <th>Produits</th>
          <th>Montant</th>
          <th>Statut</th>
          <th>Adresse de livraison</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sales.map(sale => (
          <tr key={sale.id}>
            <td>{sale.clientName}</td> {/* Afficher le nom du client */}
            <td>{sale.clientPhone}</td> {/* Afficher le téléphone du client */}
            <td>{sale.items.map(item => item.name).join(', ')}</td> {/* Affichage des produits dans la commande */}
            <td>{sale.total} TND</td>
            <td>{sale.status}</td>
            <td>
              {sale.shippingAddress.street}, {sale.shippingAddress.city}, {sale.shippingAddress.country}
            </td>
            <td>
              <Button variant="success" onClick={() => handleStatusChange(sale.id, 'Terminé')}>Terminer</Button>{' '}
              <Button variant="info" onClick={() => handleStatusChange(sale.id, 'Expédiée')}>Expédier</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ManageSales;
