import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "ClarityHD — AI Image Upscaler | Transform Blurry Photos to 4K",
  description:
    "Transform blurry, low-resolution images into stunning ultra HD masterpieces using advanced AI enhancement technology. Crystal clear results in seconds.",
  keywords:
    "AI upscaler, image enhancement, HD upscaler, photo quality, 4K upscale, AI image editor, photo enhancer",
  authors: [{ name: "ClarityHD", url: "https://clarityhd.ai" }],
  creator: "ClarityHD",
  publisher: "ClarityHD",
  robots: "index, follow",
  openGraph: {
    title: "ClarityHD — AI Image Upscaler",
    description:
      "Transform blurry images into ultra HD using advanced AI enhancement technology.",
    url: "https://clarityhd.ai",
    siteName: "ClarityHD",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClarityHD AI Image Upscaler",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClarityHD — AI Image Upscaler",
    description:
      "Transform blurry images into ultra HD using advanced AI enhancement technology.",
    images: ["/twitter-image.png"],
    creator: "@clarityhd",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}