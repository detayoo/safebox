"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FailureToggle } from "@/components/common/failure-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/appointments", label: "Appointments" },
  { href: "/book", label: "Book appointment" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/appointments" className="text-sm font-semibold tracking-tight">
          Clinic Desk
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <FailureToggle />
      </div>
    </header>
  );
}
