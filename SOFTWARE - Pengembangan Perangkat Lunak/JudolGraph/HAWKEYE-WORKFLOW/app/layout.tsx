import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HAWKEYE Workflow",
  description: "Simplified HAWKEYE investigation workflow demo.",
  icons: {
    icon: "/hawkeye_dark_rounded_bg_256.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark font-sans", inter.variable)}>
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/react-scan/dist/auto.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
