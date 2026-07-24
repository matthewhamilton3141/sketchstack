import Dagre from "@dagrejs/dagre";
import type { Edge } from "@xyflow/react";
import type { AppNode } from "@/lib/appNode";

const NODE_W = 200;
const NODE_H = 80;

// Return a new nodes array with positions recalculated by Dagre. Group nodes
// and children (parentId set) are excluded from the layout pass so they stay
// where the user placed them.
export function autoLayout(
  nodes: AppNode[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB",
): AppNode[] {
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 60,
    marginx: 40,
    marginy: 40,
  });

  const layoutNodes = nodes.filter(
    (n) => n.type !== "group" && !n.parentId,
  );
  const layoutIds = new Set(layoutNodes.map((n) => n.id));

  for (const node of layoutNodes) {
    g.setNode(node.id, { width: NODE_W, height: NODE_H });
  }
  for (const edge of edges) {
    if (layoutIds.has(edge.source) && layoutIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  Dagre.layout(g);

  return nodes.map((n) => {
    if (!layoutIds.has(n.id)) return n;
    const pos = g.node(n.id);
    if (!pos) return n;
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
    };
  });
}
