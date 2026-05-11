import { useMemo, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Mesh, MeshStandardMaterial, Color } from "three";
import * as d3 from "d3";
import type { VisualizationProps } from "@/visualizations/types";
import type { CatalogNode } from "@/types/catalog";
import { isGroup } from "@/types/catalog";

// Same palette as other views
const TYPE_COLORS: Record<string, string> = {
  wms:       "#3b82f6",
  wfs:       "#8b5cf6",
  geojson:   "#10b981",
  csv:       "#f59e0b",
  "3dtiles": "#ef4444",
  cog:       "#06b6d4",
  wmts:      "#6366f1",
  reference: "#f97316",
};

const DISTRICT_PAD_COLORS = [
  "#1e3a5f", "#2d1b4e", "#0f3d2e",
  "#3d2a0a", "#2a0f3d", "#0f2d3d", "#3d1a0f",
];

// Map catalog types → model filenames
const TYPE_MODELS: Record<string, string> = {
  "3dtiles": "6Story_Stack",
  cog:       "4Story_Wide_2Doors_Roof",
  wms:       "4Story_Center",
  wmts:      "4Story",
  wfs:       "3Story_Balcony",
  geojson:   "2Story_Wide",
  csv:       "2Story_Double",
  reference: "2Story_Sign",
};

// Fallback by size band
function modelForSize(size: number): string {
  if (size >= 30) return "4Story";
  if (size >= 20) return "3Story_Small";
  if (size >= 12) return "2Story_Stairs";
  if (size >= 6)  return "2Story";
  return "1Story";
}

function modelName(type: string, size: number): string {
  return TYPE_MODELS[type] ?? modelForSize(size);
}

const WORLD = 80;
const BASE_SCALE = 2.2;

type LayoutNode = d3.HierarchyRectangularNode<CatalogNode>;

function useTreemapLayout(root: CatalogNode) {
  return useMemo(() => {
    const hierarchy = d3
      .hierarchy<CatalogNode>(root, (d) => (isGroup(d) ? d.children : undefined))
      .sum((d) => (isGroup(d) ? 0 : (d.size ?? 1)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<CatalogNode>()
      .size([WORLD, WORLD])
      .paddingOuter(3)
      .paddingTop(3)
      .paddingInner(1)
      .round(true)(hierarchy);

    return hierarchy as LayoutNode;
  }, [root]);
}

function OBJBuilding({
  node,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  node: LayoutNode;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const size = isGroup(node.data) ? 1 : (node.data.size ?? 1);
  const type = node.data.type;
  const model = modelName(type, size);
  const obj = useLoader(OBJLoader, `/OBJ/${model}.obj`);

  const cx = (node.x0 + node.x1) / 2 - WORLD / 2;
  const cz = (node.y0 + node.y1) / 2 - WORLD / 2;
  const isSelected = node.data.id === selectedId;
  const isHovered = node.data.id === hoveredId;
  const hexColor = TYPE_COLORS[type] ?? "#475569";

  const cloned = useMemo(() => {
    const c = obj.clone(true);
    const color = new Color(hexColor);
    c.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: isSelected ? 0.5 : isHovered ? 0.2 : 0.04,
          roughness: 0.65,
          metalness: 0.15,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [obj, hexColor, isSelected, isHovered]);

  return (
    <primitive
      object={cloned}
      position={[cx, 0, cz]}
      scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(node.data.id); }}
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onHover(node.data.id); }}
      onPointerOut={() => onHover(null)}
    />
  );
}

function DistrictPad({ node, colorIndex }: { node: LayoutNode; colorIndex: number }) {
  const w = node.x1 - node.x0;
  const d = node.y1 - node.y0;
  const cx = (node.x0 + node.x1) / 2 - WORLD / 2;
  const cz = (node.y0 + node.y1) / 2 - WORLD / 2;
  const color = DISTRICT_PAD_COLORS[colorIndex % DISTRICT_PAD_COLORS.length];
  const labelZ = node.y0 - WORLD / 2 + 2;

  return (
    <group>
      <mesh position={[cx, 0.05, cz]}>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <Text
        position={[cx, 0.2, labelZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.4}
        color="#64748b"
        anchorX="center"
        anchorY="top"
        maxWidth={w - 1}
      >
        {node.data.name.toUpperCase()}
      </Text>
    </group>
  );
}

function City({ root, selectedId, onSelect }: VisualizationProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const layoutRoot = useTreemapLayout(root);

  const districts = useMemo(
    () => (layoutRoot.children?.filter((d) => isGroup(d.data)) as LayoutNode[]) ?? [],
    [layoutRoot]
  );
  const buildings = useMemo(() => layoutRoot.leaves() as LayoutNode[], [layoutRoot]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[40, 80, 40]} intensity={1.1} color="#fff8f0" castShadow />
      <directionalLight position={[-60, 30, -40]} intensity={0.25} color="#4488ff" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#ff9933" distance={70} decay={2} />

      <fog attach="fog" args={["#0a0f1e", 90, 190]} />
      <color attach="background" args={["#0a0f1e"]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#080c18" roughness={1} />
      </mesh>

      {/* District pads */}
      {districts.map((d, i) => (
        <DistrictPad key={d.data.id} node={d} colorIndex={i} />
      ))}

      {/* Buildings — each suspended individually so others show while one loads */}
      {buildings.map((node) => (
        <Suspense key={node.data.id} fallback={null}>
          <OBJBuilding
            node={node}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={setHoveredId}
          />
        </Suspense>
      ))}
    </>
  );
}

export function ThreeSceneViz(props: VisualizationProps) {
  return (
    <div className="h-full w-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 55, 65], fov: 50 }}
        gl={{ antialias: true }}
      >
        <City {...props} />
        <OrbitControls
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={160}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-600 pointer-events-none">
        Orbit · Scroll to zoom · Click to select
      </div>
    </div>
  );
}
