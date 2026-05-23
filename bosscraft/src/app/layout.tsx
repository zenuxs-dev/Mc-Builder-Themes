import './globals.css';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Metadata } from 'next';
import { getSite, getServerStatus } from '@/lib/api';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  if (!site) return { title: 'BossCraft' };

  let iconUrl = '/favicon.ico';
  if (site.serverIp) {
    const mcStatus = await getServerStatus(site.serverIp);
    if (mcStatus?.icon) iconUrl = mcStatus.icon;
  }

  return {
    title: site.name,
    description: site.description || `The official webstore for ${site.name}`,
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
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className={outfit.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}