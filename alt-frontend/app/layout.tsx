import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CopyParty - File Manager",
  description: "Modern web interface for CopyParty file server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
