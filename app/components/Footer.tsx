import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <span>&copy; 2026 Digitally Born. All rights reserved.</span>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/apply">Apply</Link>
        <Link href="#">Privacy</Link>
      </div>
    </footer>
  );
}
