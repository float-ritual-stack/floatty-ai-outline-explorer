import type { Metadata } from "next";
import "./globals.css";
import { colors } from "@/lib/constants";

export const metadata: Metadata = {
  title: "floatty explorer + AI",
  description: "AI-powered knowledge graph explorer for floatty outliner",
};

// Generate CSS custom properties from the single-source-of-truth colors object.
// globals.css then references these vars — no manual sync required.
const colorVarBlock = Object.entries(colors)
  .map(([k, v]) => `  --color-${k}: ${v};`)
  .join("\n");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style>{`:root {\n${colorVarBlock}\n}`}</style>
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
