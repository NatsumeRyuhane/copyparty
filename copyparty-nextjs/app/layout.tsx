import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CopyParty - Modern File Browser",
  description: "A modern, clean frontend for CopyParty file server",
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
