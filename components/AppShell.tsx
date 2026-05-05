import Link from "next/link";
import { Activity, AlertTriangle, ClipboardCheck, Database, Inbox, LayoutDashboard, PlayCircle } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/runs", label: "Runs", icon: PlayCircle },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/failure-ops", label: "Failure Ops", icon: AlertTriangle },
  { href: "/evals", label: "Evals", icon: ClipboardCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-5 py-6 md:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-accent text-white">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-base font-semibold text-ink">APEX V1</div>
            <div className="text-xs text-muted">Meeting Intelligence</div>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded px-3 py-2 text-sm text-ink hover:bg-panel"
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
