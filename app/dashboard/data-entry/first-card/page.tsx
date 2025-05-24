"use client";

import { FirstCardForm } from "./FirstCardForm";

export default function FirstCardPage() {
    return (
    <div className="min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold mb-6 text-center text-slate-700">
          First Card Data Entry
        </h1>
        <FirstCardForm onDataSubmitted={() => {}} />
      </main>
    </div>
  );
}
