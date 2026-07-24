import type { Metadata } from "next";
import EmbedDiagram from "@/components/EmbedDiagram";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Minimal iframe-embeddable view of a public diagram. No chrome — just the
// canvas and a small watermark. Pair with the Content-Security-Policy header
// set in next.config.ts to allow cross-origin embedding.
export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="h-screen w-screen">
      <EmbedDiagram id={id} />
    </div>
  );
}
