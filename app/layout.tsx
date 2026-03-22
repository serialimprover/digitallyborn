import type { Metadata } from "next";
import "./globals.css";
import NavWrapper from "./components/NavWrapper";
import FooterWrapper from "./components/FooterWrapper";

export const metadata: Metadata = {
  title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
  description:
    "An invite-only community for CIOs, VPs of Technology, and engineering systems leaders at hardware and manufacturing companies built over the last two decades. No vendors. No implementation partners.",
  openGraph: {
    title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
    description:
      "An invite-only community for CIOs, VPs of Technology, and engineering systems leaders at hardware and manufacturing companies built over the last two decades. No vendors. No implementation partners.",
    siteName: "Digitally Born",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
    description:
      "An invite-only community for technology leaders at modern manufacturing companies. No vendors. No implementation partners. Just honest conversations about which platforms actually work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavWrapper />
        {children}
        <FooterWrapper />
      </body>
    </html>
  );
}
