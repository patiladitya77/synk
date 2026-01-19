import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ReduxProvider } from "./provider";
import { GoogleProvider } from "./google-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whiteboard - Real-time Collaborative Canvas",
  description:
    "Create, sketch, and collaborate on an infinite canvas. Perfect for teams working together in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <GoogleProvider>
          <ReduxProvider>
            <ThemeProvider>
              <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
          </ReduxProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
