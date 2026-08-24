import Graphic from 'esri/Graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import * as query from 'esri/rest/query';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import type Geometry from 'esri/geometry/Geometry';
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
import {
  createSearchRequest,
  getHighlightColor,
  getUrlSearchParameters,
  getZoomLevel,
  IMConfig
} from '../../config';

export type TSearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'invalid-config' | 'error';

export interface ISearchState {
  status: TSearchStatus;
}

const HIGHLIGHT_LAYER_ID = 'sc-gis-background-search-highlight';

export function useBackgroundSearch(mapView: JimuMapView | null, config: IMConfig): ISearchState {
  const [state, setState] = React.useState<ISearchState>({ status: 'idle' });
  const highlightLayerRef = React.useRef<GraphicsLayer | null>(null);
  const attachedMapViewRef = React.useRef<JimuMapView | null>(null);

  React.useEffect(() => {
    return () => {
      const highlightLayer = highlightLayerRef.current;
      const attachedMapView = attachedMapViewRef.current;

      if (highlightLayer && attachedMapView?.view?.map) {
        attachedMapView.view.map.remove(highlightLayer);
      }

      highlightLayerRef.current = null;
      attachedMapViewRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const view = mapView?.view;

    if (!view || typeof window === 'undefined') {
      return;
    }

    const parameters = getUrlSearchParameters(window.location.search);
    if (!parameters) {
      highlightLayerRef.current?.removeAll();
      setState({ status: 'idle' });
      return;
    }

    const request = createSearchRequest(config.services, parameters);
    if (!request) {
      highlightLayerRef.current?.removeAll();
      setState({ status: 'invalid-config' });
      return;
    }

    const highlightLayer = getHighlightLayer(mapView, highlightLayerRef, attachedMapViewRef);
    let isCancelled = false;

    const runSearch = async (): Promise<void> => {
      setState({ status: 'loading' });

      try {
        const featureSet = await query.executeQueryJSON(request.service.layerUrl, {
          where: request.where,
          outFields: ['*'],
          returnGeometry: true,
          outSpatialReference: view.spatialReference
        });

        if (isCancelled) {
          return;
        }

        const geometry = featureSet.features[0]?.geometry;
        if (!geometry) {
          highlightLayer.removeAll();
          setState({ status: 'empty' });
          return;
        }

        const graphic = createHighlightGraphic(geometry, getHighlightColor(config.highlightColor));
        if (!graphic) {
          highlightLayer.removeAll();
          setState({ status: 'error' });
          return;
        }

        highlightLayer.removeAll();
        highlightLayer.add(graphic);
        try {
          await view.goTo(
            {
              target: geometry,
              scale: getZoomLevel(config.zoomLevel)
            },
            { animate: true, duration: 1000 }
          );
        } catch {
          // A user interaction can interrupt the animation without invalidating the search result.
        }

        if (!isCancelled) {
          setState({ status: 'success' });
        }
      } catch {
        if (!isCancelled) {
          highlightLayer.removeAll();
          setState({ status: 'error' });
        }
      }
    };

    void runSearch();

    return () => {
      isCancelled = true;
    };
  }, [config, mapView]);

  return state;
}

function getHighlightLayer(
  mapView: JimuMapView,
  highlightLayerRef: React.MutableRefObject<GraphicsLayer | null>,
  attachedMapViewRef: React.MutableRefObject<JimuMapView | null>
): GraphicsLayer {
  const existingLayer = highlightLayerRef.current;
  const highlightLayer = existingLayer ?? new GraphicsLayer({
    id: HIGHLIGHT_LAYER_ID,
    listMode: 'hide'
  });

  if (attachedMapViewRef.current !== mapView) {
    const previousMap = attachedMapViewRef.current?.view?.map;
    if (previousMap && existingLayer) {
      previousMap.remove(existingLayer);
    }

    mapView.view.map.add(highlightLayer);
    highlightLayerRef.current = highlightLayer;
    attachedMapViewRef.current = mapView;
  }

  return highlightLayer;
}

function createHighlightGraphic(geometry: Geometry, color: string): Graphic | null {
  const symbol = createHighlightSymbol(geometry, color);

  return symbol ? new Graphic({ geometry, symbol }) : null;
}

function createHighlightSymbol(
  geometry: Geometry,
  color: string
): SimpleFillSymbol | SimpleLineSymbol | SimpleMarkerSymbol | null {
  switch (geometry.type) {
    case 'point':
    case 'multipoint':
      return new SimpleMarkerSymbol({
        color: [0, 0, 0, 0],
        outline: { color, width: 3 },
        size: 16
      });
    case 'polyline':
      return new SimpleLineSymbol({ color, width: 4 });
    case 'polygon':
      return new SimpleFillSymbol({
        color: [0, 0, 0, 0.1],
        outline: { color, width: 3 }
      });
    default:
      return null;
  }
}
