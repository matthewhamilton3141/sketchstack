import { toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";

// Render the current diagram to an image and trigger a download. Works by
// snapshotting React Flow's viewport element, framed to fit all nodes.
export async function exportCanvasImage(
  nodes: Node[],
  format: "png" | "svg",
  bgColor: string,
  fileName: string,
) {
  const viewportEl = document.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  if (!viewportEl || nodes.length === 0) return;

  const width = 1400;
  const height = 900;
  const bounds = getNodesBounds(nodes);
  // Frame all nodes into the fixed image size with a little padding.
  const viewport = getViewportForBounds(bounds, width, height, 0.4, 2, 0.15);

  const options = {
    backgroundColor: bgColor,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  };

  const dataUrl =
    format === "png"
      ? await toPng(viewportEl, options)
      : await toSvg(viewportEl, options);

  const link = document.createElement("a");
  link.download = `${fileName}.${format}`;
  link.href = dataUrl;
  link.click();
}

// Turn a diagram title into a safe file name.
export function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "diagram"
  );
}
