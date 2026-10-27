"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-1.5 text-sm ${
      pathname === href
        ? "bg-zinc-900 text-white"
        : "text-zinc-600 hover:bg-zinc-100"
    }`;

  return (
    <header className="border-b border-zinc-200">
      <nav className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
        <span className="mr-2 text-sm font-semibold tracking-tight">
          Summify
        </span>
        <Link href="/" className={linkClass("/")}>
          Özet
        </Link>
        <Link href="/weather" className={linkClass("/weather")}>
          Hava
        </Link>
      </nav>
    </header>
  );
}
