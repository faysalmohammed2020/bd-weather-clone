import { StationManagement } from "@/components/stationManagement";
import { stations as initialStations } from "@/data/stations";

export default function StationsAdminPage() {
  return (
    <div className="md:container md:mx-auto md:py-8">
      <StationManagement initialStations={initialStations} />
    </div>
  );
}
