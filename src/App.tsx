import { VIZ_REGISTRY } from "@/visualizations/registry";
import { useCatalogStore } from "@/store/useCatalogStore";
import { VizSwitcher } from "@/components/VizSwitcher";
import { NodeDetail } from "@/components/NodeDetail";
import { mockCatalog } from "@/data/mockCatalog";

export default function App() {
  const { activeVizId, selectedId, setSelected } = useCatalogStore();
  const entry = VIZ_REGISTRY.find((v) => v.id === activeVizId) ?? VIZ_REGISTRY[0];
  const VizComponent = entry.component;

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-sm font-semibold text-gray-200 tracking-wide">Catalog 3D Viz</h1>
          <p className="text-xs text-gray-500 mt-0.5">Visualization experiments</p>
        </div>
        <div className="overflow-y-auto flex-1 flex flex-col">
          <VizSwitcher />
          <div className="border-t border-gray-700 mt-auto">
            <div className="px-4 pt-3 pb-1 text-xs text-gray-500 uppercase tracking-wide">
              Node Detail
            </div>
            <NodeDetail />
          </div>
        </div>
      </aside>

      {/* Main visualization area */}
      <main className="flex-1 relative overflow-hidden">
        <VizComponent
          root={mockCatalog}
          selectedId={selectedId}
          onSelect={setSelected}
        />
      </main>
    </div>
  );
}
