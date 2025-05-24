"use client";

import { Formik, Form } from "formik";
import { DailySummaryForm } from "./DailySummery";

const initialValues = {
  measurements: Array(16).fill("-"),
};

export default function DailySummaryWrapper() {
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <Form className="p-8">
        <DailySummaryForm />
      </Form>
    </Formik>
  );
}
