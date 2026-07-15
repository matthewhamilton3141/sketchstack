import { MarkerType, type Edge } from "@xyflow/react";
import type { SystemNode } from "@/components/SystemNode";
import type { NodeKind } from "@/lib/nodeTypes";

export interface Template {
  id: string;
  name: string;
  description: string;
  title: string;
  nodes: SystemNode[];
  edges: Edge[];
}

// A concise builder so the node definitions below stay readable.
function n(
  id: string,
  kind: NodeKind,
  label: string,
  x: number,
  y: number,
  tech?: string,
): SystemNode {
  return { id, type: "system", position: { x, y }, data: { kind, label, tech } };
}

// Choose the cleanest pair of handles for an edge based on the relative
// positions of its two nodes: sides for horizontal runs, top/bottom for
// vertical ones. Nodes carry handles with ids top/right/bottom/left.
function pickHandles(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "right", targetHandle: "left" }
      : { sourceHandle: "left", targetHandle: "right" };
  }
  return dy >= 0
    ? { sourceHandle: "bottom", targetHandle: "top" }
    : { sourceHandle: "top", targetHandle: "bottom" };
}

// Build a template, computing each edge's handles from node geometry.
function makeTemplate(
  base: Omit<Template, "edges">,
  edgeSpecs: [id: string, source: string, target: string, label?: string][],
): Template {
  const posOf = (id: string) =>
    base.nodes.find((node) => node.id === id)!.position;
  const edges: Edge[] = edgeSpecs.map(([id, source, target, label]) => ({
    id,
    source,
    target,
    label,
    ...pickHandles(posOf(source), posOf(target)),
    markerEnd: { type: MarkerType.ArrowClosed },
  }));
  return { ...base, edges };
}

export const TEMPLATES: Template[] = [
  makeTemplate(
    {
      id: "saas",
      name: "SaaS web app",
      description: "Frontend, API, database, auth, and a cache.",
      title: "SaaS web app",
      nodes: [
        n("1", "frontend", "Web app", 0, 0, "Next.js"),
        n("2", "api", "API", 260, 0, "Node/Express"),
        n("3", "database", "Database", 520, -90, "Postgres"),
        n("4", "auth", "Auth", 260, 180, "Supabase Auth"),
        n("5", "cache", "Cache", 520, 90, "Redis"),
      ],
    },
    [
      ["e1", "1", "2"],
      ["e2", "2", "3", "reads/writes"],
      ["e3", "2", "4", "verifies"],
      ["e4", "2", "5", "caches"],
    ],
  ),
  makeTemplate(
    {
      id: "rest",
      name: "REST API + DB",
      description: "Client through a gateway to a REST API and database.",
      title: "REST API service",
      nodes: [
        n("1", "frontend", "Client", 0, 0),
        n("2", "gateway", "API Gateway", 230, 0),
        n("3", "api", "REST API", 460, 0, "FastAPI"),
        n("4", "database", "Database", 690, 0, "Postgres"),
      ],
    },
    [
      ["e1", "1", "2"],
      ["e2", "2", "3"],
      ["e3", "3", "4", "queries"],
    ],
  ),
  makeTemplate(
    {
      id: "rag",
      name: "AI RAG app",
      description: "Chat UI, backend, an LLM, and a vector DB with ingestion.",
      title: "AI RAG app",
      nodes: [
        n("1", "frontend", "Chat UI", 0, 0),
        n("2", "api", "Backend", 250, 0),
        n("3", "llm", "LLM", 500, -90, "Claude"),
        n("4", "vectordb", "Vector DB", 500, 90, "pgvector"),
        n("5", "pipeline", "Ingest pipeline", 250, 190),
      ],
    },
    [
      ["e1", "1", "2"],
      ["e2", "2", "3", "prompt"],
      ["e3", "2", "4", "retrieve context"],
      ["e4", "5", "4", "embed & upsert"],
    ],
  ),
  makeTemplate(
    {
      id: "events",
      name: "Event-driven",
      description: "API publishes to a queue; a worker processes into a database.",
      title: "Event-driven pipeline",
      nodes: [
        n("1", "api", "API", 0, 0),
        n("2", "queue", "Queue", 230, 0, "SQS"),
        n("3", "worker", "Worker", 460, 0),
        n("4", "database", "Database", 690, 0),
      ],
    },
    [
      ["e1", "1", "2", "publish"],
      ["e2", "2", "3", "consume"],
      ["e3", "3", "4", "write"],
    ],
  ),
];
