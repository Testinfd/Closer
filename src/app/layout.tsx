import type { Metadata } from "next";
import { Homemade_Apple, Caveat, Liu_Jian_Mao_Cao, Indie_Flower, Zeyada } from 'next/font/google';
import "./globals.css";
import Script from 'next/script';
import ClientConfig from './client-config';

// Google fonts for handwriting
const homemadeApple = Homemade_Apple({
  variable: "--font-homemade-apple",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const liuJianMaoCao = Liu_Jian_Mao_Cao({
  variable: "--font-liu-jian-mao-cao",
  weight: "400",
  subsets: ["latin"],
});

const indieFlower = Indie_Flower({
  variable: "--font-indie-flower",
  weight: "400",
  subsets: ["latin"],
});

const zeyada = Zeyada({
  variable: "--font-zeyada",
  weight: "400",
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
      
      <body
        className={`${homemadeApple.variable} ${caveat.variable} ${liuJianMaoCao.variable} ${indieFlower.variable} ${zeyada.variable} antialiased`}
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
