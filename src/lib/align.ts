import type { Node, XYPosition } from "@xyflow/react";

export type AlignMode =
  | "left"
  | "centerX"
  | "right"
  | "top"
  | "middleY"
  | "bottom"
  | "distH"
  | "distV";

// Given the selected nodes and an alignment mode, return the new position for
// each affected node (keyed by id). Alignment is relative to the selection's
// bounding box; distribute spreads nodes evenly between the outer two.
export function computeAlignment(
  selected: Node[],
  mode: AlignMode,
): Map<string, XYPosition> {
  const positions = new Map<string, XYPosition>();
  if (selected.length < 2) return positions;

  const dim = (n: Node) => ({
    w: n.measured?.width ?? 0,
    h: n.measured?.height ?? 0,
  });

  const minLeft = Math.min(...selected.map((n) => n.position.x));
  const maxRight = Math.max(...selected.map((n) => n.position.x + dim(n).w));
  const minTop = Math.min(...selected.map((n) => n.position.y));
  const maxBottom = Math.max(...selected.map((n) => n.position.y + dim(n).h));
  const centerX = (minLeft + maxRight) / 2;
  const centerY = (minTop + maxBottom) / 2;

  if (mode === "distH" || mode === "distV") {
    const horizontal = mode === "distH";
    const sorted = [...selected].sort((a, b) =>
      horizontal ? a.position.x - b.position.x : a.position.y - b.position.y,
    );
    const totalSize = sorted.reduce(
      (sum, n) => sum + (horizontal ? dim(n).w : dim(n).h),
      0,
    );
    const span = horizontal ? maxRight - minLeft : maxBottom - minTop;
    const gap = (span - totalSize) / (sorted.length - 1);
    let cursor = horizontal ? minLeft : minTop;
    for (const n of sorted) {
      positions.set(
        n.id,
        horizontal
          ? { x: cursor, y: n.position.y }
          : { x: n.position.x, y: cursor },
      );
      cursor += (horizontal ? dim(n).w : dim(n).h) + gap;
    }
    return positions;
  }

  for (const n of selected) {
    const { w, h } = dim(n);
    let { x, y } = n.position;
    switch (mode) {
      case "left":
        x = minLeft;
        break;
      case "centerX":
        x = centerX - w / 2;
        break;
      case "right":
        x = maxRight - w;
        break;
      case "top":
        y = minTop;
        break;
      case "middleY":
        y = centerY - h / 2;
        break;
      case "bottom":
        y = maxBottom - h;
        break;
    }
    positions.set(n.id, { x, y });
  }
  return positions;
}
