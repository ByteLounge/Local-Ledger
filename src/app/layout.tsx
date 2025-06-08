import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/components/AppProvider"; // Import AppProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Local Ledger",
  description: "Your personal expense tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
        suppressHydrationWarning // Add suppressHydrationWarning here too
      >
        <AppProvider> {/* Wrap children with AppProvider */}
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
