import type { SystemNode } from "@/components/SystemNode";
import type { NoteNode } from "@/components/NoteNode";

// Every node on the canvas is either a system component or a standalone note.
export type AppNode = SystemNode | NoteNode;
