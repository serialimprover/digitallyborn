import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
  description:
    "An invite-only community for CIOs, VPs of Digital, and technology executives at hardware engineering and manufacturing companies. No vendors. No sales pitches.",
  openGraph: {
    title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
    description:
      "An invite-only community for CIOs, VPs of Digital, and technology executives at hardware engineering and manufacturing companies. No vendors. No sales pitches.",
    siteName: "Digitally Born",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitally Born — A Private Community for Manufacturing Tech Leaders",
    description:
      "An invite-only community for CIOs and technology executives at manufacturing companies. No vendors. No sales pitches.",
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
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
