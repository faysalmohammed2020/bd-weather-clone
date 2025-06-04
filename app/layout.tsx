import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Inter, Amiri } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "BD Weather",
  description: "BD Weather",
};

// English
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Arabic
const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn("antialiased", {
          [inter.className]: locale === "en",
          [amiri.className]: locale === "ar",
        })}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
