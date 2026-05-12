import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Hour Town",
  description: "Find local happy hour specials near you.",
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
