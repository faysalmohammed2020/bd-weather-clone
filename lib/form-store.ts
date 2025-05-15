// lib/form-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormStore<T extends Record<string, unknown>> = {
    formData: T;
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    updateFields: (fields: Partial<T>) => void;
    setFormData: (data: T) => void;
    resetForm: (initialData?: T) => void;
  };
  
  export function createFormStore<T extends Record<string, unknown>>(
    options: {
      name: string;        // Unique store name for persistence
      initialData: T;      // Default form values
      persist?: boolean;   // Enable/disable persistence (default: true)
    }
  ) {
    return create<FormStore<T>>()(
      options.persist !== false 
        ? persist(
            (set) => ({
              formData: options.initialData,
              updateField: (field, value) => 
                set((state) => ({
                  formData: { ...state.formData, [field]: value }
                })),
              updateFields: (fields) =>
                set((state) => ({
                  formData: { ...state.formData, ...fields }
                })),
              setFormData: (data) => set({ formData: data }),
              resetForm: (initialData) => 
                set({ formData: initialData || options.initialData }),
            }),
            {
              name: options.name,
            }
          )
        : (set) => ({
            formData: options.initialData,
            updateField: (field, value) => 
              set((state) => ({
                formData: { ...state.formData, [field]: value }
              })),
            updateFields: (fields) =>
              set((state) => ({
                formData: { ...state.formData, ...fields }
              })),
            setFormData: (data) => set({ formData: data }),
            resetForm: (initialData) => 
              set({ formData: initialData || options.initialData }),
          })
    );
  }