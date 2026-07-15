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

// Concise builders so the template definitions below stay readable.
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

function e(id: string, source: string, target: string, label?: string): Edge {
  return {
    id,
    source,
    target,
    label,
    markerEnd: { type: MarkerType.ArrowClosed },
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "saas",
    name: "SaaS web app",
    description: "Frontend, API, database, auth, and a cache.",
    title: "SaaS web app",
    nodes: [
      n("1", "frontend", "Web app", 0, 0, "Next.js"),
      n("2", "api", "API", 260, 0, "Node/Express"),
      n("3", "database", "Database", 520, -90, "Postgres"),
      n("4", "auth", "Auth", 260, 170, "Supabase Auth"),
      n("5", "cache", "Cache", 520, 90, "Redis"),
    ],
    edges: [
      e("e1", "1", "2"),
      e("e2", "2", "3", "reads/writes"),
      e("e3", "2", "4", "verifies"),
      e("e4", "2", "5", "caches"),
    ],
  },
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
    edges: [
      e("e1", "1", "2"),
      e("e2", "2", "3"),
      e("e3", "3", "4", "queries"),
    ],
  },
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
    edges: [
      e("e1", "1", "2"),
      e("e2", "2", "3", "prompt"),
      e("e3", "2", "4", "retrieve context"),
      e("e4", "5", "4", "embed & upsert"),
    ],
  },
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
    edges: [
      e("e1", "1", "2", "publish"),
      e("e2", "2", "3", "consume"),
      e("e3", "3", "4", "write"),
    ],
  },
];
