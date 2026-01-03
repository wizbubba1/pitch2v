import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pitch2v - Deck Alignment Analysis",
  description: "Check if your pitch deck aligns with Vitruvius Venture Studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black">
        {children}
      </body>
    </html>
  );
}
