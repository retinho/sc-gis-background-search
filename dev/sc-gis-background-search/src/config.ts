import { ImmutableObject } from 'jimu-core';

export interface IServiceConfig {
  id: string;          // Eindeutige ID für den URL-Parameter (z.B. "parzellen")
  name: string;        // Anzeigename in den Settings
  layerUrl: string;    // Komplette URL inkl. Layer-ID, z.B. .../MapServer/0
  searchFields: string; // Komma-getrennte Felder, z.B. "EGRID,NUMMER"
}

export interface IConfig {
  services: IServiceConfig[];
  zoomLevel?: number;
  highlightColor?: string; // Hex-Farbe für das Resultat
}

export type IMConfig = ImmutableObject<IConfig>;