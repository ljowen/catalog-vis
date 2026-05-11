import { useCatalogStore } from "@/store/useCatalogStore";
import { isGroup } from "@/types/catalog";
import type { CatalogNode } from "@/types/catalog";
import { mockCatalog } from "@/data/mockCatalog";

function findNode(root: CatalogNode, id: string): CatalogNode | null {
  if (root.id === id) return root;
  if (isGroup(root)) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function NodeDetail() {
  const selectedId = useCatalogStore((s) => s.selectedId);
  const node = selectedId ? findNode(mockCatalog, selectedId) : null;

  if (!node) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a node to see details
      </div>
    );
  }

  const isLeaf = !isGroup(node);

  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</div>
        <div className="text-white font-medium">{node.name}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-mono">
          {node.type}
        </span>
      </div>
      {node.description && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</div>
          <div className="text-sm text-gray-300">{node.description}</div>
        </div>
      )}
      {isLeaf && node.owner && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Owner</div>
          <div className="text-sm text-gray-300">{node.owner}</div>
        </div>
      )}
      {node.tags && node.tags.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tags</div>
          <div className="flex flex-wrap gap-1">
            {node.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      {isLeaf && node.url && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">URL</div>
          <div className="text-xs text-blue-400 font-mono break-all">{node.url}</div>
        </div>
      )}
    </div>
  );
}
