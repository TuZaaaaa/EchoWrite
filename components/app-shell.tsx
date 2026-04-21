import Link from "next/link";
import {
  BookOpenText,
  FilePenLine,
  FolderKanban,
  History,
  Layers2,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Layers2 },
  { href: "/practice/new", label: "Practice", icon: FilePenLine },
  { href: "/attempts", label: "Attempts", icon: History },
  { href: "/mistakes", label: "Mistakes", icon: BookOpenText },
  { href: "/passages", label: "Passages", icon: FolderKanban },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 mb-6 rounded-[28px] border border-stone-200/80 bg-white/85 px-4 py-4 shadow-[0_6px_30px_rgba(28,25,23,0.07)] backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-stone-900 text-stone-50">
                <FilePenLine className="size-5" />
              </div>
              <div>
                <p className="font-serif text-2xl text-stone-950">EchoWrite</p>
                <p className="text-sm text-stone-500">
                  Back-translation writing trainer
                </p>
              </div>
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm text-stone-600 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-950"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
