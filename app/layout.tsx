import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: "Padma Yoga Espacio – Yoga, Tai Chi y Bienestar en Argentina",
  description: "Descubrí Padma Yoga Espacio: clases de Yoga Integral, Tai Chi Chuan y masajes holísticos en un ambiente luminoso y acogedor. Reservá tu turno online.",
  keywords: ["yoga Argentina", "tai chi clases", "masajes holísticos", "yoga espacio", "bienestar holístico", "clases de yoga"],
  openGraph: {
    title: "Padma Yoga Espacio",
    description: "Un espacio luminoso para tu práctica de yoga, tai chi y bienestar holístico.",
    images: [{ url: "/Gemini_Generated_Image_py4imypy4imypy4i.png", width: 600, height: 500, alt: "Salón de Padma Yoga Espacio" }],
    type: "website",
    locale: "es_AR",
    siteName: "Padma Yoga Espacio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Padma Yoga Espacio",
    description: "Un espacio luminoso para tu práctica de yoga, tai chi y bienestar holístico.",
    images: ["/Gemini_Generated_Image_py4imypy4imypy4i.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
