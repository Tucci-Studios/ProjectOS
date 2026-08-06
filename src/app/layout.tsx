import type { Metadata } from "next";
import { INDEXING_ALLOWED, siteUrl } from "@/lib/site";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Without this, Next has no origin to resolve relative OG image paths
  // against, so every link preview points at a URL that doesn't exist.
  metadataBase: new URL(siteUrl()),
  // Belt and braces: robots.txt is a polite request, this is the directive
  // crawlers actually honour.
  robots: INDEXING_ALLOWED ? undefined : { index: false, follow: false },
  title: "Project Open Source",
  description:
    "Publish open-source projects, fork each other's work, and watch every lineage grow as a public family tree. Built for vibe coders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
