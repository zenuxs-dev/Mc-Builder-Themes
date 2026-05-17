import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Metadata } from 'next';
import { getSite, getServerStatus } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  if (!site) return { title: 'Minecraft Server' };

  let iconUrl = '/favicon.ico';
  if (site.serverIp) {
    const mcStatus = await getServerStatus(site.serverIp);
    if (mcStatus?.icon) iconUrl = mcStatus.icon;
  }

  return {
    title: site.name,
    description: site.description || `Official website for ${site.name}`,
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={spaceGrotesk.className}>
        <AuthProvider>
          <div className="main-layout">
            <div className="content-wrapper">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}