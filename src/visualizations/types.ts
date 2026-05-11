import type { ComponentType } from "react";
import type { CatalogNode } from "@/types/catalog";

export interface VisualizationProps {
  root: CatalogNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export interface VizRegistryEntry {
  id: string;
  label: string;
  description: string;
  component: ComponentType<VisualizationProps>;
}
