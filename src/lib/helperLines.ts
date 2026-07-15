import type { Node, NodePositionChange, XYPosition } from "@xyflow/react";

interface HelperLinesResult {
  horizontal?: number;
  vertical?: number;
  snapPosition: Partial<XYPosition>;
}

// While a node is dragged, find the nearest CENTER alignment (within
// `distance`) against every other node, returning a snapped position plus the
// guide-line coordinates to draw through the centers.
export function getHelperLines(
  change: NodePositionChange,
  nodes: Node[],
  distance = 6,
): HelperLinesResult {
  const result: HelperLinesResult = { snapPosition: { x: undefined, y: undefined } };
  const nodeA = nodes.find((n) => n.id === change.id);
  if (!nodeA || !change.position) return result;

  const aW = nodeA.measured?.width ?? 0;
  const aH = nodeA.measured?.height ?? 0;
  const aCenterX = change.position.x + aW / 2;
  const aCenterY = change.position.y + aH / 2;

  let vDist = distance; // best vertical-line (center x) match so far
  let hDist = distance; // best horizontal-line (center y) match so far

  for (const nodeB of nodes) {
    if (nodeB.id === nodeA.id) continue;
    const bW = nodeB.measured?.width ?? 0;
    const bH = nodeB.measured?.height ?? 0;
    const bCenterX = nodeB.position.x + bW / 2;
    const bCenterY = nodeB.position.y + bH / 2;

    // Vertical guide: align horizontal centers (snap x).
    const dx = Math.abs(aCenterX - bCenterX);
    if (dx < vDist) {
      result.snapPosition.x = bCenterX - aW / 2;
      result.vertical = bCenterX;
      vDist = dx;
    }

    // Horizontal guide: align vertical centers (snap y).
    const dy = Math.abs(aCenterY - bCenterY);
    if (dy < hDist) {
      result.snapPosition.y = bCenterY - aH / 2;
      result.horizontal = bCenterY;
      hDist = dy;
    }
  }

  return result;
}
