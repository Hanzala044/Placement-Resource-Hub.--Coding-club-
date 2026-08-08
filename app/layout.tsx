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

// Runs before React hydrates so a previously-chosen "cream" theme (see
// ThemeToggle) applies immediately instead of flashing the default theme
// first. Static, no user input involved — safe to inline.
const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('prh:theme')==='cream'){document.documentElement.setAttribute('data-theme','cream')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {/* suppressHydrationWarning: some browser extensions (ad blockers, form
          fillers, etc.) inject attributes onto <html>/<body> before React
          hydrates, which React otherwise flags as a mismatch even though
          nothing is actually wrong with the render. It also covers the
          data-theme attribute the script above sets pre-hydration. */}
      <body suppressHydrationWarning className="min-h-full">
        <ToastProvider>
          <ConfirmProvider>
            <Shell>{children}</Shell>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
