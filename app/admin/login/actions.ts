"use server";

import { createAdminClient } from "@/app/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Digitally Born <noreply@digitallyborn.io>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digitallyborn.io";

export async function requestAdminSignIn(
  email: string
): Promise<{ success: boolean }> {
  const normalised = email.toLowerCase().trim();
  const db = createAdminClient();

  // Check admins table — if not an admin, silently pretend success
  // so we don't reveal which email addresses have admin access.
  const { data: admin } = await db
    .from("admins")
    .select("email")
    .eq("email", normalised)
    .maybeSingle();

  if (!admin) {
    return { success: true };
  }

  // Generate a magic link using the service-role key.
  // This works even if the user doesn't yet exist in auth.users.
  const { data, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: normalised,
    options: {
      redirectTo: `${SITE_URL}/admin/auth/callback`,
    },
  });

  if (error || !data?.properties?.action_link) {
    console.error("generateLink error:", error);
    return { success: false };
  }

  const link = data.properties.action_link;

  await resend.emails.send({
    from: FROM,
    to: normalised,
    subject: "Your Digitally Born admin sign-in link",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin: 0; padding: 0; background: #f5f4f1; font-family: -apple-system, sans-serif; color: #1a1a1a; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
  .header { background: #0E0F11; padding: 28px 40px; display: flex; align-items: center; gap: 12px; }
  .mark { width: 32px; height: 32px; border: 2px solid #D4A054; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #D4A054; font-family: monospace; }
  .brand { color: #E8E6E1; font-size: 1rem; font-weight: 500; }
  .body { padding: 40px; }
  h1 { font-size: 1.4rem; font-weight: 600; margin: 0 0 16px; color: #0E0F11; }
  p { font-size: 0.92rem; line-height: 1.65; color: #444; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 13px 28px; background: #D4A054; color: #0E0F11; font-weight: 600; font-size: 0.88rem; border-radius: 100px; text-decoration: none; margin: 8px 0 24px; }
  .footer { padding: 24px 40px; background: #f5f4f1; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="mark">DB</div>
    <span class="brand">Digitally Born</span>
  </div>
  <div class="body">
    <h1>Admin sign-in link</h1>
    <p>Click the button below to sign in to the Digitally Born admin portal. This link expires in 1 hour and can only be used once.</p>
    <a href="${link}" class="btn">Sign in to admin portal →</a>
    <p style="font-size:0.82rem;color:#888;">If you didn't request this link, you can safely ignore this email.</p>
  </div>
  <div class="footer">Digitally Born · Admin access only</div>
</div>
</body>
</html>`,
  });

  return { success: true };
}
