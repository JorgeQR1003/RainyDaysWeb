import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rainy Days",
  description: "Clima con iconos chilos!!",
  icons: {
    icon: [
      {
        url: "/sun-logo.png",
        sizes: "180x180",
      },
    ],
    apple: [
      {
        url: "/sun-logo.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/sun-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/sun-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
