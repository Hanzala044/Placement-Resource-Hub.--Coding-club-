import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement Resource Hub",
  description: "Interview experiences and prep resources, shared by seniors for juniors.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: some browser extensions (ad blockers, form
          fillers, etc.) inject attributes onto <html>/<body> before React
          hydrates, which React otherwise flags as a mismatch even though
          nothing is actually wrong with the render. */}
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <ToastProvider>
          <ConfirmProvider>
            <Navbar />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              Built for AITM Coding Club Screening — Track 2
            </footer>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
