import type { Edge } from "@xyflow/react";
import {
  ALL_CATEGORY_ORDER,
  NODE_KINDS,
  BADGE_CONFIG,
  type DiagramMode,
} from "@/lib/nodeTypes";
import { MODES } from "@/lib/modes";
import type { SystemNode } from "@/components/SystemNode";
import type { NoteNode } from "@/components/NoteNode";
import type { AppNode } from "@/lib/appNode";

// Turn the diagram into a clean, structured Markdown spec that a user can paste
// into an AI coding agent. The mode tailors the headings and instructions.
export function generatePrompt(
  nodes: AppNode[],
  edges: Edge[],
  title = "Untitled",
  mode: DiagramMode = "system",
): string {
  const cfg = MODES[mode];
  const heading = title.trim() || "Untitled";
  const systemNodes = nodes.filter(
    (n): n is SystemNode => n.type === "system",
  );
  const noteNodes = nodes.filter((n): n is NoteNode => n.type === "note");

  if (systemNodes.length === 0 && noteNodes.length === 0) {
    return `# ${heading}\n\n_${cfg.emptyHint}_\n`;
  }

  const byId = new Map(systemNodes.map((n) => [n.id, n]));
  const lines: string[] = [];

  lines.push(`# ${cfg.promptTitle}: ${heading}`);
  lines.push("");

  if (systemNodes.length > 0) {
    // --- Items, grouped by category so related pieces read together ---
    lines.push(`## ${cfg.itemsHeading}`);
    for (const category of ALL_CATEGORY_ORDER) {
      const inCategory = systemNodes.filter(
        (n) => NODE_KINDS[n.data.kind].category === category,
      );
      if (inCategory.length === 0) continue;

      lines.push(`\n### ${category}`);
      for (const node of inCategory) {
        const spec = NODE_KINDS[node.data.kind];
        const tech = node.data.tech?.trim();
        const badges = node.data.badges ?? [];
        const head = tech
          ? `**${node.data.label}** (${spec.label} — ${tech})`
          : `**${node.data.label}** (${spec.label})`;
        const badgeSuffix = badges.length
          ? ` [${badges.map((b) => BADGE_CONFIG[b].label).join(", ")}]`
          : "";
        lines.push(`- ${head}${badgeSuffix}`);
        const notes = node.data.notes?.trim();
        if (notes) {
          for (const line of notes.split("\n")) {
            lines.push(`  - ${line}`);
          }
        }
      }
    }
    lines.push("");

    // --- Connections / relationships ---
    lines.push(`## ${cfg.connectionsHeading}`);
    if (edges.length === 0) {
      lines.push("- _No connections drawn yet._");
    } else {
      const byPair = new Map(edges.map((e) => [`${e.source}|${e.target}`, e]));
      const emitted = new Set<string>();
      const nameOf = (id: string) => byId.get(id)?.data.label ?? id;
      const labelOf = (e: Edge) =>
        typeof e.label === "string" ? e.label.trim() : "";
      const styleOf = (e: Edge): string => {
        const s = e.data?.edgeStyle as string | undefined;
        if (s === "dashed") return " [async]";
        if (s === "dotted") return " [event]";
        return "";
      };

      for (const edge of edges) {
        if (emitted.has(edge.id)) continue;
        const reverse = byPair.get(`${edge.target}|${edge.source}`);
        const source = nameOf(edge.source);
        const target = nameOf(edge.target);

        if (reverse && reverse.id !== edge.id) {
          emitted.add(edge.id);
          emitted.add(reverse.id);
          const labels = [labelOf(edge), labelOf(reverse)].filter(Boolean);
          const suffix = labels.length ? `: ${labels.join(" / ")}` : "";
          lines.push(`- ${source} ↔ ${target}${suffix}`);
        } else {
          emitted.add(edge.id);
          const label = labelOf(edge);
          const style = styleOf(edge);
          lines.push(
            `- ${source} → ${target}${label ? `: ${label}` : ""}${style}`,
          );
        }
      }
    }
    lines.push("");

    // --- Flag any components that aren't wired to anything ---
    const connectedIds = new Set<string>();
    for (const edge of edges) {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    }
    const orphans = systemNodes.filter((n) => !connectedIds.has(n.id));
    if (orphans.length > 0) {
      lines.push("## Unconnected components");
      lines.push(
        "_These aren't wired to anything yet — decide how they fit or remove them:_",
      );
      for (const node of orphans) {
        lines.push(`- ${node.data.label} (${NODE_KINDS[node.data.kind].label})`);
      }
      lines.push("");
    }

    // --- Critical path ---
    const criticalPath = findCriticalPath(systemNodes, edges);
    if (criticalPath.length >= 2) {
      lines.push("## Critical Path");
      lines.push(
        "_Longest dependency chain — components on this path are load-bearing:_",
      );
      const pathNames = criticalPath.map(
        (id) => byId.get(id)?.data.label ?? id,
      );
      lines.push(`- ${pathNames.join(" → ")} (${criticalPath.length} hops)`);
      lines.push("");
    }
  }

  // --- Notes the user chose to include ---
  const notesLines = buildNotesSection(noteNodes);
  if (notesLines.length > 0) {
    lines.push("## Notes");
    lines.push(...notesLines);
    lines.push("");
  }

  // --- Instructions for the agent (mode-specific) ---
  lines.push("## Instructions");
  lines.push(cfg.instructions);
  lines.push("");

  return lines.join("\n");
}

