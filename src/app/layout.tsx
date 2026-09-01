import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "JagaJajan",
  description:
    "Catat jajan harianmu dengan gaya — kelola dompet, pemasukan, dan pengeluaran dalam satu app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/logo-baru.png",
    apple: "/icons/logo-baru.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JagaJajan",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#DDD6FE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-dvh bg-[var(--color-background)] antialiased text-[var(--color-foreground)]">
        <SessionProvider>
          <PwaRegister />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
