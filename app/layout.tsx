import type { Metadata } from "next";
import {
  Geist_Mono,
  Gilda_Display,
  Google_Sans_Flex,
  Instrument_Serif, Geist } from "next/font/google";
import { ThemeToggleShortcut } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth/provider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const gildaDisplay = Gilda_Display({
  variable: "--font-gilda-display",
  subsets: ["latin"],
  weight: ["400"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneHealth — Your health, records & care in one place",
  description:
    "OneHealth keeps your medical stories, prescriptions and hospital access together. Patient-first, consent-based, always available.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", googleSansFlex.variable, instrumentSerif.variable, gildaDisplay.variable, geistMono.variable, "font-sans", geist.variable)}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
        <ThemeToggleShortcut />
      </body>
      </ThemeProvider>
    </html>
  );
}