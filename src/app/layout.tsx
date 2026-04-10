import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "简语 Simplingua",
    template: "%s | 简语 Simplingua",
  },
  description: "简语学习与讨论平台 — 浏览词汇表、阅读语法书、参与社区讨论",
  keywords: ["简语", "Simplingua", "人造语言", "语言学习", "conlang"],
  openGraph: {
    title: "简语 Simplingua",
    description: "简语学习与讨论平台 — 浏览词汇表、阅读语法书、参与社区讨论",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="228216"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
