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
  verification: {
    google: "QM-B56IC60TwQO0DIW5uUXXUfGwHZ89bKuZ2j6q5nIg",
  },
};

import { MainLayout } from "@/components/layout/MainLayout";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

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
          <ToastContainer />
          <ConfirmationModal />
        </MainLayout>
      </body>
    </html>
  );
}
