// "use client";

// import { useState } from "react";
// import { MeteorologicalDataForm } from "../first-card/meteorological-data-form";
// import WeatherObservationForm from "../second-card/SecondCard";
// import WeatherDataForm from "../daily-summery/weather-data-form";
// import SynopticCodeForm from "../synoptic-code/synoptic-code-form";

// export default function WeatherFormPage() {
//   const tabKeys = [
//     "first-card",
//     "second-card",
//     "daily-summery",
//     "synoptic-code",
//   ] as const;
//   type TabKey = (typeof tabKeys)[number];

//   const [activeTab, setActiveTab] = useState<TabKey>("first-card");

//   const tabLabels: Record<TabKey, string> = {
//     "first-card": "First Card",
//     "second-card": "Second Card",
//     "daily-summery": "Daily Summary",
//     "synoptic-code": "Synoptic Code",
//   };

//   const currentTabIndex = tabKeys.indexOf(activeTab);
//   const isLastStep = currentTabIndex === tabKeys.length - 1;

//   const handleNext = () => {
//     if (!isLastStep) {
//       setActiveTab(tabKeys[currentTabIndex + 1]);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (isLastStep) {
//       console.log("Form submitted");
//       // Collect and send data here
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "first-card":
//         return <MeteorologicalDataForm />;
//       case "second-card":
//         return <WeatherObservationForm />;
//       case "daily-summery":
//         return (
//           <div>
//             <h1 className="text-2xl font-bold text-center mb-6">DAILY SUMMARY</h1>
//             <WeatherDataForm />
//           </div>
//         );
//       case "synoptic-code":
//         return (
//           <div>
//             <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
//               Weather Data Management System
//             </h1>
//             <SynopticCodeForm />
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <main className="container mx-auto py-8 px-4">
//       <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
//         Weather Form Entry
//       </h1>

//       {/* Tabs */}
//       <div className="flex justify-center mb-6">
//         {tabKeys.map((key) => (
//           <button
//             key={key}
//             type="button"
//             className={`px-4 py-2 font-medium rounded-t-lg border-b-2 ${
//               activeTab === key
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-500 hover:text-blue-600"
//             }`}
//             onClick={() => setActiveTab(key)}
//           >
//             {tabLabels[key]}
//           </button>
//         ))}
//       </div>

//       {/* Form */}
//       <form
//         className="bg-white p-6 rounded-lg shadow space-y-4"
//         onSubmit={handleSubmit}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && !isLastStep) {
//             e.preventDefault(); // prevent premature submit
//           }
//         }}
//       >
//         {renderTabContent()}

//         <div className="flex justify-end pt-4">
//           {!isLastStep ? (
//             <button
//               type="button"
//               onClick={handleNext}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               type="submit"
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//             >
//               Submit
//             </button>
//           )}
//         </div>
//       </form>
//     </main>
//   );
// }





















"use client";

import { useState } from "react";
import { MeteorologicalDataForm } from "../first-card/meteorological-data-form";
import WeatherObservationForm from "../second-card/SecondCard";
import WeatherDataForm from "../daily-summery/weather-data-form";
import SynopticCodeForm from "../synoptic-code/synoptic-code-form";

type FormData = {
  meteorological: { city: string };
  observation: { temperature: string };
  summary: { remarks: string };
  synoptic: { code: string };
};

export default function WeatherFormPage() {
  const tabKeys = [
    "first-card",
    "second-card",
    "daily-summery",
    "synoptic-code",
  ] as const;
  type TabKey = (typeof tabKeys)[number];

  const [activeTab, setActiveTab] = useState<TabKey>("first-card");

  const [formData, setFormData] = useState<FormData>({
    meteorological: { city: "" },
    observation: { temperature: "" },
    summary: { remarks: "" },
    synoptic: { code: "" },
  });

  const updateFormData = (section: keyof FormData, newData: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...newData,
      },
    }));
  };

  const tabLabels: Record<TabKey, string> = {
    "first-card": "First Card",
    "second-card": "Second Card",
    "daily-summery": "Daily Summary",
    "synoptic-code": "Synoptic Code",
  };

  const currentTabIndex = tabKeys.indexOf(activeTab);
  const isLastStep = currentTabIndex === tabKeys.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setActiveTab(tabKeys[currentTabIndex + 1]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLastStep) {
      console.log("Final submitted data:", formData);
      // Here, you can send `formData` to backend
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "first-card":
        return (
          <MeteorologicalDataForm
            value={formData.meteorological}
            onChange={(data: any) => updateFormData("meteorological", data)}
          />
        );
      case "second-card":
        return (
          <WeatherObservationForm
            value={formData.observation}
            onChange={(data: any) => updateFormData("observation", data)}
          />
        );
      case "daily-summery":
        return (
          <WeatherDataForm
            value={formData.summary}
            onChange={(data: any) => updateFormData("summary", data)}
          />
        );
      case "synoptic-code":
        return (
          <SynopticCodeForm
            value={formData.synoptic}
            onChange={(data: any) => updateFormData("synoptic", data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
        Weather Form Entry
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        {tabKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`px-4 py-2 font-medium rounded-t-lg border-b-2 ${
              activeTab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(key)}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        className="bg-white p-6 rounded-lg shadow space-y-4"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLastStep) {
            e.preventDefault(); // prevent premature submit
          }
        }}
      >
        {renderTabContent()}

        <div className="flex justify-end pt-4">
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
