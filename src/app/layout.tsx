import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "MoneyTrack",
  description: "Catat pengeluaran harian dengan cepat dan mudah",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-logo.png",
    apple: "/icons/icon-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F8FAFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-dvh bg-[var(--color-background)] font-sans antialiased text-[var(--color-foreground)]">
        <SessionProvider>
          <PwaRegister />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
