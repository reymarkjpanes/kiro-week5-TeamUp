import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamUp - Find the Right People. Build Better Teams.",
  description:
    "A collaboration platform that helps users create teams or join existing ones for hackathons, capstone projects, research, or startup ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
