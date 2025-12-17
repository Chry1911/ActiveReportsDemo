import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ActiveReportsJS Demo",
  description: "Demo Next.js con Designer e Viewer di ActiveReportsJS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@grapecity/activereports@5.2.6/styles/ar-js-ui.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@grapecity/activereports@5.2.6/styles/ar-js-designer.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@grapecity/activereports@5.2.6/styles/ar-js-viewer.css"
        />
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
