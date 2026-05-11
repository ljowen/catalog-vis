import type { VizRegistryEntry } from "./types";
import { TreeViewViz } from "./TreeView";
import { DrillTreeViz } from "./DrillTree";
import { SunburstViz } from "./Sunburst";
import { TreemapViz } from "./Treemap";
import { ForceGraphViz } from "./ForceGraph";
import { ThreeSceneViz } from "./ThreeScene";

export const VIZ_REGISTRY: VizRegistryEntry[] = [
  {
    id: "tree",
    label: "Tree View",
    description: "Collapsible hierarchy",
    component: TreeViewViz,
  },
  {
    id: "drill-tree",
    label: "Drill Tree",
    description: "Folder changes root",
    component: DrillTreeViz,
  },
  {
    id: "sunburst",
    label: "Sunburst",
    description: "Radial partition",
    component: SunburstViz,
  },
  {
    id: "treemap",
    label: "Treemap",
    description: "Area-proportional",
    component: TreemapViz,
  },
  {
    id: "forcegraph",
    label: "Force Graph",
    description: "Node-link network",
    component: ForceGraphViz,
  },
  {
    id: "three",
    label: "3D Scene",
    description: "Three.js / R3F",
    component: ThreeSceneViz,
  },
];

export const DEFAULT_VIZ_ID = "tree";
