import type { Metadata } from "next";
import { Playfair_Display, Outfit, JetBrains_Mono, DM_Sans } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fan Olimpiadasi | Oriental Universiteti",
  description:
    "Oriental Universiteti tomonidan tashkil etiladigan respublika miqyosidagi Fan Olimpiadasi. 11-sinf o'quvchilari uchun onlayn test platformasi.",
  keywords: [
    "fan olimpiadasi",
    "oriental universiteti",
    "olimpiada",
    "test",
    "matematika",
    "informatika",
  ],
  openGraph: {
    title: "Fan Olimpiadasi | Oriental Universiteti",
    description:
      "11-sinf o'quvchilari orasida respublika miqyosidagi Fan Olimpiadasi",
    type: "website",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${playfair.variable} ${outfit.variable} ${jetbrains.variable} ${dmSans.variable}`}
    >
      <body className="font-body antialiased min-h-screen bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
