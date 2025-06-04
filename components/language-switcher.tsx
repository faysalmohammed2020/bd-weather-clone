  "use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();
  const t = useTranslations();

  // Set initial direction based on current locale
  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale as string;
  }, [locale]);

  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
    // The useEffect will handle the direction change after the locale changes
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-green-700 hover:bg-green-600 text-white hover:text-white"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLanguage("en")}>
          <span className={locale === "en" ? "font-bold" : ""}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage("ar")}>
          <span className={locale === "ar" ? "font-bold" : ""}>العربية</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
