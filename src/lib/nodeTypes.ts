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
  description: string; // one-line "what it is / when to use it" (hover + Learn)
}

export const NODE_KINDS: Record<NodeKind, NodeKindSpec> = {
  // --- Web/API core ---
  frontend: { kind: "frontend", label: "Frontend", category: "Web/API core", color: "#38bdf8", icon: Monitor, techHint: "Next.js, React Native…", description: "The user-facing client (web or mobile UI). Use it as the entry point users interact with." },
  api: { kind: "api", label: "API / Backend", category: "Web/API core", color: "#a78bfa", icon: Server, techHint: "Node/Express, FastAPI…", description: "Your backend service holding business logic. Use it between the UI and your data stores." },
  database: { kind: "database", label: "Database", category: "Web/API core", color: "#34d399", icon: Database, techHint: "Postgres, MongoDB…", description: "Durable, structured storage for core data. Use it to persist and query records." },
  gateway: { kind: "gateway", label: "API Gateway", category: "Web/API core", color: "#22d3ee", icon: DoorOpen, techHint: "Kong, AWS API Gateway…", description: "A single entry point that routes, authenticates, and rate-limits traffic. Use it in front of multiple services." },
  loadbalancer: { kind: "loadbalancer", label: "Load Balancer", category: "Web/API core", color: "#60a5fa", icon: Scale, techHint: "Nginx, ALB…", description: "Distributes traffic across instances. Use it to scale out and stay available under load." },
  cdn: { kind: "cdn", label: "CDN", category: "Web/API core", color: "#818cf8", icon: Globe, techHint: "Cloudflare, Fastly…", description: "Caches static assets at edge locations near users. Use it to serve images, JS, and video fast globally." },

  // --- Async & infra ---
  cache: { kind: "cache", label: "Cache", category: "Async & infra", color: "#fb923c", icon: Zap, techHint: "Redis, Memcached…", description: "Fast in-memory store for hot data. Use it to cut latency and take read load off the database." },
  queue: { kind: "queue", label: "Queue / Events", category: "Async & infra", color: "#fbbf24", icon: Mails, techHint: "SQS, Kafka, RabbitMQ…", description: "Buffers messages between producers and consumers. Use it to decouple services and smooth spikes." },
  worker: { kind: "worker", label: "Worker / Job", category: "Async & infra", color: "#facc15", icon: Cog, techHint: "Background jobs…", description: "Processes background jobs off the request path. Use it for slow or async tasks like emails or exports." },
  scheduler: { kind: "scheduler", label: "Scheduler", category: "Async & infra", color: "#f87171", icon: Clock, techHint: "cron, Temporal…", description: "Triggers work on a schedule (cron). Use it for recurring jobs like nightly reports or cleanups." },
  monitoring: { kind: "monitoring", label: "Monitoring", category: "Async & infra", color: "#a3e635", icon: Activity, techHint: "Datadog, Sentry…", description: "Collects logs, metrics, and errors. Use it to observe health and get alerted when things break." },

  // --- External & auth ---
  auth: { kind: "auth", label: "Auth", category: "External & auth", color: "#fb7185", icon: KeyRound, techHint: "Supabase Auth, Clerk…", description: "Handles sign-in, sessions, and identity. Use it to authenticate users and gate access." },
  external: { kind: "external", label: "External API", category: "External & auth", color: "#f472b6", icon: ExternalLink, techHint: "any third-party API…", description: "A third-party API you depend on. Use it for capabilities you don't build yourself." },
  storage: { kind: "storage", label: "Storage", category: "External & auth", color: "#2dd4bf", icon: HardDrive, techHint: "S3, Supabase Storage…", description: "Blob/object storage for files and media. Use it for uploads, images, and large binaries." },
  payment: { kind: "payment", label: "Payments", category: "External & auth", color: "#4ade80", icon: CreditCard, techHint: "Stripe, PayPal…", description: "Processes payments and billing. Use it to charge customers or run subscriptions." },
  notification: { kind: "notification", label: "Notifications", category: "External & auth", color: "#c084fc", icon: Bell, techHint: "Resend, Twilio…", description: "Sends emails, SMS, or push messages. Use it to reach users outside the app." },
  analytics: { kind: "analytics", label: "Analytics", category: "External & auth", color: "#e879f9", icon: BarChart3, techHint: "PostHog, GA…", description: "Captures product/usage events. Use it to measure behavior and track funnels." },

  // --- AI / data ---
  llm: { kind: "llm", label: "LLM / AI", category: "AI / data", color: "#d946ef", icon: Sparkles, techHint: "Claude, GPT…", description: "A large language model that generates or reasons over text. Use it for chat, summarization, or extraction." },
  vectordb: { kind: "vectordb", label: "Vector DB", category: "AI / data", color: "#6366f1", icon: Network, techHint: "Pinecone, pgvector…", description: "Stores embeddings for similarity search. Use it to power semantic search and RAG retrieval." },
  agent: { kind: "agent", label: "AI Agent", category: "AI / data", color: "#a855f7", icon: Bot, techHint: "Claude agent, LangGraph…", description: "An autonomous LLM loop that uses tools to complete tasks. Use it for multi-step, tool-driven work." },
  pipeline: { kind: "pipeline", label: "Data Pipeline", category: "AI / data", color: "#84cc16", icon: Workflow, techHint: "Airflow, dbt…", description: "Moves and transforms data between systems. Use it for ETL, ingestion, or batch processing." },
  warehouse: { kind: "warehouse", label: "Data Warehouse", category: "AI / data", color: "#94a3b8", icon: Warehouse, techHint: "Snowflake, BigQuery…", description: "Analytical store for large-scale querying. Use it for reporting and BI over historical data." },

  // --- App / UI flows ---
  screen: { kind: "screen", label: "Screen", category: "Screens", color: "#38bdf8", icon: Monitor, techHint: "route / page", description: "A full page or route in the app. Use it for each distinct destination a user navigates to." },
  modal: { kind: "modal", label: "Modal", category: "Screens", color: "#818cf8", icon: Layers, techHint: "dialog / sheet", description: "An overlay dialog on top of the current screen. Use it for focused tasks or confirmations." },
  nav: { kind: "nav", label: "Navigation", category: "Navigation", color: "#22d3ee", icon: Navigation, techHint: "tab bar / menu", description: "Primary navigation like a tab bar or menu. Use it to move between top-level areas." },
  action: { kind: "action", label: "Action", category: "Navigation", color: "#f59e0b", icon: MousePointerClick, techHint: "button / gesture", description: "A user-triggered action (button, gesture). Use it to represent an interaction that does something." },
  drawer: { kind: "drawer", label: "Menu / Drawer", category: "Navigation", color: "#c084fc", icon: Menu, techHint: "side menu", description: "A slide-out side menu or panel. Use it for secondary navigation or options." },
  form: { kind: "form", label: "Form", category: "Screens", color: "#60a5fa", icon: FileText, techHint: "inputs / validation", description: "A screen or section for user input. Use it to collect and validate data." },
  list: { kind: "list", label: "List / Feed", category: "Screens", color: "#2dd4bf", icon: List, techHint: "collection", description: "A collection or feed of items. Use it to browse many records at once." },
  detail: { kind: "detail", label: "Detail View", category: "Screens", color: "#4ade80", icon: ScrollText, techHint: "single item", description: "A view of a single item. Use it to show or edit one record in depth." },
  uicomponent: { kind: "uicomponent", label: "Component", category: "UI", color: "#a855f7", icon: Component, techHint: "reusable UI", description: "A reusable UI building block. Use it for shared elements like cards or headers." },
  toast: { kind: "toast", label: "Notification", category: "UI", color: "#fbbf24", icon: MessageSquare, techHint: "toast / alert", description: "A transient notification or alert. Use it for feedback like 'Saved' or an error." },
  state: { kind: "state", label: "Loading / Empty", category: "UI", color: "#94a3b8", icon: Loader, techHint: "loading / empty / error", description: "A loading, empty, or error state. Use it to design what a screen shows before or without data." },

  // --- Database schema ---
  table: { kind: "table", label: "Table", category: "Schema", color: "#34d399", icon: TableIcon, techHint: "columns…", description: "A relational table of rows and columns. Use it as the primary store for an entity." },
  view: { kind: "view", label: "View", category: "Schema", color: "#2dd4bf", icon: Eye, techHint: "materialized?", description: "A saved query presented as a table. Use it to simplify or precompute reads." },
  enum: { kind: "enum", label: "Enum", category: "Schema", color: "#fbbf24", icon: ListChecks, techHint: "values…", description: "A fixed set of allowed values. Use it for status/type columns with known options." },
  junction: { kind: "junction", label: "Join Table", category: "Schema", color: "#94a3b8", icon: Link2, techHint: "M:N link", description: "A join table linking two entities many-to-many. Use it to model M:N relationships." },
  sequence: { kind: "sequence", label: "Sequence", category: "Schema", color: "#84cc16", icon: Hash, techHint: "auto-increment id", description: "An auto-incrementing number generator. Use it for surrogate primary keys." },
  index: { kind: "index", label: "Index", category: "Indexes & Logic", color: "#38bdf8", icon: ListOrdered, techHint: "on columns…", description: "A lookup structure that speeds up queries. Use it on columns you filter or join often." },
  trigger: { kind: "trigger", label: "Trigger", category: "Indexes & Logic", color: "#fb923c", icon: Zap, techHint: "on insert / update…", description: "Logic that runs automatically on data changes. Use it to enforce rules or keep data in sync." },
  func: { kind: "func", label: "Function", category: "Indexes & Logic", color: "#d946ef", icon: Braces, techHint: "stored procedure", description: "A stored function or procedure. Use it to run reusable logic in the database." },

  // --- Feature / task planning ---
  epic: { kind: "epic", label: "Epic", category: "Work items", color: "#a855f7", icon: Flag, techHint: "goal", description: "A large body of work spanning many stories. Use it to group a big goal or initiative." },
  story: { kind: "story", label: "Story", category: "Work items", color: "#22d3ee", icon: BookOpen, techHint: "user story", description: "A user-facing requirement. Use it to describe value from the user's perspective." },
  task: { kind: "task", label: "Task", category: "Work items", color: "#38bdf8", icon: ListTodo, techHint: "assignee / estimate", description: "A concrete unit of work. Use it for something a person can pick up and finish." },
  subtask: { kind: "subtask", label: "Subtask", category: "Work items", color: "#818cf8", icon: CornerDownRight, techHint: "part of a task", description: "A smaller piece of a task. Use it to break a task into steps." },
  bug: { kind: "bug", label: "Bug", category: "Work items", color: "#f87171", icon: Bug, techHint: "severity", description: "A defect to fix. Use it to track something that's broken." },
  milestone: { kind: "milestone", label: "Milestone", category: "Planning", color: "#f59e0b", icon: MilestoneIcon, techHint: "target date", description: "A significant checkpoint or target date. Use it to mark a deadline or release." },
  sprint: { kind: "sprint", label: "Sprint", category: "Planning", color: "#4ade80", icon: Timer, techHint: "iteration", description: "A time-boxed iteration of work. Use it to group items delivered together." },
  risk: { kind: "risk", label: "Risk", category: "Planning", color: "#fb7185", icon: ShieldAlert, techHint: "blocker / risk", description: "A threat or blocker to the plan. Use it to surface and track what could go wrong." },
  decision: { kind: "decision", label: "Decision", category: "Planning", color: "#fbbf24", icon: GitFork, techHint: "choice / ADR", description: "A recorded choice (ADR). Use it to capture why an approach was picked." },

  // --- Universal (available in every mode; recolor + rename it yourself) ---
  custom: { kind: "custom", label: "Custom", category: "Custom", color: "#94a3b8", icon: Box, techHint: "anything…", description: "A blank node you name and color yourself. Use it for anything the presets don't cover." },
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
