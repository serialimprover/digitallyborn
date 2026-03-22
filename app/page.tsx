import Link from "next/link";
import Reveal from "./components/Reveal";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCIO() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="4" rx="1" />
      <rect x="2" y="11" width="16" height="4" rx="1" />
      <circle cx="5.5" cy="6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="13" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9 6h5M9 13h3" />
    </svg>
  );
}

function IconVP() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L2 8l8 5 8-5-8-5z" />
      <path d="M2 13l8 5 8-5" />
      <path d="M2 10.5l8 5 8-5" />
    </svg>
  );
}

function IconDirector() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="6" height="6" rx="1.5" />
      <path d="M10 2v5M10 13v5M2 10h5M13 10h5" />
    </svg>
  );
}

function IconStrategy() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l4.5-8 4 4L17 3" />
      <path d="M14 3h3v3" />
    </svg>
  );
}

async function getMemberStats() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  // Select only company — no PII (email) loaded into memory
  const { data } = await db.from("approved_members").select("company");

  if (!data || data.length === 0) return { memberCount: 0, companyCount: 0 };

  const memberCount = data.length;
  const companyCount = new Set(
    data.map((m: { company?: string }) => m.company?.trim().toLowerCase()).filter(Boolean)
  ).size;

  return { memberCount, companyCount };
}

export default async function HomePage() {
  const { memberCount, companyCount } = await getMemberStats();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="hero-label">
            <span className="hero-label-line" />
            Private community
          </span>
          <h1>
            Where manufacturing&apos;s <em>tech leaders</em> speak freely
          </h1>
          <p className="hero-desc">
            Digitally Born is an invite-only community for CIOs, VPs of Technology, and engineering
            systems leaders at hardware and manufacturing companies built over the last two decades.
            No vendors. No implementation partners. Just honest conversations about which platforms
            actually work — with people who&apos;ve made the same calls.
          </p>
          <div className="hero-actions">
            <Link href="/apply" className="btn btn-accent">
              Apply for membership <ArrowRight />
            </Link>
            <a href="#about" className="btn btn-ghost">Learn more</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-value">{memberCount}</div>
              <div className="stat-label">Vetted members</div>
            </div>
            <div>
              <div className="stat-value">{companyCount}</div>
              <div className="stat-label">Companies represented</div>
            </div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Vendor-free</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-quote-card">
            <span className="hero-quote-marks">&ldquo;</span>
            <p className="hero-quote-text">
              Finally had an honest conversation about platform selection without someone
              trying to upsell me. These are the only people who&apos;ve dealt with the
              same complexity at the same scale.
            </p>
            <div className="hero-quote-author">
              <span className="hero-quote-role">Head of Technology</span>
              <span className="hero-quote-sep">·</span>
              <span className="hero-quote-company">Precision manufacturer, Series C</span>
            </div>
          </div>
          <div className="hero-topics">
            <div className="hero-topics-label">Recent discussions</div>
            <div className="hero-topic-chips">
              <span>Platform consolidation vs. best-of-breed</span>
              <span>When ERP and PLM both own master data</span>
              <span>Evaluating ERPs without getting locked in</span>
              <span>AI tools vs. what&apos;s on the shop floor</span>
              <span>Making sense of system integration</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Who It's For */}
      <Reveal>
        <section className="section" id="about">
          <div className="section-label">Who this is for</div>
          <h2 className="section-heading">
            Built for the technology leaders of modern manufacturing companies
          </h2>
          <div className="audience-grid">
            {[
              [<IconCIO key="cio" />, "Chief Information Officers", "Owning the technology vision for a company that's always been digital — managing the sprawl of platforms that came with scaling fast, and deciding what to consolidate and what to leave alone."],
              [<IconVP key="vp" />, "VPs of Technology & IT", "Evaluating platforms, avoiding vendor lock-in, and building a coherent stack from a decade of tools your teams adopted to solve immediate problems — while every major enterprise platform claims it can do it all."],
              [<IconDirector key="dir" />, "Directors of Engineering Systems", "Owning the integration layer between systems that were each bought to solve one problem and now each claim to be the system of record — PLM, ERP, MES, and the spreadsheets filling the gaps between them."],
              [<IconStrategy key="strat" />, "Heads of Digital Strategy", "Figuring out what your technology roadmap should actually look like when every conference pitches a different vision of the future and every vendor's deck starts with the same slide."],
            ].map(([icon, title, desc]) => (
              <div key={title as string} className="audience-card">
                <div className="audience-icon">{icon}</div>
                <h3>{title as string}</h3>
                <p>{desc as string}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="divider" />

      {/* Principles */}
      <Reveal>
        <section className="section" id="principles">
          <div className="principles-intro">
            <p className="principles-intro-num">04</p>
            <h2 className="section-heading" style={{ marginBottom: 0 }}>What makes this community different</h2>
          </div>
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

      {/* Pain Points */}
      <Reveal>
        <section className="pain-section" id="challenges">
          <div className="section-label">Sound familiar?</div>
          <h2 className="section-heading">
            The conversations you can&apos;t have with a vendor in the room
          </h2>
          <div className="pain-list">
            {[
              "You\u2019ve sat through fourteen vendor briefings this quarter. Each one promises to be the operating system for your entire enterprise \u2014 and every deck has a slide titled \u201CSingle Source of Truth.\u201D",
              "The build-vs-buy calculus you ran two years ago is already outdated. AI-assisted development keeps rewriting what internal software costs, and nobody has updated the frameworks for making this call.",
              "ERP says it owns the master data. PLM says differently. Your data platform team wants a governance meeting. Meanwhile, production decisions are being made from a spreadsheet someone emailed last Thursday.",
              "Your board wants to know how you\u2019re deploying AI. You\u2019d like to have that conversation honestly \u2014 without a vendor in the room framing the answer.",
              "You didn\u2019t inherit a broken stack \u2014 you chose every system you have. Which somehow makes it harder to explain why three of them are supposed to share the same data but never actually do.",
              "The implementation partner helping you roll out the new platform is also a certified reseller of that platform. You found out how that shapes their advice after the contract was signed.",
            ].map((text, i) => (
              <div key={i} className="pain-item">
                <span className="pain-tick">—</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="divider" />

      {/* CTA */}
      <Reveal>
        <section className="cta-band">
          <h2>You&apos;ve earned a room<br />without a sales pitch in it.</h2>
          <p>
            A private community where manufacturing&apos;s technology leaders share which platforms
            are actually worth it, which vendors to avoid, and what they wish they&apos;d known
            before signing — no vendors, no implementation partners, no agenda.
          </p>
          <Link href="/apply" className="btn btn-accent">
            Apply for membership <ArrowRight />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
