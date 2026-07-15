"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { NODE_KINDS, type SystemNodeData } from "@/lib/nodeTypes";

export type SystemNode = Node<SystemNodeData, "system">;

const handleClass = "!h-2.5 !w-2.5 !border-2 !border-[var(--panel)]";

// A single system component on the canvas: colored card + icon + handles.
function SystemNodeComponent({ data, selected }: NodeProps<SystemNode>) {
  const spec = NODE_KINDS[data.kind];
  const Icon = spec.icon;

  return (
    <div
      style={{ borderColor: spec.color }}
      className={`min-w-[168px] rounded-lg border-2 bg-[var(--panel)] px-3 py-2 shadow-sm ${
        selected ? "ring-2 ring-[var(--muted)]" : ""
      }`}
    >
      {/* One handle per side, each with a UNIQUE id. With ConnectionMode.Loose
          (set on the canvas) any dot can start or receive a connection. */}
      <Handle id="top" type="target" position={Position.Top} style={{ background: spec.color }} className={handleClass} />
      <Handle id="left" type="target" position={Position.Left} style={{ background: spec.color }} className={handleClass} />

      <div className="flex items-center gap-1.5">
        <Icon size={14} style={{ color: spec.color }} strokeWidth={2.25} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
          {spec.label}
        </span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-[var(--text)]">
        {data.label}
      </div>
      {data.tech ? (
        <div className="mt-0.5 text-xs text-[var(--muted)]">{data.tech}</div>
      ) : null}

      <Handle id="bottom" type="source" position={Position.Bottom} style={{ background: spec.color }} className={handleClass} />
      <Handle id="right" type="source" position={Position.Right} style={{ background: spec.color }} className={handleClass} />
    </div>
  );
}

export default memo(SystemNodeComponent);
