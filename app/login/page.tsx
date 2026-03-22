"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "not_approved") {
      setError("This email address is not on the approved members list.");
    } else if (err === "auth_failed") {
      setError("The sign-in link was invalid or has expired. Please try again.");
    }
  }, [searchParams]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    setLoading(false);

    if (signInError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-mark">DB</div>
        <h1 className="login-title">Member sign-in</h1>
        <p className="login-desc">
          Enter your email and we'll send you a sign-in link. No password required.
        </p>

        {submitted ? (
          <div className="login-success">
            <div className="login-success-icon">✓</div>
            <h2>Check your inbox</h2>
            <p>
              We sent a sign-in link to <strong>{email}</strong>. Click the link to
              access the member hub.
            </p>
            <p className="login-success-note">The link expires in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-accent login-submit"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
            <p className="login-footer-note">
              Access is limited to approved Digitally Born members.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
