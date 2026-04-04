import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubSphere — Enterprise Ledger",
  description: "A precision instrument for enterprise subscription management.",
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
