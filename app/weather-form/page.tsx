// "use client"

// import { useState } from "react"
// import { Formik, Form } from "formik"
// import * as Yup from "yup"
// import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
// import { Loader2, Save } from "lucide-react"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"

// // Import all form components
// import CloudTab from "@/components/weather-form/cloud-tab"
// import RainfallTab from "@/components/weather-form/rainfall-tab"
// import PressureTab from "@/components/weather-form/pressure-tab"
// import TemperatureTab from "@/components/weather-form/temperature-tab"
// import BasicInfoTab from "../dashboard/daily-summery/tabs/basic-info-tab"
// import MeasurementsTab from "../dashboard/daily-summery/tabs/measurements-tab"
// import MeteorCodesTab from "../dashboard/daily-summery/tabs/meteor-codes-tab"
// import CharacterCodesTab from "../dashboard/daily-summery/tabs/character-codes-tab"
// import WindDirectionTab from "../dashboard/daily-summery/tabs/wind-direction-tab"
// import SynopticMeasurementsTab from "../dashboard/synoptic-code/synoptic-components/synoptic-measurement"

// // Define validation schema
// const validationSchema = Yup.object({
//   // Basic info
//   dataType: Yup.string().max(2, "Maximum 2 characters"),
//   stationNo: Yup.string().max(5, "Maximum 5 characters"),
//   year: Yup.string().max(2, "Maximum 2 characters"),
//   month: Yup.string().max(2, "Maximum 2 characters"),
//   day: Yup.string().max(2, "Maximum 2 characters"),

//   // Measurements
//   measurements: Yup.array().of(Yup.string().nullable()),

//   // Meteor codes
//   meteorCodes: Yup.array().of(Yup.string().nullable()),

//   // Character codes
//   characterCodes: Yup.object(),

//   // Wind direction
//   windDirection: Yup.string().nullable(),
//   windTime: Yup.string().nullable(),

//   // Synoptic measurements
//   weatherRemark: Yup.string().nullable(),

//   // First card data
//   pressure: Yup.object().nullable(),
//   temperature: Yup.object().nullable(),

//   // Second card data
//   cloud: Yup.object().nullable(),
//   rainfall: Yup.object().nullable(),
// })

// export default function WeatherFormPage() {
//   const [submitting, setSubmitting] = useState(false)
//   const router = useRouter()

//   // Define main form tabs
//   const mainTabs = [
//     { id: "basic-info", label: "Basic Info", color: "blue" },
//     { id: "first-card", label: "First Card", color: "indigo" },
//     { id: "second-card", label: "Second Card", color: "violet" },
//     { id: "daily-summary", label: "Daily Summary", color: "green" },
//     { id: "synoptic-code", label: "Synoptic Code", color: "amber" },
//   ]

//   // Define sub-tabs for each main tab
//   const subTabs = {
//     "first-card": [
//       { id: "pressure", label: "Pressure", icon: "BarChart3" },
//       { id: "temperature", label: "Temperature", icon: "Thermometer" },
//       { id: "humidity", label: "Humidity", icon: "Droplets" },
//     ],
//     "second-card": [
//       { id: "cloud", label: "Cloud", icon: "Cloud" },
//       { id: "rainfall", label: "Rainfall", icon: "CloudRain" },
//       { id: "wind", label: "Wind", icon: "Wind" },
//     ],
//     "daily-summary": [
//       { id: "measurements", label: "Measurements", icon: "BarChart3" },
//       { id: "meteor-codes", label: "Meteor Codes", icon: "Cloud" },
//       { id: "character-codes", label: "Character Codes", icon: "CloudRain" },
//       { id: "wind-direction", label: "Wind Direction", icon: "Wind" },
//     ],
//     "synoptic-code": [{ id: "synoptic-measurements", label: "Measurements", icon: "BarChart3" }],
//   }

//   const [activeMainTab, setActiveMainTab] = useState("basic-info")
//   const [activeSubTabs, setActiveSubTabs] = useState({
//     "first-card": "pressure",
//     "second-card": "cloud",
//     "daily-summary": "measurements",
//     "synoptic-code": "synoptic-measurements",
//   })

//   // Initial form values
//   const initialValues = {
//     // Basic info
//     dataType: "",
//     stationNo: "",
//     year: "",
//     month: "",
//     day: "",

//     // Measurements
//     measurements: Array(16).fill(""),

//     // Meteor codes
//     meteorCodes: Array(8).fill(""),

//     // Character codes
//     characterCodes: {},

//     // Wind direction
//     windDirection: "",
//     windTime: "",

//     // Synoptic measurements
//     weatherRemark: "",

