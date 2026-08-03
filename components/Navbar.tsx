"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cloud, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./language-switcher";
import ThemeToggle from "./theme-toggle";

interface NavbarProps {
  isScrolled: boolean;
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("landingPage");

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/features", label: t("features") },
    { href: "/about", label: t("about") },
    { href: "/data-sources", label: t("dataSources") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/95"
          : "bg-white/95 dark:bg-slate-950/95"
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <div className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
            <Cloud className="absolute inset-0 h-7 w-7 text-white sm:h-8 sm:w-8" />
          </div>
          <span className="truncate bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-base font-bold text-transparent sm:text-xl dark:from-cyan-400 dark:to-blue-400">
            {t("brandName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                isActive(item.href)
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          <Link href="/sign-in" className="hidden md:block">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2">
              {t("signIn")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>

          <ThemeToggle />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b bg-white dark:bg-gray-900">
              <nav className="container flex flex-col py-4 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard"
                  className="mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                    {t("accessDashboard")}
                  </Button>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
