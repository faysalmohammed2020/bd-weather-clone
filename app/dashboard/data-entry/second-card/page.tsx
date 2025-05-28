export const dynamic = "force-dynamic";

import SecondCardForm from "./SecondCard";
import { getTimeInformation } from "@/lib/api";

export default async function Home() {
  const timeInformation = await getTimeInformation();

  return (
    <main className="w-full py-4 px-4">
      <SecondCardForm timeInfo={timeInformation} />
    </main>
  );
}
