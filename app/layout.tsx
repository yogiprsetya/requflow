import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { cn } from '~/lib/css';
import { ThemeProvider } from '~/components/theme-provider';
import { ReactNode } from 'react';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Requflow',
  description: 'OpenAPI Spec Playground',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, 'h-svh overflow-hidden antialiased')}
    >
      <body className="flex h-svh max-h-svh flex-col overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
