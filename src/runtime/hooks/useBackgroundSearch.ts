import Graphic from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
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
  IMConfig,
  isValidSearchValue
} from '../../config';

export type TSearchStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'invalid-config'
  | 'invalid-search'
  | 'error';

export interface ISearchState {
  status: TSearchStatus;
}

interface IWatchHandle {
  remove: () => void;
}

const HIGHLIGHT_LAYER_ID_PREFIX = 'sc-gis-background-search-highlight';

export function useBackgroundSearch(
  mapView: JimuMapView | null,
  config: IMConfig,
  widgetId: string
): ISearchState {
  const [state, setState] = React.useState<ISearchState>({ status: 'idle' });
  const highlightLayerRef = React.useRef<GraphicsLayer | null>(null);
  const attachedMapViewRef = React.useRef<JimuMapView | null>(null);
  const popupCloseHandleRef = React.useRef<IWatchHandle | null>(null);

  React.useEffect(() => {
    return () => {
      detachHighlightLayer(highlightLayerRef, attachedMapViewRef, popupCloseHandleRef);
    };
  }, []);

  React.useEffect(() => {
    const view = mapView?.view;

    if (!view || typeof window === 'undefined') {
      detachHighlightLayer(highlightLayerRef, attachedMapViewRef, popupCloseHandleRef);
      setState({ status: 'idle' });
      return;
    }

    const parameters = getUrlSearchParameters(window.location.search);
    if (!parameters) {
      clearHighlight(highlightLayerRef, popupCloseHandleRef);
      setState({ status: 'idle' });
      return;
    }

    if (!isValidSearchValue(parameters.searchValue)) {
      clearHighlight(highlightLayerRef, popupCloseHandleRef);
      setState({ status: 'invalid-search' });
      return;
    }

    const request = createSearchRequest(config.services, parameters);
    if (!request) {
      clearHighlight(highlightLayerRef, popupCloseHandleRef);
      setState({ status: 'invalid-config' });
      return;
    }

    const highlightLayer = getHighlightLayer(mapView, widgetId, highlightLayerRef, attachedMapViewRef);
    removePopupCloseHandler(popupCloseHandleRef);
    let isCancelled = false;
    const abortController = new AbortController();

    const runSearch = async (): Promise<void> => {
      setState({ status: 'loading' });

      try {
        const searchLayer = new FeatureLayer({
          url: request.service.layerUrl,
          outFields: ['*'],
          popupEnabled: true
        });
        await searchLayer.load({ signal: abortController.signal });
        const featureSet = await searchLayer.queryFeatures(
          {
            where: request.where,
            outFields: ['*'],
            num: 1,
            returnGeometry: true,
            outSpatialReference: view.spatialReference
          },
          { signal: abortController.signal }
        );

        if (isCancelled) {
          return;
        }

        const resultFeature = featureSet.features[0];
        const geometry = resultFeature?.geometry;
        if (!geometry) {
          clearHighlight(highlightLayerRef, popupCloseHandleRef);
          setState({ status: 'empty' });
          return;
        }

        const graphic = createHighlightGraphic(geometry, getHighlightColor(config.highlightColor));
        if (!graphic) {
          clearHighlight(highlightLayerRef, popupCloseHandleRef);
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

        if (!isCancelled && resultFeature) {
          try {
            openServicePopup(view, resultFeature, searchLayer, highlightLayer, popupCloseHandleRef);
          } catch (error) {
            console.warn('BackgroundSearch: The result popup could not be opened.', error);
          }
        }

        if (!isCancelled) {
          setState({ status: 'success' });
        }
      } catch {
        if (!isCancelled) {
          clearHighlight(highlightLayerRef, popupCloseHandleRef);
          setState({ status: 'error' });
        }
      }
    };

    void runSearch();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [config, mapView, widgetId]);

  return state;
}

function openServicePopup(
  view: JimuMapView['view'],
  feature: Graphic,
  serviceLayer: FeatureLayer,
  highlightLayer: GraphicsLayer,
  popupCloseHandleRef: React.MutableRefObject<IWatchHandle | null>
): void {
  const popupFeature = feature.clone();
  popupFeature.popupTemplate = serviceLayer.popupTemplate ?? serviceLayer.createPopupTemplate();
  removePopupCloseHandler(popupCloseHandleRef);
  view.openPopup({ features: [popupFeature] });
  const popup = view.popup;

  if (!popup) {
    return;
  }

  let wasVisible = popup.visible;
  popupCloseHandleRef.current = popup.watch('visible', (isVisible: boolean) => {
    if (wasVisible && !isVisible) {
      highlightLayer.removeAll();
      removePopupCloseHandler(popupCloseHandleRef);
    }

    wasVisible = isVisible;
  });
}

function getHighlightLayer(
  mapView: JimuMapView,
  widgetId: string,
  highlightLayerRef: React.MutableRefObject<GraphicsLayer | null>,
  attachedMapViewRef: React.MutableRefObject<JimuMapView | null>
): GraphicsLayer {
  const existingLayer = highlightLayerRef.current;
  const highlightLayer = existingLayer ?? new GraphicsLayer({
    id: `${HIGHLIGHT_LAYER_ID_PREFIX}-${widgetId}`,
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

function detachHighlightLayer(
  highlightLayerRef: React.MutableRefObject<GraphicsLayer | null>,
  attachedMapViewRef: React.MutableRefObject<JimuMapView | null>,
  popupCloseHandleRef: React.MutableRefObject<IWatchHandle | null>
): void {
  const highlightLayer = highlightLayerRef.current;
  const attachedMapView = attachedMapViewRef.current;

  if (highlightLayer && attachedMapView?.view?.map) {
    attachedMapView.view.map.remove(highlightLayer);
  }

  highlightLayerRef.current = null;
  attachedMapViewRef.current = null;
  removePopupCloseHandler(popupCloseHandleRef);
}

function clearHighlight(
  highlightLayerRef: React.MutableRefObject<GraphicsLayer | null>,
  popupCloseHandleRef: React.MutableRefObject<IWatchHandle | null>
): void {
  highlightLayerRef.current?.removeAll();
  removePopupCloseHandler(popupCloseHandleRef);
}

function removePopupCloseHandler(
  popupCloseHandleRef: React.MutableRefObject<IWatchHandle | null>
): void {
  popupCloseHandleRef.current?.remove();
  popupCloseHandleRef.current = null;
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
