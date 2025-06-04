import Sidebar from "../../../components/sidebar";
import { LocationProvider } from "@/contexts/divisionContext";
import { HourProvider } from "@/contexts/hourContext";
import Profile from "@/components/profile";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <>
    <NextIntlClientProvider>
      <div className="flex fixed size-full bg-gray-50">
        <Sidebar />
        <div className="flex w-full flex-col overflow-hidden">
          <div className="bg-blue-400 flex flex-col p-2 items-end">
            <Profile />
          </div>
          <div className="grow overflow-y-auto relative p-6">
            <LocationProvider>
              <HourProvider>
                {children}
              </HourProvider>
            </LocationProvider>
          </div>
        </div>
      </div>
      </NextIntlClientProvider>
    </>
  );
};

export default DashboardLayout;
