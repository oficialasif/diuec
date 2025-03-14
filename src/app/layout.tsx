import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DIU Esports Community",
  description: "Daffodil International University Esports Community Platform",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-black text-white`}>
        <Providers>
          <AuthProvider>
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow mt-16">
                  {children}
                </main>
                <Footer />
              </div>
            </ProtectedRoute>
            <Toaster position="top-center" />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
