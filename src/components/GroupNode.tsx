"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps, type Node } from "@xyflow/react";
import type { GroupNodeData } from "@/lib/nodeTypes";

export type GroupNode = Node<GroupNodeData, "group">;

// A resizable, labelled swimlane / group container. Sits behind other nodes
// (zIndex: -1 is set when the node is created). Nodes dragged inside it
// automatically become children so they move with the group.
function GroupNodeComponent({ data, selected }: NodeProps<GroupNode>) {
  return (
    <div
      className={`h-full w-full rounded-xl border-2 border-dashed ${
        selected
          ? "border-[var(--text)] bg-[var(--text)]/5"
          : "border-[var(--border)] bg-[var(--panel-2)]/40"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        lineStyle={{ borderColor: "var(--muted)", borderWidth: 1 }}
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: "var(--panel)",
          border: "1px solid var(--muted)",
          borderRadius: 2,
        }}
      />
      <div className="pointer-events-none absolute left-3 top-2 select-none text-xs font-semibold text-[var(--muted)]">
        {data.label || "Group"}
      </div>
    </div>
  );
}

export default memo(GroupNodeComponent);
