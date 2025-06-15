"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Umbrella,
  Droplets,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useTranslations } from "next-intl";

const alertData = [
  { name: "12AM", temp: 28, rainfall: 20, alerts: 2 },
  { name: "3AM", temp: 27, rainfall: 45, alerts: 3 },
  { name: "6AM", temp: 26, rainfall: 80, alerts: 5 },
  { name: "9AM", temp: 28, rainfall: 60, alerts: 4 },
  { name: "12PM", temp: 31, rainfall: 30, alerts: 2 },
  { name: "3PM", temp: 33, rainfall: 10, alerts: 1 },
  { name: "6PM", temp: 30, rainfall: 25, alerts: 2 },
  { name: "9PM", temp: 29, rainfall: 40, alerts: 3 },
];

const regionData = [
  { name: "Chittagong", alerts: 12, floods: 8, cyclones: 2 },
  { name: "Khulna", alerts: 8, floods: 6, cyclones: 1 },
  { name: "Barisal", alerts: 10, floods: 7, cyclones: 3 },
  { name: "Sylhet", alerts: 9, floods: 5, cyclones: 1 },
  { name: "Dhaka", alerts: 6, floods: 3, cyclones: 0 },
  { name: "Rajshahi", alerts: 4, floods: 2, cyclones: 0 },
];

export default function WeatherAlertsSection() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const t = useTranslations('landingPage.weatherAlertsSection')
  return (
    <section className="relative w-full py-16 bg-gradient-to-r from-amber-50 to-red-50 dark:from-gray-900 dark:to-red-950/20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-amber-300/20 dark:bg-amber-700/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-red-300/20 dark:bg-red-700/10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Alert animation */}
      <div className="absolute top-10 right-10 pointer-events-none">
        <motion.div
          className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <AlertTriangle className="h-8 w-8 text-red-500/50" />
        </motion.div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            className="space-y-6 order-2 lg:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
          >
            <motion.div variants={item}>
              <div className="inline-block rounded-lg bg-amber-200 dark:bg-amber-900/50 px-3 py-1 text-sm text-amber-700 dark:text-amber-300">
                {t('title')}
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-red-700 dark:from-amber-400 dark:to-red-400"
              variants={item}
            >
              {t('subtitle')}
            </motion.h2>

            <motion.p
              className="text-gray-700 dark:text-gray-300 md:text-lg"
              variants={item}
            >
              {t('description')}
            </motion.p>

            <motion.ul className="space-y-6 mt-8" variants={container}>
              <motion.li
                className="flex items-start gap-4"
                variants={item}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 mt-1">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {t('cycloneWarnings.title')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                   {t('cycloneWarnings.description')}
                  </p>
                </div>
              </motion.li>

              <motion.li
                className="flex items-start gap-4"
                variants={item}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 mt-1">
                  <Umbrella className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {t('floodAlerts.title')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('floodAlerts.description')}
                  </p>
                </div>
              </motion.li>

              <motion.li
                className="flex items-start gap-4"
                variants={item}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 mt-1">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {t('droughtMonitoring.title')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t('droughtMonitoring.description')}
                  </p>
                </div>
              </motion.li>
            </motion.ul>

            <motion.div className="pt-6" variants={item}>
              <Link href="/features">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-300 group">
                  {t('learnMore')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2 border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-gray-900 p-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
            viewport={{ once: true }}
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.div
                className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                <span className="font-medium">{t('liveAlerts')}</span>
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {t('dashboardTitle')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   {t('dashboardSubtitle')}
                  </p>
                </div>
                <button className="text-sm flex items-center text-amber-600 dark:text-amber-400 hover:underline">
                 {t('details')} <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                   {t('activeAlerts.title')}
                  </p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {t('activeAlerts.totals.total')}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t('activeAlerts.todayIncrease')}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t('activeAlerts.floodWarnings')}
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {t('activeAlerts.totals.floods')}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t('activeAlerts.critical')}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {t('activeAlerts.cycloneWatches')}
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {t('activeAlerts.totals.cyclones')}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {t('activeAlerts.warning')}
                  </p>
                </div>
              </div>

              <div className="h-64">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('weatherTrends24h')}
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={alertData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRainfall"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorAlerts"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      strokeOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rainfall"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRainfall)"
                      name="Rainfall (mm)"
                    />
                    <Area
                      type="monotone"
                      dataKey="alerts"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorAlerts)"
                      name="Alerts"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 {t('regionalAlerts')}
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      strokeOpacity={0.2}
                    />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="alerts"
                      fill="#f59e0b"
                      name={t("totalAlerts")}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="floods"
                      fill="#3b82f6"
                      name={t("floods")}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cyclones"
                      fill="#ef4444"
                      name={t("cyclones")}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
