import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PrimeWave | Resource Reservation Management System',
  description:
    'Centralized digital platform for coordinating shared facilities, workstations, and laboratory resources with real-time conflict prevention.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans flex flex-col`}
      >
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                borderRadius: '1rem',
                fontSize: '0.875rem',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
