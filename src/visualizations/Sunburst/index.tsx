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

export function SunburstViz({ root, selectedId, onSelect }: VisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const radius = Math.min(width, height) / 2;

    d3.select(svg).selectAll("*").remove();

    const g = d3
      .select(svg)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Build hierarchy — partition normalized to [2π, depth+1]
    const hierarchy = d3
      .hierarchy<CatalogNode>(root, (d) => (isGroup(d) ? d.children : undefined))
      .sum((d) => (isGroup(d) ? 0 : (d.size ?? 1)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const maxDepth = hierarchy.height + 1;

    const partition = d3
      .partition<CatalogNode>()
      .size([2 * Math.PI, maxDepth]);

    partition(hierarchy);

    // Arc converts normalized y values to pixel radii
    const arc = d3
      .arc<d3.HierarchyRectangularNode<CatalogNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => (d.y0 / maxDepth) * radius)
      .outerRadius((d) => (d.y1 / maxDepth) * radius - 1);

    function arcVisible(d: d3.HierarchyRectangularNode<CatalogNode>) {
      return d.y1 <= maxDepth && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d: d3.HierarchyRectangularNode<CatalogNode>) {
      return d.y1 <= maxDepth && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.04;
    }

    function labelTransform(d: d3.HierarchyRectangularNode<CatalogNode>) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2 / maxDepth) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    const descendants = hierarchy.descendants();
    const rootNode = descendants[0] as d3.HierarchyRectangularNode<CatalogNode>;

    const path = g
      .append("g")
      .selectAll("path")
      .data(descendants.slice(1) as d3.HierarchyRectangularNode<CatalogNode>[])
      .join("path")
      .attr("fill", (d) => nodeColor(d.data.type))
      .attr("fill-opacity", (d) =>
        arcVisible(d) ? (d.data.id === selectedId ? 1 : 0.75) : 0
      )
      .attr("pointer-events", (d) => (arcVisible(d) ? "auto" : "none"))
      .attr("d", arc)
      .style("cursor", "pointer")
      .on("click", (_event, p) => {
        onSelect(p.data.id);
        if (isGroup(p.data)) zoomTo(p);
      })
      .on("mouseenter", function (_event, d) {
        if (arcVisible(d)) d3.select(this).attr("fill-opacity", 1);
      })
      .on("mouseleave", function (_event, d) {
        d3.select(this).attr("fill-opacity",
          arcVisible(d) ? (d.data.id === selectedId ? 1 : 0.75) : 0
        );
      });

    const label = g
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(descendants.slice(1) as d3.HierarchyRectangularNode<CatalogNode>[])
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("font-size", "11px")
      .attr("fill-opacity", (d) => (labelVisible(d) ? 1 : 0))
      .attr("transform", labelTransform)
      .text((d) => d.data.name);

    // Centre circle — click to zoom out to parent
    let current = rootNode;

    const centreGroup = g.append("g").style("cursor", "pointer");

    centreGroup
      .append("circle")
      .attr("r", (rootNode.y1 / maxDepth) * radius)
      .attr("fill", "#1e293b")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1);

    const centreLabel = centreGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px")
      .attr("pointer-events", "none")
      .text(rootNode.data.name);

    centreGroup.on("click", () => {
      if (current.parent) zoomTo(current.parent as d3.HierarchyRectangularNode<CatalogNode>);
    });

    function zoomTo(p: d3.HierarchyRectangularNode<CatalogNode>) {
      current = p;

      // Remap angles so the selected node fills the full circle
      const xScale = d3.scaleLinear().domain([p.x0, p.x1]).range([0, 2 * Math.PI]);
      const yScale = d3.scaleLinear().domain([p.y0, maxDepth]).range([p.y0 ? radius / maxDepth : 0, radius]);

      const zoomed = arc
        .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale(d.x0))))
        .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale(d.x1))))
        .innerRadius((d) => Math.max(0, yScale(d.y0)))
        .outerRadius((d) => Math.max(0, yScale(d.y1) - 1));

      const t = g.transition().duration(600);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path.transition(t as any)
        .attr("fill-opacity", (d) =>
          arcVisible(d) ? (d.data.id === selectedId ? 1 : 0.75) : 0
        )
        .attr("pointer-events", (d) => (arcVisible(d) ? "auto" : "none"))
        .attrTween("d", (d) => {
          const i0 = d3.interpolate(d.x0, d.x0);
          const i1 = d3.interpolate(d.x1, d.x1);
          return (_t: number) => {
            d.x0 = i0(_t);
            d.x1 = i1(_t);
            return zoomed(d) ?? "";
          };
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label.transition(t as any)
        .attr("fill-opacity", (d) => {
          const angle = xScale(d.x0 + (d.x1 - d.x0) / 2);
          const r = yScale(d.y0 + (d.y1 - d.y0) / 2);
          return labelVisible(d) && angle >= 0 && r >= 0 ? 1 : 0;
        })
        .attrTween("transform", (d) => () => {
          const x = (((xScale(d.x0) + xScale(d.x1)) / 2) * 180) / Math.PI;
          const y = (yScale(d.y0) + yScale(d.y1)) / 2;
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        });

      centreLabel.text(p.data.name);
    }
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
        Click a segment to zoom in · Click centre to zoom out
      </div>
    </div>
  );
}
