import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="footer-mark">DB</div>
        <p className="footer-tagline">An invite-only community for technology leaders in hardware engineering and manufacturing.</p>
        <div className="footer-nots">
          <span>No vendors</span>
          <span>No pitches</span>
          <span>No consultants</span>
        </div>
      </div>
      <div className="footer-right">
        <Link href="/apply" className="btn btn-ghost footer-cta">Apply for membership</Link>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/apply">Apply</Link>
          <Link href="#">Privacy</Link>
        </div>
        <span className="footer-copy">&copy; 2026 Digitally Born. All rights reserved.</span>
      </div>
    </footer>
  );
}
