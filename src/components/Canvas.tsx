"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import SystemNodeComponent, { type SystemNode } from "@/components/SystemNode";
import DetailsPanel from "@/components/DetailsPanel";
import EdgePanel from "@/components/EdgePanel";
import PromptPanel from "@/components/PromptPanel";
import { useTheme } from "@/components/ThemeProvider";
import { generatePrompt } from "@/lib/generatePrompt";
import {
  CATEGORY_ORDER,
  KINDS_BY_CATEGORY,
  NODE_KINDS,
  type NodeKind,
  type SystemNodeData,
} from "@/lib/nodeTypes";

// Concrete colors for React Flow's SVG chrome (background dots + minimap),
// which can't read CSS variables. Keyed by theme.
const CANVAS_COLORS = {
  light: { grid: "#cbd5e1", miniBg: "#ffffff", miniMask: "rgba(15,23,42,0.06)" },
  dusk: { grid: "#46536b", miniBg: "#374257", miniMask: "rgba(0,0,0,0.28)" },
  dark: { grid: "#2a2a2a", miniBg: "#171717", miniMask: "rgba(0,0,0,0.5)" },
} as const;

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
// the saved shape ever changes in a breaking way.
const STORAGE_KEY = "sysdesign:diagram:v1";

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<SystemNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  // Gates auto-save: we must not persist until we've loaded any saved diagram,
  // otherwise the first render would overwrite it with the default nodes.
  const [hydrated, setHydrated] = useState(false);
  const { theme } = useTheme();
  const colors = CANVAS_COLORS[theme];

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;

  // Load any previously saved diagram once, on mount (browser-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { nodes?: SystemNode[]; edges?: Edge[] };
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    } catch {
      // Storage full or disabled — ignore; the app still works in-memory.
    }
  }, [nodes, edges, hydrated]);

  // Wipe the canvas and the saved copy.
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
  }, [setNodes, setEdges]);

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
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedId(null);
    },
    [setNodes, setEdges],
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
      setEdges((eds) => eds.filter((e) => e.id !== id));
      setSelectedEdgeId(null);
    },
    [setEdges],
  );

  // Register our custom node under the "system" type. Memoized so React Flow
  // doesn't warn about a new object every render.
  const nodeTypes = useMemo(() => ({ system: SystemNodeComponent }), []);

  // Fired when the user drags from one node's handle to another.
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...connection, markerEnd: { type: MarkerType.ArrowClosed } },
          eds,
        ),
      ),
    [setEdges],
  );

  const addNode = useCallback(
    (kind: NodeKind, label: string) => {
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
    [setNodes],
  );

  return (
    <div className="relative h-full w-full bg-[var(--bg)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
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
        <Panel position="bottom-center">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setPrompt(generatePrompt(nodes, edges))}
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
        <PromptPanel prompt={prompt} onClose={() => setPrompt(null)} />
      ) : null}
    </div>
  );
}
