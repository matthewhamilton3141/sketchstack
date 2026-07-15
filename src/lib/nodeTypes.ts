// Single source of truth for the kinds of nodes a system diagram can contain.
// Components render from this, and the prompt generator reads from it too, so
// adding a new kind is a one-place change. Colors are hex (not Tailwind
// classes) so they also work for the minimap and inline styles.

import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Clock,
  Cog,
  CreditCard,
  Database,
  DoorOpen,
  ExternalLink,
  Globe,
  HardDrive,
  KeyRound,
  Mails,
  Monitor,
  Network,
  Scale,
  Server,
  Sparkles,
  Warehouse,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NodeKind =
  | "frontend"
  | "api"
  | "database"
  | "gateway"
  | "loadbalancer"
  | "cdn"
  | "cache"
  | "queue"
  | "worker"
  | "scheduler"
  | "monitoring"
  | "auth"
  | "external"
  | "storage"
  | "payment"
  | "notification"
  | "analytics"
  | "llm"
  | "vectordb"
  | "agent"
  | "pipeline"
  | "warehouse";

export type NodeCategory =
  | "Web/API core"
  | "Async & infra"
  | "External & auth"
  | "AI / data";

export interface NodeKindSpec {
  kind: NodeKind;
  label: string;
  category: NodeCategory;
  color: string; // hex accent color for this kind
  icon: LucideIcon; // SVG icon shown on the card and palette chip
  techHint: string; // placeholder for the "tech" field
}

export const NODE_KINDS: Record<NodeKind, NodeKindSpec> = {
  // --- Web/API core ---
  frontend: { kind: "frontend", label: "Frontend", category: "Web/API core", color: "#38bdf8", icon: Monitor, techHint: "Next.js, React Native…" },
  api: { kind: "api", label: "API / Backend", category: "Web/API core", color: "#a78bfa", icon: Server, techHint: "Node/Express, FastAPI…" },
  database: { kind: "database", label: "Database", category: "Web/API core", color: "#34d399", icon: Database, techHint: "Postgres, MongoDB…" },
  gateway: { kind: "gateway", label: "API Gateway", category: "Web/API core", color: "#22d3ee", icon: DoorOpen, techHint: "Kong, AWS API Gateway…" },
  loadbalancer: { kind: "loadbalancer", label: "Load Balancer", category: "Web/API core", color: "#60a5fa", icon: Scale, techHint: "Nginx, ALB…" },
  cdn: { kind: "cdn", label: "CDN", category: "Web/API core", color: "#818cf8", icon: Globe, techHint: "Cloudflare, Fastly…" },

  // --- Async & infra ---
  cache: { kind: "cache", label: "Cache", category: "Async & infra", color: "#fb923c", icon: Zap, techHint: "Redis, Memcached…" },
  queue: { kind: "queue", label: "Queue / Events", category: "Async & infra", color: "#fbbf24", icon: Mails, techHint: "SQS, Kafka, RabbitMQ…" },
  worker: { kind: "worker", label: "Worker / Job", category: "Async & infra", color: "#facc15", icon: Cog, techHint: "Background jobs…" },
  scheduler: { kind: "scheduler", label: "Scheduler", category: "Async & infra", color: "#f87171", icon: Clock, techHint: "cron, Temporal…" },
  monitoring: { kind: "monitoring", label: "Monitoring", category: "Async & infra", color: "#a3e635", icon: Activity, techHint: "Datadog, Sentry…" },

  // --- External & auth ---
  auth: { kind: "auth", label: "Auth", category: "External & auth", color: "#fb7185", icon: KeyRound, techHint: "Supabase Auth, Clerk…" },
  external: { kind: "external", label: "External API", category: "External & auth", color: "#f472b6", icon: ExternalLink, techHint: "any third-party API…" },
  storage: { kind: "storage", label: "Storage", category: "External & auth", color: "#2dd4bf", icon: HardDrive, techHint: "S3, Supabase Storage…" },
  payment: { kind: "payment", label: "Payments", category: "External & auth", color: "#4ade80", icon: CreditCard, techHint: "Stripe, PayPal…" },
  notification: { kind: "notification", label: "Notifications", category: "External & auth", color: "#c084fc", icon: Bell, techHint: "Resend, Twilio…" },
  analytics: { kind: "analytics", label: "Analytics", category: "External & auth", color: "#e879f9", icon: BarChart3, techHint: "PostHog, GA…" },

  // --- AI / data ---
  llm: { kind: "llm", label: "LLM / AI", category: "AI / data", color: "#d946ef", icon: Sparkles, techHint: "Claude, GPT…" },
  vectordb: { kind: "vectordb", label: "Vector DB", category: "AI / data", color: "#6366f1", icon: Network, techHint: "Pinecone, pgvector…" },
  agent: { kind: "agent", label: "AI Agent", category: "AI / data", color: "#a855f7", icon: Bot, techHint: "Claude agent, LangGraph…" },
  pipeline: { kind: "pipeline", label: "Data Pipeline", category: "AI / data", color: "#84cc16", icon: Workflow, techHint: "Airflow, dbt…" },
  warehouse: { kind: "warehouse", label: "Data Warehouse", category: "AI / data", color: "#94a3b8", icon: Warehouse, techHint: "Snowflake, BigQuery…" },
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