//     // First card data
//     pressure: {},
//     temperature: {},
//     humidity: {},

//     // Second card data
//     cloud: {},
//     rainfall: {},
//     wind: {},
//   }

//   // Handle form submission
//   const handleSubmit = async (values, { resetForm }) => {
//     try {
//       setSubmitting(true)

//       // Combine all data into a single object
//       const combinedData = {
//         timestamp: new Date().toISOString(),
//         basicInfo: {
//           dataType: values.dataType,
//           stationNo: values.stationNo,
//           year: values.year,
//           month: values.month,
//           day: values.day,
//         },
//         firstCard: {
//           pressure: values.pressure,
//           temperature: values.temperature,
//           humidity: values.humidity,
//         },
//         secondCard: {
//           cloud: values.cloud,
//           rainfall: values.rainfall,
//           wind: values.wind,
//         },
//         dailySummary: {
//           measurements: values.measurements,
//           meteorCodes: values.meteorCodes,
//           characterCodes: values.characterCodes,
//           windDirection: values.windDirection,
//           windTime: values.windTime,
//         },
//         synopticCode: {
//           weatherRemark: values.weatherRemark,
//         },
//       }

//       // Send data to the server
//       const response = await fetch("/api/weather-data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(combinedData),
//       })

//       const result = await response.json()

//       if (result.success) {
//         toast.success("Weather data saved successfully!")
//         resetForm()
//         setTimeout(() => router.push("/dashboard"), 1500)
//       } else {
//         throw new Error(result.message || "Failed to save weather data")
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error)
//       toast.error("An error occurred while saving the data. Please try again.")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // Handle sub-tab change
//   const handleSubTabChange = (mainTab, subTab) => {
//     setActiveSubTabs((prev) => ({
//       ...prev,
//       [mainTab]: subTab,
//     }))
//   }

//   // Navigate to next main tab
//   const handleNextMainTab = () => {
//     const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
//     if (currentIndex < mainTabs.length - 1) {
//       setActiveMainTab(mainTabs[currentIndex + 1].id)
//     }
//   }

//   // Navigate to previous main tab
//   const handlePrevMainTab = () => {
//     const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
//     if (currentIndex > 0) {
//       setActiveMainTab(mainTabs[currentIndex - 1].id)
//     }
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">

//       <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Weather Data Management System</h1>

//       <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
//         {({ values, errors, touched, isSubmitting }) => (
//           <Form>
//             <Card className="shadow-lg border-t-4 border-t-blue-500">
//               {/* Main Tabs */}
//               <CardHeader className="pb-0">
//                 <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
//                   <TabsList className="w-full grid grid-cols-5 gap-1">
//                     {mainTabs.map((tab) => (
//                       <TabsTrigger
//                         key={tab.id}
//                         value={tab.id}
//                         className={`data-[state=active]:bg-${tab.color}-500 data-[state=active]:text-white`}
//                       >
//                         {tab.label}
//                       </TabsTrigger>
//                     ))}
//                   </TabsList>
//                 </Tabs>
//               </CardHeader>

//               <CardContent className="pt-6">
//                 {/* Basic Info Tab */}
//                 {activeMainTab === "basic-info" && (
//                   <div className="border-2 border-blue-100 rounded-md p-4 bg-blue-50/30">
//                     <BasicInfoTab />
//                   </div>
//                 )}

//                 {/* First Card Tab */}
//                 {activeMainTab === "first-card" && (
//                   <div>
//                     <Tabs 
//                       value={activeSubTabs["first-card"]} 
//                       onValueChange={(value) => handleSubTabChange("first-card", value)}
//                     >
//                       <TabsList className="mb-4">
//                         {subTabs["first-card"].map((tab) => (
//                           <TabsTrigger
//                             key={tab.id}
//                             value={tab.id}
//                             className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
//                           >
//                             {tab.label}
//                           </TabsTrigger>
//                         ))}
//                       </TabsList>
//                     </Tabs>

//                     <div className="border-2 border-indigo-100 rounded-md p-4 bg-indigo-50/30">
//                       {activeSubTabs["first-card"] === "pressure" && <PressureTab />}
//                       {activeSubTabs["first-card"] === "temperature" && <TemperatureTab />}
//                       {/* Add other first card sub-tabs as needed */}
//                     </div>
//                   </div>
//                 )}

