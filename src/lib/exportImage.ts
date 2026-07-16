import { toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";

// Concrete light-theme values injected onto the captured element so every
// var()-based color resolves in html-to-image's detached clone (otherwise SVG
// edge/label fills fall back to black — the "black blocks" bug). Includes both
// our tokens and React Flow's internal edge tokens.
const EXPORT_VARS: Record<string, string> = {
  "--bg": "#ffffff",
  "--panel": "#ffffff",
  "--panel-2": "#f1f5f9",
  "--border": "#e2e8f0",
  "--text": "#0f172a",
  "--muted": "#64748b",
  "--edge": "#64748b",
  "--xy-edge-stroke-default": "#64748b",
  "--xy-edge-stroke": "#64748b",
  "--xy-edge-stroke-selected-default": "#64748b",
};

// Render the current diagram to an image and download it. Snapshots React
// Flow's viewport element, framed to fit all nodes. Always rendered light so
// text/edges stay readable regardless of the current UI theme.
export async function exportCanvasImage(
  nodes: Node[],
  format: "png" | "svg",
  fileName: string,
) {
  const viewportEl = document.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  if (!viewportEl || nodes.length === 0) {
    alert("Nothing to export yet — add some nodes first.");
    return;
  }

  const root = document.documentElement;
  const prevTheme = root.dataset.theme;
  root.dataset.theme = "light";

  // Inject concrete vars on the cloned root so var() references resolve.
  const restore: [string, string][] = [];
  for (const [k, v] of Object.entries(EXPORT_VARS)) {
    restore.push([k, viewportEl.style.getPropertyValue(k)]);
    viewportEl.style.setProperty(k, v);
  }

  try {
    const width = 1400;
    const height = 900;
    const bounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(bounds, width, height, 0.4, 2, 0.15);

    const options = {
      backgroundColor: "#ffffff",
      width,
      height,
      cacheBust: true,
      pixelRatio: format === "png" ? 2 : 1,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    };

    const render = format === "png" ? toPng : toSvg;
    // First pass warms fonts/images (html-to-image's first render is often
    // blank/partial); the second pass is the one we keep.
    await render(viewportEl, options);
    const dataUrl = await render(viewportEl, options);

    const link = document.createElement("a");
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Image export failed:", err);
    alert("Sorry — exporting the image failed. Please try again.");
  } finally {
    for (const [k, v] of restore) {
      if (v) viewportEl.style.setProperty(k, v);
      else viewportEl.style.removeProperty(k);
    }
    root.dataset.theme = prevTheme;
  }
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
