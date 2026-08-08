import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Shell } from "@/components/Shell";
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
      <body suppressHydrationWarning className="min-h-full bg-zinc-50 dark:bg-black">
        <ToastProvider>
          <ConfirmProvider>
            <Shell>{children}</Shell>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