//                 {/* Second Card Tab */}
//                 {activeMainTab === "second-card" && (
//                   <div>
//                     <Tabs 
//                       value={activeSubTabs["second-card"]} 
//                       onValueChange={(value) => handleSubTabChange("second-card", value)}
//                     >
//                       <TabsList className="mb-4">
//                         {subTabs["second-card"].map((tab) => (
//                           <TabsTrigger
//                             key={tab.id}
//                             value={tab.id}
//                             className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
//                           >
//                             {tab.label}
//                           </TabsTrigger>
//                         ))}
//                       </TabsList>
//                     </Tabs>

//                     <div className="border-2 border-violet-100 rounded-md p-4 bg-violet-50/30">
//                       {activeSubTabs["second-card"] === "cloud" && <CloudTab />}
//                       {activeSubTabs["second-card"] === "rainfall" && <RainfallTab />}
//                       {/* Add other second card sub-tabs as needed */}
//                     </div>
//                   </div>
//                 )}

//                 {/* Daily Summary Tab */}
//                 {activeMainTab === "daily-summary" && (
//                   <div>
//                     <Tabs 
//                       value={activeSubTabs["daily-summary"]} 
//                       onValueChange={(value) => handleSubTabChange("daily-summary", value)}
//                     >
//                       <TabsList className="mb-4">
//                         {subTabs["daily-summary"].map((tab) => (
//                           <TabsTrigger
//                             key={tab.id}
//                             value={tab.id}
//                             className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
//                           >
//                             {tab.label}
//                           </TabsTrigger>
//                         ))}
//                       </TabsList>
//                     </Tabs>

//                     <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
//                       {activeSubTabs["daily-summary"] === "measurements" && <MeasurementsTab />}
//                       {activeSubTabs["daily-summary"] === "meteor-codes" && <MeteorCodesTab />}
//                       {activeSubTabs["daily-summary"] === "character-codes" && <CharacterCodesTab />}
//                       {activeSubTabs["daily-summary"] === "wind-direction" && <WindDirectionTab />}
//                     </div>
//                   </div>
//                 )}

//                 {/* Synoptic Code Tab */}
//                 {activeMainTab === "synoptic-code" && (
//                   <div>
//                     <Tabs 
//                       value={activeSubTabs["synoptic-code"]} 
//                       onValueChange={(value) => handleSubTabChange("synoptic-code", value)}
//                     >
//                       <TabsList className="mb-4">
//                         {subTabs["synoptic-code"].map((tab) => (
//                           <TabsTrigger
//                             key={tab.id}
//                             value={tab.id}
//                             className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
//                           >
//                             {tab.label}
//                           </TabsTrigger>
//                         ))}
//                       </TabsList>
//                     </Tabs>

//                     <div className="border-2 border-amber-100 rounded-md p-4 bg-amber-50/30">
//                       {activeSubTabs["synoptic-code"] === "synoptic-measurements" && <SynopticMeasurementsTab />}
//                     </div>
//                   </div>
//                 )}
//               </CardContent>

//               <CardFooter className="border-t pt-6 flex justify-between">
//                 <div>
//                   {Object.keys(errors).length > 0 && (
//                     <p className="text-sm text-destructive">Please fill in all required fields before submitting</p>
//                   )}
//                 </div>

//                 <div className="space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => handlePrevMainTab()}
//                     disabled={activeMainTab === mainTabs[0].id}
//                   >
//                     Previous
//                   </Button>

//                   {activeMainTab !== mainTabs[mainTabs.length - 1].id ? (
//                     <Button type="button" onClick={() => handleNextMainTab()} className="bg-blue-600 hover:bg-blue-700">
//                       Next
//                     </Button>
//                   ) : (
//                     <Button
//                       type="submit"
//                       disabled={isSubmitting || submitting}
//                       className="bg-green-600 hover:bg-green-700"
//                     >
//                       {isSubmitting || submitting ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           Submitting...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="mr-2 h-4 w-4" />
//                           Submit All Data
//                         </>
//                       )}
//                     </Button>
//                   )}
//                 </div>
//               </CardFooter>
//             </Card>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   )
// }



// "use client"

// import { useState } from "react"
// import { Formik, Form } from "formik"
// import * as Yup from "yup"
// import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Loader2, Save } from "lucide-react"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"

// // Import all form components
// import CloudTab from "@/components/weather-form/cloud-tab"
// import RainfallTab from "@/components/weather-form/rainfall-tab"
// import PressureTab from "@/components/weather-form/pressure-tab"
// import TemperatureTab from "@/components/weather-form/temperature-tab"
// import BasicInfoTab from "../dashboard/daily-summery/tabs/basic-info-tab"
// import MeasurementsTab from "../dashboard/daily-summery/tabs/measurements-tab"
// import MeteorCodesTab from "../dashboard/daily-summery/tabs/meteor-codes-tab"
// import CharacterCodesTab from "../dashboard/daily-summery/tabs/character-codes-tab"
// import WindDirectionTab from "../dashboard/daily-summery/tabs/wind-direction-tab"
// import SynopticMeasurementsTab from "../dashboard/synoptic-code/synoptic-components/synoptic-measurement"

