import type { SystemNode } from "@/components/SystemNode";
import type { NoteNode } from "@/components/NoteNode";
import type { GroupNode } from "@/components/GroupNode";

// Every node on the canvas is a system component, a standalone note, or a
// labelled group/swimlane that organises other nodes.
export type AppNode = SystemNode | NoteNode | GroupNode;
