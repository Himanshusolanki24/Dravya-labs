import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased">
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
