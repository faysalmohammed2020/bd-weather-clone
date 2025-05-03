"use client"


import WeatherDataForm from "./weather-data-form"

export default function DailySummery() {
  return (
    <main className="container mx-auto p-4 md:p-8">
    
      <h1 className="text-2xl font-bold text-center mb-6">DAILY SUMMARY</h1>
      <WeatherDataForm />
    </main>
  )
}
