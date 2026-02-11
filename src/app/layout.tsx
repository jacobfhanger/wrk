import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wardrobe Consultant",
  description:
    "AI-powered wardrobe consultant that analyzes your clothes and suggests outfits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
