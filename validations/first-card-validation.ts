
import * as Yup from "yup"

// Validation schemas for each tab

export const temperatureSchema = Yup.object({
  
  dryBulbAsRead: Yup.string()
    .required("Dry-bulb field is required")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
  wetBulbAsRead: Yup.string()
    .required("Wet-bulb field is required")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
  maxMinTempAsRead: Yup.string()
    .required("MAX/MIN field is required")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const pressureSchema = Yup.object({
  barAsRead: Yup.string()
    .required("Bar As Read field is required")
    .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10142 for 1014.2 hPa)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const squallSchema = Yup.object({
  // Conditional validation for squall fields
  squallForce: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Force field is required")
        .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
    otherwise: (schema) => schema,
  }),
  squallDirection: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Direction field is required")
        .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
    otherwise: (schema) => schema,
  }),
  squallTime: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) => schema.required("Squall Time field is required"),
    otherwise: (schema) => schema,
  }),
})

export const visibilitySchema = Yup.object({
  horizontalVisibility: Yup.string()
    .required("Horizontal Visibility field is required")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 050, 999)")
    .test("is-numeric", "Only numeric values allowed", (value) => /^\d+$/.test(value || "")),
})

export const weatherSchema = Yup.object({
  pastWeatherW1: Yup.string()
    .required("Past Weather (W1) field is required")
    .matches(/^[0-9]$/, "Past Weather (W1) Must contain digits 0-9 only"),
  pastWeatherW2: Yup.string()
    .required("Past Weather (W2) field is required")
    .matches(/^[0-9]$/, "Past Weather (W2) Must contain digits 0-9 only"),
  presentWeatherWW: Yup.string()
    .required("Present Weather field is required")
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
