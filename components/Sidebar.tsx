"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useUser } from "@clerk/nextjs";
import { HomeIcon, FileTextIcon, LinkIcon, PlusIcon, SparklesIcon, XIcon } from "@/components/icons";

const mainLinks = [
  { href: "/", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/experiences", label: "Experiences", icon: FileTextIcon },
  { href: "/resources", label: "Resources", icon: LinkIcon },
];

const contributeLinks = [
  { href: "/submit-experience", label: "Share Experience", icon: PlusIcon },
  { href: "/submit-resource", label: "Add Resource", icon: PlusIcon },
];

const advancedLinks = [
  { href: "/quiz", label: "Take a Quiz", icon: SparklesIcon },
  { href: "/interview-simulator", label: "Mock Interview", icon: SparklesIcon },
];

const personalLinks = [
  { href: "/my-dashboard", label: "My Dashboard", icon: HomeIcon },
];

function NavSection({
  title,
  links,
  pathname,
  onNavigate,
}: {
  title: string;
  links: typeof mainLinks;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] opacity-70">{title}</p>
      <div className="mt-2 flex flex-col gap-0.5">
        {links.map((link) => {
          const active = "exact" in link && link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/25"
                  : "text-[var(--text-secondary)] hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <link.icon width={17} height={17} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--surface-card)] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Logo />
            Placement Hub
          </Link>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800" aria-label="Close menu">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-2">
          <NavSection title="Main" links={mainLinks} pathname={pathname} onNavigate={onClose} />
          <NavSection title="Contribute" links={contributeLinks} pathname={pathname} onNavigate={onClose} />
          <NavSection title="Advanced Tools" links={advancedLinks} pathname={pathname} onNavigate={onClose} />
          
          {isSignedIn && (
            <NavSection title="Personal" links={personalLinks} pathname={pathname} onNavigate={onClose} />
          )}
        </nav>

        <div className="m-3 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
          <SparklesIcon width={20} height={20} />
          <p className="mt-2 text-sm font-semibold">AI summaries</p>
          <p className="mt-1 text-xs text-indigo-100">
            Every experience gets a one-click Gemini TL;DR and topic tags.
          </p>
        </div>
      </aside>
    </>
  );
}
