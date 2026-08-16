import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateCourse | Licensing Education, State by State",
  description:
    "Professional licensing education organized by category, state, program, and approved course.",
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
