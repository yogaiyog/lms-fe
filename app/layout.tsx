import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import QueryProvider from "@/lib/query-provider";
import "./globals.css";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
  ],
});

const lexend = localFont({
  variable: "--font-lexend",
  display: "swap",
  src: "./fonts/lexend-latin.woff2",
});

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "LMS Coding";

export const metadata: Metadata = {
  title: COMPANY_NAME,
  description: "Platform belajar coding untuk anak-anak Indonesia",
  icons: [{ rel: "icon", url: "/logo.png" }, { rel: "shortcut icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
