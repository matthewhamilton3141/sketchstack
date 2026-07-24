"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  reconnectEdge,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionMode,
  SelectionMode,
  type Edge,
  type Connection,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Undo2,
  Redo2,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  StickyNote,
  Cloud,
  Share2,
  GraduationCap,
  Trash2,
  Rows3,
  Workflow,
} from "lucide-react";
import SystemNodeComponent, { type SystemNode } from "@/components/SystemNode";
import NoteNodeComponent, {
  NOTE_COLOR,
  type NoteNode,
} from "@/components/NoteNode";
import GroupNodeComponent, { type GroupNode } from "@/components/GroupNode";
import type { AppNode } from "@/lib/appNode";
import HelperLines from "@/components/HelperLines";
import { getHelperLines } from "@/lib/helperLines";
import { computeAlignment, type AlignMode } from "@/lib/align";
import DetailsPanel from "@/components/DetailsPanel";
import NoteEditorPanel from "@/components/NoteEditorPanel";
import EdgePanel, { type EdgeStyle } from "@/components/EdgePanel";
import GroupPanel from "@/components/GroupPanel";
import SearchPanel from "@/components/SearchPanel";
import PromptPanel from "@/components/PromptPanel";
import CloudPanel from "@/components/CloudPanel";
import LearnPanel from "@/components/LearnPanel";
import CommandPalette from "@/components/CommandPalette";
import NodePaletteItem from "@/components/NodePaletteItem";
import { TEMPLATES, type Template } from "@/lib/templates";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import {
  createDiagram,
  updateDiagram,
  loadDiagram,
  deleteDiagram,
  setPublic,
  type DiagramData,
} from "@/lib/cloudDiagrams";
import { isSupabaseConfigured } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import {
  DIAGRAM_STORAGE_KEY as STORAGE_KEY,
  LEGACY_DIAGRAM_STORAGE_KEY as LEGACY_KEY,
} from "@/lib/storageKeys";
import { generatePrompt } from "@/lib/generatePrompt";
import { slugify } from "@/lib/slugify";
import { downloadDesign, parseDesign } from "@/lib/designFile";
import {
  NODE_KINDS,
  paletteGroups,
  type DiagramMode,
  type NodeKind,
  type SystemNodeData,
  type GroupNodeData,
} from "@/lib/nodeTypes";
import { MODES, MODE_ORDER } from "@/lib/modes";
import { autoLayout } from "@/lib/autoLayout";

// Concrete colors for React Flow's SVG chrome (background dots + minimap) and
// image-export background, which can't read CSS variables. Keyed by theme.
const CANVAS_COLORS = {
  light: { grid: "#cbd5e1", miniBg: "#ffffff", miniMask: "rgba(15,23,42,0.06)", bg: "#eef2f6" },
  dark: { grid: "#2a2a2a", miniBg: "#171717", miniMask: "rgba(0,0,0,0.5)", bg: "#0a0a0a" },
} as const;

const DEFAULT_TITLE = "Untitled system";

