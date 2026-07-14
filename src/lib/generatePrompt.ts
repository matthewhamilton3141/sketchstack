import type { Edge } from "@xyflow/react";
import { NODE_KINDS } from "@/lib/nodeTypes";
import type { SystemNode } from "@/components/SystemNode";

// Turn the diagram into a clean, structured Markdown spec that a user can
// paste into an AI coding agent. Pure function of (nodes, edges) so it's easy
// to test and reuse.
export function generatePrompt(
  nodes: SystemNode[],
  edges: Edge[],
  title = "Untitled system",
): string {
  if (nodes.length === 0) {
    return "# " + title + "\n\n_Add some components to the canvas to generate a spec._\n";
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lines: string[] = [];

  lines.push(`# System Design: ${title}`);
  lines.push("");

  // --- Components ---
  lines.push("## Components");
  for (const node of nodes) {
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
