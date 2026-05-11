import { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";
import type { VisualizationProps } from "@/visualizations/types";
import type { CatalogNode } from "@/types/catalog";
import { isGroup } from "@/types/catalog";

const TYPE_COLORS: Record<string, string> = {
  group:     "#64748b",
  wms:       "#3b82f6",
  wfs:       "#8b5cf6",
  geojson:   "#10b981",
  csv:       "#f59e0b",
  "3dtiles": "#ef4444",
  cog:       "#06b6d4",
  wmts:      "#6366f1",
  reference: "#f97316",
};

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  depth: number;
  isGroup: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
}

function flattenTree(node: CatalogNode, depth = 0): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  function walk(n: CatalogNode, d: number) {
    nodes.push({ id: n.id, name: n.name, type: n.type, depth: d, isGroup: isGroup(n) });
    if (isGroup(n)) {
      for (const child of n.children) {
        links.push({ source: { id: n.id } as GraphNode, target: { id: child.id } as GraphNode });
        walk(child, d + 1);
      }
    }
  }

  walk(node, depth);
  return { nodes, links };
}

export function ForceGraphViz({ root, selectedId, onSelect }: VisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const render = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    // Stop any running simulation
    simulationRef.current?.stop();

    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svg).selectAll("*").remove();
    d3.select(svg).attr("width", width).attr("height", height);

    const { nodes, links } = flattenTree(root);

    // Resolve links to node objects
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const resolvedLinks: GraphLink[] = links.map((l) => ({
      source: nodeById.get((l.source as GraphNode).id)!,
      target: nodeById.get((l.target as GraphNode).id)!,
    }));

    // Zoom container
    const zoomG = d3.select(svg).append("g");

    d3.select(svg).call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => zoomG.attr("transform", event.transform))
    );

    // Links
    const link = zoomG
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(resolvedLinks)
      .join("line")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6);

    // Node groups
    const node = zoomG
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_event, d) => onSelect(d.id))
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Circle
    node
      .append("circle")
      .attr("r", (d) => (d.isGroup ? (d.depth === 0 ? 18 : 12) : 7))
      .attr("fill", (d) => TYPE_COLORS[d.type] ?? "#94a3b8")
      .attr("fill-opacity", (d) => (d.id === selectedId ? 1 : 0.8))
      .attr("stroke", (d) => (d.id === selectedId ? "white" : "none"))
      .attr("stroke-width", 2);

    // Label
    node
      .append("text")
      .attr("dy", (d) => (d.isGroup ? (d.depth === 0 ? 26 : 20) : 16))
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.isGroup ? "#e2e8f0" : "#94a3b8"))
      .attr("font-size", (d) => (d.isGroup ? "11px" : "9px"))
      .attr("pointer-events", "none")
      .text((d) => d.name);

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(resolvedLinks)
          .id((d) => d.id)
          .distance((d) => {
            const s = d.source as GraphNode;
            return s.depth === 0 ? 120 : 60;
          })
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) => (d.isGroup ? 30 : 16)))
      .on("tick", () => {
        link
          .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
          .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
          .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
          .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

        node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });

    simulationRef.current = simulation;
  }, [root, selectedId, onSelect]);

  // Re-render on mount and data changes
  useEffect(() => {
    render();
    return () => { simulationRef.current?.stop(); };
  }, [render]);

  useEffect(() => {
    const observer = new ResizeObserver(() => render());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [render]);

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <svg ref={svgRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 pointer-events-none">
        Drag nodes · Scroll to zoom · Click to select
      </div>
    </div>
  );
}
