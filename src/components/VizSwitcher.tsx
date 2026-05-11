import { VIZ_REGISTRY } from "@/visualizations/registry";
import { useCatalogStore } from "@/store/useCatalogStore";

export function VizSwitcher() {
  const { activeVizId, setActiveViz } = useCatalogStore();

  return (
    <div className="flex flex-col gap-1 p-2 border-b border-gray-700">
      <div className="text-xs text-gray-500 uppercase tracking-wide px-2 pb-1">Views</div>
      {VIZ_REGISTRY.map((entry) => (
        <button
          key={entry.id}
          onClick={() => setActiveViz(entry.id)}
          className={`flex flex-col px-3 py-2 rounded text-left transition-colors
            ${activeVizId === entry.id
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
        >
          <span className="text-sm font-medium">{entry.label}</span>
          <span className={`text-xs ${activeVizId === entry.id ? "text-blue-200" : "text-gray-500"}`}>
            {entry.description}
          </span>
        </button>
      ))}
    </div>
  );
}
