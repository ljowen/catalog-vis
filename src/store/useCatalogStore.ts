import { create } from "zustand";

interface CatalogStore {
  activeVizId: string;
  selectedId: string | null;
  expandedIds: Set<string>;
  setActiveViz: (id: string) => void;
  setSelected: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  activeVizId: "tree",
  selectedId: null,
  expandedIds: new Set(["root"]),

  setActiveViz: (id) => set({ activeVizId: id }),

  setSelected: (id) => set({ selectedId: id }),

  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    }),
}));
