import type { Edge } from "@xyflow/react";
import type { AppNode } from "@/lib/appNode";
import type { DiagramMode } from "@/lib/nodeTypes";
import { slugify } from "@/lib/exportImage";

// The on-disk format for a downloaded design. Versioned so we can migrate later.
export interface DesignFile {
  app: "sketchstack";
  version: 1;
  title: string;
  mode: DiagramMode;
  nodes: AppNode[];
  edges: Edge[];
}

// Download the current diagram as a .json design file (round-trippable).
export function downloadDesign(
  title: string,
  mode: DiagramMode,
  nodes: AppNode[],
  edges: Edge[],
) {
  const data: DesignFile = {
    app: "sketchstack",
    version: 1,
    title,
    mode,
    nodes,
    edges,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(title)}.sketchstack.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Parse imported text into a design, or throw if it's not a valid design file.
export function parseDesign(text: string): {
  title: string;
  mode: DiagramMode;
  nodes: AppNode[];
  edges: Edge[];
} {
  const data = JSON.parse(text) as Partial<DesignFile>;
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error("Not a Sketchstack design file.");
  }
  return {
    title: typeof data.title === "string" ? data.title : "Imported design",
    mode: (data.mode as DiagramMode) ?? "system",
    nodes: data.nodes as AppNode[],
    edges: data.edges as Edge[],
  };
}
