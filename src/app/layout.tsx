import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const body = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'TripMate',
  description: 'Lên lịch du lịch Việt Nam theo ngày, chi phí và số người.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${body.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
