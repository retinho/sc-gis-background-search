import { React } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { Col, Row } from 'jimu-ui';
import {
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_ZOOM_LEVEL,
  IConfig,
  IMConfig,
  IServiceConfig,
  MAX_SERVICES
} from '../config';
import defaultMessages, { TMessageId } from '../runtime/translations/default';

interface ICalciteInputElement extends HTMLElement {
  value: string;
}

export default function Setting(props: AllWidgetSettingProps<IMConfig>): React.ReactElement {
  const { onSettingChange, id, useMapWidgetIds, config, intl } = props;
  const services = Array.from(config.services ?? []);
  const translate = (key: TMessageId): string =>
    intl.formatMessage({ id: key, defaultMessage: defaultMessages[key] });

  const updateConfig = <TKey extends keyof IConfig>(key: TKey, value: IConfig[TKey]): void => {
    onSettingChange({ id, config: config.set(key, value) });
  };

  const addService = (): void => {
    if (services.length >= MAX_SERVICES) return;

    updateConfig('services', services.concat({
      id: `svc_${Date.now()}`,
      name: translate('defaultServiceName'),
      layerUrl: '',
      searchFields: ''
    }));
  };

  const removeService = (index: number): void => {
    updateConfig('services', services.filter((_, serviceIndex) => serviceIndex !== index));
  };

  const updateService = (index: number, field: keyof IServiceConfig, value: string): void => {
    updateConfig(
      'services',
      services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [field]: value } : service
      )
    );
  };

  return (
    <div className="widget-setting-background-search">
      <SettingSection title={translate('mapSectionTitle')}>
        <SettingRow>
          <MapWidgetSelector
            useMapWidgetIds={useMapWidgetIds}
            onSelect={(ids) => onSettingChange({ id, useMapWidgetIds: ids })}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title={translate('serviceConfigTitle')}>
        {services.length >= MAX_SERVICES && (
          <calcite-notice open icon kind="warning" className="mb-2">
            <div slot="message">{translate('maxServicesReached')}</div>
          </calcite-notice>
        )}
        <SettingRow>
          <calcite-button
            appearance="outline"
            width="full"
            disabled={services.length >= MAX_SERVICES ? true : undefined}
            icon-start="plus"
            onClick={addService}
          >
            {translate('addService')}
          </calcite-button>
        </SettingRow>

        {services.map((service, index) => (
          <div key={index} className="border rounded p-3 mb-3">
            <Row className="align-items-center justify-content-between mb-3">
              <strong>{service.name || `${translate('defaultServiceName')} ${index + 1}`}</strong>
              <calcite-button
                appearance="transparent"
                kind="danger"
                label={translate('removeService')}
                icon-start="trash"
                onClick={() => removeService(index)}
              />
            </Row>
            <Col>
              <calcite-label className="mb-2">
                {translate('serviceId')}
                <calcite-input
                  value={service.id}
                  onInput={(event) => updateService(index, 'id', getInputValue(event))}
                  onKeyDown={stopBuilderKeyboardShortcut}
                />
              </calcite-label>
              <calcite-label className="mb-2">
                {translate('serviceName')}
                <calcite-input
                  value={service.name}
                  onInput={(event) => updateService(index, 'name', getInputValue(event))}
                  onKeyDown={stopBuilderKeyboardShortcut}
                />
              </calcite-label>
              <calcite-label className="mb-2">
                {translate('layerUrl')}
                <calcite-input
                  type="url"
                  value={service.layerUrl}
                  onInput={(event) => updateService(index, 'layerUrl', getInputValue(event))}
                  onKeyDown={stopBuilderKeyboardShortcut}
                />
              </calcite-label>
              <calcite-label>
                {translate('searchFields')}
                <calcite-input
                  value={service.searchFields}
                  onInput={(event) => updateService(index, 'searchFields', getInputValue(event))}
                  onKeyDown={stopBuilderKeyboardShortcut}
                />
              </calcite-label>
            </Col>
          </div>
        ))}
      </SettingSection>

      <SettingSection title={translate('displaySectionTitle')}>
        <SettingRow>
          <Col className="w-100">
            <calcite-label className="mb-3">
              {translate('zoomLevel')}
              <calcite-input
                type="number"
                min="1"
                step="1"
                value={String(config.zoomLevel ?? DEFAULT_ZOOM_LEVEL)}
                onInput={(event) => updateConfig('zoomLevel', getZoomLevel(event))}
                onKeyDown={stopBuilderKeyboardShortcut}
              />
            </calcite-label>
            <calcite-label>
              {translate('highlightColor')}
              <calcite-input
                type="color"
                value={config.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
                onInput={(event) => updateConfig('highlightColor', getInputValue(event))}
                onKeyDown={stopBuilderKeyboardShortcut}
              />
            </calcite-label>
          </Col>
        </SettingRow>
      </SettingSection>
    </div>
  );
}

function getInputValue(event: React.FormEvent<HTMLElement>): string {
  return (event.currentTarget as ICalciteInputElement).value;
}

function getZoomLevel(event: React.FormEvent<HTMLElement>): number {
  const value = Number(getInputValue(event));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : DEFAULT_ZOOM_LEVEL;
}

function stopBuilderKeyboardShortcut(event: React.KeyboardEvent<HTMLElement>): void {
  event.stopPropagation();
}