// // Define validation schema
// const validationSchema = Yup.object({
//   // Basic info
//   dataType: Yup.string().max(2, "Maximum 2 characters"),
//   stationNo: Yup.string().max(5, "Maximum 5 characters"),
//   year: Yup.string().max(2, "Maximum 2 characters"),
//   month: Yup.string().max(2, "Maximum 2 characters"),
//   day: Yup.string().max(2, "Maximum 2 characters"),

//   // Measurements
//   measurements: Yup.array().of(Yup.string().nullable()),

//   // Meteor codes
//   meteorCodes: Yup.array().of(Yup.string().nullable()),

//   // Character codes
//   characterCodes: Yup.object(),

//   // Wind direction
//   windDirection: Yup.string().nullable(),
//   windTime: Yup.string().nullable(),

//   // Synoptic measurements
//   weatherRemark: Yup.string().nullable(),

//   // First card data
//   pressure: Yup.object().nullable(),
//   temperature: Yup.object().nullable(),

//   // Second card data
//   cloud: Yup.object().nullable(),
//   rainfall: Yup.object().nullable(),
// })

// export default function WeatherFormPage() {
//   const [submitting, setSubmitting] = useState(false)
//   const router = useRouter()

//   // Define main form tabs
//   const mainTabs = [
//     { id: "basic-info", label: "Basic Info", color: "blue" },
//     { id: "first-card", label: "First Card", color: "indigo" },
//     { id: "second-card", label: "Second Card", color: "violet" },
//     { id: "daily-summary", label: "Daily Summary", color: "green" },
//     { id: "synoptic-code", label: "Synoptic Code", color: "amber" },
//   ]

//   // Define sub-tabs for each main tab
//   const subTabs = {
//     "first-card": [
//       { id: "pressure", label: "Pressure", icon: "BarChart3" },
//       { id: "temperature", label: "Temperature", icon: "Thermometer" },
//       { id: "humidity", label: "Humidity", icon: "Droplets" },
//     ],
//     "second-card": [
//       { id: "cloud", label: "Cloud", icon: "Cloud" },
//       { id: "rainfall", label: "Rainfall", icon: "CloudRain" },
//       { id: "wind", label: "Wind", icon: "Wind" },
//     ],
//     "daily-summary": [
//       { id: "measurements", label: "Measurements", icon: "BarChart3" },
//       { id: "meteor-codes", label: "Meteor Codes", icon: "Cloud" },
//       { id: "character-codes", label: "Character Codes", icon: "CloudRain" },
//       { id: "wind-direction", label: "Wind Direction", icon: "Wind" },
//     ],
//     "synoptic-code": [{ id: "synoptic-measurements", label: "Measurements", icon: "BarChart3" }],
//   }

//   const [activeMainTab, setActiveMainTab] = useState("basic-info")
//   const [activeSubTabs, setActiveSubTabs] = useState({
//     "first-card": "pressure",
//     "second-card": "cloud",
//     "daily-summary": "measurements",
//     "synoptic-code": "synoptic-measurements",
//   })

//   // Initial form values
//   const initialValues = {
//     // Basic info
//     dataType: "",
//     stationNo: "",
//     year: "",
//     month: "",
//     day: "",

//     // Measurements
//     measurements: Array(16).fill(""),

//     // Meteor codes
//     meteorCodes: Array(8).fill(""),

//     // Character codes
//     characterCodes: {},

//     // Wind direction
//     windDirection: "",
//     windTime: "",

//     // Synoptic measurements
//     weatherRemark: "",

//     // First card data
//     pressure: {},
//     temperature: {},
//     humidity: {},

//     // Second card data
//     cloud: {},
//     rainfall: {},
//     wind: {},
//   }

//   // Handle form submission
//   const handleSubmit = async (values, { resetForm }) => {
//     // Only proceed if we're on the last tab and the submit button was clicked
//     if (activeMainTab !== mainTabs[mainTabs.length - 1].id) {
//       return // Don't submit if not on the last tab
//     }

//     try {
//       setSubmitting(true)

