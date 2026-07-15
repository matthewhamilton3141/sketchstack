import type { Edge } from "@xyflow/react";
import { CATEGORY_ORDER, NODE_KINDS } from "@/lib/nodeTypes";
import type { SystemNode } from "@/components/SystemNode";
import type { NoteNode } from "@/components/NoteNode";
import type { AppNode } from "@/lib/appNode";

// Turn the diagram into a clean, structured Markdown spec that a user can
// paste into an AI coding agent. Pure function of (nodes, edges) so it's easy
// to test and reuse.
export function generatePrompt(
  nodes: AppNode[],
  edges: Edge[],
  title = "Untitled system",
): string {
  const heading = title.trim() || "Untitled system";
  const systemNodes = nodes.filter(
    (n): n is SystemNode => n.type === "system",
  );
  const noteNodes = nodes.filter((n): n is NoteNode => n.type === "note");

  if (systemNodes.length === 0 && noteNodes.length === 0) {
    return `# ${heading}\n\n_Add some components to the canvas to generate a spec._\n`;
  }

  const byId = new Map(systemNodes.map((n) => [n.id, n]));
  const lines: string[] = [];

  lines.push(`# System Design: ${heading}`);
  lines.push("");

  if (systemNodes.length > 0) {
    // --- Components, grouped by category so related pieces read together ---
    lines.push("## Components");
    for (const category of CATEGORY_ORDER) {
      const inCategory = systemNodes.filter(
        (n) => NODE_KINDS[n.data.kind].category === category,
      );
      if (inCategory.length === 0) continue;

      lines.push(`\n### ${category}`);
      for (const node of inCategory) {
        const spec = NODE_KINDS[node.data.kind];
        const tech = node.data.tech?.trim();
        const head = tech
          ? `**${node.data.label}** (${spec.label} — ${tech})`
          : `**${node.data.label}** (${spec.label})`;
        lines.push(`- ${head}`);
        const notes = node.data.notes?.trim();
        if (notes) {
          for (const line of notes.split("\n")) {
            lines.push(`  - ${line}`);
          }
        }
      }
    }
    lines.push("");

    // --- Connections / data flow ---
    lines.push("## Connections / Data Flow");
    if (edges.length === 0) {
      lines.push("- _No connections drawn yet._");
    } else {
      for (const edge of edges) {
        const source = byId.get(edge.source)?.data.label ?? edge.source;
        const target = byId.get(edge.target)?.data.label ?? edge.target;
        const label =
          typeof edge.label === "string" && edge.label.trim()
            ? `: ${edge.label.trim()}`
            : "";
        lines.push(`- ${source} → ${target}${label}`);
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
  }

  // --- Notes the user chose to include ---
  const notesLines = buildNotesSection(noteNodes);
  if (notesLines.length > 0) {
    lines.push("## Notes");
    lines.push(...notesLines);
    lines.push("");
  }

  // --- Instructions for the agent ---
  lines.push("## Instructions");
  lines.push(
    "Implement the system described above. Treat each component as a distinct " +
      "part of the architecture, use the specified technologies where given, and " +
      "honor the connections as the data flow between components.",
  );
  lines.push("");

  return lines.join("\n");
}

// Build the note lines honoring each note's promptInclude setting:
// "none" is skipped, "bullets" emits top-level text only, "full" adds the
// indented sub-comments.
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
