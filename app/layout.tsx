import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateCourse | Real Estate Licensing, State by State",
  description:
    "A national platform for state-specific real estate licensing education, exam preparation, and renewal guidance.",
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
