import type { GeoPoint } from "@/types/geo";

// 主要城市数据
export const majorCities: GeoPoint[] = [
  {
    lat: 40.7128,
    lng: -74.006,
    value: 95,
    name: "New York",
    category: "major",
  },
  {
    lat: 34.0522,
    lng: -118.2437,
    value: 90,
    name: "Los Angeles",
    category: "major",
  },
  { lat: 51.5074, lng: -0.1278, value: 92, name: "London", category: "major" },
  { lat: 48.8566, lng: 2.3522, value: 88, name: "Paris", category: "major" },
  { lat: 35.6762, lng: 139.6503, value: 91, name: "Tokyo", category: "major" },
  {
    lat: 22.3193,
    lng: 114.1694,
    value: 85,
    name: "Hong Kong",
    category: "major",
  },
  {
    lat: 39.9042,
    lng: 116.4074,
    value: 93,
    name: "Beijing",
    category: "major",
  },
  { lat: 19.076, lng: 72.8777, value: 87, name: "Mumbai", category: "major" },
  {
    lat: -33.8688,
    lng: 151.2093,
    value: 82,
    name: "Sydney",
    category: "major",
  },
  {
    lat: -23.5505,
    lng: -46.6333,
    value: 80,
    name: "São Paulo",
    category: "major",
  },
  { lat: 55.7558, lng: 37.6173, value: 84, name: "Moscow", category: "major" },
  { lat: 25.2048, lng: 55.2708, value: 89, name: "Dubai", category: "major" },
  {
    lat: 1.3521,
    lng: 103.8198,
    value: 86,
    name: "Singapore",
    category: "major",
  },
];

// 次要城市数据
export const secondaryCities: GeoPoint[] = [
  {
    lat: 41.8781,
    lng: -87.6298,
    value: 75,
    name: "Chicago",
    category: "secondary",
  },
  {
    lat: 37.7749,
    lng: -122.4194,
    value: 78,
    name: "San Francisco",
    category: "secondary",
  },
  { lat: 52.52, lng: 13.405, value: 72, name: "Berlin", category: "secondary" },
  {
    lat: 41.9028,
    lng: 12.4964,
    value: 70,
    name: "Rome",
    category: "secondary",
  },
  {
    lat: 31.2304,
    lng: 121.4737,
    value: 76,
    name: "Shanghai",
    category: "secondary",
  },
  {
    lat: 37.5665,
    lng: 126.978,
    value: 73,
    name: "Seoul",
    category: "secondary",
  },
  {
    lat: -34.6037,
    lng: -58.3816,
    value: 68,
    name: "Buenos Aires",
    category: "secondary",
  },
  {
    lat: 30.0444,
    lng: 31.2357,
    value: 65,
    name: "Cairo",
    category: "secondary",
  },
  {
    lat: 28.6139,
    lng: 77.209,
    value: 69,
    name: "New Delhi",
    category: "secondary",
  },
  {
    lat: 59.3293,
    lng: 18.0686,
    value: 67,
    name: "Stockholm",
    category: "secondary",
  },
  {
    lat: 45.4215,
    lng: -75.6972,
    value: 64,
    name: "Ottawa",
    category: "secondary",
  },
  {
    lat: -37.8136,
    lng: 144.9631,
    value: 66,
    name: "Melbourne",
    category: "secondary",
  },
  {
    lat: 4.711,
    lng: -74.0721,
    value: 62,
    name: "Bogotá",
    category: "secondary",
  },
  {
    lat: 33.6844,
    lng: 73.0479,
    value: 60,
    name: "Islamabad",
    category: "secondary",
  },
  {
    lat: 14.5995,
    lng: 120.9842,
    value: 63,
    name: "Manila",
    category: "secondary",
  },
];

// 热点数据
export const hotspots: GeoPoint[] = [
  {
    lat: 37.7749,
    lng: -122.4194,
    value: 95,
    name: "San Francisco Bay Area",
    category: "tech",
  },
  {
    lat: 47.6062,
    lng: -122.3321,
    value: 90,
    name: "Seattle",
    category: "tech",
  },
  { lat: 30.2672, lng: -97.7431, value: 85, name: "Austin", category: "tech" },
  { lat: 42.3601, lng: -71.0589, value: 82, name: "Boston", category: "tech" },
  { lat: 52.52, lng: 13.405, value: 80, name: "Berlin", category: "tech" },
  {
    lat: 51.5074,
    lng: -0.1278,
    value: 88,
    name: "London",
    category: "finance",
  },
  {
    lat: 40.7128,
    lng: -74.006,
    value: 92,
    name: "New York",
    category: "finance",
  },
  {
    lat: 35.6762,
    lng: 139.6503,
    value: 86,
    name: "Tokyo",
    category: "finance",
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    value: 84,
    name: "Singapore",
    category: "finance",
  },
  {
    lat: 22.3193,
    lng: 114.1694,
    value: 87,
    name: "Hong Kong",
    category: "finance",
  },
  { lat: 25.2048, lng: 55.2708, value: 89, name: "Dubai", category: "finance" },
  {
    lat: 19.076,
    lng: 72.8777,
    value: 78,
    name: "Mumbai",
    category: "emerging",
  },
  {
    lat: 28.6139,
    lng: 77.209,
    value: 76,
    name: "New Delhi",
    category: "emerging",
  },
  {
    lat: 39.9042,
    lng: 116.4074,
    value: 82,
    name: "Beijing",
    category: "emerging",
  },
  {
    lat: 31.2304,
    lng: 121.4737,
    value: 80,
    name: "Shanghai",
    category: "emerging",
  },
  {
    lat: -23.5505,
    lng: -46.6333,
    value: 75,
    name: "São Paulo",
    category: "emerging",
  },
  {
    lat: -33.8688,
    lng: 151.2093,
    value: 79,
    name: "Sydney",
    category: "emerging",
  },
];

