export const dynamic = "force-dynamic";

import { FirstCardForm } from "./FirstCardForm";
import { getTimeInformation } from "@/lib/api";

export default async function FirstCardPage() {
  const timeInformation = await getTimeInformation();

  return (
    <main className="container mx-auto">
      <FirstCardForm timeInfo={timeInformation} />
    </main>
  );
}
