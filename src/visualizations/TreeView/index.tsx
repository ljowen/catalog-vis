import type { VisualizationProps } from "@/visualizations/types";
import { useCatalogStore } from "@/store/useCatalogStore";
import { isGroup } from "@/types/catalog";
import type { CatalogNode } from "@/types/catalog";

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

function TreeNode({ node, depth }: { node: CatalogNode; depth: number }) {
  const { selectedId, expandedIds, setSelected, toggleExpanded } = useCatalogStore();
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = isGroup(node) && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm select-none
          ${isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-200"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          setSelected(node.id);
          if (hasChildren) toggleExpanded(node.id);
        }}
      >
        {hasChildren && (
          <span className="text-xs text-gray-400 w-3">{isExpanded ? "▾" : "▸"}</span>
        )}
        {!hasChildren && <span className="w-3" />}
        <span>{TYPE_ICONS[node.type] ?? "•"}</span>
        <span className="truncate">{node.name}</span>
      </div>
      {isGroup(node) && isExpanded && node.children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function TreeViewViz({ root }: VisualizationProps) {
  return (
    <div className="h-full overflow-y-auto py-2">
      <TreeNode node={root} depth={0} />
    </div>
  );
}
