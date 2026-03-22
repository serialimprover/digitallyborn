import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Sign-in — Digitally Born",
  description: "Sign in to the Digitally Born member hub. Access is limited to approved members.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
