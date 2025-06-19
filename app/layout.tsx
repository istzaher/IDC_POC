import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SAP AI Validation PoC',
  description: 'AI-Powered SAP Data Entry Validation Proof of Concept',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-slate-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold">AI CR Validation</h1>
              <p className="text-blue-200">AI-Powered Data Entry & Validation System</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto p-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 