import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Telugu, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/shell/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins", display: "swap" });
const notoTelugu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-telugu", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "VaartaNow - తెలుగు ప్రజల Daily AI Updates",
    template: "%s | VaartaNow"
  },
  description: "Telugu-first AI news, shorts, jobs, local alerts, utilities and daily updates.",
  applicationName: "VaartaNow",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "VaartaNow",
    description: "A Telugu-first AI-powered news super app.",
    siteName: "VaartaNow",
    type: "website",
    locale: "te_IN"
  },
  twitter: {
    card: "summary_large_image",
    title: "VaartaNow",
    description: "తెలుగు ప్రజల Daily AI Updates"
  },
  alternates: {
    canonical: "/"
  }
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="te" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${notoTelugu.variable} font-sans`}>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
