import { AuthErrorBoundary } from "@/components/context/AuthErrorBoundary";
import { AuthProvider } from "@/components/context/AuthProvider";
import { ToastContextProvider } from "@/components/context/ToastProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./local-fonts.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ashram Management System",
  description:
    "A comprehensive donation and donor management system for ashrams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

        <link
          rel="preload"
          href="/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Poppins/Poppins-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/Montserrat/static/Montserrat-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthErrorBoundary>
          <AuthProvider>
            <ToastContextProvider>
              <PerformanceProvider>{children}</PerformanceProvider>
            </ToastContextProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
