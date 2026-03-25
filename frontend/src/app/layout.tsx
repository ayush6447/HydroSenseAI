import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HydroSenseAI | AI Agriculture Orchestrator",
  description: "Modern Responsive Multi-Model AI Agriculture Dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased selection:bg-accent/10 selection:text-accent`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
