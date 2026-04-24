import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dravya Labs - Ayurveda Chat & Remedies",
  description: "AI-powered Ayurvedic consultation platform",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { SavedItemsProvider } from "@/context/SavedItemsContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} ${notoSans.variable} font-sans antialiased`}
      >
        <UserProvider>
          <LanguageProvider>
            <SavedItemsProvider>
              {children}
            </SavedItemsProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