//       // Combine all data into a single object
//       const combinedData = {
//         timestamp: new Date().toISOString(),
//         basicInfo: {
//           dataType: values.dataType,
//           stationNo: values.stationNo,
//           year: values.year,
//           month: values.month,
//           day: values.day,
//         },
//         firstCard: {
//           pressure: values.pressure,
//           temperature: values.temperature,
//           humidity: values.humidity,
//         },
//         secondCard: {
//           cloud: values.cloud,
//           rainfall: values.rainfall,
//           wind: values.wind,
//         },
//         dailySummary: {
//           measurements: values.measurements,
//           meteorCodes: values.meteorCodes,
//           characterCodes: values.characterCodes,
//           windDirection: values.windDirection,
//           windTime: values.windTime,
//         },
//         synopticCode: {
//           weatherRemark: values.weatherRemark,
//         },
//       }

//       // Send data to the server
//       const response = await fetch("/api/weather-data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(combinedData),
//       })

//       const result = await response.json()

//       if (result.success) {
//         toast.success("Weather data saved successfully!")
//         resetForm()
//         setTimeout(() => router.push("/dashboard"), 1500)
//       } else {
//         throw new Error(result.message || "Failed to save weather data")
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error)
//       toast.error("An error occurred while saving the data. Please try again.")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // Handle sub-tab change
//   const handleSubTabChange = (mainTab, subTab) => {
//     setActiveSubTabs((prev) => ({
//       ...prev,
//       [mainTab]: subTab,
//     }))
//   }

//   // Navigate to next main tab
//   const handleNextMainTab = () => {
//     const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
//     if (currentIndex < mainTabs.length - 1) {
//       setActiveMainTab(mainTabs[currentIndex + 1].id)
//     }
//   }

//   // Navigate to previous main tab
//   const handlePrevMainTab = () => {
//     const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
//     if (currentIndex > 0) {
//       setActiveMainTab(mainTabs[currentIndex - 1].id)
//     }
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">

//       <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Weather Data Management System</h1>

//       <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
//         {({ values, errors, touched, isSubmitting }) => (
//           <Form
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault()
//               }
//             }}
//           >
//             <Card className="shadow-lg border-t-4 border-t-blue-500">
//               {/* Main Tabs */}
//               <CardHeader className="pb-0">
//                 <TabsList className="w-full grid grid-cols-5 gap-1">
//                   {mainTabs.map((tab) => (
//                     <TabsTrigger
//                       key={tab.id}
//                       value={tab.id}
//                       onClick={() => setActiveMainTab(tab.id)}
//                       className={`data-[state=active]:bg-${tab.color}-500 data-[state=active]:text-white`}
//                       data-state={activeMainTab === tab.id ? "active" : "inactive"}
//                     >
//                       {tab.label}
//                     </TabsTrigger>
//                   ))}
//                 </TabsList>
//               </CardHeader>

//               <CardContent className="pt-6">
//                 {/* Basic Info Tab */}
//                 {activeMainTab === "basic-info" && (
//                   <div className="border-2 border-blue-100 rounded-md p-4 bg-blue-50/30">
//                     <BasicInfoTab />
//                   </div>
//                 )}

//                 {/* First Card Tab */}
//                 {activeMainTab === "first-card" && (
//                   <div>
//                     <TabsList className="mb-4">
//                       {subTabs["first-card"].map((tab) => (
//                         <TabsTrigger
//                           key={tab.id}
//                           value={tab.id}
//                           onClick={() => handleSubTabChange("first-card", tab.id)}
//                           className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
//                           data-state={activeSubTabs["first-card"] === tab.id ? "active" : "inactive"}
//                         >
//                           {tab.label}
//                         </TabsTrigger>
//                       ))}
//                     </TabsList>

//                     <div className="border-2 border-indigo-100 rounded-md p-4 bg-indigo-50/30">
//                       {activeSubTabs["first-card"] === "pressure" && <PressureTab />}
//                       {activeSubTabs["first-card"] === "temperature" && <TemperatureTab />}
//                       {/* Add other first card sub-tabs as needed */}
//                     </div>
//                   </div>
//                 )}

//                 {/* Second Card Tab */}
//                 {activeMainTab === "second-card" && (
//                   <div>
//                     <TabsList className="mb-4">
//                       {subTabs["second-card"].map((tab) => (
//                         <TabsTrigger
//                           key={tab.id}
//                           value={tab.id}
//                           onClick={() => handleSubTabChange("second-card", tab.id)}
//                           className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
//                           data-state={activeSubTabs["second-card"] === tab.id ? "active" : "inactive"}
//                         >
//                           {tab.label}
//                         </TabsTrigger>
//                       ))}
//                     </TabsList>

