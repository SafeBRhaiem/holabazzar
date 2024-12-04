import React, { useEffect } from 'react';

const AdminDashboard = () => {
  useEffect(() => {
    // Vérification de l'objet powerbi dans la console
    if (!window.powerbi) {
      console.error('La bibliothèque Power BI n\'est pas chargée');
      return;
    }

    // Vérifiez si le conteneur pour l'embed existe
    const reportContainer = document.getElementById('power-bi-container');
    if (!reportContainer) {
      console.error('Le conteneur Power BI est introuvable.');
      return;
    }

    const embedConfig = {
      type: 'report',
      embedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZGMyNjVkNTEtNWI5Yi00NjRjLThiMmEtZTFlODdkOGM0Y2E5IiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9', 
      id: 'eyJrIjoiZGMyNjVkNTEtNWI5Yi00NjRjLThiMmEtZTFlODdkOGM0Y2E5IiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9', 
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false },
        },
      },
    };

    try {
      // Embarquement du rapport Power BI dans le conteneur
      window.powerbi.embed(reportContainer, embedConfig);
    } catch (error) {
      console.error("Erreur lors de l'intégration du rapport Power BI : ", error);
    }
  }, []);  // Le tableau vide [] signifie que cet effet s'exécute une seule fois après le montage du composant

  return (
    <div>
      <h1>Tableau de bord des ventes </h1>
      <div> <iframe title="holabazza" width="600" height="373.5" src="https://app.powerbi.com/view?r=eyJrIjoiZGMyNjVkNTEtNWI5Yi00NjRjLThiMmEtZTFlODdkOGM0Y2E5IiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9" frameborder="0" allowFullScreen="true"></iframe></div>
    </div>
  );
};

export default AdminDashboard;