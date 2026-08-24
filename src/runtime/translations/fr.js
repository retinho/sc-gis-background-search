System.register([], function (_export) {
  return {
    execute: function () {
      _export({
        _widgetLabel: 'Recherche en arrière-plan',
        mapSectionTitle: 'Carte associée',
        serviceConfigTitle: 'Services de carte (Max. 5)',
        displaySectionTitle: 'Zoom et mise en évidence',
        addService: 'Ajouter un service',
        removeService: 'Supprimer le service',
        serviceId: 'ID URL (ex. parcelle)',
        serviceName: 'Nom d\'affichage',
        layerUrl: 'URL de la couche (.../MapServer/0)',
        searchFields: 'Champs de recherche (séparés par des virgules)',
        zoomLevel: 'Échelle cible (1:X)',
        highlightColor: 'Couleur de surbrillance (Hex)',
        maxServicesReached: 'Maximum 5 services autorisés.',
        defaultServiceName: 'Nouveau service',
        noMap: 'Veuillez sélectionner une carte.',
        loading: 'Recherche d’un résultat…',
        empty: 'Aucun résultat correspondant trouvé.',
        invalidConfig: 'La configuration du service de recherche est incomplète ou non valide.',
        error: 'La recherche n’a pas pu être effectuée.'
      });
    }
  };
});
