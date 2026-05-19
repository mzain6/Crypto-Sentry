import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "BitBash Crypto Sentry",
  description: "Cryptocurrency monitoring foundation with PostgreSQL ingestion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

