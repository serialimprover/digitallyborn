"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <div className="nav-mark">DB</div>
        <span className="nav-name">Digitally Born</span>
      </Link>
      <div className="nav-links">
        <Link href="/#about" className="nav-link">About</Link>
        <Link href="/#principles" className="nav-link">Principles</Link>
        <Link href="/apply" className="nav-apply">Apply to join</Link>
      </div>
    </nav>
  );
}
