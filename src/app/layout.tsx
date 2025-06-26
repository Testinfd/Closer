import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import ClientConfig from './client-config';

// Google fonts for handwriting
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Text to Handwriting",
  description: "Convert text to handwritten notes",
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
          href="https://fonts.googleapis.com/css2?family=Homemade+Apple&family=Caveat&family=Liu+Jian+Mao+Cao&family=Indie+Flower&family=Zeyada&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientConfig />
        {children}
        <Script 
          src="/vendors/html2canvas.min.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
