"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "not_admin") {
      setError("This email address does not have admin access.");
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
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/auth/callback`,
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
        <h1 className="login-title">Admin sign-in</h1>
        <p className="login-desc">
          Restricted to authorised administrators only.
        </p>

        {submitted ? (
          <div className="login-success">
            <div className="login-success-icon">✓</div>
            <h2>Check your inbox</h2>
            <p>
              We sent a sign-in link to <strong>{email}</strong>.
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
                placeholder="you@domain.com"
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
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
