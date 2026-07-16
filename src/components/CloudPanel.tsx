"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listDiagrams,
  setPublic,
  MAX_CLOUD_DIAGRAMS,
  type CloudDiagramSummary,
} from "@/lib/cloudDiagrams";

interface CloudPanelProps {
  currentName: string;
  currentCloudId: string | null;
  onSave: (asNew: boolean) => Promise<void>;
  onOpen: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CloudPanel({
  currentName,
  currentCloudId,
  onSave,
  onOpen,
  onDelete,
  onClose,
}: CloudPanelProps) {
  const [list, setList] = useState<CloudDiagramSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/d/${id}`,
      );
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  const refresh = useCallback(async () => {
    try {
      setList(await listDiagrams());
      setError(null);
    } catch {
      setError(
        "Couldn't load your diagrams. Make sure you've run supabase/diagrams.sql.",
      );
      setList([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const atCap = (list?.length ?? 0) >= MAX_CLOUD_DIAGRAMS;

  const run = async (fn: () => Promise<void>, thenRefreshOnly = false) => {
    setBusy(true);
    try {
      await fn();
      if (thenRefreshOnly) await refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-md flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text)]">
            My diagrams{" "}
            <span className="text-[var(--muted)]">
              ({list?.length ?? "…"}/{MAX_CLOUD_DIAGRAMS})
            </span>
          </span>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)]"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Save the current canvas */}
        <div className="border-b border-[var(--border)] p-4">
          <div className="mb-2 text-xs text-[var(--muted)]">
            Current: <span className="text-[var(--text)]">{currentName}</span>
          </div>
          <div className="flex gap-2">
            {currentCloudId ? (
              <button
                disabled={busy}
                onClick={() => run(() => onSave(false), true)}
                className="flex-1 rounded-md bg-[var(--btn-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)] disabled:opacity-60"
              >
                Update this diagram
              </button>
            ) : (
              <button
                disabled={busy || atCap}
                onClick={() => run(() => onSave(true), true)}
                className="flex-1 rounded-md bg-[var(--btn-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--btn-text)] hover:bg-[var(--btn-hover)] disabled:opacity-60"
                title={atCap ? "Delete one to free a slot" : undefined}
              >
                Save to cloud
              </button>
            )}
            {currentCloudId ? (
              <button
                disabled={busy || atCap}
                onClick={() => run(() => onSave(true), true)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-40"
                title={atCap ? "Delete one to free a slot" : "Save a copy"}
              >
                Save as new
              </button>
            ) : null}
          </div>
          {atCap ? (
            <div className="mt-2 text-[11px] text-[var(--muted)]">
              You&apos;ve reached {MAX_CLOUD_DIAGRAMS} saved diagrams — delete one
              to save a new one.
            </div>
          ) : null}
        </div>

        {/* List */}
        <div className="min-h-[80px] flex-1 overflow-y-auto p-2">
          {error ? (
            <div className="p-3 text-sm text-red-500">{error}</div>
          ) : list === null ? (
            <div className="p-3 text-sm text-[var(--muted)]">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-3 text-sm text-[var(--muted)]">
              No saved diagrams yet.
            </div>
          ) : (
            list.map((d) => (
              <div
                key={d.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                  d.id === currentCloudId ? "bg-[var(--panel-2)]" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-[var(--text)]">
                    {d.name}
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {d.mode} · {timeAgo(d.updated_at)}
                    {d.is_public ? (
                      <>
                        {" · "}
                        <span className="text-emerald-500">Public</span>
                        {" · "}
                        <button
                          disabled={busy}
                          onClick={() => run(() => setPublic(d.id, false), true)}
                          className="hover:text-[var(--text)] disabled:opacity-40"
                        >
                          unshare
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  disabled={busy}
                  onClick={() => run(() => onOpen(d.id))}
                  className="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-40"
                >
                  Open
                </button>
                {d.is_public ? (
                  <button
                    disabled={busy}
                    onClick={() => copyLink(d.id)}
                    className="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)] hover:bg-[var(--panel-2)] disabled:opacity-40"
                  >
                    {copiedId === d.id ? "Copied!" : "Copy link"}
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await setPublic(d.id, true);
                        await copyLink(d.id);
                      }, true)
                    }
                    className="rounded border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-40"
                  >
                    Share
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => run(() => onDelete(d.id), true)}
                  className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-500 hover:bg-red-500/10 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
