"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { NODE_KINDS, BADGE_CONFIG, type SystemNodeData } from "@/lib/nodeTypes";

export type SystemNode = Node<SystemNodeData, "system">;

const handleClass =
  "!h-3 !w-3 !border-2 !border-[var(--panel)] transition-transform hover:!scale-125";

// A single system component on the canvas: colored card + icon + handles.
function SystemNodeComponent({ data, selected }: NodeProps<SystemNode>) {
  const spec = NODE_KINDS[data.kind];
  const Icon = spec.icon;
  const color = data.color ?? spec.color;

  return (
    <div
      style={{ borderColor: color }}
      className={`min-w-[168px] rounded-xl border-2 bg-[var(--panel)] px-3 py-2 shadow-md ${
        selected ? "ring-2 ring-offset-1 ring-[var(--muted)]" : ""
      }`}
    >
      <Handle id="top" type="source" position={Position.Top} isConnectableStart isConnectableEnd style={{ background: color }} className={handleClass} />
      <Handle id="left" type="source" position={Position.Left} isConnectableStart isConnectableEnd style={{ background: color }} className={handleClass} />

      <div className="flex items-center gap-1.5">
        <Icon size={14} style={{ color: color }} strokeWidth={2.25} />
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

      {data.badges && data.badges.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.badges.map((badge) => {
            const cfg = BADGE_CONFIG[badge];
            return (
              <span
                key={badge}
                style={{
                  color: cfg.color,
                  borderColor: `${cfg.color}55`,
                  backgroundColor: `${cfg.color}18`,
                }}
                className="rounded border px-1 py-px text-[9px] font-semibold uppercase tracking-wide"
              >
                {cfg.label}
              </span>
            );
          })}
        </div>
      ) : null}

      <Handle id="bottom" type="source" position={Position.Bottom} isConnectableStart isConnectableEnd style={{ background: color }} className={handleClass} />
      <Handle id="right" type="source" position={Position.Right} isConnectableStart isConnectableEnd style={{ background: color }} className={handleClass} />
    </div>
  );
}

export default memo(SystemNodeComponent);
