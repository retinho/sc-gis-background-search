import { React } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { TextInput, Button, NumericInput, Alert } from 'jimu-ui';
import { IMConfig, IServiceConfig } from '../config';
import defaultMessages from '../runtime/translations/default';
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus';
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash';

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const { onSettingChange, id, useMapWidgetIds, config, intl } = props;

  const translate = (key: string) => intl.formatMessage({ id: key, defaultMessage: defaultMessages[key] });

  // Fallback, falls Array leer ist
  const services = config.services || [];

  const updateConfig = (key: keyof IMConfig, value: any) => {
    onSettingChange({ id, config: config.set(key, value) });
  };

  const addService = () => {
    if (services.length >= 5) return;
    const newService: IServiceConfig = {
      id: `svc_${Date.now()}`,
      name: 'Neuer Dienst',
      layerUrl: '',
      searchFields: ''
    };
    updateConfig('services', services.concat([newService]));
  };

  const removeService = (index: number) => {
    const updated = [...services];
    updated.splice(index, 1);
    updateConfig('services', updated);
  };

  const updateServiceDetail = (index: number, field: keyof IServiceConfig, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
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
        {services.length >= 5 && (
          <Alert form="basic" type="warning" className="mb-2">
            {translate('maxServicesReached')}
          </Alert>
        )}
        <SettingRow>
          <Button type="primary" onClick={addService} disabled={services.length >= 5} className="w-100">
            <PlusOutlined className="mr-2" /> {translate('addService')}
          </Button>
        </SettingRow>

        {services.map((svc, index) => (
          <div key={index} className="p-2 mb-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{svc.name || `Dienst ${index + 1}`}</strong>
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

      <SettingSection title="Zoom & Highlight">
        <SettingRow label={translate('zoomLevel')}>
          <NumericInput
            size="sm"
            value={config.zoomLevel ?? 1000}
            onChange={val => updateConfig('zoomLevel', val)}
            className="w-50"
          />
        </SettingRow>
        <SettingRow label={translate('highlightColor')}>
          <TextInput 
            size="sm"
            value={config.highlightColor ?? '#00FFFF'}
            onChange={e => updateConfig('highlightColor', e.target.value)}
            className="w-50"
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}