// Single source of truth for the kinds of nodes a system diagram can contain.
// Components render from this, and the prompt generator reads from it too, so
// adding a new kind is a one-place change. Colors are hex (not Tailwind
// classes) so they also work for the minimap and inline styles.

import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Box,
  Bug,
  Clock,
  Cog,
  Component,
  CreditCard,
  Database,
  DoorOpen,
  Eye,
  ExternalLink,
  Flag,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Link2,
  ListChecks,
  ListTodo,
  Mails,
  Milestone as MilestoneIcon,
  Monitor,
  MousePointerClick,
  Navigation,
  Network,
  Scale,
  Server,
  Sparkles,
  Table as TableIcon,
  Warehouse,
  Workflow,
  Zap,
  BookOpen,
  Braces,
  CornerDownRight,
  FileText,
  GitFork,
  Hash,
  List,
  ListOrdered,
  Loader,
  Menu,
  MessageSquare,
  ScrollText,
  ShieldAlert,
  Timer,
  type LucideIcon,
} from "lucide-react";

// Diagrams have a mode; each mode shows its own pack of node kinds and gets a
// tailored generated prompt.
export type DiagramMode = "system" | "appflow" | "database" | "planning";

export type NodeKind =
  // System design
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
  | "warehouse"
  // App / UI flows
  | "screen"
  | "modal"
  | "nav"
  | "action"
  | "uicomponent"
  | "form"
  | "list"
  | "detail"
  | "drawer"
  | "toast"
  | "state"
  // Database schema
  | "table"
  | "view"
  | "enum"
  | "junction"
  | "sequence"
  | "index"
  | "trigger"
  | "func"
  // Feature / task planning
  | "epic"
  | "task"
  | "milestone"
  | "bug"
  | "story"
  | "subtask"
  | "sprint"
  | "risk"
  | "decision"
  // Universal
  | "custom";

export interface NodeKindSpec {
  kind: NodeKind;
  label: string;
  category: string; // grouping shown in the palette + prompt (mode-specific)
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

  // --- App / UI flows ---
  screen: { kind: "screen", label: "Screen", category: "Screens", color: "#38bdf8", icon: Monitor, techHint: "route / page" },
  modal: { kind: "modal", label: "Modal", category: "Screens", color: "#818cf8", icon: Layers, techHint: "dialog / sheet" },
  nav: { kind: "nav", label: "Navigation", category: "Navigation", color: "#22d3ee", icon: Navigation, techHint: "tab bar / menu" },
  action: { kind: "action", label: "Action", category: "Navigation", color: "#f59e0b", icon: MousePointerClick, techHint: "button / gesture" },
  drawer: { kind: "drawer", label: "Menu / Drawer", category: "Navigation", color: "#c084fc", icon: Menu, techHint: "side menu" },
  form: { kind: "form", label: "Form", category: "Screens", color: "#60a5fa", icon: FileText, techHint: "inputs / validation" },
  list: { kind: "list", label: "List / Feed", category: "Screens", color: "#2dd4bf", icon: List, techHint: "collection" },
  detail: { kind: "detail", label: "Detail View", category: "Screens", color: "#4ade80", icon: ScrollText, techHint: "single item" },
  uicomponent: { kind: "uicomponent", label: "Component", category: "UI", color: "#a855f7", icon: Component, techHint: "reusable UI" },
  toast: { kind: "toast", label: "Notification", category: "UI", color: "#fbbf24", icon: MessageSquare, techHint: "toast / alert" },
  state: { kind: "state", label: "Loading / Empty", category: "UI", color: "#94a3b8", icon: Loader, techHint: "loading / empty / error" },

  // --- Database schema ---
  table: { kind: "table", label: "Table", category: "Schema", color: "#34d399", icon: TableIcon, techHint: "columns…" },
  view: { kind: "view", label: "View", category: "Schema", color: "#2dd4bf", icon: Eye, techHint: "materialized?" },
  enum: { kind: "enum", label: "Enum", category: "Schema", color: "#fbbf24", icon: ListChecks, techHint: "values…" },
  junction: { kind: "junction", label: "Join Table", category: "Schema", color: "#94a3b8", icon: Link2, techHint: "M:N link" },
  sequence: { kind: "sequence", label: "Sequence", category: "Schema", color: "#84cc16", icon: Hash, techHint: "auto-increment id" },
  index: { kind: "index", label: "Index", category: "Indexes & Logic", color: "#38bdf8", icon: ListOrdered, techHint: "on columns…" },
  trigger: { kind: "trigger", label: "Trigger", category: "Indexes & Logic", color: "#fb923c", icon: Zap, techHint: "on insert / update…" },
  func: { kind: "func", label: "Function", category: "Indexes & Logic", color: "#d946ef", icon: Braces, techHint: "stored procedure" },

