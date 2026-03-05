import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyCenter } from 'd3-sankey';

interface SankeyFlowProps {
  data: any[];
  width?: number;
  height?: number;
  customNodes?: string[];
}

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ 
  data, 
  width = 800, 
  height = 400,
  customNodes = ['user', 'app', 'status']
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const sankeyData = useMemo(() => {
    if (!data.length) return { nodes: [], links: [] };

    const nodes: { name: string; category: string }[] = [];
    const links: { source: number; target: number; value: number }[] = [];
    const nodeMap = new Map<string, number>();

    const addNode = (name: string, category: string) => {
      const key = `${category}:${name}`;
      if (!nodeMap.has(key)) {
        nodeMap.set(key, nodes.length);
        nodes.push({ name, category });
      }
      return nodeMap.get(key)!;
    };

    // Aggregate flows based on customNodes sequence
    const flows = new Map<string, number>();

    data.forEach(log => {
      for (let i = 0; i < customNodes.length - 1; i++) {
        const cat1 = customNodes[i];
        const cat2 = customNodes[i+1];
        
        // Map internal property names if needed
        const val1 = cat1 === 'app' ? log.application : (log as any)[cat1];
        const val2 = cat2 === 'app' ? log.application : (log as any)[cat2];

        if (val1 === undefined || val2 === undefined) continue;

        const node1 = addNode(val1, cat1);
        const node2 = addNode(val2, cat2);

        const key = `${node1}->${node2}`;
        flows.set(key, (flows.get(key) || 0) + 1);
      }
    });

    flows.forEach((value, key) => {
      const [source, target] = key.split('->').map(Number);
      links.push({ source, target, value });
    });

    return { nodes, links };
  }, [data, customNodes]);

  useEffect(() => {
    if (!svgRef.current || !sankeyData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const sankeyGenerator = sankey<any, any>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [innerWidth - 1, innerHeight - 6]])
      .nodeAlign(sankeyCenter);

    const { nodes, links } = sankeyGenerator({
      nodes: sankeyData.nodes.map(d => ({ ...d })),
      links: sankeyData.links.map(d => ({ ...d }))
    });

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Links
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.2)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        const targetName = d.target.name;
        const targetCategory = d.target.category?.toLowerCase();
        
        if (targetCategory === 'status') {
          return targetName === 'Success' ? '#10b981' : '#ef4444';
        }
        
        if (targetName === 'Success') return '#10b981';
        if (targetName === 'Failure' || targetName === 'Failed') return '#ef4444';
        
        return '#cbd5e1'; // Neutral for intermediate links
      })
      .attr('stroke-width', d => Math.max(1, d.width));

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g');

    node.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => {
        const category = d.category?.toLowerCase();
        if (category === 'user') return '#8b5cf6'; // Purple
        if (category === 'country' || category === 'location') return '#3b82f6'; // Blue
        if (category === 'app' || category === 'application') return '#0ea5e9'; // Sky Blue
        if (category === 'status') return d.name === 'Success' ? '#10b981' : '#ef4444';
        
        // Fallback for status nodes if category isn't explicitly 'status'
        if (d.name === 'Success') return '#10b981';
        if (d.name === 'Failure' || d.name === 'Failed') return '#ef4444';
        
        return '#94a3b8'; // Default slate gray
      })
      .attr('stroke', '#000');

    node.append('text')
      .attr('x', d => d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < innerWidth / 2 ? 'start' : 'end')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('fill', '#000');

  }, [sankeyData, width, height]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
