import Link from "next/link";
import Reveal from "./components/Reveal";

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <span className="hero-label">
          <span className="hero-label-line" />
          Private community
        </span>
        <h1>
          Where manufacturing&apos;s <em>tech leaders</em> speak freely
        </h1>
        <p className="hero-desc">
          Digitally Born is an invite-only community for CIOs, VPs of Digital, and technology
          executives at hardware engineering and manufacturing companies. No vendors. No sales pitches.
          Just honest conversations with the people who understand your challenges.
        </p>
        <div className="hero-actions">
          <Link href="/apply" className="btn btn-accent">
            Apply for membership <ArrowRight />
          </Link>
          <a href="#about" className="btn btn-ghost">Learn more</a>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-value">140+</div>
            <div className="stat-label">Vetted members</div>
          </div>
          <div>
            <div className="stat-value">68</div>
            <div className="stat-label">Companies represented</div>
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Vendor-free</div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Who It's For */}
      <Reveal>
        <section className="section" id="about">
          <div className="section-label">Who this is for</div>
          <h2 className="section-heading">
            Built for the people leading digital transformation in the physical world
          </h2>
          <div className="audience-grid">
            {[
              ["⚙", "Chief Information Officers", "Setting the technology vision for manufacturing organizations and managing the tension between legacy infrastructure and modern platforms."],
              ["◈", "VPs of Digital & IT", "Leading digital transformation initiatives, evaluating platforms, and building the teams that connect software to shop floors."],
              ["◆", "Directors of Engineering Systems", "Owning PLM, ERP, MES, and the integration layer that keeps engineering and manufacturing in sync."],
              ["▸", "Heads of Digital Strategy", "Charting the roadmap for Industry 4.0 adoption, IoT integration, and data-driven manufacturing operations."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="audience-card">
                <div className="audience-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="divider" />

      {/* Principles */}
      <Reveal>
        <section className="section" id="principles">
          <div className="section-label">Our principles</div>
          <h2 className="section-heading">What makes this community different</h2>
          <div className="principles-grid">
            {[
              ["01", "Vendor-free zone", "No sponsorships. No product demos disguised as \"thought leadership.\" Every member is vetted to ensure they are practitioners, not sellers."],
              ["02", "Radical candor", "Members share what actually worked — and what didn't. Failed implementations are as valuable as success stories here."],
              ["03", "Chatham House Rule", "Discussions stay in the room. You can share insights externally, but never attribute them. This creates the safety needed for real honesty."],
              ["04", "Practitioner-led", "Every session, resource, and discussion is driven by members who've been in the trenches — not consultants or analysts watching from the sidelines."],
            ].map(([num, title, desc]) => (
              <div key={num} className="principle">
                <div className="principle-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="divider" />

      {/* CTA */}
      <Reveal>
        <section className="cta-band">
          <h2>Ready for conversations<br />that actually matter?</h2>
          <p>
            Applications are reviewed weekly. We&apos;re looking for active leaders who will
            contribute as much as they gain.
          </p>
          <Link href="/apply" className="btn btn-accent">
            Apply for membership <ArrowRight />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
