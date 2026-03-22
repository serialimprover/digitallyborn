import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Digitally Born <noreply@digitallyborn.io>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digitallyborn.io";

// ── Shared layout ────────────────────────────────────────────────────────────

function layout(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin: 0; padding: 0; background: #f5f4f1; font-family: -apple-system, 'Outfit', sans-serif; color: #1a1a1a; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
  .header { background: #0E0F11; padding: 28px 40px; display: flex; align-items: center; gap: 12px; }
  .mark { width: 32px; height: 32px; border: 2px solid #D4A054; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #D4A054; font-family: monospace; line-height: 1; text-align: center; }
  .brand { color: #E8E6E1; font-size: 1rem; font-weight: 500; }
  .body { padding: 40px; }
  h1 { font-size: 1.4rem; font-weight: 600; margin: 0 0 16px; line-height: 1.3; color: #0E0F11; }
  p { font-size: 0.92rem; line-height: 1.65; color: #444; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 13px 28px; background: #D4A054; color: #0E0F11; font-weight: 600; font-size: 0.88rem; border-radius: 100px; text-decoration: none; margin: 8px 0 24px; }
  .divider { height: 1px; background: #eee; margin: 24px 0; }
  .field-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #999; margin-bottom: 3px; }
  .field-value { font-size: 0.88rem; color: #1a1a1a; margin-bottom: 14px; line-height: 1.5; }
  .footer { padding: 24px 40px; background: #f5f4f1; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; }
  .footer a { color: #999; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="mark">DB</div>
    <span class="brand">Digitally Born</span>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    Digitally Born · A private community for manufacturing tech leaders<br />
    <a href="${SITE_URL}">${SITE_URL.replace("https://", "")}</a>
  </div>
</div>
</body>
</html>`;
}

// ── 1. New application → all admins ─────────────────────────────────────────

interface ApplicationPayload {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  company: string;
  industry: string;
  company_size: string;
  challenge: string;
  hopes?: string | null;
  referral_source?: string | null;
  linkedin?: string | null;
}

export async function sendNewApplicationEmail(
  app: ApplicationPayload,
  adminEmails: string[],
  applicationId?: string
) {
  if (!adminEmails.length) return;

  const reviewUrl = applicationId
    ? `${SITE_URL}/admin/applications/${applicationId}`
    : `${SITE_URL}/admin/applications`;

  const html = layout(`
    <h1>New membership application</h1>
    <p><strong>${app.first_name} ${app.last_name}</strong> has applied to join Digitally Born.</p>
    <div class="divider"></div>
    <div class="field-label">Name</div>
    <div class="field-value">${app.first_name} ${app.last_name}</div>
    <div class="field-label">Email</div>
    <div class="field-value">${app.email}</div>
    <div class="field-label">Role</div>
    <div class="field-value">${app.job_title} at ${app.company}</div>
    <div class="field-label">Industry</div>
    <div class="field-value">${app.industry} · ${app.company_size} employees</div>
    <div class="field-label">Biggest challenge</div>
    <div class="field-value">${app.challenge}</div>
    ${app.hopes ? `<div class="field-label">Hopes from community</div><div class="field-value">${app.hopes}</div>` : ""}
    ${app.referral_source ? `<div class="field-label">Referred by</div><div class="field-value">${app.referral_source}</div>` : ""}
    <div class="divider"></div>
    <a href="${reviewUrl}" class="btn">Review application →</a>
  `);

  await resend.batch.send(
    adminEmails.map((to) => ({
      from: FROM,
      to,
      subject: `New application: ${app.first_name} ${app.last_name} (${app.company})`,
      html,
    }))
  );
}

// ── 2. Application approved → applicant ─────────────────────────────────────

export async function sendApprovalEmail(email: string, firstName: string) {
  const html = layout(`
    <h1>Welcome to Digitally Born, ${firstName}</h1>
    <p>Your application has been reviewed and approved. You're now a member of Digitally Born — a private community for technology executives in hardware engineering and manufacturing.</p>
    <p>Sign in to access the member hub, including upcoming events, peer resources, and the Slack community.</p>
    <a href="${SITE_URL}/login" class="btn">Sign in to the member hub →</a>
    <div class="divider"></div>
    <p style="font-size:0.82rem;color:#888;">A reminder of our community principles: all discussions operate under Chatham House Rule. What's said in the room stays in the room.</p>
  `);

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You're in — welcome to Digitally Born",
    html,
  });
}

// ── 3. Application rejected → applicant ─────────────────────────────────────

export async function sendRejectionEmail(email: string, firstName: string) {
  const html = layout(`
    <h1>Your Digitally Born application</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you for your interest in Digitally Born. After reviewing your application, we're not able to offer membership at this time.</p>
    <p>Our community is focused specifically on technology executives at hardware engineering and manufacturing companies, and we keep membership selective to maintain the quality of discussion.</p>
    <p>We appreciate you taking the time to apply and wish you well.</p>
  `);

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Digitally Born application",
    html,
  });
}

// ── 4. New event → all active members ───────────────────────────────────────

interface EventPayload {
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  type: string;
  location?: string | null;
  link?: string | null;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export async function sendNewEventEmail(event: EventPayload, memberEmails: string[]) {
  if (!memberEmails.length) return;

  const dateStr = formatEventDate(event.event_date);
  const meta = [event.event_time, event.location].filter(Boolean).join(" · ");

  const html = layout(`
    <h1>New event: ${event.title}</h1>
    <div class="field-label">Date</div>
    <div class="field-value">${dateStr}</div>
    ${meta ? `<div class="field-label">When &amp; where</div><div class="field-value">${meta}</div>` : ""}
    <div class="field-label">Format</div>
    <div class="field-value">${event.type}</div>
    ${event.description ? `<div class="divider"></div><p>${event.description}</p>` : ""}
    <div class="divider"></div>
    ${event.link
      ? `<a href="${event.link}" class="btn">RSVP →</a>`
      : `<a href="${SITE_URL}/members" class="btn">View in member hub →</a>`}
  `);

  // Send in batches of 50 to stay within API limits
  const BATCH = 50;
  for (let i = 0; i < memberEmails.length; i += BATCH) {
    await resend.batch.send(
      memberEmails.slice(i, i + BATCH).map((to) => ({
        from: FROM,
        to,
        subject: `New event: ${event.title} — ${dateStr}`,
        html,
      }))
    );
  }
}
