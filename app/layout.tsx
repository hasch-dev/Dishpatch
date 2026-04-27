import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

// Inter for clean, legible UI/Body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Create a CSS variable
});

// Montserrat for bold, high-fashion headlines
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat", // Create a CSS variable
});

export const metadata: Metadata = {
  title: "Dishpatch | Bespoke Culinary Logistics",
  description:
    "A modern culinary system for private chef experiences and consultancy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Applying both variables to the body so they are available throughout the app */}
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Defaulting to your "Polished Marble" theme
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
