import { ImmutableObject } from 'jimu-core';

export interface IServiceConfig {
  id: string;
  name: string;
  layerUrl: string;
  searchFields: string;
}

export interface IConfig {
  services: IServiceConfig[];
  zoomLevel?: number;
  highlightColor?: string;
}

export type IMConfig = ImmutableObject<IConfig>;

export const DEFAULT_ZOOM_LEVEL = 1000;
export const DEFAULT_HIGHLIGHT_COLOR = '#00FFFF';
export const MAX_SERVICES = 5;
export const MAX_SEARCH_VALUE_LENGTH = 256;

export interface ISearchParameters {
  serviceId: string;
  searchValue: string;
}

export interface ISearchRequest {
  service: IServiceConfig;
  where: string;
}

const SERVICE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const FIELD_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const LAYER_PATH_PATTERN = /\/(?:MapServer|FeatureServer)\/\d+\/?$/i;
const HEX_COLOR_PATTERN = /^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

export function getUrlSearchParameters(search: string): ISearchParameters | null {
  const parameters = new URLSearchParams(search);
  const serviceId = parameters.get('sc_search_id')?.trim();
  const searchValue = parameters.get('sc_search_val')?.trim();

  if (!serviceId || !searchValue) {
    return null;
  }

  return { serviceId, searchValue };
}

export function createSearchRequest(
  services: readonly IServiceConfig[] | undefined,
  parameters: ISearchParameters
): ISearchRequest | null {
  const service = services?.find(({ id }) => id === parameters.serviceId);

  if (
    !service ||
    !isValidServiceConfig(service) ||
    !SERVICE_ID_PATTERN.test(parameters.serviceId) ||
    !isValidSearchValue(parameters.searchValue)
  ) {
    return null;
  }

  const fields = getSearchFields(service.searchFields);
  const escapedSearchValue = escapeSqlLikeValue(parameters.searchValue);
  const where = fields
    .map((field) => `UPPER(${field}) LIKE UPPER('%${escapedSearchValue}%') ESCAPE '\\'`)
    .join(' OR ');

  return { service, where };
}

export function isValidServiceConfig(service: IServiceConfig): boolean {
  return (
    SERVICE_ID_PATTERN.test(service.id) &&
    isHttpsServiceLayerUrl(service.layerUrl) &&
    getSearchFields(service.searchFields).length > 0
  );
}

export function isValidSearchValue(value: string): boolean {
  return value.length <= MAX_SEARCH_VALUE_LENGTH;
}

export function getSearchFields(searchFields: string): string[] {
  const fields = searchFields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  return fields.every((field) => FIELD_NAME_PATTERN.test(field)) ? fields : [];
}

export function getHighlightColor(value: string | undefined): string {
  return value && HEX_COLOR_PATTERN.test(value) ? value : DEFAULT_HIGHLIGHT_COLOR;
}

export function getZoomLevel(value: number | undefined): number {
  return value && Number.isFinite(value) && value > 0 ? Math.round(value) : DEFAULT_ZOOM_LEVEL;
}

function escapeSqlLikeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

function isHttpsServiceLayerUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && LAYER_PATH_PATTERN.test(url.pathname);
  } catch {
    return false;
  }
}
