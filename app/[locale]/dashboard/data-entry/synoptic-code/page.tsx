"use client";

import { Formik, Form } from "formik";
import { SynopticCode } from "./SynopticCode";

const initialValues = {
  dataType: "",
  stationNo: "",
  year: "",
  month: "",
  day: "",
  weatherRemark: "",
  measurements: Array(21).fill(""),
};

export default function Page() {
  return (
    <Formik initialValues={initialValues} onSubmit={(values) => console.log(values)}>
      <Form className="p-8">
        <SynopticCode />
      </Form>
    </Formik>
  );
}
