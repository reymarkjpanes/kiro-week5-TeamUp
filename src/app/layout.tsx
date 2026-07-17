import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamUp - Find the Right People. Build Better Teams.",
  description:
    "A collaboration platform that helps users create teams or join existing ones for hackathons, capstone projects, research, or startup ideas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
