import { React, AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView, loadArcGISJSAPIModules } from 'jimu-arcgis';
import { IMConfig } from '../config';

export default function BackgroundSearch(props: AllWidgetProps<IMConfig>) {
  const { config, useMapWidgetIds } = props;
  const [mv, setMv] = React.useState<JimuMapView | null>(null);

  React.useEffect(() => {
    // Nur ausführen, wenn Karte bereit ist
    if (!mv?.view) return;

    const executeUrlSearch = async () => {
      // 1. URL Parameter auslesen
      const urlParams = new URLSearchParams(window.location.search);
      const searchId = urlParams.get('sc_search_id');
      const searchVal = urlParams.get('sc_search_val');

      if (!searchId || !searchVal || !config.services) return;

      // 2. Passenden Service aus Config suchen
      const serviceConfig = config.services.find(s => s.id === searchId);
      if (!serviceConfig || !serviceConfig.layerUrl || !serviceConfig.searchFields) {
        console.warn(`BackgroundSearch: Service-ID '${searchId}' nicht konfiguriert oder unvollständig.`);
        return;
      }

      try {
        // 3. ArcGIS Module laden
        const [queryRest, Query, Graphic, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol] = 
          await loadArcGISJSAPIModules([
            'esri/rest/query',
            'esri/rest/support/Query',
            'esri/Graphic',
            'esri/symbols/SimpleFillSymbol',
            'esri/symbols/SimpleLineSymbol',
            'esri/symbols/SimpleMarkerSymbol'
          ]);

        // 4. SQL WHERE Clause zusammenbauen (unterstützt mehrere Felder mit OR)
        const fields = serviceConfig.searchFields.split(',').map(f => f.trim());
        // Bsp: UPPER(FELD1) LIKE UPPER('%wert%') OR UPPER(FELD2) LIKE UPPER('%wert%')
        const whereClause = fields
          .map(f => `UPPER(${f}) LIKE UPPER('%${searchVal}%')`)
          .join(' OR ');

        const queryObject = new Query({
          where: whereClause,
          outFields: ['*'],
          returnGeometry: true,
          outSpatialReference: mv.view.spatialReference
        });

        // 5. REST Query gegen den konfigurierten Layer ausführen
        const featureSet = await queryRest.executeQueryJSON(serviceConfig.layerUrl, queryObject);

        if (featureSet && featureSet.features.length > 0) {
          const resultFeature = featureSet.features[0]; // Wir nehmen den ersten Treffer
          const geometry = resultFeature.geometry;
          
          const highlightHex = config.highlightColor ?? '#00FFFF';

          // 6. Dynamisches Symbol basierend auf Geometrie-Typ
          let symbol;
          if (geometry.type === 'point') {
            symbol = new SimpleMarkerSymbol({
              color: [0, 0, 0, 0], // transparent
              outline: { color: highlightHex, width: 3 },
              size: 16
            });
          } else if (geometry.type === 'polyline') {
            symbol = new SimpleLineSymbol({
              color: highlightHex,
              width: 4
            });
          } else {
            // Polygon
            symbol = new SimpleFillSymbol({
              color: [0, 0, 0, 0.1],
              outline: { color: highlightHex, width: 3 }
            });
          }

          const graphic = new Graphic({
            geometry: geometry,
            symbol: symbol
          });

          // Grafik zur View hinzufügen und zoomen
          mv.view.graphics.removeAll();
          mv.view.graphics.add(graphic);

          mv.view.goTo({
            target: geometry,
            scale: config.zoomLevel ?? 1000
          }, { animate: true, duration: 1000 });
          
        } else {
          console.info(`BackgroundSearch: Keine Resultate für '${searchVal}' gefunden.`);
        }
      } catch (error) {
        console.error("BackgroundSearch Error:", error);
      }
    };

    // Führe Suche aus
    executeUrlSearch();

  // Effect-Dependencies: Wird getriggert, sobald mv.view bereit ist.
  }, [mv?.view, config.services, config.highlightColor, config.zoomLevel]);

  // Wenn keine Karte in den Settings definiert ist, können wir nichts rendern.
  if (!useMapWidgetIds || useMapWidgetIds.length === 0) {
    // Im Builder zeigen wir einen Text an, damit der User weiss, dass das Widget da ist.
    return (
      <div className="p-3 text-center border">
        <small>Background Search Widget (Headless) - Bitte Karte konfigurieren.</small>
      </div>
    );
  }

  // Für die Runtime: Ein unsichtbarer Container, der nur die Karte bindet.
  return (
    <div className="widget-background-search" style={{ display: 'none' }}>
      <JimuMapViewComponent 
        useMapWidgetId={useMapWidgetIds[0]} 
        onActiveViewChange={setMv} 
      />
    </div>
  );
}