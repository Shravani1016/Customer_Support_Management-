import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClientFlow CRM',
  description: 'B2B Sales CRM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider> 
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                success: {
                  duration: 3000,
                  style: { background: '#10B981', color: 'white' },
                },
                error: {
                  duration: 4000,
                  style: { background: '#EF4444', color: 'white' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}