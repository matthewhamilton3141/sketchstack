import type { Edge } from "@xyflow/react";
import { supabase } from "@/lib/supabase";
import type { AppNode } from "@/lib/appNode";
import type { DiagramMode } from "@/lib/nodeTypes";

// How many diagrams a user may keep in the cloud (a product/cost cap; the rest
// stay in localStorage).
export const MAX_CLOUD_DIAGRAMS = 5;

// A saved diagram's payload (nodes + edges live in the `data` jsonb column).
export interface DiagramData {
  nodes: AppNode[];
  edges: Edge[];
}

// Row shape for listing (no heavy `data`).
export interface CloudDiagramSummary {
  id: string;
  name: string;
  mode: DiagramMode;
  is_public: boolean;
  updated_at: string;
}

export async function listDiagrams(): Promise<CloudDiagramSummary[]> {
  const { data, error } = await supabase
    .from("diagrams")
    .select("id, name, mode, is_public, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CloudDiagramSummary[];
}

// Toggle a diagram's public (shareable) status.
export async function setPublic(id: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from("diagrams")
    .update({ is_public: isPublic })
    .eq("id", id);
  if (error) throw error;
}

export async function loadDiagram(id: string): Promise<{
  name: string;
  mode: DiagramMode;
  data: DiagramData;
}> {
  const { data, error } = await supabase
    .from("diagrams")
    .select("name, mode, data")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as { name: string; mode: DiagramMode; data: DiagramData };
}

export async function createDiagram(
  userId: string,
  name: string,
  mode: DiagramMode,
  data: DiagramData,
): Promise<string> {
  const { data: row, error } = await supabase
    .from("diagrams")
    .insert({ user_id: userId, name, mode, data })
    .select("id")
    .single();
  if (error) throw error;
  return (row as { id: string }).id;
}

export async function updateDiagram(
  id: string,
  name: string,
  mode: DiagramMode,
  data: DiagramData,
): Promise<void> {
  const { error } = await supabase
    .from("diagrams")
    .update({ name, mode, data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDiagram(id: string): Promise<void> {
  const { error } = await supabase.from("diagrams").delete().eq("id", id);
  if (error) throw error;
}
