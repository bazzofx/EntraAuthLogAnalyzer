import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface SecurityMapProps {
  locations: { name: string; countryCode: string }[];
}

// Simple lookup for country centroids (approximate)
const countryCoords: Record<string, [number, number]> = {
  'US': [-95.7129, 37.0902],
  'GB': [-3.4360, 55.3781],
  'IE': [-8.2439, 53.4129],
  'FR': [2.2137, 46.2276],
  'DE': [10.4515, 51.1657],
  'CA': [-106.3468, 56.1304],
  'AU': [133.7751, -25.2744],
  'IN': [78.9629, 20.5937],
  'CN': [104.1954, 35.8617],
  'BR': [-51.9253, -14.2350],
  'JP': [138.2529, 36.2048],
  'RU': [105.3188, 61.5240],
  'ES': [-3.7492, 40.4637],
  'IT': [12.5674, 41.8719],
  'NL': [5.2913, 52.1326],
  'SG': [103.8198, 1.3521],
  'HK': [114.1095, 22.3964],
  'AE': [53.8478, 23.4241],
  'IL': [34.8516, 31.0461],
  'ZA': [22.9375, -30.5595],
  'MX': [-102.5528, 23.6345],
  'CH': [8.2275, 46.8182],
  'SE': [18.6435, 60.1282],
  'NO': [8.4689, 60.4720],
  'FI': [25.7482, 61.9241],
  'DK': [9.5018, 56.2639],
  'PL': [19.1451, 51.9194],
  'BE': [4.4699, 50.5039],
  'AT': [14.5501, 47.5162],
  'PT': [-8.2245, 39.3999],
  'GR': [21.8243, 39.0742],
  'TR': [35.2433, 38.9637],
  'NZ': [174.8860, -40.9006],
  // --- Europe ---
  'CZ': [15.4730, 49.8175],
  'HU': [19.5033, 47.1625],
  'RO': [24.9668, 45.9432],
  'BG': [25.4858, 42.7339],
  'SK': [19.6990, 48.6690],
  'HR': [15.2000, 45.1000],
  'SI': [14.9955, 46.1512],
  'EE': [25.0136, 58.5953],
  'LV': [24.6032, 56.8796],
  'LT': [23.8813, 55.1694],
  'IS': [-19.0208, 64.9631],
  'LU': [6.1296, 49.8153],

  // --- Middle East ---
  'SA': [45.0792, 23.8859],
  'QA': [51.1839, 25.3548],
  'KW': [47.4818, 29.3117],
  'OM': [55.9233, 21.5126],
  'BH': [50.6378, 26.0667],
  'JO': [36.2384, 30.5852],
  'LB': [35.8623, 33.8547],
  'EG': [30.8025, 26.8206],

  // --- Africa ---
  'NG': [8.6753, 9.0820],
  'KE': [37.9062, -0.0236],
  'MA': [-7.0926, 31.7917],
  'DZ': [1.6596, 28.0339],
  'TN': [9.5375, 33.8869],
  'GH': [-1.0232, 7.9465],
  'ET': [40.4897, 9.1450],

  // --- Asia ---
  'KR': [127.7669, 35.9078],
  'TW': [120.9605, 23.6978],
  'TH': [100.9925, 15.8700],
  'VN': [108.2772, 14.0583],
  'MY': [101.9758, 4.2105],
  'ID': [113.9213, -0.7893],
  'PH': [121.7740, 12.8797],
  'PK': [69.3451, 30.3753],
  'BD': [90.3563, 23.6850],
  'LK': [80.7718, 7.8731],
  'KZ': [66.9237, 48.0196],

  // --- Americas ---
  'AR': [-63.6167, -38.4161],
  'CL': [-71.5430, -35.6751],
  'CO': [-74.2973, 4.5709],
  'PE': [-75.0152, -9.1900],
  'VE': [-66.5897, 6.4238],
  'UY': [-55.7658, -32.5228],
  'CR': [-83.7534, 9.7489],
  'PA': [-80.7821, 8.5380],
  'DO': [-70.1627, 18.7357],

  // --- Oceania ---
  'FJ': [178.0650, -17.7134],
  'PG': [143.9555, -6.3149],
};

export const SecurityMap: React.FC<SecurityMapProps> = ({ locations }) => {
  const markers = locations.map(loc => ({
    name: loc.name,
    coordinates: countryCoords[loc.countryCode] || [0, 0]
  })).filter(m => m.coordinates[0] !== 0);

  // Calculate center of markers for auto-zoom/center
  const center: [number, number] = markers.length > 0 
    ? [
        markers.reduce((acc, m) => acc + m.coordinates[0], 0) / markers.length,
        markers.reduce((acc, m) => acc + m.coordinates[1], 0) / markers.length
      ]
    : [0, 20];

  return (
    <div className="w-full h-[350px] bg-[#0a0a0a] border border-black overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 bg-black/80 border border-white/20 px-2 py-1 text-[10px] font-bold uppercase italic text-white">
        Geographic Threat Map
      </div>
      <div className="absolute bottom-2 right-2 z-10 text-[8px] text-gray-500 font-mono uppercase">
        Use mouse to zoom & pan
      </div>
      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={center} zoom={markers.length > 0 ? 2 : 1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isHighlighted = locations.some(l => l.countryCode === geo.properties.ISO_A2);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHighlighted ? "#002699" : "#002db3"}
                    stroke={isHighlighted ? "#ef4444" : "#262626"}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#262626", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {markers.length > 1 && (
            <Line
              from={markers[0].coordinates}
              to={markers[1].coordinates}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}

          {markers.map(({ name, coordinates }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle r={3} fill="#ef4444" stroke="#fff" strokeWidth={1} />
              <text
                textAnchor="middle"
                y={-8}
                style={{ fontFamily: "monospace", fill: "#fff", fontSize: "12px", fontWeight: "bold" }}
              >
                {name.split(',').pop()?.trim()}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
