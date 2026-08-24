import { React } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { TextInput, Button, NumericInput, Alert } from 'jimu-ui';
import {
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_ZOOM_LEVEL,
  IConfig,
  IMConfig,
  IServiceConfig,
  MAX_SERVICES
} from '../config';
import defaultMessages, { TMessageId } from '../runtime/translations/default';
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus';
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash';

export default function Setting(props: AllWidgetSettingProps<IMConfig>): React.ReactElement {
  const { onSettingChange, id, useMapWidgetIds, config, intl } = props;

  const translate = (key: TMessageId): string =>
    intl.formatMessage({ id: key, defaultMessage: defaultMessages[key] });

  const services = Array.from(config.services ?? []);

  const updateConfig = <TKey extends keyof IConfig>(key: TKey, value: IConfig[TKey]): void => {
    onSettingChange({ id, config: config.set(key, value) });
  };

  const addService = (): void => {
    if (services.length >= MAX_SERVICES) return;
    const newService: IServiceConfig = {
      id: `svc_${Date.now()}`,
      name: translate('defaultServiceName'),
      layerUrl: '',
      searchFields: ''
    };
    updateConfig('services', services.concat([newService]));
  };

  const removeService = (index: number): void => {
    updateConfig('services', services.filter((_, serviceIndex) => serviceIndex !== index));
  };

  const updateServiceDetail = (
    index: number,
    field: keyof IServiceConfig,
    value: string
  ): void => {
    const updated = services.map((service, serviceIndex) =>
      serviceIndex === index ? { ...service, [field]: value } : service
    );
    updateConfig('services', updated);
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
          <Alert form="basic" type="warning" className="mb-2">
            {translate('maxServicesReached')}
          </Alert>
        )}
        <SettingRow>
          <Button type="primary" onClick={addService} disabled={services.length >= MAX_SERVICES} className="w-100">
            <PlusOutlined className="mr-2" /> {translate('addService')}
          </Button>
        </SettingRow>

        {services.map((svc, index) => (
          <div key={svc.id || index} className="p-2 mb-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{svc.name || `${translate('defaultServiceName')} ${index + 1}`}</strong>
              <Button icon size="sm" type="danger" onClick={() => removeService(index)}>
                <TrashOutlined />
              </Button>
            </div>
            <TextInput 
              placeholder={translate('serviceId')} 
              value={svc.id} 
              onChange={e => updateServiceDetail(index, 'id', e.target.value)} 
              className="mb-2 w-100" size="sm" 
            />
            <TextInput 
              placeholder={translate('serviceName')} 
              value={svc.name} 
              onChange={e => updateServiceDetail(index, 'name', e.target.value)} 
              className="mb-2 w-100" size="sm" 
            />
            <TextInput 
              placeholder={translate('layerUrl')} 
              value={svc.layerUrl} 
              onChange={e => updateServiceDetail(index, 'layerUrl', e.target.value)} 
              className="mb-2 w-100" size="sm" 
            />
            <TextInput 
              placeholder={translate('searchFields')} 
              value={svc.searchFields} 
              onChange={e => updateServiceDetail(index, 'searchFields', e.target.value)} 
              className="w-100" size="sm" 
            />
          </div>
        ))}
      </SettingSection>

      <SettingSection title={translate('displaySectionTitle')}>
        <SettingRow label={translate('zoomLevel')}>
          <NumericInput
            size="sm"
            value={config.zoomLevel ?? DEFAULT_ZOOM_LEVEL}
            onChange={val => updateConfig('zoomLevel', val)}
            className="w-50"
          />
        </SettingRow>
        <SettingRow label={translate('highlightColor')}>
          <TextInput 
            size="sm"
            value={config.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR}
            onChange={e => updateConfig('highlightColor', e.target.value)}
            className="w-50"
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}
