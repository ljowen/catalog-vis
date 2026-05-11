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

function nodeColor(type: string) {
  return TYPE_COLORS[type] ?? "#94a3b8";
}

type RectNode = d3.HierarchyRectangularNode<CatalogNode>;

export function TreemapViz({ root, selectedId, onSelect }: VisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svg).selectAll("*").remove();

    const hierarchy = d3
      .hierarchy<CatalogNode>(root, (d) => (isGroup(d) ? d.children : undefined))
      .sum((d) => (isGroup(d) ? 0 : (d.size ?? 1)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const treemap = d3
      .treemap<CatalogNode>()
      .size([width, height])
      .paddingOuter(6)
      .paddingTop(20)
      .paddingInner(2)
      .round(true);

    treemap(hierarchy);

    const svgEl = d3.select(svg).attr("width", width).attr("height", height);

    // Track zoom state
    let currentRoot: RectNode = hierarchy as RectNode;

    function draw(displayRoot: RectNode) {
      svgEl.selectAll("*").remove();

      // All descendants of the current display root
      const nodes = displayRoot.descendants();

      const group = svgEl.append("g");

      const cell = group
        .selectAll<SVGGElement, RectNode>("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      // Background rect
      cell
        .append("rect")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0))
        .attr("fill", (d) => {
          if (isGroup(d.data)) return "#1e293b";
          return nodeColor(d.data.type);
        })
        .attr("fill-opacity", (d) => {
          if (isGroup(d.data)) return 1;
          return d.data.id === selectedId ? 1 : 0.75;
        })
        .attr("stroke", (d) => (isGroup(d.data) ? "#334155" : "none"))
        .attr("stroke-width", 1)
        .attr("rx", 2)
        .style("cursor", (d) => (isGroup(d.data) && d !== displayRoot ? "pointer" : "default"))
        .on("click", (_event, d) => {
          if (d === displayRoot) return;
          onSelect(d.data.id);
          if (isGroup(d.data)) {
            currentRoot = d;
            draw(d);
          }
        })
        .on("mouseenter", function (_event, d) {
          if (!isGroup(d.data)) {
            d3.select(this).attr("fill-opacity", 1);
          }
        })
        .on("mouseleave", function (_event, d) {
          if (!isGroup(d.data)) {
            d3.select(this).attr("fill-opacity", d.data.id === selectedId ? 1 : 0.75);
          }
        });

      // Group header bar
      cell
        .filter((d) => isGroup(d.data) && d !== displayRoot)
        .append("rect")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", 20)
        .attr("fill", (d) => nodeColor(d.data.type))
        .attr("fill-opacity", 0.9)
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("click", (_event, d) => {
          onSelect(d.data.id);
          currentRoot = d;
          draw(d);
        });

      // Labels
      cell
        .append("text")
        .attr("x", (d) => (isGroup(d.data) && d !== displayRoot ? 6 : (d.x1 - d.x0) / 2))
        .attr("y", (d) => (isGroup(d.data) && d !== displayRoot ? 13 : (d.y1 - d.y0) / 2))
        .attr("text-anchor", (d) => (isGroup(d.data) && d !== displayRoot ? "start" : "middle"))
        .attr("dominant-baseline", (d) => (isGroup(d.data) && d !== displayRoot ? "auto" : "middle"))
        .attr("fill", "white")
        .attr("font-size", (d) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          return Math.min(13, Math.max(9, Math.sqrt(w * h) / 8)) + "px";
        })
        .attr("pointer-events", "none")
        .text((d) => {
          if (d === displayRoot) return "";
          const w = d.x1 - d.x0;
          const name = d.data.name;
          // Rough char-width estimate to truncate
          const maxChars = Math.floor(w / 6.5);
          return name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
        });

      // Breadcrumb / zoom-out affordance
      if (displayRoot !== (hierarchy as RectNode)) {
        const crumb = svgEl
          .append("g")
          .style("cursor", "pointer")
          .on("click", () => {
            const parent = currentRoot.parent as RectNode | null;
            currentRoot = parent ?? (hierarchy as RectNode);
            draw(currentRoot);
          });

        crumb
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", 28)
          .attr("fill", "#0f172a");

        crumb
          .append("text")
          .attr("x", 10)
          .attr("y", 18)
          .attr("fill", "#60a5fa")
          .attr("font-size", "12px")
          .text(`← ${currentRoot.parent?.data.name ?? root.name} / ${displayRoot.data.name}`);
      }
    }

    draw(currentRoot);
  }, [root, selectedId, onSelect]);

  useEffect(() => {
    render();
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
        Click a group to zoom in · Click breadcrumb to zoom out
      </div>
    </div>
  );
}
