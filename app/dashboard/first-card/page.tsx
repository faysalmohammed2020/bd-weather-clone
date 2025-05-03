// import { MeteorologicalDataForm } from "@/app/dashboard/first-card/meteorological-data-form"
import { MeteorologicalDataForm } from '@/app/dashboard/first-card/meteorological-data-form';
// import { MeteorologicalDataForm } from '@/app/dashboard/first-card/meteorological-data-form';

export default function Home() {
  return (
    <div className=" bg-zinc-50 ">
    <main className="container mx-auto py-8 px-4 ">
      <h1 className="text-2xl font-bold mb-6 text-center">Bangladesh Weather Data Collection</h1>
      <MeteorologicalDataForm />
    </main>
    </div>
  )
}
