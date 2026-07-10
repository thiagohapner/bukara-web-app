import type { Metadata } from "next";
import { Inter, Playfair_Display, Mulish } from "next/font/google";
import Script from "next/script";
import ConsentBanner from "@/components/ConsentBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const OG_IMAGE = "https://qdycgspamxfiurajizmt.supabase.co/storage/v1/object/public/images/hero/main_image.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bukara.de"),
  title: "Bukara GmbH",
  description: "Professionelle Fräswerkzeuge, Schärfservice und Sonderwerkzeuge — exklusiver ITA-Partner.",
  openGraph: {
    title: "Bukara GmbH",
    description: "Professionelle Fräswerkzeuge, Schärfservice und Sonderwerkzeuge — exklusiver ITA-Partner.",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "Bukara GmbH" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bukara GmbH",
    description: "Professionelle Fräswerkzeuge, Schärfservice und Sonderwerkzeuge — exklusiver ITA-Partner.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable} ${mulish.variable}`}>
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
        <ConsentBanner />
      </body>
    </html>
  );
}
