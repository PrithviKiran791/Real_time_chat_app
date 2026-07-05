import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConvexClientProvider from "@/Providers/ConvexClientprovider";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const sourceSans3Heading = Source_Sans_3({subsets:['latin'],variable:'--font-heading'});

const oxanium = Oxanium({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat Sphere",
  description: "A premium real-time chat application",
  icons: {
    icon: "/site-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", oxanium.variable, sourceSans3Heading.variable)}
    >
      <body className={geistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme={false} disableTransitionOnChange>
        <ConvexClientProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
