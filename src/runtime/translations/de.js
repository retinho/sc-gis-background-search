System.register([], function (_export) {
  return {
    execute: function () {
      _export({
        _widgetLabel: 'Background Search',
        mapSectionTitle: 'Verknüpfte Karte',
        serviceConfigTitle: 'Kartendienste (Max. 5)',
        displaySectionTitle: 'Zoom und Hervorhebung',
        addService: 'Dienst hinzufügen',
        serviceId: 'URL-ID (z.B. parzelle)',
        serviceName: 'Anzeigename',
        layerUrl: 'Layer URL (.../MapServer/0)',
        searchFields: 'Suchfelder (Komma-getrennt)',
        zoomLevel: 'Ziel-Massstab (1:X)',
        highlightColor: 'Highlight-Farbe (Hex)',
        maxServicesReached: 'Maximal 5 Dienste erlaubt.',
        defaultServiceName: 'Neuer Dienst',
        noMap: 'Bitte Karte wählen.',
        loading: 'Resultat wird gesucht…',
        empty: 'Kein passendes Resultat gefunden.',
        invalidConfig: 'Die Konfiguration des Suchdienstes ist unvollständig oder ungültig.',
        error: 'Die Suche konnte nicht abgeschlossen werden.'
      });
    }
  };
});
