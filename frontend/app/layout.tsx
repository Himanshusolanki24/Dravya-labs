import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dravya Labs - Ayurveda Chat & Remedies",
  description: "AI-powered Ayurvedic consultation platform",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { SavedItemsProvider } from "@/context/SavedItemsContext";
import { UserProvider } from "@/context/UserContext";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ReactQueryProvider>
          <UserProvider>
            <LanguageProvider>
              <SavedItemsProvider>
                {children}
              </SavedItemsProvider>
            </LanguageProvider>
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

