import { useState, useRef, useEffect, useCallback } from "react";
import type { VisualizationProps } from "@/visualizations/types";
import { isGroup } from "@/types/catalog";
import type { CatalogGroup, CatalogNode } from "@/types/catalog";

const TYPE_ICONS: Record<string, string> = {
  group: "📁",
  wms: "🗺",
  wfs: "📐",
  geojson: "📍",
  csv: "📊",
  "3dtiles": "🏙",
  cog: "🛰",
  wmts: "🗺",
  reference: "🔗",
};

const TYPE_LABELS: Record<string, string> = {
  wms: "WMS",
  wfs: "WFS",
  geojson: "GeoJSON",
  csv: "CSV",
  "3dtiles": "3D Tiles",
  cog: "COG",
  wmts: "WMTS",
  reference: "Reference",
};

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const cb = useCallback((entries: ResizeObserverEntry[]) => {
    setWidth(entries[0].contentRect.width);
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(cb);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [cb]);
  return { ref, width };
}

function wingFromWidth(width: number) {
  if (width < 320) return 1;
  if (width < 480) return 2;
  return 3;
}

function Breadcrumb({
  stack,
  onJump,
}: {
  stack: CatalogGroup[];
  onJump: (index: number) => void;
}) {
  const { ref: containerRef, width } = useContainerWidth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPopoverOpen(false);
  }, [stack]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const WING = wingFromWidth(width);

  // No ellipsis needed when everything fits
  if (stack.length <= WING * 2 + 1) {
    return (
      <div ref={containerRef} className="flex items-center gap-1 min-w-0 flex-1">
        {stack.map((node, i) => (
          <Crumb key={node.id} node={node} index={i} isLast={i === stack.length - 1} onJump={onJump} />
        ))}
      </div>
    );
  }

  const head = stack.slice(0, WING);
  const tail = stack.slice(stack.length - WING);
  const hidden = stack.slice(WING, stack.length - WING);

  return (
    <div ref={containerRef} className="flex items-center gap-1 min-w-0 flex-1">
      {head.map((node, i) => (
        <Crumb key={node.id} node={node} index={i} isLast={false} onJump={onJump} />
      ))}

      {/* Ellipsis button + popover */}
      <span className="text-gray-600 flex-shrink-0">›</span>
      <div className="relative flex-shrink-0" ref={popoverRef}>
        <button
          className="text-sm px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => setPopoverOpen((o) => !o)}
          title={`${hidden.length} hidden levels`}
        >
          •••
        </button>
        {popoverOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 min-w-48 max-h-72 overflow-y-auto">
            {hidden.map((node, i) => {
              const isLast = i === hidden.length - 1;
              const indent = i * 4;
              return (
                <button
                  key={node.id}
                  className="w-full text-left py-1.5 text-sm text-blue-400 hover:bg-gray-700 hover:text-white flex items-center gap-1 pr-3"
                  style={{ paddingLeft: `${8 + indent}px` }}
                  title={node.name}
                  onClick={() => {
                    onJump(WING + i);
                    setPopoverOpen(false);
                  }}
                >
                  <span className="text-gray-600 flex-shrink-0 font-mono text-xs">
                    {isLast ? "└" : "├"}
                  </span>
                  <span className="truncate">{node.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {tail.map((node, i) => {
        const globalIndex = stack.length - WING + i;
        return (
          <Crumb key={node.id} node={node} index={globalIndex} isLast={globalIndex === stack.length - 1} onJump={onJump} />
        );
      })}
    </div>
  );
}

function Crumb({
  node,
  index,
  isLast,
  onJump,
}: {
  node: CatalogGroup;
  index: number;
  isLast: boolean;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      {index > 0 && <span className="text-gray-600 flex-shrink-0">›</span>}
      <button
        className={`text-sm truncate max-w-36 flex-shrink-0 ${
          isLast
            ? "text-white font-medium cursor-default"
            : "text-blue-400 hover:text-blue-300 hover:underline"
        }`}
        onClick={() => !isLast && onJump(index)}
        title={node.name}
      >
        {node.name}
      </button>
    </div>
  );
}

export function DrillTreeViz({ root, selectedId, onSelect }: VisualizationProps) {
  const rootGroup = isGroup(root) ? root : null;
  const [stack, setStack] = useState<CatalogGroup[]>(rootGroup ? [rootGroup] : []);

  const current = stack[stack.length - 1];

  function drillInto(node: CatalogGroup) {
    setStack((s) => [...s, node]);
  }

  function jumpTo(index: number) {
    setStack((s) => s.slice(0, index + 1));
  }

  if (!current) return null;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-200">
      {/* Breadcrumb */}
      <div className="flex items-center px-4 py-3 border-b border-gray-700 flex-shrink-0 min-w-0">
        <Breadcrumb stack={stack} onJump={jumpTo} />
      </div>

      {/* Children list */}
      <div className="flex-1 overflow-y-auto">
        {stack.length > 1 && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-800 select-none hover:bg-gray-800 text-gray-400"
            onClick={() => jumpTo(stack.length - 2)}
          >
            <span className="text-lg flex-shrink-0">📁</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">..</div>
              <div className="text-xs text-gray-600">{stack[stack.length - 2].name}</div>
            </div>
          </div>
        )}
        {current.children.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500 italic">This folder is empty.</p>
        )}
        {current.children.map((node) => (
          <Row
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            onDrill={drillInto}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Footer depth hint */}
      <div className="px-4 py-2 border-t border-gray-700 flex-shrink-0 text-xs text-gray-600">
        Depth {stack.length - 1}
        {stack.length > 1 && (
          <button
            className="ml-3 text-gray-500 hover:text-gray-300"
            onClick={() => jumpTo(0)}
          >
            ↩ back to root
          </button>
        )}
      </div>
    </div>
  );
}

function Row({
  node,
  isSelected,
  onDrill,
  onSelect,
}: {
  node: CatalogNode;
  isSelected: boolean;
  onDrill: (g: CatalogGroup) => void;
  onSelect: (id: string) => void;
}) {
  const group = isGroup(node) ? node : null;

  function handleClick() {
    onSelect(node.id);
    if (group) onDrill(group);
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-800 select-none
        ${isSelected && !group ? "bg-blue-700 text-white" : "hover:bg-gray-800 text-gray-200"}`}
      onClick={handleClick}
    >
      <span className="text-lg flex-shrink-0">{TYPE_ICONS[node.type] ?? "•"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{node.name}</div>
        {group ? (
          <div className="text-xs text-gray-500">{group.children.length} items</div>
        ) : (
          <div className="text-xs text-gray-500">{TYPE_LABELS[node.type] ?? node.type}</div>
        )}
      </div>
      {group && (
        <span className="text-gray-500 flex-shrink-0 text-sm">›</span>
      )}
    </div>
  );
}
