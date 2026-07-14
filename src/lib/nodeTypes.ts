// Single source of truth for the kinds of nodes a system diagram can contain.
// Components render from this, and the prompt generator will read from it too,
// so adding a new kind is a one-place change.

export type NodeKind =
  | "frontend"
  | "api"
  | "database"
  | "cache"
  | "queue"
  | "worker"
  | "auth"
  | "external"
  | "storage"
  | "llm"
  | "vectordb"
  | "pipeline";

export type NodeCategory =
  | "Web/API core"
  | "Async & infra"
  | "External & auth"
  | "AI / data";

export interface NodeKindSpec {
  kind: NodeKind;
  label: string;
  category: NodeCategory;
  // Tailwind classes for the accent color of this kind.
  accent: string; // border + text
  dot: string; // small color swatch
  // A short hint shown as placeholder for the "tech" field later.
  techHint: string;
}

export const NODE_KINDS: Record<NodeKind, NodeKindSpec> = {
  frontend: { kind: "frontend", label: "Frontend", category: "Web/API core", accent: "border-sky-400", dot: "bg-sky-400", techHint: "Next.js, React Native…" },
  api: { kind: "api", label: "API / Backend", category: "Web/API core", accent: "border-violet-400", dot: "bg-violet-400", techHint: "Node/Express, FastAPI…" },
  database: { kind: "database", label: "Database", category: "Web/API core", accent: "border-emerald-400", dot: "bg-emerald-400", techHint: "Postgres, MongoDB…" },
  cache: { kind: "cache", label: "Cache", category: "Async & infra", accent: "border-orange-400", dot: "bg-orange-400", techHint: "Redis, Memcached…" },
  queue: { kind: "queue", label: "Queue / Events", category: "Async & infra", accent: "border-amber-400", dot: "bg-amber-400", techHint: "SQS, Kafka, RabbitMQ…" },
  worker: { kind: "worker", label: "Worker / Job", category: "Async & infra", accent: "border-yellow-400", dot: "bg-yellow-400", techHint: "Cron, background jobs…" },
  auth: { kind: "auth", label: "Auth", category: "External & auth", accent: "border-rose-400", dot: "bg-rose-400", techHint: "Supabase Auth, Clerk…" },
  external: { kind: "external", label: "External API", category: "External & auth", accent: "border-pink-400", dot: "bg-pink-400", techHint: "Stripe, Twilio…" },
  storage: { kind: "storage", label: "Storage", category: "External & auth", accent: "border-teal-400", dot: "bg-teal-400", techHint: "S3, Supabase Storage…" },
  llm: { kind: "llm", label: "LLM / AI", category: "AI / data", accent: "border-fuchsia-400", dot: "bg-fuchsia-400", techHint: "Claude, GPT…" },
  vectordb: { kind: "vectordb", label: "Vector DB", category: "AI / data", accent: "border-indigo-400", dot: "bg-indigo-400", techHint: "Pinecone, pgvector…" },
  pipeline: { kind: "pipeline", label: "Data Pipeline", category: "AI / data", accent: "border-lime-400", dot: "bg-lime-400", techHint: "Airflow, dbt…" },
};

// Ordered categories -> kinds, used to render the palette in groups.
export const CATEGORY_ORDER: NodeCategory[] = [
  "Web/API core",
  "Async & infra",
  "External & auth",
  "AI / data",
];

export const KINDS_BY_CATEGORY: Record<NodeCategory, NodeKindSpec[]> =
  CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = Object.values(NODE_KINDS).filter((k) => k.category === cat);
      return acc;
    },
    {} as Record<NodeCategory, NodeKindSpec[]>,
  );

// The shape of `data` carried by every system node on the canvas.
export interface SystemNodeData {
  kind: NodeKind;
  label: string; // user-editable name for this specific node
  tech?: string; // chosen technology, e.g. "Postgres"
  notes?: string; // free-form details, feeds the generated prompt
  [key: string]: unknown; // React Flow requires an index signature on node data
}
