import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rainy Days - Aplicación del Clima",
  description: "Tu compañero personalizado del clima con iconos adorables",
  icons: {
    icon: [
      {
        url: "/sun-logo.png",
        sizes: "any",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/sun-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/sun-logo.png" />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
