import * as Yup from "yup"

// Validation schemas for each tab
export const temperatureSchema = Yup.object({
  dryBulbAsRead: Yup.string()
    .required("Dry-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
  wetBulbAsRead: Yup.string()
    .required("Wet-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
  maxMinTempAsRead: Yup.string()
    .required("MAX/MIN অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const pressureSchema = Yup.object({
  barAsRead: Yup.string()
    .required("Bar As Read অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10142 for 1014.2 hPa)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const squallSchema = Yup.object({
  // Conditional validation for squall fields
  squallForce: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Force অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
    otherwise: (schema) => schema,
  }),
  squallDirection: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Direction অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
    otherwise: (schema) => schema,
  }),
  squallTime: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) => schema.required("Squall Time অবশ্যই পূরণ করতে হবে"),
    otherwise: (schema) => schema,
  }),
})

export const visibilitySchema = Yup.object({
  horizontalVisibility: Yup.string()
    .required("Horizontal Visibility অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 050, 999)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const weatherSchema = Yup.object({
  pastWeatherW1: Yup.string()
    .required("Past Weather (W1) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W1) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  pastWeatherW2: Yup.string()
    .required("Past Weather (W2) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W2) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  presentWeatherWW: Yup.string()
    .required("Present Weather অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{2}$/, "Must be exactly 2 digits (e.g., 01, 23, 99)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

// Combined schema for the entire form
export const validationSchema = Yup.object({
  ...temperatureSchema.fields,
  ...pressureSchema.fields,
  ...squallSchema.fields,
  ...visibilitySchema.fields,
  ...weatherSchema.fields,
})

// Export individual field validations for specific use cases
export const fieldValidations = {
  temperature: temperatureSchema,
  pressure: pressureSchema,
  squall: squallSchema,
  visibility: visibilitySchema,
  weather: weatherSchema,
} as const

// Type definitions for better TypeScript support
export type TemperatureFormData = Yup.InferType<typeof temperatureSchema>
export type PressureFormData = Yup.InferType<typeof pressureSchema>
export type SquallFormData = Yup.InferType<typeof squallSchema>
export type VisibilityFormData = Yup.InferType<typeof visibilitySchema>
export type WeatherFormData = Yup.InferType<typeof weatherSchema>
export type FirstCardFormData = Yup.InferType<typeof validationSchema>
