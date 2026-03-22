"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
          <div className="nav-logo-wrap">
            <Image src="/logo.png" alt="Digitally Born" width={36} height={36} className="nav-logo" priority />
          </div>
          <span className="nav-name">Digitally Born</span>
        </Link>
        <div className="nav-links">
          <Link href="/#about" className="nav-link">About</Link>
          <Link href="/#principles" className="nav-link">Principles</Link>
          <Link href="/login" className={`nav-link${pathname === "/login" ? " active" : ""}`}>Member login</Link>
          <Link href="/apply" className={`nav-apply${pathname === "/apply" ? " active" : ""}`}>Apply to join</Link>
        </div>
        <button
          className="nav-hamburger"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </nav>
      {open && (
        <>
          <div className="nav-mobile-backdrop" onClick={() => setOpen(false)} />
          <div className="nav-mobile-menu">
            <Link href="/#about" className="nav-mobile-link" onClick={() => setOpen(false)}>About</Link>
            <Link href="/#principles" className="nav-mobile-link" onClick={() => setOpen(false)}>Principles</Link>
            <Link href="/login" className={`nav-mobile-link${pathname === "/login" ? " active" : ""}`} onClick={() => setOpen(false)}>Member login</Link>
            <Link href="/apply" className="nav-mobile-apply" onClick={() => setOpen(false)}>Apply to join</Link>
          </div>
        </>
      )}
    </>
  );
}
