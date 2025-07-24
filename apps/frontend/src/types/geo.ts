import type * as d3 from "d3";

export interface GeoPoint {
  lat: number;
  lng: number;
  value: number;
  name?: string;
  category?: string;
}

export interface GeoConfig {
  width: number;
  height: number;
  projection?: d3.GeoProjection;
  colors: string[];
  showGraticule?: boolean;
  enableZoom?: boolean;
}

export interface WorldMapData {
  countries: any;
  cities: GeoPoint[];
  connections: Array<{ source: GeoPoint; target: GeoPoint; value: number }>;
}
