import { AuthProvider } from '@/context/AuthContext';
import { QuizProvider } from '@/context/QuizContext';
import CRTOverlay from '@/components/CRTOverlay';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  title: 'CyberSec Arena — Test Your Cybersecurity Knowledge',
  description: 'An interactive cybersecurity quiz application covering 25+ domains including Linux, Windows, Networking, Nmap, Metasploit, Web Security, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <QuizProvider>
            <CRTOverlay />
            <Navbar />
            <main className="main-content">
              {children}
            </main>
          </QuizProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
