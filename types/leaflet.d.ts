import '@maptiler/leaflet-maptilersdk';

declare module 'leaflet' {
  namespace maptiler {
    const Style: {
      [key: string]: string;
    };
  }

  interface Map {
    maptilerLayer: (options: any) => any;
  }

  const maptiler: {
    Style: { [key: string]: string };
    maptilerLayer: (options: any) => any;
  };
}
