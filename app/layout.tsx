import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "UniCal World Calendar",
  description: "Calendar from Soe With love",
};

import { MainLayout } from "@/components/layout/MainLayout";
import { AuthModalWrapper } from "../components/auth/AuthModalWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <MainLayout>
          {children}
          <AuthModalWrapper />
        </MainLayout>
      </body>
    </html>
  );
}
