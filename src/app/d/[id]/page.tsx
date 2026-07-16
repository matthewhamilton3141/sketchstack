import type { Metadata } from "next";
import SharedDiagram from "@/components/SharedDiagram";

// Fetch just the public diagram's name (server-side, anon key) so shared links
// preview nicely when pasted into Slack/Discord/etc. RLS only exposes public
// rows, so private/unknown ids fall back to the generic title.
async function fetchPublicName(id: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/diagrams?id=eq.${id}&is_public=eq.true&select=name`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Cache briefly; a shared diagram's name rarely changes.
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { name: string }[];
    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const name = await fetchPublicName(id);
  const title = name ? `${name} · Sketchstack` : "Shared diagram · Sketchstack";
  const description = name
    ? `View the "${name}" system-design diagram on Sketchstack.`
    : "View a shared system-design diagram on Sketchstack.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

// Public, read-only view of a shared diagram.
export default async function SharedDiagramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharedDiagram id={id} />;
}
