import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Membership — Digitally Born",
  description:
    "Apply to join Digitally Born, the invite-only community for CIOs and technology executives at manufacturing companies. Free membership, reviewed within 5 business days.",
  openGraph: {
    title: "Apply for Membership — Digitally Born",
    description:
      "Apply to join Digitally Born, the invite-only community for CIOs and technology executives at manufacturing companies. Free membership, reviewed within 5 business days.",
    siteName: "Digitally Born",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Apply for Membership — Digitally Born",
    description:
      "Apply to join Digitally Born. Free membership for qualifying manufacturing technology leaders.",
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
