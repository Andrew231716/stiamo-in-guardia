import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import { ThemeSync } from "@/components/providers/ThemeSync";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stiamo in guardia",
  description:
    "Assistente spirituale quotidiano, diario personale e monitoraggio dei progressi. Non sostituisce un medico, uno psicologo o un responsabile spirituale.",
  applicationName: "Stiamo in guardia",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stiamo in guardia",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121a17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${figtree.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppProvider>
          <ThemeSync />
          <AppShell>{children}</AppShell>
        </AppProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`,
          }}
        />
      </body>
    </html>
  );
}
