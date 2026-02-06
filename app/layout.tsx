import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import PresencePing from "./components/PresencePing";
import ButtonSpinner from "./components/ButtonSpinner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chatbook",
  description: "A simple WhatsApp-like chat using websockets and MongoDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen">
          <AppHeader />
          <PresencePing />
          <ButtonSpinner />
          <div className="pt-14">{children}</div>
        </div>
      </body>
    </html>
  );
}
