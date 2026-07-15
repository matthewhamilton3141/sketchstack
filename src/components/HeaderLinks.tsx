// External link buttons for the header: the GitHub repo and Matthew's portfolio
// (the polygon mark is his personal "rayquaza" logo).

const linkClass =
  "rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--text)]";

export default function HeaderLinks() {
  return (
    <div className="flex items-center gap-0.5">
      <a
        href="https://github.com/matthewhamilton3141/sketchstack"
        target="_blank"
        rel="noopener noreferrer"
        title="View on GitHub"
        aria-label="GitHub repository"
        className={linkClass}
      >
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.01.28-2.09 0-3.09 0 0-.79-.25-2.65 1.01A9.64 9.64 0 0 0 12 3c-2.35 0-4.27 1.02-5.4 2.01-1.86-1.26-2.65-1.01-2.65-1.01-.28 1-.28 2.09 0 3.09A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      </a>
      <a
        href="https://matthewhamilton.dev"
        target="_blank"
        rel="noopener noreferrer"
        title="Matthew Hamilton — portfolio"
        aria-label="Matthew Hamilton portfolio"
        className={linkClass}
      >
        <svg
          viewBox="0 0 800 1000"
          width="14"
          height="17"
          fill="currentColor"
          aria-hidden="true"
        >
          <polygon points="400,0 456,215 400,312 344,215" />
          <polygon points="0,183 283,222 186,253 371,995" />
          <polygon points="800,183 517,222 614,253 429,995" />
        </svg>
      </a>
    </div>
  );
}
