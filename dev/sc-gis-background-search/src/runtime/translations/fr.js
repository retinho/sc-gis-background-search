System.register([], function (_export) {
  return {
    execute: function () {
      _export({
        _widgetLabel: 'Recherche en arrière-plan',
        mapSectionTitle: 'Carte associée',
        serviceConfigTitle: 'Services de carte (Max. 5)',
        addService: 'Ajouter un service',
        serviceId: 'ID URL (ex. parcelle)',
        serviceName: 'Nom d\'affichage',
        layerUrl: 'URL de la couche (.../MapServer/0)',
        searchFields: 'Champs de recherche (séparés par des virgules)',
        zoomLevel: 'Échelle cible (1:X)',
        highlightColor: 'Couleur de surbrillance (Hex)',
        maxServicesReached: 'Maximum 5 services autorisés.'
      });
    }
  };
});