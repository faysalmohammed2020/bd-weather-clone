"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Locale } from "@/i18n-config"

interface LanguageSwitcherProps {
  lang: Locale
  dictionary: any
}

export default function LanguageSwitcher({ lang, dictionary }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const otherLang = lang === "ar" ? "en" : "ar"
  const isRtl = lang === "ar"

  // Replace the current language segment with the other language
  // or add the language segment if it's a non-localized route
  const newPathname = pathname.startsWith(`/${lang}`)
    ? pathname.replace(`/${lang}`, `/${otherLang}`)
    : `/${otherLang}${pathname}`

  const handleLanguageChange = () => {
    // Force a full page reload to ensure all RTL/LTR styles are properly applied
    window.location.href = newPathname
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={handleLanguageChange}
    >
      <Globe className={`h-4 w-4 ${isRtl ? "ml-1.5" : "mr-1.5"}`} />
      <span>
        {dictionary.header?.switchToArabic ||
          dictionary.common?.switchLanguage ||
          (lang === "ar" ? "English" : "العربية")}
      </span>
    </Button>
  )
}
