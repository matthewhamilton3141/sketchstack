"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionMode,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Undo2, Redo2 } from "lucide-react";
import SystemNodeComponent, { type SystemNode } from "@/components/SystemNode";
import DetailsPanel from "@/components/DetailsPanel";
import EdgePanel from "@/components/EdgePanel";
import PromptPanel from "@/components/PromptPanel";
import TemplatesModal from "@/components/TemplatesModal";
import { type Template } from "@/lib/templates";
import { useTheme } from "@/components/ThemeProvider";
import { generatePrompt } from "@/lib/generatePrompt";
import { exportCanvasImage, slugify } from "@/lib/exportImage";
import { downloadDesign, parseDesign } from "@/lib/designFile";
import {
  CATEGORY_ORDER,
  KINDS_BY_CATEGORY,
  NODE_KINDS,
  type NodeKind,
  type SystemNodeData,
} from "@/lib/nodeTypes";

// Concrete colors for React Flow's SVG chrome (background dots + minimap) and
// image-export background, which can't read CSS variables. Keyed by theme.
const CANVAS_COLORS = {
  light: { grid: "#cbd5e1", miniBg: "#ffffff", miniMask: "rgba(15,23,42,0.06)", bg: "#eef2f6" },
  dusk: { grid: "#46536b", miniBg: "#374257", miniMask: "rgba(0,0,0,0.28)", bg: "#2b3648" },
  dark: { grid: "#2a2a2a", miniBg: "#171717", miniMask: "rgba(0,0,0,0.5)", bg: "#0a0a0a" },
} as const;

const DEFAULT_TITLE = "Untitled system";