// Two starter nodes so the canvas isn't empty on first load.
const initialNodes: AppNode[] = [
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

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DRAG_TYPE = "application/sketchstack-template";
const DRAG_NODE_TYPE = "application/sketchstack-node";
const NOTE_DRAG = "__note__";
const GROUP_DRAG = "__group__";

// Stroke styles for edge types (fed into SVG path style).
function edgeStrokeDasharray(style: EdgeStyle | undefined): string | undefined {
  if (style === "dashed") return "8 4";
  if (style === "dotted") return "2 4";
  return undefined;
}

// Align toolbar actions (shown when 2+ nodes are selected).
const ALIGN_ACTIONS: { mode: AlignMode; Icon: typeof Undo2; label: string }[] = [
  { mode: "left", Icon: AlignStartVertical, label: "Align left" },
  { mode: "centerX", Icon: AlignCenterVertical, label: "Align horizontal centers" },
  { mode: "right", Icon: AlignEndVertical, label: "Align right" },
  { mode: "top", Icon: AlignStartHorizontal, label: "Align top" },
  { mode: "middleY", Icon: AlignCenterHorizontal, label: "Align vertical centers" },
  { mode: "bottom", Icon: AlignEndHorizontal, label: "Align bottom" },
  { mode: "distH", Icon: AlignHorizontalDistributeCenter, label: "Distribute horizontally" },
  { mode: "distV", Icon: AlignVerticalDistributeCenter, label: "Distribute vertically" },
];

export default function Canvas() {
  const [nodes, setNodes] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [mode, setMode] = useState<DiagramMode>("system");
  const { user } = useAuth();
  const [currentCloudId, setCurrentCloudId] = useState<string | null>(null);
  const [showCloud, setShowCloud] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "copied" | "error"
  >("idle");
  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<AppNode, Edge> | null>(null);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const minimapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [helperLineH, setHelperLineH] = useState<number | undefined>();
  const [helperLineV, setHelperLineV] = useState<number | undefined>();
  const [past, setPast] = useState<{ nodes: AppNode[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: AppNode[]; edges: Edge[] }[]>(
    [],
  );
  const [hydrated, setHydrated] = useState(false);
  const { theme } = useTheme();
  const colors = CANVAS_COLORS[theme];

  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const selectedSystemNode =
    selected?.type === "system" ? (selected as SystemNode) : null;
  const selectedNoteNode =
    selected?.type === "note" ? (selected as NoteNode) : null;
  const selectedGroupNode =
    selected?.type === "group" ? (selected as GroupNode) : null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;
  const selectedNodes = nodes.filter((n) => n.selected);

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
          nodes?: AppNode[];
          edges?: Edge[];
          title?: string;
          mode?: DiagramMode;
          cloudId?: string;
        };
        if (saved.nodes?.length) {
          setNodes(saved.nodes);
        }
        if (saved.edges) setEdges(saved.edges);
        if (saved.title) setTitle(saved.title);
        if (saved.mode) setMode(saved.mode);
        if (saved.cloudId) setCurrentCloudId(saved.cloudId);
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
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ nodes, edges, title, mode, cloudId: currentCloudId }),
      );
    } catch {
      // Storage full or disabled — ignore.
    }
  }, [nodes, edges, title, mode, currentCloudId, hydrated]);

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      setHelperLineH(undefined);
      setHelperLineV(undefined);

      const only = changes[0];
      if (
        changes.length === 1 &&
        only.type === "position" &&
        only.dragging &&
        only.position
      ) {
        const lines = getHelperLines(only, nodes);
        only.position.x = lines.snapPosition.x ?? only.position.x;
        only.position.y = lines.snapPosition.y ?? only.position.y;
        setHelperLineH(lines.horizontal);
        setHelperLineV(lines.vertical);
      }

      setNodes((ns) => applyNodeChanges(changes, ns));
    },
    [nodes, setNodes],
  );

  const clearCanvas = useCallback(() => {
    takeSnapshot();
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setCurrentCloudId(null);
  }, [takeSnapshot, setNodes, setEdges]);

  // --- Cloud save handlers ---
  const saveToCloud = useCallback(
    async (asNew: boolean) => {
      if (!user) return;
      const data: DiagramData = { nodes, edges };
      const name = title.trim() || "Untitled";
      if (!asNew && currentCloudId) {
        await updateDiagram(currentCloudId, name, mode, data);
      } else {
        const id = await createDiagram(user.id, name, mode, data);
        setCurrentCloudId(id);
      }
    },
    [user, nodes, edges, title, mode, currentCloudId],
  );

  const handleShare = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShareState("sharing");
    try {
      const data: DiagramData = { nodes, edges };
      const name = title.trim() || "Untitled";
      let id = currentCloudId;
      if (id) {
        await updateDiagram(id, name, mode, data);
      } else {
        id = await createDiagram(user.id, name, mode, data);
        setCurrentCloudId(id);
      }
      await setPublic(id, true);
      await navigator.clipboard.writeText(
        `${window.location.origin}/d/${id}`,
      );
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2500);
    }
  }, [user, nodes, edges, title, mode, currentCloudId]);

  const openFromCloud = useCallback(
    async (id: string) => {
      const loaded = await loadDiagram(id);
      takeSnapshot();
      setNodes(loaded.data.nodes ?? []);
      setEdges(loaded.data.edges ?? []);
      setTitle(loaded.name);
      setMode(loaded.mode);
      setCurrentCloudId(id);
      setSelectedId(null);
      setSelectedEdgeId(null);
      setShowCloud(false);
    },
    [takeSnapshot, setNodes, setEdges],
  );

  const deleteFromCloud = useCallback(
    async (id: string) => {
      await deleteDiagram(id);
      if (id === currentCloudId) setCurrentCloudId(null);
    },
    [currentCloudId],
  );

  const updateNodeData = useCallback(
    (id: string, patch: Partial<SystemNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as AppNode) : n,
        ),
      );
    },
    [setNodes],
  );

  const updateNoteData = useCallback(
    (id: string, patch: Partial<NoteNode["data"]>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as AppNode) : n,
        ),
      );
    },
    [setNodes],
  );

  const updateGroupLabel = useCallback(
    (id: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? ({ ...n, data: { ...n.data, label } } as AppNode)
            : n,
        ),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      const nodeToDelete = nodes.find((n) => n.id === id);
      takeSnapshot();
      if (nodeToDelete?.type === "group") {
        // Unparent children, converting relative positions back to absolute.
        setNodes((nds) => {
          const gp = nodeToDelete.position;
          return nds
            .filter((n) => n.id !== id)
            .map((n) => {
              if (n.parentId !== id) return n;
              return {
                ...n,
                parentId: undefined,
                extent: undefined,
                position: {
                  x: gp.x + n.position.x,
                  y: gp.y + n.position.y,
                },
              } as AppNode;
            });
        });
      } else {
        setNodes((nds) => nds.filter((n) => n.id !== id));
      }
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedId(null);
    },
    [nodes, takeSnapshot, setNodes, setEdges],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const source = nodes.find((n) => n.id === id);
      if (!source) return;
      takeSnapshot();
      const copyId = genId();
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        {
          ...source,
          id: copyId,
          position: { x: source.position.x + 40, y: source.position.y + 40 },
          selected: true,
          data: structuredClone(source.data),
        } as AppNode,
      ]);
      setSelectedId(copyId);
    },
    [nodes, takeSnapshot, setNodes],
  );

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

  const updateEdgeStyle = useCallback(
    (id: string, edgeStyle: EdgeStyle) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id !== id) return e;
          const dasharray = edgeStrokeDasharray(edgeStyle);
          return {
            ...e,
            style: { ...e.style, strokeDasharray: dasharray },
            data: { ...e.data, edgeStyle },
          };
        }),
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

  const duplicateSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;
    takeSnapshot();
    const copies = selected.map(
      (n) =>
        ({
          ...n,
          id: genId(),
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: true,
          data: structuredClone(n.data),
        }) as AppNode,
    );
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...copies,
    ]);
  }, [nodes, takeSnapshot, setNodes]);

  // Run Dagre auto-layout on all non-group, non-child nodes.
  const runAutoLayout = useCallback(() => {
    takeSnapshot();
    const laid = autoLayout(nodes, edges);
    setNodes(laid);
    // Fit view after layout (next tick so new positions are applied).
    setTimeout(() => rfInstance?.fitView({ duration: 400 }), 50);
  }, [nodes, edges, takeSnapshot, setNodes, rfInstance]);

  // Pan the canvas to a node and select it (used by Search).
  const focusNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === nodeId })),
      );
      setSelectedId(nodeId);
      setSelectedEdgeId(null);
      rfInstance?.fitView({
        nodes: [{ id: nodeId }],
        maxZoom: 1.5,
        duration: 400,
      });
    },
    [rfInstance, setNodes],
  );

  const nodeTypes = useMemo(
    () => ({
      system: SystemNodeComponent,
      note: NoteNodeComponent,
      group: GroupNodeComponent,
    }),
    [],
  );

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

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      takeSnapshot();
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
    },
    [takeSnapshot, setEdges],
  );

  // When a non-group node is dropped inside a group's bounds, make it a child.
  const onNodeDragStop = useCallback(
    (_: unknown, draggedNode: AppNode) => {
      if (draggedNode.type === "group" || draggedNode.parentId) return;
      const groupNodes = nodes.filter((n) => n.type === "group");
      if (groupNodes.length === 0) return;

      const nodeW = 168;
      const nodeH = 60;
      const cx = draggedNode.position.x + nodeW / 2;
      const cy = draggedNode.position.y + nodeH / 2;

      for (const group of groupNodes) {
        const gw = (group.style?.width as number) ?? 400;
        const gh = (group.style?.height as number) ?? 260;
        if (
          cx >= group.position.x &&
          cx <= group.position.x + gw &&
          cy >= group.position.y &&
          cy <= group.position.y + gh
        ) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === draggedNode.id
                ? ({
                    ...n,
                    parentId: group.id,
                    position: {
                      x: draggedNode.position.x - group.position.x,
                      y: draggedNode.position.y - group.position.y,
                    },
                  } as AppNode)
                : n,
            ),
          );
          break;
        }
      }
    },
    [nodes, setNodes],
  );

  const addTemplate = useCallback(
    (template: Template, position?: { x: number; y: number }) => {
      takeSnapshot();
      const minX = Math.min(...template.nodes.map((n) => n.position.x));
      const minY = Math.min(...template.nodes.map((n) => n.position.y));
      const baseX = position?.x ?? 160;
      const baseY = position?.y ?? 160;

      const idMap = new Map<string, string>();
      const newNodes: SystemNode[] = template.nodes.map((n) => {
        const id = genId();
        idMap.set(n.id, id);
        return {
          ...n,
          id,
          selected: false,
          position: {
            x: baseX + (n.position.x - minX),
            y: baseY + (n.position.y - minY),
          },
          data: { ...n.data },
        };
      });
      const newEdges: Edge[] = template.edges.map((e) => ({
        ...e,
        id: genId(),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }));

      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);
      setSelectedId(null);
      setSelectedEdgeId(null);
    },
    [takeSnapshot, setNodes, setEdges],
  );

  const alignSelected = useCallback(
    (alignMode: AlignMode) => {
      const sel = nodes.filter((n) => n.selected);
      if (sel.length < 2) return;
      const positions = computeAlignment(sel, alignMode);
      takeSnapshot();
      setNodes((nds) =>
        nds.map((n) =>
          positions.has(n.id) ? { ...n, position: positions.get(n.id)! } : n,
        ),
      );
    },
    [nodes, takeSnapshot, setNodes],
  );

  const pokeMinimap = useCallback(() => {
    setMinimapVisible(true);
    if (minimapTimer.current) clearTimeout(minimapTimer.current);
    minimapTimer.current = setTimeout(() => setMinimapVisible(false), 1200);
  }, []);

  const addNode = useCallback(
    (kind: NodeKind, label: string, position?: { x: number; y: number }) => {
      takeSnapshot();
      const id = genId();
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        {
          id,
          type: "system",
          position: position ?? {
            x: 120 + Math.random() * 240,
            y: 120 + Math.random() * 240,
          },
          data: { kind, label },
          selected: true,
        },
      ]);
      setSelectedId(id);
    },
    [takeSnapshot, setNodes],
  );

  const addNote = useCallback(
    (position?: { x: number; y: number }) => {
      takeSnapshot();
      const id = genId();
      const note: NoteNode = {
        id,
        type: "note",
        position: position ?? {
          x: 120 + Math.random() * 240,
          y: 120 + Math.random() * 240,
        },
        data: {
          bullets: [{ id: `${id}-b0`, text: "", children: [] }],
          promptInclude: "bullets",
        },
        selected: true,
      };
      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), note]);
      setSelectedId(id);
    },
    [takeSnapshot, setNodes],
  );

  const addGroup = useCallback(
    (position?: { x: number; y: number }) => {
      takeSnapshot();
      const id = genId();
      const group: GroupNode = {
        id,
        type: "group",
        position: position ?? {
          x: 80 + Math.random() * 200,
          y: 80 + Math.random() * 200,
        },
        style: { width: 400, height: 260 },
        zIndex: -1,
        data: { label: "Group" },
        selected: true,
      };
      // Groups go first in the array so they render behind other nodes.
      setNodes((nds) => [group, ...nds.map((n) => ({ ...n, selected: false }))]);
      setSelectedId(id);
    },
    [takeSnapshot, setNodes],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!rfInstance) return;
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const dragged = event.dataTransfer.getData(DRAG_NODE_TYPE);
      if (dragged === NOTE_DRAG) {
        addNote(position);
        return;
      }
      if (dragged === GROUP_DRAG) {
        addGroup(position);
        return;
      }
      const kind = dragged as NodeKind;
      if (kind && NODE_KINDS[kind]) {
        addNode(kind, NODE_KINDS[kind].label, position);
        return;
      }
      const template = TEMPLATES.find(
        (t) => t.id === event.dataTransfer.getData(DRAG_TYPE),
      );
      if (template) addTemplate(template, position);
    },
    [rfInstance, addNode, addNote, addGroup, addTemplate],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const {
          title: t,
          mode: m,
          nodes: n,
          edges: ed,
        } = parseDesign(await file.text());
        takeSnapshot();
        setNodes(n);
        setEdges(ed);
        setTitle(t);
        setMode(m);
        setSelectedId(null);
        setSelectedEdgeId(null);
      } catch {
        alert("Couldn't import that file — it isn't a Sketchstack design.");
      }
    },
    [takeSnapshot, setNodes, setEdges],
  );

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
      // ⌘K opens the component palette from anywhere (even while typing).
      if (mod && key === "k") {
        e.preventDefault();
        setShowPalette((v) => !v);
        return;
      }
      // ⌘F opens canvas search (even while typing).
      if (mod && key === "f") {
        e.preventDefault();
        setShowSearch((v) => !v);
        return;
      }
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
        selectionMode={SelectionMode.Partial}
        attributionPosition="bottom-left"
        deleteKeyCode={null}
        onNodeDragStart={takeSnapshot}
        onNodeDragStop={onNodeDragStop}
        onInit={setRfInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onMove={pokeMinimap}
        onNodeDrag={pokeMinimap}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
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
        <HelperLines horizontal={helperLineH} vertical={helperLineV} />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => {
            if (n.type === "note") return NOTE_COLOR;
            if (n.type === "group") return "transparent";
            const d = n.data as SystemNodeData;
            return d.color ?? NODE_KINDS[d.kind]?.color ?? "#94a3b8";
          }}
          nodeStrokeWidth={0}
          nodeBorderRadius={3}
          maskColor={colors.miniMask}
          style={{
            backgroundColor: colors.miniBg,
            border: "1px solid var(--border)",
            borderRadius: 8,
            bottom: 52,
            opacity: minimapVisible ? 1 : 0,
            transition: "opacity 250ms ease",
            pointerEvents: minimapVisible ? "auto" : "none",
          }}
        />
        <Panel position="top-left">
          <div className="flex max-h-[calc(100vh-8rem)] w-56 flex-col overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 shadow-sm">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as DiagramMode)}
              aria-label="Diagram mode"
              className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1.5 text-xs font-semibold text-[var(--text)] outline-none"
            >
              {MODE_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MODES[m].label}
                </option>
              ))}
            </select>
            {mode === "system" ? (
              <div className="mb-2">
                <div className="px-1 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] opacity-70">
                  Templates · drag or click
                </div>
                <div className="flex flex-col gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_TYPE, t.id);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => addTemplate(t)}
                      className="cursor-grab rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--border)] active:cursor-grabbing"
                      title={t.description}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mb-2">
              <div className="px-1 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] opacity-70">
                Annotate · drag or click
              </div>
              <div className="flex flex-col gap-1">
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_NODE_TYPE, NOTE_DRAG);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => addNote()}
                  style={{
                    borderColor: NOTE_COLOR,
                    backgroundColor: `${NOTE_COLOR}1a`,
                  }}
                  className="flex w-full cursor-grab items-center gap-1 rounded-md border px-1.5 py-1 text-xs font-medium text-[var(--text)] transition-transform hover:scale-[1.03] active:cursor-grabbing"
                  title="Click to add or drag onto canvas — Note"
                >
                  <StickyNote size={13} style={{ color: NOTE_COLOR }} strokeWidth={2.25} />
                  Note
                </button>
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_NODE_TYPE, GROUP_DRAG);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => addGroup()}
                  className="flex w-full cursor-grab items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-1.5 py-1 text-xs font-medium text-[var(--text)] transition-transform hover:scale-[1.03] active:cursor-grabbing"
                  title="Click to add or drag onto canvas — Group / swimlane"
                >
                  <Rows3 size={13} className="text-[var(--muted)]" strokeWidth={2.25} />
                  Group
                </button>
              </div>
            </div>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Add a component
              </span>
              <button
                onClick={() => setShowPalette(true)}
                className="flex items-center gap-1 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
                title="Search components (⌘K)"
              >
                <span className="font-mono">⌘K</span>
              </button>
            </div>
            {paletteGroups(mode).map(({ category, kinds }) => (
              <div key={category} className="mb-1.5">
                <div className="px-1 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] opacity-70">
                  {category}
                </div>
                <div className="flex flex-wrap gap-1">
                  {kinds.map((spec) => (
                    <NodePaletteItem
                      key={spec.kind}
                      spec={spec}
                      onAdd={() => addNode(spec.kind, spec.label)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_NODE_TYPE, spec.kind);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                    />
                  ))}
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
              <button
                onClick={runAutoLayout}
                disabled={nodes.filter((n) => n.type !== "group").length < 2}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-30"
                title="Auto-arrange nodes (Dagre top-to-bottom layout)"
              >
                <Workflow size={13} />
                Layout
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                disabled={nodes.length === 0 && edges.length === 0}
                className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                title="Clear the canvas"
              >
                <Trash2 size={13} />
                Clear
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
                onClick={() => setShowLearn(true)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Learn how to build a system design"
              >
                <GraduationCap size={14} /> Learn
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Search nodes (⌘F)"
              >
                ⌘F
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Import a .sketchstack.json design file"
              >
                Import
              </button>
              <button
                onClick={() => downloadDesign(title, mode, nodes, edges)}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                title="Download the editable design (.json)"
              >
                Design
              </button>
              {user ? (
                <button
                  onClick={() => setShowCloud(true)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
                  title="Save to / open from the cloud"
                >
                  <Cloud size={13} /> Cloud
                </button>
              ) : null}
              {isSupabaseConfigured ? (
                <button
                  onClick={handleShare}
                  disabled={shareState === "sharing"}
                  className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  title={
                    user
                      ? "Publish this diagram and copy a shareable link"
                      : "Sign in to share a live link to this diagram"
                  }
                >
                  <Share2 size={13} />
                  {shareState === "sharing"
                    ? "Sharing…"
                    : shareState === "copied"
                      ? "Link copied!"
                      : shareState === "error"
                        ? "Failed — retry"
                        : "Share"}
                </button>
              ) : null}
            </div>
          </div>
        </Panel>
        {selectedNodes.length >= 2 ? (
          <Panel position="top-center">
            <div className="mt-14 flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-1.5 py-1 shadow-sm">
              {ALIGN_ACTIONS.map((a, i) => (
                <Fragment key={a.mode}>
                  {i === 3 || i === 6 ? (
                    <span className="mx-0.5 h-4 w-px bg-[var(--border)]" />
                  ) : null}
                  <button
                    onClick={() => alignSelected(a.mode)}
                    title={a.label}
                    className="rounded-md p-1 text-[var(--text)] hover:bg-[var(--panel-2)]"
                  >
                    <a.Icon size={15} />
                  </button>
                </Fragment>
              ))}
            </div>
          </Panel>
        ) : null}
        <Panel position="bottom-center">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setPrompt(generatePrompt(nodes, edges, title, mode))}
              className="rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-text)] shadow-md hover:bg-[var(--btn-hover)]"
            >
              Generate Prompt
            </button>
            <span className="text-[10px] text-[var(--muted)]">
              Auto-saved to this browser
            </span>
          </div>
        </Panel>
        {selectedSystemNode ? (
          <Panel position="top-right">
            <DetailsPanel
              node={selectedSystemNode}
              onChange={(patch) => updateNodeData(selectedSystemNode.id, patch)}
              onDuplicate={() => duplicateNode(selectedSystemNode.id)}
              onDelete={() => deleteNode(selectedSystemNode.id)}
              onClose={() => setSelectedId(null)}
            />
          </Panel>
        ) : null}
        {selectedNoteNode ? (
          <Panel position="top-right">
            <NoteEditorPanel
              node={selectedNoteNode}
              onChange={(patch) => updateNoteData(selectedNoteNode.id, patch)}
              onDuplicate={() => duplicateNode(selectedNoteNode.id)}
              onDelete={() => deleteNode(selectedNoteNode.id)}
              onClose={() => setSelectedId(null)}
            />
          </Panel>
        ) : null}
        {selectedGroupNode ? (
          <Panel position="top-right">
            <GroupPanel
              node={selectedGroupNode}
              onChange={(label) => updateGroupLabel(selectedGroupNode.id, label)}
              onDelete={() => deleteNode(selectedGroupNode.id)}
              onClose={() => setSelectedId(null)}
            />
          </Panel>
        ) : null}
        {selectedEdge ? (
          <Panel position="top-right">
            <EdgePanel
              edge={selectedEdge}
              onChange={(label) => updateEdgeLabel(selectedEdge.id, label)}
              onStyleChange={(style) => updateEdgeStyle(selectedEdge.id, style)}
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
      {showCloud && user ? (
        <CloudPanel
          currentName={title.trim() || "Untitled"}
          currentCloudId={currentCloudId}
          onSave={saveToCloud}
          onOpen={openFromCloud}
          onDelete={deleteFromCloud}
          onClose={() => setShowCloud(false)}
        />
      ) : null}
      {showAuth ? <AuthModal onClose={() => setShowAuth(false)} /> : null}
      {showLearn ? (
        <LearnPanel
          mode={mode}
          onUseTemplate={(t) => {
            setMode("system");
            addTemplate(t);
            setShowLearn(false);
          }}
          onClose={() => setShowLearn(false)}
        />
      ) : null}
      {showSearch ? (
        <SearchPanel
          nodes={nodes}
          onFocus={focusNode}
          onClose={() => setShowSearch(false)}
        />
      ) : null}
      {confirmClear ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmClear(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" />
              <h2 id="clear-title" className="text-base font-semibold text-[var(--text)]">
                Clear the canvas?
              </h2>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This removes all {nodes.length} node{nodes.length === 1 ? "" : "s"} and{" "}
              {edges.length} connection{edges.length === 1 ? "" : "s"} from the canvas. You
              can undo this with ⌘Z.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--panel-2)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setConfirmClear(false);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
              >
                Clear canvas
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showPalette ? (
        <CommandPalette
          mode={mode}
          onSelect={(kind, label) => {
            addNode(kind, label);
            setShowPalette(false);
          }}
          onClose={() => setShowPalette(false)}
        />
      ) : null}
    </div>
  );
}
