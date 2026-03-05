/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

interface UserMapProps {
  countries: string[];
  width?: number;
  height?: number;
}

export const UserMap: React.FC<UserMapProps> = ({ countries, width = 400, height = 250 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Load world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((data: any) => {
      const world = feature(data, data.objects.countries) as any;
      
      // Simple mapping for common ISO codes to names used in the atlas
      const isoMap: Record<string, string> = {
        'US': 'United States of America',
        'GB': 'United Kingdom',
        'NL': 'Netherlands',
        'DE': 'Germany',
        'FR': 'France',
        'AU': 'Australia',
        'CA': 'Canada',
        'IN': 'India',
        'CN': 'China',
        'JP': 'Japan',
        'BR': 'Brazil',
        'RU': 'Russia',
        'ZA': 'South Africa',
        'ES': 'Spain',
        'IT': 'Italy',
        'IE': 'Ireland',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'SE': 'Sweden',
        'NO': 'Norway',
        'FI': 'Finland',
        'DK': 'Denmark',
        'PL': 'Poland',
        'AT': 'Austria',
        'PT': 'Portugal',
        'GR': 'Greece',
        'TR': 'Turkey',
        'IL': 'Israel',
        'SG': 'Singapore',
        'HK': 'Hong Kong',
        'KR': 'South Korea',
        'MX': 'Mexico',
        'AR': 'Argentina',
        'CL': 'Chile',
        'CO': 'Colombia',
        'PE': 'Peru',
        'NZ': 'New Zealand',
        'AE': 'United Arab Emirates',
        'SA': 'Saudi Arabia',
        'ID': 'Indonesia',
        'MY': 'Malaysia',
        'TH': 'Thailand',
        'VN': 'Vietnam',
        'PH': 'Philippines',
        'EG': 'Egypt',
        'NG': 'Nigeria',
        'KE': 'Kenya',
        'UA': 'Ukraine',
        'RO': 'Romania',
        'HU': 'Hungary',
        'CZ': 'Czechia'
      };

      svg.append('g')
        .selectAll('path')
        .data(world.features)
        .join('path')
        .attr('d', path)
        .attr('fill', (d: any) => {
          const countryName = d.properties.name;
          const isHighlighted = countries.some(c => {
            const search = c.toUpperCase();
            const mappedName = isoMap[search];
            
            // If it's a 2-letter code we have mapped, use exact match for the mapped name
            if (mappedName) {
              return countryName === mappedName;
            }
            
            // If it's a 2-letter code we DON'T have mapped, only match if it's exactly the same
            // (unlikely to match atlas names which are usually full names)
            if (c.length <= 2) {
              return countryName.toLowerCase() === c.toLowerCase();
            }
            
            // For longer strings (potential full names), use exact match or strict inclusion
            // but avoid 'includes' on short strings which caused the original issue
            return countryName.toLowerCase() === c.toLowerCase();
          });
          return isHighlighted ? '#3b82f6' : '#f3f4f6';
        })
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5);
    });
  }, [countries, width, height]);

  return (
    <div className="bg-gray-50 border border-black/5 p-2 rounded-sm overflow-hidden">
      <svg ref={svgRef} className="w-full h-auto" viewBox={`0 0 ${width} ${height}`} />
    </div>
  );
};
