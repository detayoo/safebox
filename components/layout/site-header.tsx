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
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
        <Link
          href="/appointments"
          className="shrink-0 text-sm font-semibold tracking-tight whitespace-nowrap"
        >
          Clinic Desk
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3",
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
