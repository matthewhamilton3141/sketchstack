"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReactFlow, Background, Controls, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Edge } from "@xyflow/react";

import SystemNodeComponent from "@/components/SystemNode";
import NoteNodeComponent from "@/components/NoteNode";
import GroupNodeComponent from "@/components/GroupNode";
import { NoteDisplayContext } from "@/components/noteDisplay";
import { loadDiagram, type DiagramData } from "@/lib/cloudDiagrams";
import type { DiagramMode } from "@/lib/nodeTypes";

interface Loaded {
  name: string;
  mode: DiagramMode;
  data: DiagramData;
}

// Minimal read-only canvas for iframe embedding (/embed/[id]). No nav, no
// panels — just the diagram and a small "Sketchstack" watermark.
export default function EmbedDiagram({ id }: { id: string }) {
  const [diagram, setDiagram] = useState<Loaded | null>(null);
  const [error, setError] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      system: SystemNodeComponent,
      note: NoteNodeComponent,
      group: GroupNodeComponent,
    }),
    [],
  );

  useEffect(() => {
    loadDiagram(id)
      .then((d) => setDiagram(d as Loaded))
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
        Diagram not available.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[var(--bg)]">
      {diagram ? (
        <NoteDisplayContext.Provider value={{ expandAll: true }}>
          <ReactFlow
            nodes={diagram.data.nodes ?? []}
            edges={(diagram.data.edges ?? []) as Edge[]}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            edgesFocusable={false}
            panOnScroll
            zoomOnScroll={false}
          >
            <Background color="#94a3b8" gap={20} />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>
        </NoteDisplayContext.Provider>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
          Loading…
        </div>
      )}
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-3 text-[10px] text-[var(--muted)] opacity-50 transition-opacity hover:opacity-100"
      >
        Sketchstack
      </Link>
    </div>
  );
}
