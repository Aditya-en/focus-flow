import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FocusFlow - Study Session Manager",
  description: "Manage your study sessions with Pomodoro and Deep Work techniques",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon/favicon-64x64.png",
    apple: "/favicon/favicon-192x192.png",
    other: [
      {
        rel: "icon",
        url: "/favicon/favicon-64x64.png",
        sizes: "64x64",
      },
      {
        rel: "icon",
        url: "/favicon/favicon-128x128.png",
        sizes: "128x128",
      },
      {
        rel: "icon",
        url: "/favicon/favicon-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "icon",
        url: "/favicon/favicon-512x512.png",
        sizes: "512x512",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}