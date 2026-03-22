"use client";

import { useState } from "react";
import { submitApplication } from "./actions";

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await submitApplication({
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        linkedin: formData.get("linkedin") as string,
        job_title: formData.get("job_title") as string,
        company: formData.get("company") as string,
        industry: formData.get("industry") as string,
        company_size: formData.get("company_size") as string,
        challenge: formData.get("challenge") as string,
        hopes: formData.get("hopes") as string,
        referral_source: formData.get("referral_source") as string,
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-page">
      <div className="apply-sidebar">
        <h2>
          Apply to join<br />
          <em style={{ fontFamily: "var(--font-display)", color: "var(--accent)", fontStyle: "italic" }}>
            Digitally Born
          </em>
        </h2>
        <p>
          Membership is free and by application only. We review every submission to ensure
          the community stays focused, safe, and useful for everyone.
        </p>
        <ul className="expectations">
          {[
            "Applications are reviewed within 5 business days",
            "We verify your role and company independently",
            "Vendors, consultants, and sales professionals are not eligible",
            "Members are expected to participate, not just observe",
            "All discussions operate under Chatham House Rule",
          ].map((t) => (
            <li key={t}><span className="arrow"><ArrowRight /></span>{t}</li>
          ))}
        </ul>
      </div>

      <div className="apply-form-container">
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-section-label">About you</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name <span className="required">*</span></label>
                <input className="form-input" name="first_name" type="text" required placeholder="Jane" />
              </div>
              <div className="form-group">
                <label className="form-label">Last name <span className="required">*</span></label>
                <input className="form-input" name="last_name" type="text" required placeholder="Chen" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Work email <span className="required">*</span></label>
              <input className="form-input" name="email" type="email" required placeholder="jane@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn profile</label>
              <input className="form-input" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
            </div>

            <div className="form-divider" />
            <div className="form-section-label">Your role</div>
            <div className="form-group">
              <label className="form-label">Job title <span className="required">*</span></label>
              <input className="form-input" name="job_title" type="text" required placeholder="CIO, VP of Technology, Head of Engineering Systems..." />
            </div>
            <div className="form-group">
              <label className="form-label">Company <span className="required">*</span></label>
              <input className="form-input" name="company" type="text" required placeholder="Acme Manufacturing" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Industry segment <span className="required">*</span></label>
                <select className="form-input select" name="industry" required defaultValue="">
                  <option value="" disabled>Select...</option>
                  <option>Aerospace &amp; Defense</option>
                  <option>Automotive</option>
                  <option>Consumer Electronics</option>
                  <option>Heavy Equipment</option>
                  <option>Industrial Automation</option>
                  <option>Medical Devices</option>
                  <option>Semiconductors</option>
                  <option>Other Manufacturing</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company size <span className="required">*</span></label>
                <select className="form-input select" name="company_size" required defaultValue="">
                  <option value="" disabled>Select...</option>
                  <option>50–200</option>
                  <option>200–1,000</option>
                  <option>1,000–5,000</option>
                  <option>5,000–20,000</option>
                  <option>20,000+</option>
                </select>
              </div>
            </div>

            <div className="form-divider" />
            <div className="form-section-label">Your interest</div>
            <div className="form-group">
              <label className="form-label">
                What&apos;s the biggest technology challenge you&apos;re facing right now? <span className="required">*</span>
              </label>
              <textarea
                className="form-input textarea"
                name="challenge"
                required
                placeholder="E.g., Our ERP and PLM each claim to own the same data and we can't get them to agree. We're also being pitched by every major platform and can't tell who to trust..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">What do you hope to get from this community?</label>
              <textarea
                className="form-input textarea"
                name="hopes"
                placeholder="E.g., Unbiased takes on which platforms are actually worth it from peers who've been through the same evaluation — without a vendor in the room..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">How did you hear about Digitally Born?</label>
              <select className="form-input select" name="referral_source" defaultValue="">
                <option value="" disabled>Select...</option>
                <option>Peer referral</option>
                <option>LinkedIn</option>
                <option>Industry event</option>
                <option>Podcast</option>
                <option>Other</option>
              </select>
            </div>

            {error && (
              <p style={{ color: "var(--error)", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>
            )}

            <div className="form-submit-row">
              <span className="form-note">
                Your information is kept confidential and is never shared with third parties.
              </span>
              <button type="submit" className="btn btn-accent" disabled={submitting}>
                {submitting ? <><Spinner />Submitting…</> : "Submit application"}
              </button>
            </div>
          </form>
        ) : (
          <div className="form-success">
            <div className="success-icon"><CheckIcon /></div>
            <h3>Application received</h3>
            <p>
              Thank you for your interest in Digitally Born. Our review team will evaluate
              your application and respond within 5 business days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
