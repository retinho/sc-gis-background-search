import { AllWidgetProps, React } from 'jimu-core';
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { useBackgroundSearch } from './hooks/useBackgroundSearch';
import defaultMessages, { TMessageId } from './translations/default';

export default function BackgroundSearch(props: AllWidgetProps<IMConfig>): React.ReactElement {
  const { config, useMapWidgetIds } = props;
  const [mapView, setMapView] = React.useState<JimuMapView | null>(null);
  const searchState = useBackgroundSearch(mapView, config, props.id);
  const messageId = getMessageId(useMapWidgetIds?.[0], searchState.status);
  const message = messageId
    ? props.intl.formatMessage({ id: messageId, defaultMessage: defaultMessages[messageId] })
    : null;

  return (
    <div className="widget-background-search">
      {useMapWidgetIds?.[0] && (
        <JimuMapViewComponent useMapWidgetId={useMapWidgetIds[0]} onActiveViewChange={setMapView} />
      )}
      {message && <SearchStatus message={message} messageId={messageId} />}
    </div>
  );
}

interface ISearchStatusProps {
  message: string;
  messageId: TMessageId;
}

function SearchStatus({ message, messageId }: ISearchStatusProps): React.ReactElement {
  if (messageId === 'loading') {
    return (
      <div className="p-2 d-flex align-items-center" role="status" aria-live="polite">
        <calcite-loader active inline scale="s" label={message} className="mr-2" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <calcite-notice open icon kind={messageId === 'error' ? 'danger' : 'warning'} className="m-2">
      <div slot="message">{message}</div>
    </calcite-notice>
  );
}

function getMessageId(
  useMapWidgetId: string | undefined,
  status: ReturnType<typeof useBackgroundSearch>['status']
): TMessageId | null {
  if (!useMapWidgetId) {
    return 'noMap';
  }

  switch (status) {
    case 'loading':
      return 'loading';
    case 'empty':
      return 'empty';
    case 'invalid-config':
      return 'invalidConfig';
    case 'error':
      return 'error';
    default:
      return null;
  }
}
