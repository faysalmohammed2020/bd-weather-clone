"use client";

import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) {
      window.location.reload();
      return;
    }

    const localePrefix = new RegExp(
      `^/(${routing.locales.join("|")})(?=/|$)`,
    );
    const unlocalizedPath = pathname.replace(localePrefix, "") || "/";
    const nextPath =
      unlocalizedPath === "/"
        ? `/${newLocale}`
        : `/${newLocale}${unlocalizedPath}`;
    const destination = new URL(window.location.href);

    destination.pathname = nextPath;
    window.location.assign(destination.toString());
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
          <span className={locale === "en" ? "font-bold text-green-700" : ""}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage("ar")}>
          <span className={locale === "ar" ? "font-bold text-green-700" : ""}>العربية</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage("ja")}>
          <span className={locale === "ja" ? "font-bold text-green-700" : ""}>日本語</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