// Topological-sort + DP longest-path. Returns the node ID sequence of the
// longest directed path, or [] if the graph has no edges or contains a cycle.
function findCriticalPath(nodes: SystemNode[], edges: Edge[]): string[] {
  if (nodes.length === 0 || edges.length === 0) return [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);

  const inDegree = new Map<string, number>();
  for (const n of nodes) inDegree.set(n.id, 0);

  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // Kahn's topological sort
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  const workQueue = [...queue];
  while (workQueue.length > 0) {
    const curr = workQueue.shift()!;
    order.push(curr);
    for (const next of adj.get(curr) ?? []) {
      const d = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, d);
      if (d === 0) workQueue.push(next);
    }
  }

  if (order.length < nodes.length) return []; // cycle — skip

  // DP longest path
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const id of nodes.map((n) => n.id)) {
    dist.set(id, 0);
    prev.set(id, null);
  }

  for (const id of order) {
    for (const next of adj.get(id) ?? []) {
      const newDist = (dist.get(id) ?? 0) + 1;
      if (newDist > (dist.get(next) ?? 0)) {
        dist.set(next, newDist);
        prev.set(next, id);
      }
    }
  }

  let maxDist = 0;
  let endNode = "";
  for (const [id, d] of dist) {
    if (d > maxDist) {
      maxDist = d;
      endNode = id;
    }
  }

  if (maxDist < 1 || !endNode) return [];

  // Trace back
  const path: string[] = [];
  let curr: string | null | undefined = endNode;
  while (curr) {
    path.unshift(curr);
    curr = prev.get(curr);
  }

  return path.length >= 2 ? path : [];
}

// Build the note lines honoring each note's promptInclude setting.
function buildNotesSection(noteNodes: NoteNode[]): string[] {
  const lines: string[] = [];
  for (const note of noteNodes) {
    if (note.data.promptInclude === "none") continue;
    for (const bullet of note.data.bullets) {
      const text = bullet.text.trim();
      const hasChildren = bullet.children.some((c) => c.trim());
      if (!text && !hasChildren) continue;
      lines.push(`- ${text || "(untitled)"}`);
      if (note.data.promptInclude === "full") {
        for (const child of bullet.children) {
          if (child.trim()) lines.push(`  - ${child.trim()}`);
        }
      }
    }
  }
  return lines;
}