//                     <div className="border-2 border-violet-100 rounded-md p-4 bg-violet-50/30">
//                       {activeSubTabs["second-card"] === "cloud" && <CloudTab />}
//                       {activeSubTabs["second-card"] === "rainfall" && <RainfallTab />}
//                       {/* Add other second card sub-tabs as needed */}
//                     </div>
//                   </div>
//                 )}

//                 {/* Daily Summary Tab */}
//                 {activeMainTab === "daily-summary" && (
//                   <div>
//                     <TabsList className="mb-4">
//                       {subTabs["daily-summary"].map((tab) => (
//                         <TabsTrigger
//                           key={tab.id}
//                           value={tab.id}
//                           onClick={() => handleSubTabChange("daily-summary", tab.id)}
//                           className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
//                           data-state={activeSubTabs["daily-summary"] === tab.id ? "active" : "inactive"}
//                         >
//                           {tab.label}
//                         </TabsTrigger>
//                       ))}
//                     </TabsList>

//                     <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
//                       {activeSubTabs["daily-summary"] === "measurements" && <MeasurementsTab />}
//                       {activeSubTabs["daily-summary"] === "meteor-codes" && <MeteorCodesTab />}
//                       {activeSubTabs["daily-summary"] === "character-codes" && <CharacterCodesTab />}
//                       {activeSubTabs["daily-summary"] === "wind-direction" && <WindDirectionTab />}
//                     </div>
//                   </div>
//                 )}

//                 {/* Synoptic Code Tab */}
//                 {activeMainTab === "synoptic-code" && (
//                   <div>
//                     <TabsList className="mb-4">
//                       {subTabs["synoptic-code"].map((tab) => (
//                         <TabsTrigger
//                           key={tab.id}
//                           value={tab.id}
//                           onClick={() => handleSubTabChange("synoptic-code", tab.id)}
//                           className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
//                           data-state={activeSubTabs["synoptic-code"] === tab.id ? "active" : "inactive"}
//                         >
//                           {tab.label}
//                         </TabsTrigger>
//                       ))}
//                     </TabsList>

//                     <div className="border-2 border-amber-100 rounded-md p-4 bg-amber-50/30">
//                       {activeSubTabs["synoptic-code"] === "synoptic-measurements" && <SynopticMeasurementsTab />}
//                     </div>
//                   </div>
//                 )}
//               </CardContent>

//               <CardFooter className="border-t pt-6 flex justify-between">
//                 <div>
//                   {Object.keys(errors).length > 0 && (
//                     <p className="text-sm text-destructive">Please fill in all required fields before submitting</p>
//                   )}
//                 </div>

//                 <div className="space-x-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => handlePrevMainTab()}
//                     disabled={activeMainTab === mainTabs[0].id}
//                   >
//                     Previous
//                   </Button>

//                   {activeMainTab !== mainTabs[mainTabs.length - 1].id ? (
//                     <Button type="button" onClick={() => handleNextMainTab()} className="bg-blue-600 hover:bg-blue-700">
//                       Next
//                     </Button>
//                   ) : (
//                     <Button
//                       type="submit"
//                       disabled={isSubmitting || submitting}
//                       className="bg-green-600 hover:bg-green-700"
//                     >
//                       {isSubmitting || submitting ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           Submitting...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="mr-2 h-4 w-4" />
//                           Submit All Data
//                         </>
//                       )}
//                     </Button>
//                   )}
//                 </div>
//               </CardFooter>
//             </Card>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   )
// }









"use client"

import { useState } from "react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Import all form components

import CloudTab from "@/components/weather-form/cloud-tab"
import RainfallTab from "@/components/weather-form/rainfall-tab"
import PressureTab from "@/components/weather-form/pressure-tab"
import TemperatureTab from "@/components/weather-form/temperature-tab"
import BasicInfoTab from "../dashboard/daily-summery/tabs/basic-info-tab"
import MeasurementsTab from "../dashboard/daily-summery/tabs/measurements-tab"
import MeteorCodesTab from "../dashboard/daily-summery/tabs/meteor-codes-tab"
import CharacterCodesTab from "../dashboard/daily-summery/tabs/character-codes-tab"
import WindDirectionTab from "../dashboard/daily-summery/tabs/wind-direction-tab"
import SynopticMeasurementsTab from "../dashboard/synoptic-code/synoptic-components/synoptic-measurement"

