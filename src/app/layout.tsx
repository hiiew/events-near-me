import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Rounded, friendly font from the style guide (ui-ux.md §4).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happening — events near you",
  description: "Find gigs, markets, workshops and meetups happening near you.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbf5" },
    { media: "(prefers-color-scheme: dark)", color: "#17132b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