  // --- Feature / task planning ---
  epic: { kind: "epic", label: "Epic", category: "Work items", color: "#a855f7", icon: Flag, techHint: "goal" },
  story: { kind: "story", label: "Story", category: "Work items", color: "#22d3ee", icon: BookOpen, techHint: "user story" },
  task: { kind: "task", label: "Task", category: "Work items", color: "#38bdf8", icon: ListTodo, techHint: "assignee / estimate" },
  subtask: { kind: "subtask", label: "Subtask", category: "Work items", color: "#818cf8", icon: CornerDownRight, techHint: "part of a task" },
  bug: { kind: "bug", label: "Bug", category: "Work items", color: "#f87171", icon: Bug, techHint: "severity" },
  milestone: { kind: "milestone", label: "Milestone", category: "Planning", color: "#f59e0b", icon: MilestoneIcon, techHint: "target date" },
  sprint: { kind: "sprint", label: "Sprint", category: "Planning", color: "#4ade80", icon: Timer, techHint: "iteration" },
  risk: { kind: "risk", label: "Risk", category: "Planning", color: "#fb7185", icon: ShieldAlert, techHint: "blocker / risk" },
  decision: { kind: "decision", label: "Decision", category: "Planning", color: "#fbbf24", icon: GitFork, techHint: "choice / ADR" },

  // --- Universal (available in every mode; recolor + rename it yourself) ---
  custom: { kind: "custom", label: "Custom", category: "Custom", color: "#94a3b8", icon: Box, techHint: "anything…" },
};

// Which node kinds each mode offers (custom is appended to every mode).
export const MODE_KINDS: Record<DiagramMode, NodeKind[]> = {
  system: [
    "frontend", "api", "database", "gateway", "loadbalancer", "cdn",
    "cache", "queue", "worker", "scheduler", "monitoring",
    "auth", "external", "storage", "payment", "notification", "analytics",
    "llm", "vectordb", "agent", "pipeline", "warehouse",
  ],
  appflow: [
    "screen", "modal", "form", "list", "detail",
    "nav", "action", "drawer",
    "uicomponent", "toast", "state",
  ],
  database: [
    "table", "view", "enum", "junction", "sequence",
    "index", "trigger", "func",
  ],
  planning: [
    "epic", "story", "task", "subtask", "bug",
    "milestone", "sprint", "risk", "decision",
  ],
};

// Palette groups for a mode: kinds (+ the universal custom) grouped by category
// in declaration order.
export function paletteGroups(
  mode: DiagramMode,
): { category: string; kinds: NodeKindSpec[] }[] {
  const kinds = [...MODE_KINDS[mode], "custom" as NodeKind].map(
    (k) => NODE_KINDS[k],
  );
  const order: string[] = [];
  const byCat = new Map<string, NodeKindSpec[]>();
  for (const spec of kinds) {
    if (!byCat.has(spec.category)) {
      byCat.set(spec.category, []);
      order.push(spec.category);
    }
    byCat.get(spec.category)!.push(spec);
  }
  return order.map((category) => ({ category, kinds: byCat.get(category)! }));
}

// Global category order (declaration order) for grouping in the prompt.
export const ALL_CATEGORY_ORDER: string[] = Object.values(NODE_KINDS).reduce<
  string[]
>((acc, k) => {
  if (!acc.includes(k.category)) acc.push(k.category);
  return acc;
}, []);

// The shape of `data` carried by every system node on the canvas.
export interface SystemNodeData {
  kind: NodeKind;
  label: string; // user-editable name for this specific node
  tech?: string; // chosen technology, e.g. "Postgres"
  notes?: string; // free-form details, feeds the generated prompt
  color?: string; // optional per-node color override (hex); defaults to kind color
  [key: string]: unknown; // React Flow requires an index signature on node data
}