// Define validation schema
const validationSchema = Yup.object({
  // Basic info
  dataType: Yup.string().max(2, "Maximum 2 characters"),
  stationNo: Yup.string().max(5, "Maximum 5 characters"),
  year: Yup.string().max(2, "Maximum 2 characters"),
  month: Yup.string().max(2, "Maximum 2 characters"),
  day: Yup.string().max(2, "Maximum 2 characters"),

  // Measurements
  measurements: Yup.array().of(Yup.string().nullable()),

  // Meteor codes
  meteorCodes: Yup.array().of(Yup.string().nullable()),

  // Character codes
  characterCodes: Yup.object(),

  // Wind direction
  windDirection: Yup.string().nullable(),
  windTime: Yup.string().nullable(),

  // Synoptic measurements
  weatherRemark: Yup.string().nullable(),

  // First card data
  pressure: Yup.object().nullable(),
  temperature: Yup.object().nullable(),

  // Second card data
  cloud: Yup.object().nullable(),
  rainfall: Yup.object().nullable(),
})

export default function WeatherFormPage() {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Define main form tabs
  const mainTabs = [
    { id: "basic-info", label: "Basic Info", color: "blue" },
    { id: "first-card", label: "First Card", color: "indigo" },
    { id: "second-card", label: "Second Card", color: "violet" },
    { id: "daily-summary", label: "Daily Summary", color: "green" },
    { id: "synoptic-code", label: "Synoptic Code", color: "amber" },
  ]

  // Define sub-tabs for each main tab
  const subTabs = {
    "first-card": [
      { id: "pressure", label: "Pressure", icon: "BarChart3" },
      { id: "temperature", label: "Temperature", icon: "Thermometer" },
      { id: "humidity", label: "Humidity", icon: "Droplets" },
    ],
    "second-card": [
      { id: "cloud", label: "Cloud", icon: "Cloud" },
      { id: "rainfall", label: "Rainfall", icon: "CloudRain" },
      { id: "wind", label: "Wind", icon: "Wind" },
    ],
    "daily-summary": [
      { id: "measurements", label: "Measurements", icon: "BarChart3" },
      { id: "meteor-codes", label: "Meteor Codes", icon: "Cloud" },
      { id: "character-codes", label: "Character Codes", icon: "CloudRain" },
      { id: "wind-direction", label: "Wind Direction", icon: "Wind" },
    ],
    "synoptic-code": [{ id: "synoptic-measurements", label: "Measurements", icon: "BarChart3" }],
  }

  const [activeMainTab, setActiveMainTab] = useState("basic-info")
  const [activeSubTabs, setActiveSubTabs] = useState({
    "first-card": "pressure",
    "second-card": "cloud",
    "daily-summary": "measurements",
    "synoptic-code": "synoptic-measurements",
  })

  // Initial form values
  const initialValues = {
    // Basic info
    dataType: "",
    stationNo: "",
    year: "",
    month: "",
    day: "",

    // Measurements
    measurements: Array(16).fill(""),

    // Meteor codes
    meteorCodes: Array(8).fill(""),

    // Character codes
    characterCodes: {},

    // Wind direction
    windDirection: "",
    windTime: "",

    // Synoptic measurements
    weatherRemark: "",

    // First card data
    pressure: {},
    temperature: {},
    humidity: {},

    // Second card data
    cloud: {},
    rainfall: {},
    wind: {},
  }

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    // Only proceed if we're on the last tab and the submit button was clicked
    if (activeMainTab !== mainTabs[mainTabs.length - 1].id) {
      return // Don't submit if not on the last tab
    }

    try {
      setSubmitting(true)

      // Combine all data into a single object
      const combinedData = {
        timestamp: new Date().toISOString(),
        basicInfo: {
          dataType: values.dataType,
          stationNo: values.stationNo,
          year: values.year,
          month: values.month,
          day: values.day,
        },
        firstCard: {
          pressure: values.pressure,
          temperature: values.temperature,
          humidity: values.humidity,
        },
        secondCard: {
          cloud: values.cloud,
          rainfall: values.rainfall,
          wind: values.wind,
        },
        dailySummary: {
          measurements: values.measurements,
          meteorCodes: values.meteorCodes,
          characterCodes: values.characterCodes,
          windDirection: values.windDirection,
          windTime: values.windTime,
        },
        synopticCode: {
          weatherRemark: values.weatherRemark,
        },
      }

      // Send data to the server
      const response = await fetch("/api/weather-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Weather data saved successfully!")
        resetForm()
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        throw new Error(result.message || "Failed to save weather data")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An error occurred while saving the data. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle sub-tab change
  const handleSubTabChange = (mainTab, subTab) => {
    setActiveSubTabs((prev) => ({
      ...prev,
      [mainTab]: subTab,
    }))
  }

  // Navigate to next main tab
  const handleNextMainTab = () => {
    const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
    if (currentIndex < mainTabs.length - 1) {
      setActiveMainTab(mainTabs[currentIndex + 1].id)
    }
  }

  // Navigate to previous main tab
  const handlePrevMainTab = () => {
    const currentIndex = mainTabs.findIndex((tab) => tab.id === activeMainTab)
    if (currentIndex > 0) {
      setActiveMainTab(mainTabs[currentIndex - 1].id)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Weather Data Management System</h1>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, isSubmitting }) => (
          <Form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
              }
            }}
          >
            <Card className="shadow-lg border-t-4 border-t-blue-500">
              {/* Main Tabs */}
              <CardHeader className="pb-0">
                <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
                  <TabsList className="w-full grid grid-cols-5 gap-1">
                    {mainTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`data-[state=active]:bg-${tab.color}-500 data-[state=active]:text-white`}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Main Tab Contents */}
                <Tabs value={activeMainTab}>
                  {/* Basic Info Tab */}
                  <TabsContent value="basic-info">
                    <div className="border-2 border-blue-100 rounded-md p-4 bg-blue-50/30">
                      <BasicInfoTab />
                    </div>
                  </TabsContent>

                  {/* First Card Tab */}
                  <TabsContent value="first-card">
                    <div>
                      <Tabs
                        value={activeSubTabs["first-card"]}
                        onValueChange={(value) => handleSubTabChange("first-card", value)}
                      >
                        <TabsList className="mb-4">
                          {subTabs["first-card"].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                            >
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="pressure">
                          <div className="border-2 border-indigo-100 rounded-md p-4 bg-indigo-50/30">
                            <PressureTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="temperature">
                          <div className="border-2 border-indigo-100 rounded-md p-4 bg-indigo-50/30">
                            <TemperatureTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="humidity">
                          <div className="border-2 border-indigo-100 rounded-md p-4 bg-indigo-50/30">
                            {/* Add humidity component here */}
                            <div>Humidity Content</div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>

                  {/* Second Card Tab */}
                  <TabsContent value="second-card">
                    <div>
                      <Tabs
                        value={activeSubTabs["second-card"]}
                        onValueChange={(value) => handleSubTabChange("second-card", value)}
                      >
                        <TabsList className="mb-4">
                          {subTabs["second-card"].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="data-[state=active]:bg-violet-500 data-[state=active]:text-white"
                            >
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="cloud">
                          <div className="border-2 border-violet-100 rounded-md p-4 bg-violet-50/30">
                            <CloudTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="rainfall">
                          <div className="border-2 border-violet-100 rounded-md p-4 bg-violet-50/30">
                            <RainfallTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="wind">
                          <div className="border-2 border-violet-100 rounded-md p-4 bg-violet-50/30">
                            {/* Add wind component here */}
                            <div>Wind Content</div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>

                  {/* Daily Summary Tab */}
                  <TabsContent value="daily-summary">
                    <div>
                      <Tabs
                        value={activeSubTabs["daily-summary"]}
                        onValueChange={(value) => handleSubTabChange("daily-summary", value)}
                      >
                        <TabsList className="mb-4">
                          {subTabs["daily-summary"].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                            >
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="measurements">
                          <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                            <MeasurementsTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="meteor-codes">
                          <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                            <MeteorCodesTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="character-codes">
                          <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                            <CharacterCodesTab />
                          </div>
                        </TabsContent>

                        <TabsContent value="wind-direction">
                          <div className="border-2 border-green-100 rounded-md p-4 bg-green-50/30">
                            <WindDirectionTab />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>

                  {/* Synoptic Code Tab */}
                  <TabsContent value="synoptic-code">
                    <div>
                      <Tabs
                        value={activeSubTabs["synoptic-code"]}
                        onValueChange={(value) => handleSubTabChange("synoptic-code", value)}
                      >
                        <TabsList className="mb-4">
                          {subTabs["synoptic-code"].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                            >
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="synoptic-measurements">
                          <div className="border-2 border-amber-100 rounded-md p-4 bg-amber-50/30">
                            <SynopticMeasurementsTab />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="border-t pt-6 flex justify-between">
                <div>
                  {Object.keys(errors).length > 0 && (
                    <p className="text-sm text-destructive">Please fill in all required fields before submitting</p>
                  )}
                </div>

                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePrevMainTab()}
                    disabled={activeMainTab === mainTabs[0].id}
                  >
                    Previous
                  </Button>

                  {activeMainTab !== mainTabs[mainTabs.length - 1].id ? (
                    <Button type="button" onClick={() => handleNextMainTab()} className="bg-blue-600 hover:bg-blue-700">
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || submitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting || submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Submit All Data
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  )
}
