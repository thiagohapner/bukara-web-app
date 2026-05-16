import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
