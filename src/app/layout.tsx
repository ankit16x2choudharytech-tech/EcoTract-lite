import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoTrack Lite — Small Daily Actions. Big Climate Impact.",
  description:
    "EcoTrack Lite is a 100% free AI-powered platform to measure your carbon footprint, track daily emissions, get personalized recommendations, and build sustainable habits.",
  keywords: [
    "carbon footprint",
    "eco",
    "sustainability",
    "climate",
    "CO2 tracker",
    "green habits",
    "EcoTrack",
  ],
  authors: [{ name: "EcoTrack Lite" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "EcoTrack Lite",
    description: "Small Daily Actions. Big Climate Impact.",
    siteName: "EcoTrack Lite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoTrack Lite",
    description: "Small Daily Actions. Big Climate Impact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
