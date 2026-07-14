import Canvas from "@/components/Canvas";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <span className="text-lg font-semibold tracking-tight">sysdesign</span>
        <span className="text-sm text-zinc-500">— sketch your system, generate a prompt</span>
      </header>
      <main className="flex-1">
        <Canvas />
      </main>
    </div>
  );
}
