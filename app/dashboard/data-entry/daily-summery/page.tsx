"use client";

import { Formik, Form } from "formik";
import { DailySummaryForm } from "./DailySummery";
import { WeatherDataTable } from "./DailySummeryTable";

const initialValues = {
  measurements: Array(16).fill("-"),
};

export default function DailySummaryWrapper() {
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <Form className="p-8">
        <div className="mb-4 font-semibold text-gray-900 text-lg">
          Weather Observations & Daily Summary
        </div>

        <div className="mb-4 h-[30vh] overflow-y-auto border border-gray-200 p-3 rounded-lg">
          <WeatherDataTable />
        </div>
        <DailySummaryForm />
      </Form>
    </Formik>
  );
}
