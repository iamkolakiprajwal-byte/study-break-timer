import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Break Timer — Focus Better & Take Planned Breaks",
  description:
    "A clean, responsive focus and break companion for students to build healthy study habits, minimize distraction, and celebrate progress.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2878E8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-soft text-text-primary antialiased selection:bg-primary-light selection:text-primary">
        {children}
      </body>
    </html>
  );
}
