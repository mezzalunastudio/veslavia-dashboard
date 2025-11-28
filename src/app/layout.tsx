import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";
import { AuthProvider } from '@/contexts/AuthContext';
import { GlobalLoadingWrapper } from "@/components/GlobalLoadingWrapper";

export const metadata: Metadata = {
  title: "Veslavia Dashboard",
  description: "A dashboard built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>
            <AuthProvider>
              {children}
              <GlobalLoadingWrapper />
            </AuthProvider>
          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
