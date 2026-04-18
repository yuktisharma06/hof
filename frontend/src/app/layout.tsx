import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewMesh — AI-Powered Mock Interviews",
  description:
    "Practice coding interviews with AI-matched peers. Get real-time feedback, adaptive learning roadmaps, and intelligent performance analysis.",
  keywords: [
    "mock interviews",
    "coding practice",
    "peer programming",
    "AI interview prep",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="noise-bg">{children}</body>
    </html>
  );
}
