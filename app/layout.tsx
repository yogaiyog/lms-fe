import type { Metadata, Viewport } from "next";
import { Lexend, Poppins } from "next/font/google";
import QueryProvider from "@/lib/query-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
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
