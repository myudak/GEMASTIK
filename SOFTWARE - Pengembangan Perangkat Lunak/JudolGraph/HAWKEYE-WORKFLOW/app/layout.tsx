import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HAWKEYE Workflow",
  description: "Simplified HAWKEYE investigation workflow demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark font-sans", inter.variable)}>
      <body>{children}</body>
    </html>
  );
}
