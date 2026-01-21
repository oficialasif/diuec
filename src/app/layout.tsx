import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster as SonnerToaster } from 'sonner';
import UserCustomCursor from "@/components/shared/UserCustomCursor";
import "@/styles/custom-cursor.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: "#000000",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://diuec.com'), // Replace with actual domain when live
  title: "DIU Esports Community",
  icons: {
    icon: '/game-console.png',
    shortcut: '/game-console.png',
    apple: '/game-console.png',
  },
  description: "The official Esports Community platform for Daffodil International University. Join tournaments, creating teams, and compete with the best.",
  keywords: [
    "Esports", "DIU", "Daffodil International University", "Daffodil", "DIU Esports", "DIU Esports Community",
    "Gaming", "Tournament", "Valorant", "PUBG Mobile", "FIFA", "CS2", "Bangladesh Esports",
    "oficialasif", "Asif Mahmud", "Developer Asif", "Full Stack Developer"
  ],
  authors: [{ name: "Asif Mahmud (oficialasif)", url: "https://oficialasif.vercel.app" }, { name: "DIUEC Team" }],
  creator: "oficialasif",
  publisher: "DIU Esports Community",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://diuec.com",
    title: "DIU Esports Community",
    description: "Join the ultimate university esports experience. Compete, win, and rise to the top.",
    siteName: "DIU Esports Community",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DIU Esports Community Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIU Esports Community",
    description: "The official home of DIU Esports. Developed by oficialasif.",
    creator: "@oficialasif",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "DIU Esports Community",
      "url": "https://diuec.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://diuec.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "DIU Esports Community",
      "url": "https://diuec.com",
      "logo": "https://diuec.com/logo.png",
      "sameAs": [
        "https://www.facebook.com/diuesports",
        "https://twitter.com/diuesports"
      ]
    },
    {
      "@type": "Person",
      "name": "Asif Mahmud",
      "alternateName": "oficialasif",
      "url": "https://oficialasif.vercel.app",
      "jobTitle": "Lead Developer",
      "worksFor": {
        "@type": "Organization",
        "name": "DIU Esports Community"
      },
      "sameAs": [
        "https://github.com/oficialasif",
        "https://www.facebook.com/OficialAsif2",
        "https://linkedin.com/in/oficialasif",
        "https://oficialasif.vercel.app"
      ]
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-black text-white user-cursor-area`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <AuthProvider>
            <UserCustomCursor />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" />
            <SonnerToaster richColors position="top-center" />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
