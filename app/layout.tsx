import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bukara GmbH",
  description: "Professionelle Fräswerkzeuge, Schärfservice und Sonderwerkzeuge — exklusiver ITA-Partner.",
  icons: { icon: "/vercel.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <AnnouncementBar />
        {children}
      </body>
    </html>
  );
}
