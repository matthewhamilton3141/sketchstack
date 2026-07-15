"use client";

import { useTheme, type Theme } from "@/components/ThemeProvider";

const OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: "light", icon: "☀️", label: "Light" },
  { value: "dusk", icon: "🌆", label: "Dusk" },
  { value: "dark", icon: "🌙", label: "Dark" },
];

// Segmented 3-way theme switcher.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          className={`rounded-md px-2 py-1 text-sm transition-colors ${
            theme === opt.value
              ? "bg-[var(--panel-2)]"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
