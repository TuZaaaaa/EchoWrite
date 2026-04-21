import type { Metadata } from "next";
import { Instrument_Sans, Source_Serif_4 } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoWrite",
  description: "A back-translation writing trainer for stronger English prose.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
