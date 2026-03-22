"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/applications", label: "Applications", icon: "◻" },
  { href: "/admin/members", label: "Members", icon: "◆" },
  { href: "/admin/events", label: "Events", icon: "◇" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Login page gets no chrome
  if (pathname === "/admin/login") {
    return <div className="admin-login-wrap">{children}</div>;
  }

  return (
    <div className="admin-overlay">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="login-mark" style={{ margin: 0 }}>DB</div>
            <div>
              <div className="admin-logo-name">Digitally Born</div>
              <div className="admin-logo-sub">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleSignOut}
            className="admin-signout"
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
