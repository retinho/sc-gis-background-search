const messages = {
  _widgetLabel: 'Background Search',
  mapSectionTitle: 'Map Instance',
  serviceConfigTitle: 'Map Services (Max. 5)',
  displaySectionTitle: 'Zoom and highlight',
  addService: 'Add Service',
  removeService: 'Remove service',
  serviceId: 'URL ID (e.g. parcel)',
  serviceName: 'Display Name',
  layerUrl: 'Layer URL (.../MapServer/0)',
  searchFields: 'Search Fields (comma-separated)',
  zoomLevel: 'Target Scale (1:X)',
  highlightColor: 'Highlight Color (Hex)',
  maxServicesReached: 'Maximum 5 services allowed.',
  defaultServiceName: 'New service',
  noMap: 'Please select a map.',
  loading: 'Searching for a result…',
  empty: 'No matching result found.',
  invalidConfig: 'The search service configuration is incomplete or invalid.',
  invalidSearch: 'The search value is invalid or too long.',
  error: 'The search could not be completed.'
} as const;

export type TMessageId = keyof typeof messages;

export default messages;
