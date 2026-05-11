export type CatalogNodeType =
  | "group"
  | "wms"
  | "wfs"
  | "geojson"
  | "csv"
  | "3dtiles"
  | "cog"
  | "wmts"
  | "reference";

interface CatalogNodeBase {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  isHidden?: boolean;
}

export interface CatalogGroup extends CatalogNodeBase {
  type: "group";
  isOpen?: boolean;
  children: CatalogNode[];
}

export interface CatalogItem extends CatalogNodeBase {
  type: Exclude<CatalogNodeType, "group">;
  url?: string;
  licenseUrl?: string;
  metadataUrl?: string;
  owner?: string;
  updatedAt?: string;
  /** Synthetic weight for area-based visualizations (treemap, sunburst) */
  size?: number;
}

export type CatalogNode = CatalogGroup | CatalogItem;

export function isGroup(node: CatalogNode): node is CatalogGroup {
  return node.type === "group";
}
