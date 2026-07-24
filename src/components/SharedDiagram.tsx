"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactFlow, Background, Controls, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Edge } from "@xyflow/react";

import SystemNodeComponent from "@/components/SystemNode";
import NoteNodeComponent from "@/components/NoteNode";
import GroupNodeComponent from "@/components/GroupNode";
import { NoteDisplayContext } from "@/components/noteDisplay";
import HeaderLinks from "@/components/HeaderLinks";
import { loadDiagram, type DiagramData } from "@/lib/cloudDiagrams";
import { DIAGRAM_STORAGE_KEY } from "@/lib/storageKeys";
import type { DiagramMode } from "@/lib/nodeTypes";

interface Loaded {
  name: string;
  mode: DiagramMode;
  data: DiagramData;
}

// Read-only public view of a shared diagram (route /d/[id]).
export default function SharedDiagram({ id }: { id: string }) {
  const router = useRouter();
  const [diagram, setDiagram] = useState<Loaded | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

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

  // Fork the shared diagram into the visitor's own (guest) canvas.
  const openCopy = () => {
    if (!diagram) return;
    if (
      !window.confirm(
        "Open a copy in your canvas? This replaces your current working diagram.",
      )
    )
      return;
    try {
      localStorage.setItem(
        DIAGRAM_STORAGE_KEY,
        JSON.stringify({
          nodes: diagram.data.nodes ?? [],
          edges: (diagram.data.edges ?? []) as Edge[],
          title: `${diagram.name} (copy)`,
          mode: diagram.mode,
          cloudId: null,
        }),
      );
    } catch {
      // ignore storage errors
    }
    router.push("/new");
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[var(--bg)] text-center">
        <div className="text-lg font-semibold text-[var(--text)]">
          This diagram isn&apos;t available.
        </div>
        <p className="text-sm text-[var(--muted)]">
          It may be private or the link is wrong.
        </p>
        <Link
          href="/"
          className="rounded-md bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)]"
        >
          Go to Sketchstack
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[var(--text)]"
          >
            Sketchstack
          </Link>
          <span className="truncate text-sm text-[var(--muted)]">
            {diagram ? `— ${diagram.name}` : "— loading…"}
          </span>
          {diagram ? (
            <span className="hidden shrink-0 rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)] sm:inline">
              Read-only
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyLink}
            disabled={!diagram}
            className="rounded-md border border-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-50"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={openCopy}
            disabled={!diagram}
            className="rounded-md bg-[var(--btn-bg)] px-3 py-1 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)] disabled:opacity-50"
          >
            Open a copy
          </button>
          <HeaderLinks />
        </div>
      </header>
      <main className="relative flex-1 bg-[var(--bg)]">
        {diagram ? (
          // Expand note sub-comments: a read-only view can't rely on hover.
          <NoteDisplayContext.Provider value={{ expandAll: true }}>
            <ReactFlow
              nodes={diagram.data.nodes ?? []}
              edges={(diagram.data.edges ?? []) as Edge[]}
              nodeTypes={nodeTypes}
              // SystemNode declares every handle as type="source"; the editor
              // renders edges only because it runs in Loose mode. Without this
              // the default Strict mode can't resolve the target handle, so
              // edges (paths, arrowheads, labels) silently fail to render here.
              connectionMode={ConnectionMode.Loose}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              edgesFocusable={false}
              panOnScroll
            >
              <Background color="#94a3b8" gap={20} />
              <Controls showInteractive={false} position="bottom-right" />
            </ReactFlow>
          </NoteDisplayContext.Provider>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            Loading diagram…
          </div>
        )}
      </main>
    </div>
  );
}
