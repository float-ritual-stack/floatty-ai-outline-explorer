import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "floatty explorer + AI",
  description: "AI-powered knowledge graph explorer for floatty outliner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
