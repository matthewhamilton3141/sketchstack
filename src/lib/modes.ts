import type { DiagramMode } from "@/lib/nodeTypes";

// Per-mode configuration that tailors the generated prompt (headings + the
// closing instructions). The node pack for each mode lives in nodeTypes.ts.
export interface ModeConfig {
  id: DiagramMode;
  label: string; // shown in the mode switcher
  promptTitle: string; // top heading of the generated prompt
  itemsHeading: string; // section title for the nodes
  connectionsHeading: string; // section title for the edges
  emptyHint: string; // shown when the canvas is empty
  instructions: string; // closing "## Instructions" text for the agent
}

export const MODES: Record<DiagramMode, ModeConfig> = {
  system: {
    id: "system",
    label: "System Design",
    promptTitle: "System Design",
    itemsHeading: "Components",
    connectionsHeading: "Connections / Data Flow",
    emptyHint: "Add some components to the canvas to generate a spec.",
    instructions:
      "Implement the system described above. Treat each component as a distinct " +
      "part of the architecture, use the specified technologies where given, and " +
      "honor the connections as the data flow between components.",
  },
  appflow: {
    id: "appflow",
    label: "App / UI Flow",
    promptTitle: "App / UI Flow",
    itemsHeading: "Screens & UI",
    connectionsHeading: "Navigation & Actions",
    emptyHint: "Add screens and UI to the canvas to generate a spec.",
    instructions:
      "Build the screens and UI described above and wire up the navigation. Each " +
      "connection is a transition or action from one screen/element to another; " +
      "implement the routing and interactions accordingly.",
  },
  database: {
    id: "database",
    label: "Database Schema",
    promptTitle: "Database Schema",
    itemsHeading: "Tables & Types",
    connectionsHeading: "Relations",
    emptyHint: "Add tables to the canvas to generate a schema.",
    instructions:
      "Generate the database schema described above as models/migrations. Each " +
      "connection is a relationship between tables; infer sensible foreign keys " +
      "and cardinality from the labels.",
  },
  planning: {
    id: "planning",
    label: "Task Planning",
    promptTitle: "Project Plan",
    itemsHeading: "Work Items",
    connectionsHeading: "Dependencies",
    emptyHint: "Add work items to the canvas to generate a plan.",
    instructions:
      "Turn the work items above into an ordered implementation plan. Each " +
      "connection is a dependency (the source must be done before the target); " +
      "produce a step-by-step checklist that respects the dependency order.",
  },
  infra: {
    id: "infra",
    label: "Infrastructure",
    promptTitle: "Cloud Infrastructure",
    itemsHeading: "Resources",
    connectionsHeading: "Traffic / Data Flow",
    emptyHint: "Add cloud resources to the canvas to generate an infrastructure spec.",
    instructions:
      "Provision the cloud infrastructure described above using infrastructure-as-code " +
      "(Terraform, Pulumi, or CloudFormation). Treat each resource as a discrete cloud " +
      "primitive, use the specified services where given, and wire up the connections " +
      "as traffic routing, data flow, or IAM trust relationships.",
  },
};

export const MODE_ORDER: DiagramMode[] = [
  "system",
  "appflow",
  "database",
  "planning",
  "infra",
];
