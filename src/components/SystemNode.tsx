"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { NODE_KINDS, type SystemNodeData } from "@/lib/nodeTypes";

export type SystemNode = Node<SystemNodeData, "system">;

// A single system component on the canvas: colored card + type badge + handles.
function SystemNodeComponent({ data, selected }: NodeProps<SystemNode>) {
  const spec = NODE_KINDS[data.kind];

  return (
    <div
      className={`min-w-[160px] rounded-lg border-2 bg-white px-3 py-2 shadow-sm dark:bg-zinc-900 ${spec.accent} ${
        selected ? "ring-2 ring-black/40 dark:ring-white/40" : ""
      }`}
    >
      {/* Connection handles: target on top/left, source on bottom/right. */}
      <Handle type="target" position={Position.Top} className="!bg-zinc-400" />
      <Handle type="target" position={Position.Left} className="!bg-zinc-400" />

      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${spec.dot}`} />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {spec.label}
        </span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {data.label}
      </div>
      {data.tech ? (
        <div className="mt-0.5 text-xs text-zinc-500">{data.tech}</div>
      ) : null}

      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400" />
      <Handle type="source" position={Position.Right} className="!bg-zinc-400" />
    </div>
  );
}

export default memo(SystemNodeComponent);
