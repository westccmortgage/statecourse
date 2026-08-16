import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateCourse | Professional Licensing Education",
  description:
    "State-specific real estate licensing education and professional course pathways.",
  other: {
    "codex-preview": "development",
  },
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