// Two starter nodes so the canvas isn't empty on first load.
const initialNodes: SystemNode[] = [
  {
    id: "1",
    type: "system",
    position: { x: 0, y: 0 },
    data: { kind: "frontend", label: "Web app", tech: "Next.js" },
  },
  {
    id: "2",
    type: "system",
    position: { x: 280, y: 140 },
    data: { kind: "api", label: "API", tech: "Node/Express" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", markerEnd: { type: MarkerType.ArrowClosed } },
];

// Every new node needs a unique id; a simple counter is enough for now.
let nextId = 3;

// Where the diagram is auto-saved in the browser. Bump the version suffix if
// the saved shape ever changes in a breaking way. LEGACY_KEY is the pre-rebrand
// key, read once so existing diagrams migrate over.
const STORAGE_KEY = "sketchstack:diagram:v1";
const LEGACY_KEY = "sysdesign:diagram:v1";

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<SystemNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [showTemplates, setShowTemplates] = useState(false);
  // Undo/redo history. Each entry is a snapshot of the whole diagram.
  const [past, setPast] = useState<{ nodes: SystemNode[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: SystemNode[]; edges: Edge[] }[]>(
    [],
  );
  // Gates auto-save: we must not persist until we've loaded any saved diagram,
  // otherwise the first render would overwrite it with the default nodes.
  const [hydrated, setHydrated] = useState(false);
  const { theme } = useTheme();
  const colors = CANVAS_COLORS[theme];

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;

  // Push the current diagram onto the undo stack (call BEFORE a mutation).
  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p.slice(-49), { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return p.slice(0, -1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return f.slice(1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  // Load any previously saved diagram once, on mount (browser-only).
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          nodes?: SystemNode[];
          edges?: Edge[];
          title?: string;
        };
        if (saved.nodes?.length) {
          setNodes(saved.nodes);
          // Make sure new node ids don't collide with restored ones.
          const maxId = Math.max(
            0,
            ...saved.nodes.map((n) => Number(n.id)).filter(Number.isFinite),
          );
          nextId = maxId + 1;
        }
        if (saved.edges) setEdges(saved.edges);
        if (saved.title) setTitle(saved.title);
      }
    } catch {
      // Corrupt/blocked storage — fall back to the default diagram.
    }
    setHydrated(true);
  }, [setNodes, setEdges]);

  // Auto-save on every change, but only after the initial load has applied.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, title }));
    } catch {
      // Storage full or disabled — ignore; the app still works in-memory.
    }
  }, [nodes, edges, title, hydrated]);

  // Wipe the canvas and the saved copy.
  const clearCanvas = useCallback(() => {
    takeSnapshot();
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
  }, [takeSnapshot, setNodes, setEdges]);

  // Merge a patch into the selected node's data (used by the details panel).
  const updateNodeData = useCallback(
    (id: string, patch: Partial<SystemNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      takeSnapshot();
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedId(null);
    },
    [takeSnapshot, setNodes, setEdges],
  );

  // Copy a node next to itself and select the copy.
  const duplicateNode = useCallback(
    (id: string) => {
      const source = nodes.find((n) => n.id === id);
      if (!source) return;
      takeSnapshot();
      const copyId = String(nextId++);
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        {
          ...source,
          id: copyId,
          position: { x: source.position.x + 40, y: source.position.y + 40 },
          selected: true,
          data: { ...source.data },
        },
      ]);
      setSelectedId(copyId);
    },
    [nodes, takeSnapshot, setNodes],
  );

  // Set/clear the label shown on a connection (feeds the generated prompt).
  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === id ? { ...e, label: label || undefined } : e,
        ),
      );
    },
    [setEdges],
  );

  const deleteEdge = useCallback(
    (id: string) => {
      takeSnapshot();
      setEdges((eds) => eds.filter((e) => e.id !== id));
      setSelectedEdgeId(null);
    },
    [takeSnapshot, setEdges],
  );

  // Delete whatever is currently multi-selected (nodes and/or edges) plus any
  // edges attached to deleted nodes. Used by the Delete/Backspace shortcut.
  const deleteSelected = useCallback(() => {
    const selNodeIds = new Set(
      nodes.filter((n) => n.selected).map((n) => n.id),
    );
    const selEdgeIds = new Set(
      edges.filter((e) => e.selected).map((e) => e.id),
    );
    if (selNodeIds.size === 0 && selEdgeIds.size === 0) return;
    takeSnapshot();
    setNodes((nds) => nds.filter((n) => !selNodeIds.has(n.id)));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !selEdgeIds.has(e.id) &&
          !selNodeIds.has(e.source) &&
          !selNodeIds.has(e.target),
      ),
    );
    setSelectedId(null);
    setSelectedEdgeId(null);
  }, [nodes, edges, takeSnapshot, setNodes, setEdges]);

  // Duplicate all selected nodes (Cmd/Ctrl+D).
  const duplicateSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;
    takeSnapshot();
    const copies = selected.map((n) => ({
      ...n,
      id: String(nextId++),
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: true,
      data: { ...n.data },
    }));
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...copies,
    ]);
  }, [nodes, takeSnapshot, setNodes]);

  // Register our custom node under the "system" type. Memoized so React Flow
  // doesn't warn about a new object every render.
  const nodeTypes = useMemo(() => ({ system: SystemNodeComponent }), []);

  // Fired when the user drags from one node's handle to another.
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot();
      setEdges((eds) =>
        addEdge(
          { ...connection, markerEnd: { type: MarkerType.ArrowClosed } },
          eds,
        ),
      );
    },
    [takeSnapshot, setEdges],
  );

  const handleExport = useCallback(
    (format: "png" | "svg") =>
      exportCanvasImage(nodes, format, colors.bg, slugify(title)),
    [nodes, colors.bg, title],
  );

  // Replace the canvas with a starter template.
  const applyTemplate = useCallback(
    (template: Template) => {
      takeSnapshot();
      setNodes(template.nodes.map((n) => ({ ...n })));
      setEdges(template.edges.map((e) => ({ ...e })));
      setTitle(template.title);
      nextId =
        Math.max(
          0,
          ...template.nodes.map((n) => Number(n.id)).filter(Number.isFinite),
        ) + 1;
      setSelectedId(null);
      setSelectedEdgeId(null);
      setShowTemplates(false);
    },
    [takeSnapshot, setNodes, setEdges],
  );

  // Hidden file input drives "Import design".
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // let the same file be re-imported later
      if (!file) return;
      try {
        const { title: t, nodes: n, edges: ed } = parseDesign(await file.text());
        takeSnapshot();
        setNodes(n);
        setEdges(ed);
        setTitle(t);
        nextId =
          Math.max(0, ...n.map((x) => Number(x.id)).filter(Number.isFinite)) + 1;
        setSelectedId(null);
        setSelectedEdgeId(null);
      } catch {
        alert("Couldn't import that file — it isn't a Sketchstack design.");
      }
    },
    [takeSnapshot, setNodes, setEdges],
  );

  // Keyboard shortcuts: undo/redo, duplicate, delete. Ignored while typing in a
  // field so native text editing (and text undo) keeps working.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    };
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (isTyping()) return;
      if (mod && key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && key === "y") {
        e.preventDefault();
        redo();
      } else if (mod && key === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (key === "delete" || key === "backspace") {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateSelected, deleteSelected]);

  const addNode = useCallback(
    (kind: NodeKind, label: string) => {
      takeSnapshot();
      const id = String(nextId++);
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "system",
          // Drop it at a slightly random spot so nodes don't stack exactly.
          position: { x: 120 + Math.random() * 240, y: 120 + Math.random() * 240 },
          data: { kind, label },
        },
      ]);
    },
    [takeSnapshot, setNodes],
  );

  return (
    <div className="relative h-full w-full bg-[var(--bg)]">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImportFile}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        onNodeDragStart={takeSnapshot}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          setSelectedId(node.id);
          setSelectedEdgeId(null);
        }}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedId(null);
        }}
        onPaneClick={() => {
          setSelectedId(null);
          setSelectedEdgeId(null);
        }}
        fitView
      >
        <Background color={colors.grid} gap={20} />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) =>
            NODE_KINDS[(n.data as SystemNodeData).kind]?.color ?? "#94a3b8"
          }
          nodeStrokeWidth={0}
          nodeBorderRadius={3}
          maskColor={colors.miniMask}
          style={{
            backgroundColor: colors.miniBg,
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
        <Panel position="top-left">
          <div className="flex max-h-[calc(100vh-8rem)] w-56 flex-col overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 shadow-sm">
            <button
              onClick={() => setShowTemplates(true)}
              className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
            >
              ✨ Start from a template
            </button>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Add a component
              </span>
              <button
                onClick={clearCanvas}
                className="text-[10px] font-medium text-[var(--muted)] hover:text-red-500"
                title="Clear the canvas"
              >
                Clear
              </button>
            </div>
            {CATEGORY_ORDER.map((category) => (
              <div key={category} className="mb-1.5">
                <div className="px-1 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] opacity-70">
                  {category}
                </div>
                <div className="flex flex-wrap gap-1">
                  {KINDS_BY_CATEGORY[category].map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <button
                        key={spec.kind}
                        onClick={() => addNode(spec.kind, spec.label)}
                        style={{
                          borderColor: spec.color,
                          backgroundColor: `${spec.color}1a`,
                        }}
                        className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs font-medium text-[var(--text)] transition-transform hover:scale-[1.03]"
                        title={`Add ${spec.label}`}
                      >
                        <Icon size={13} style={{ color: spec.color }} strokeWidth={2.25} />
                        {spec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel position="top-center">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 border-r border-[var(--border)] pr-2">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="rounded-md p-1 text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-30"
                title="Undo (⌘Z)"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="rounded-md p-1 text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-30"
                title="Redo (⇧⌘Z)"
              >
                <Redo2 size={15} />
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder={DEFAULT_TITLE}
              aria-label="Diagram title"
              className="w-56 bg-transparent px-1 text-sm font-semibold text-[var(--text)] outline-none"
            />
            <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Import a .sketchstack.json design file"
              >
                Import
              </button>
              <button
                onClick={() => downloadDesign(title, nodes, edges)}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Download the editable design (.json)"
              >
                Design
              </button>
              <button
                onClick={() => handleExport("png")}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Download as a PNG image"
              >
                PNG
              </button>
              <button
                onClick={() => handleExport("svg")}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Download as an SVG image"
              >
                SVG
              </button>
            </div>
          </div>
        </Panel>
        <Panel position="bottom-center">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setPrompt(generatePrompt(nodes, edges, title))}
              className="rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-text)] shadow-md hover:bg-[var(--btn-hover)]"
            >
              Generate Prompt
            </button>
            <span className="text-[10px] text-[var(--muted)]">
              Auto-saved to this browser
            </span>
          </div>
        </Panel>
        {selectedNode ? (
          <Panel position="top-right">
            <DetailsPanel
              node={selectedNode}
              onChange={(patch) => updateNodeData(selectedNode.id, patch)}
              onDuplicate={() => duplicateNode(selectedNode.id)}
              onDelete={() => deleteNode(selectedNode.id)}
              onClose={() => setSelectedId(null)}
            />
          </Panel>
        ) : null}
        {selectedEdge ? (
          <Panel position="top-right">
            <EdgePanel
              edge={selectedEdge}
              onChange={(label) => updateEdgeLabel(selectedEdge.id, label)}
              onDelete={() => deleteEdge(selectedEdge.id)}
              onClose={() => setSelectedEdgeId(null)}
            />
          </Panel>
        ) : null}
      </ReactFlow>
      {prompt !== null ? (
        <PromptPanel
          prompt={prompt}
          fileName={`${slugify(title)}-prompt`}
          onClose={() => setPrompt(null)}
        />
      ) : null}
      {showTemplates ? (
        <TemplatesModal
          onSelect={applyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      ) : null}
    </div>
  );
}
