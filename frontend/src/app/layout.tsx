import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HydroSenseAI",
  description: "Multi-Model AI Agriculture Orchestration System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-theme-3 min-h-screen text-gray-800`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
