import * as Yup from "yup"

// Rainfall validation schema
export const rainfallSchema = Yup.object({
  rainfall: Yup.object({
    "since-previous": Yup.string()
      .required(t("required"))
      .matches(/^[1-9]\d{0,2}$/, "Must be a 1-3 digit number between 1 and 989")
      .test("is-valid-range", "Value must be between 1 and 989", (value) => {
        const num = Number.parseInt(value || "0")
        return num >= 1 && num <= 989
      }),
    "during-previous": Yup.string()
      .required("During previous 6 hours is required")
      .matches(/^[1-9]\d{0,2}$/, "Must be a 1-3 digit number between 1 and 989")
      .test("is-valid-range", "Value must be between 1 and 989", (value) => {
        const num = Number.parseInt(value || "0")
        return num >= 1 && num <= 989
      }),
    "last-24-hours": Yup.string()
      .required("Last 24 hours precipitation is required")
      .matches(/^[1-9]\d{0,2}$/, "Must be a 1-3 digit number between 1 and 989")
      .test("is-valid-range", "Value must be between 1 and 989", (value) => {
        const num = Number.parseInt(value || "0")
        return num >= 1 && num <= 989
      }),
  }),
})

// Wind validation schema
export const windSchema = Yup.object({
  wind: Yup.object({
    "first-anemometer": Yup.string()
      .required("1st Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    "second-anemometer": Yup.string()
      .required("2nd Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    speed: Yup.string()
      .required("Wind speed is required")
      .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 025, 100)"),

    "wind-direction": Yup.string()
      .required("Wind direction is required")
      .test("is-valid-direction", "Must be wind direction between 5 to 360 degrees", (value) => {
        if (!value) return false
        if (value === "00") return true
        const num = Number(value)
        return Number.isInteger(num) && num >= 5 && num <= 360
      }),
  }),
})

// Cloud validation schema
export const cloudSchema = Yup.object({
  clouds: Yup.object({
    low: Yup.object({
      form: Yup.string().required("Low cloud form is required"),
      amount: Yup.string().required("Low cloud amount is required"),
      height: Yup.string().required("Low cloud height is required"),
      direction: Yup.string().required("Low cloud direction is required"),
    }),
    medium: Yup.object({
      form: Yup.string().required("Medium cloud form is required"),
      amount: Yup.string().required("Medium cloud amount is required"),
      height: Yup.string().required("Medium cloud height is required"),
      direction: Yup.string().required("Medium cloud direction is required"),
    }),
    high: Yup.object({
      form: Yup.string().required("High cloud form is required"),
      amount: Yup.string().required("High cloud amount is required"),
      direction: Yup.string().required("High cloud direction is required"),
    }),
  }),
})

// Total cloud validation schema
export const totalCloudSchema = Yup.object({
  totalCloud: Yup.object({
    "total-cloud-amount": Yup.string().required("Total cloud amount is required"),
  }),
})

// Significant cloud validation schema
export const significantCloudSchema = Yup.object({
  significantClouds: Yup.object({
    layer1: Yup.object({
      form: Yup.string().required("Layer 1 form is required"),
      amount: Yup.string().required("Layer 1 amount is required"),
      height: Yup.string()
        .required("Layer 1 height is required")
        .matches(/^[0-9]+$/, "Please enter numbers only"),
    }),
    layer2: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
    layer3: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
    layer4: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
  }),
})

// Observer validation schema
export const observerSchema = Yup.object({
  observer: Yup.object({
    "observer-initial": Yup.string().required("Observer initials are required"),
    "observation-time": Yup.string().required("Observation time is required"),
  }),
})

// Combined schema for the entire form
export const validationSchema = Yup.object({
  ...cloudSchema.fields,
  ...totalCloudSchema.fields,
  ...significantCloudSchema.fields,
  ...rainfallSchema.fields,
  ...windSchema.fields,
  ...observerSchema.fields,
})

// Export individual field validations for specific use cases
export const fieldValidations = {
  cloud: cloudSchema,
  totalCloud: totalCloudSchema,
  significantCloud: significantCloudSchema,
  rainfall: rainfallSchema,
  wind: windSchema,
  observer: observerSchema,
} as const

// Type definitions for better TypeScript support
export type CloudFormData = Yup.InferType<typeof cloudSchema>
export type TotalCloudFormData = Yup.InferType<typeof totalCloudSchema>
export type SignificantCloudFormData = Yup.InferType<typeof significantCloudSchema>
export type RainfallFormData = Yup.InferType<typeof rainfallSchema>
export type WindFormData = Yup.InferType<typeof windSchema>
export type ObserverFormData = Yup.InferType<typeof observerSchema>
export type SecondCardFormData = Yup.InferType<typeof validationSchema>

// Validation helper functions
export const validateRainfallValue = (value: string): boolean => {
  const num = Number.parseInt(value || "0")
  return num >= 1 && num <= 989
}

export const validateWindDirection = (value: string): boolean => {
  if (!value) return false
  if (value === "00") return true
  const num = Number(value)
  return Number.isInteger(num) && num >= 5 && num <= 360
}

export const validateAnemometerReading = (value: string): boolean => {
  return /^\d{5}$/.test(value)
}

export const validateWindSpeed = (value: string): boolean => {
  return /^\d{3}$/.test(value)
}