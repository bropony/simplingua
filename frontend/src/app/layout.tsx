import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simplingua - Constructed Language Learning Platform",
  description: "Learn Simplingua - a simple, regular constructed language. Comprehensive tools for vocabulary, grammar, and community interaction.",
  keywords: ["conlang", "constructed language", "language learning", "Simplingua"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
