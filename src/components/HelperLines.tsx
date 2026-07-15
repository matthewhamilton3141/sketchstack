"use client";

import { useEffect, useRef } from "react";
import { type ReactFlowState, useStore } from "@xyflow/react";

interface HelperLinesProps {
  horizontal?: number;
  vertical?: number;
}

// Draws the alignment guide lines while dragging. Rendered inside <ReactFlow>
// so it can read the viewport transform from the store. Selecting primitives
// individually avoids needing a shallow equality function.
const selectWidth = (s: ReactFlowState) => s.width;
const selectHeight = (s: ReactFlowState) => s.height;
const selectTransform = (s: ReactFlowState) => s.transform;

export default function HelperLines({ horizontal, vertical }: HelperLinesProps) {
  const width = useStore(selectWidth);
  const height = useStore(selectHeight);
  const transform = useStore(selectTransform);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpi = window.devicePixelRatio || 1;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    ctx.scale(dpi, dpi);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1;

    const [tx, ty, scale] = transform;
    if (typeof vertical === "number") {
      const x = vertical * scale + tx;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    if (typeof horizontal === "number") {
      const y = horizontal * scale + ty;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [width, height, transform, horizontal, vertical]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
