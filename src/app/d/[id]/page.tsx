import SharedDiagram from "@/components/SharedDiagram";

// Public, read-only view of a shared diagram.
export default async function SharedDiagramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharedDiagram id={id} />;
}
