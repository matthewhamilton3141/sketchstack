import Canvas from "@/components/Canvas";
import AuthBar from "@/components/AuthBar";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Sketchstack
          </span>
          <span className="hidden text-sm text-[var(--muted)] sm:inline">
            — sketch your stack, generate a prompt
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthBar />
        </div>
      </header>
      <main className="flex-1">
        <Canvas />
      </main>
    </div>
  );
}
