import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'user' | 'ip' | 'country' | 'app';
  label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  status: 'Success' | 'Failure';
}

interface BlastRadiusProps {
  logs: any[];
  selectedUser: string | null;
  onUserSelect: (user: string) => void;
}

export const BlastRadius: React.FC<BlastRadiusProps> = ({ logs, selectedUser, onUserSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !selectedUser) return;

    const width = 1200;
    const height = 800;

    // Filter logs for the selected user
    const userLogs = logs.filter(l => l.user === selectedUser);

    const nodes: Node[] = [];
    const links: Link[] = [];

    // Add central user node
    nodes.push({ id: selectedUser, type: 'user', label: selectedUser });

    const ipSet = new Set<string>();
    const countrySet = new Set<string>();
    const appSet = new Set<string>();

    userLogs.forEach(log => {
      const ipId = `ip:${log.ipAddress}`;
      const countryId = `country:${log.location}`;
      const appId = `app:${log.application}`;

      if (!ipSet.has(ipId)) {
        nodes.push({ id: ipId, type: 'ip', label: log.ipAddress });
        links.push({ source: selectedUser, target: ipId, status: log.status as any });
        ipSet.add(ipId);
      }

      if (!countrySet.has(countryId)) {
        nodes.push({ id: countryId, type: 'country', label: log.location });
        links.push({ source: ipId, target: countryId, status: log.status as any });
        countrySet.add(countryId);
      }

      if (log.status === 'Success') {
        if (!appSet.has(appId)) {
          nodes.push({ id: appId, type: 'app', label: log.application });
          appSet.add(appId);
        }
        links.push({ source: ipId, target: appId, status: 'Success' });
      } else {
        // For failures, we might still want to show the attempt to the app
        if (!appSet.has(appId)) {
          nodes.push({ id: appId, type: 'app', label: log.application });
          appSet.add(appId);
        }
        links.push({ source: ipId, target: appId, status: 'Failure' });
      }
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = g.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => d.status === 'Success' ? "#10b981" : "#ef4444")
      .attr("stroke-width", d => d.status === 'Success' ? 2 : 1)
      .attr("stroke-dasharray", d => d.status === 'Failure' ? "4,4" : "0");

    const node = g.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => d.type === 'user' ? 30 : d.type === 'ip' ? 20 : 15)
      .attr("fill", d => {
        switch (d.type) {
          case 'user': return "#8b5cf6";
          case 'ip': return "#3b82f6";
          case 'country': return "#f59e0b";
          case 'app': return "#10b981";
          default: return "#999";
        }
      });

    node.append("text")
      .attr("dy", d => d.type === 'user' ? 45 : 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text(d => d.label)
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [logs, selectedUser]);

  return (
    <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-white/90 border border-black p-4 max-w-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 italic">Blast Radius Analysis</h3>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          This visualization maps the "blast radius" of a potential compromise. 
          The <span className="text-purple-600 font-bold">User</span> is at the center, connected to 
          <span className="text-blue-600 font-bold"> IP Addresses</span> and 
          <span className="text-orange-600 font-bold"> Locations</span>. 
          The <span className="text-emerald-600 font-bold">Applications</span> successfully accessed 
          reveal the impact of the compromise.
        </p>
        <div className="mt-4 flex flex-col gap-1 text-[9px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500"></div>
            <span>Successful Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500 border-t border-dashed"></div>
            <span>Failed Attempt</span>
          </div>
        </div>
      </div>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="800" 
        viewBox="0 0 1200 800"
        className="cursor-move"
      />
    </div>
  );
};