// 连接数据
export const connections = [
  // 主要金融中心连接
  { source: majorCities[0], target: majorCities[2], value: 90 }, // New York - London
  { source: majorCities[0], target: majorCities[6], value: 85 }, // New York - Beijing
  { source: majorCities[0], target: majorCities[4], value: 80 }, // New York - Tokyo
  { source: majorCities[2], target: majorCities[3], value: 75 }, // London - Paris
  { source: majorCities[2], target: majorCities[10], value: 70 }, // London - Moscow
  { source: majorCities[4], target: majorCities[6], value: 85 }, // Tokyo - Beijing
  { source: majorCities[4], target: majorCities[5], value: 80 }, // Tokyo - Hong Kong
  { source: majorCities[5], target: majorCities[12], value: 75 }, // Hong Kong - Singapore
  { source: majorCities[6], target: majorCities[7], value: 65 }, // Beijing - Mumbai
  { source: majorCities[11], target: majorCities[12], value: 70 }, // Dubai - Singapore

  // 技术中心连接
  { source: hotspots[0], target: hotspots[1], value: 85 }, // San Francisco - Seattle
  { source: hotspots[0], target: hotspots[2], value: 75 }, // San Francisco - Austin
  { source: hotspots[0], target: hotspots[3], value: 70 }, // San Francisco - Boston
  { source: hotspots[3], target: hotspots[4], value: 65 }, // Boston - Berlin
  { source: hotspots[4], target: hotspots[5], value: 60 }, // Berlin - London

  // 跨区域连接
  { source: majorCities[0], target: secondaryCities[0], value: 60 }, // New York - Chicago
  { source: majorCities[0], target: secondaryCities[1], value: 65 }, // New York - San Francisco
  { source: majorCities[2], target: secondaryCities[2], value: 55 }, // London - Berlin
  { source: majorCities[2], target: secondaryCities[3], value: 50 }, // London - Rome
  { source: majorCities[4], target: secondaryCities[5], value: 60 }, // Tokyo - Seoul
  { source: majorCities[6], target: secondaryCities[4], value: 70 }, // Beijing - Shanghai
  { source: majorCities[7], target: secondaryCities[8], value: 65 }, // Mumbai - New Delhi
  { source: majorCities[8], target: secondaryCities[11], value: 55 }, // Sydney - Melbourne
];

// 简化的世界地图GeoJSON数据
export const worldMapData = {
  type: "FeatureCollection",
  features: [
    // 北美洲
    {
      type: "Feature",
      properties: { name: "United States" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-125, 24],
            [-125, 49],
            [-66, 49],
            [-66, 24],
            [-125, 24],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Canada" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-141, 49],
            [-141, 70],
            [-52, 70],
            [-52, 49],
            [-141, 49],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Mexico" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-118, 14],
            [-118, 32],
            [-86, 32],
            [-86, 14],
            [-118, 14],
          ],
        ],
      },
    },

    // 南美洲
    {
      type: "Feature",
      properties: { name: "Brazil" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-74, -34],
            [-74, 5],
            [-34, 5],
            [-34, -34],
            [-74, -34],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Argentina" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-74, -55],
            [-74, -22],
            [-53, -22],
            [-53, -55],
            [-74, -55],
          ],
        ],
      },
    },

    // 欧洲
    {
      type: "Feature",
      properties: { name: "United Kingdom" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-10, 50],
            [-10, 59],
            [2, 59],
            [2, 50],
            [-10, 50],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "France" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-5, 42],
            [-5, 51],
            [8, 51],
            [8, 42],
            [-5, 42],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Germany" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5, 47],
            [5, 55],
            [15, 55],
            [15, 47],
            [5, 47],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Italy" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6, 36],
            [6, 47],
            [18, 47],
            [18, 36],
            [6, 36],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Russia" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [20, 40],
            [20, 75],
            [180, 75],
            [180, 40],
            [20, 40],
          ],
        ],
      },
    },

    // 亚洲
    {
      type: "Feature",
      properties: { name: "China" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73, 18],
            [73, 54],
            [135, 54],
            [135, 18],
            [73, 18],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "India" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [68, 6],
            [68, 36],
            [97, 36],
            [97, 6],
            [68, 6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Japan" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [129, 30],
            [129, 46],
            [146, 46],
            [146, 30],
            [129, 30],
          ],
        ],
      },
    },

    // 大洋洲
    {
      type: "Feature",
      properties: { name: "Australia" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [112, -44],
            [112, -10],
            [154, -10],
            [154, -44],
            [112, -44],
          ],
        ],
      },
    },

    // 非洲
    {
      type: "Feature",
      properties: { name: "South Africa" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [16, -35],
            [16, -22],
            [33, -22],
            [33, -35],
            [16, -35],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Egypt" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [24, 22],
            [24, 32],
            [37, 32],
            [37, 22],
            [24, 22],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Nigeria" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2, 4],
            [2, 14],
            [15, 14],
            [15, 4],
            [2, 4],
          ],
        ],
      },
    },
  ],
};

// 获取所有城市数据
export const getAllCities = () => {
  return [...majorCities, ...secondaryCities];
};

// 获取所有热点数据
export const getAllHotspots = () => {
  return hotspots;
};

// 获取所有连接数据
export const getAllConnections = () => {
  return connections;
};

// 按类别获取热点数据
export const getHotspotsByCategory = (category: string) => {
  return hotspots.filter((hotspot) => hotspot.category === category);
};

// 按值范围获取城市数据
export const getCitiesByValueRange = (min: number, max: number) => {
  return [...majorCities, ...secondaryCities].filter(
    (city) => city.value >= min && city.value <= max
  );
};
