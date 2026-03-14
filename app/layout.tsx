import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistPixelLine = localFont({
  src: '../public/fonts/GeistPixel-Line.woff2',
  variable: '--font-geist-pixel-line',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Semantic — Transform Meeting Insights into Action',
  description:
    'Utiliza tus reuniones como insumo. Genera automáticamente issues en Jira desde tus notas.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={geistPixelLine.variable}>
      <body>{children}</body>
    </html>
  )
}
