import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sketchstack.vercel.app"),
  title: "Sketchstack — sketch your stack, generate a prompt",
  description:
    "Draw your system as a diagram and Sketchstack turns it into a clean, structured prompt your AI coding agent can build from.",
  applicationName: "Sketchstack",
  openGraph: {
    title: "Sketchstack",
    description: "Turn system diagrams into agent-ready prompts.",
    url: "/",
    siteName: "Sketchstack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sketchstack",
    description: "Turn system diagrams into agent-ready prompts.",
  },
};

// Runs before React hydrates so the correct theme is applied with no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('sketchstack:theme')||localStorage.getItem('sysdesign:theme')||'light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
