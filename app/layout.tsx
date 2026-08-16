import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateCourse | Virginia 60-Hour Real Estate Course",
  description:
    "Preview the StateCourse Virginia 60-hour real estate pre-license curriculum, hour by hour.",
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
