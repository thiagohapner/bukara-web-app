import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0REYXM8F7G"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0REYXM8F7G');
        `}</Script>
        {children}
      </body>
    </html>
  );
}
