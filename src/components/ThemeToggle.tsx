"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const OPTIONS: { value: Theme; Icon: typeof Sun; label: string }[] = [
  { value: "light", Icon: Sun, label: "Light" },
  { value: "dark", Icon: Moon, label: "Dark" },
];

// Segmented light/dark theme switcher.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5">
      {OPTIONS.map(({ value, Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          className={`rounded-md p-1.5 text-[var(--text)] transition-colors ${
            theme === value
              ? "bg-[var(--panel-2)]"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
