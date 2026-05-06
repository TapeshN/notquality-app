"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/playgrounds/legacy/products", label: "Products" },
  { href: "/playgrounds/legacy/cart", label: "Cart" },
  { href: "/playgrounds/legacy/orders", label: "Orders" },
  { href: "/playgrounds/legacy/dashboard", label: "Dashboard" },
];

export default function LegacyNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function loadCartCount() {
      const response = await fetch("/api/cart/items", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      const quantityCount = items.reduce((sum: number, item: { quantity?: number }) => {
        return sum + (item.quantity ?? 0);
      }, 0);
      setCartCount(quantityCount);
    }

    void loadCartCount();
    // BUG LG-002: cart count only loads on mount and remains stale after adds.
  }, []);

  return (
    <nav
      className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
      data-testid="legacy-nav"
    >
      <ul className="flex flex-wrap items-center gap-2 sm:gap-4">
        {LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const baseClass =
            "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400";
          const activeClass = isActive
            ? "bg-zinc-200 text-zinc-900"
            : "text-zinc-300 hover:bg-zinc-800 hover:text-white";

          return (
            <li key={link.href} className="flex items-center">
              <Link href={link.href} className={`${baseClass} ${activeClass}`}>
                {link.label}
              </Link>
              {link.label === "Cart" ? (
                <span
                  className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-100"
                  data-testid="cart-count"
                >
                  {cartCount}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
