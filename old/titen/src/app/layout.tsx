import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Metadata } from 'next';
import { getSite, getServerStatus } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  if (!site) return { title: 'Titan Minecraft' };

  let iconUrl = '/favicon.ico';
  if (site.serverIp) {
    const mcStatus = await getServerStatus(site.serverIp);
    if (mcStatus?.icon) iconUrl = mcStatus.icon;
  }

  return {
    title: site.name,
    description: site.description || `The official Titan-themed website for ${site.name}`,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className={outfit.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}