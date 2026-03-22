"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <div className="nav-mark">DB</div>
        <span className="nav-name">Digitally Born</span>
      </Link>
      <div className="nav-links">
        <Link href="/#about" className="nav-link">About</Link>
        <Link href="/#principles" className="nav-link">Principles</Link>
        <Link href="/login" className={`nav-link${pathname === "/login" ? " active" : ""}`}>Member login</Link>
        <Link href="/apply" className={`nav-apply${pathname === "/apply" ? " active" : ""}`}>Apply to join</Link>
      </div>
    </nav>
  );
}
