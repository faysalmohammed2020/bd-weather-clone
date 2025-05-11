import { StationManagement } from "@/components/stationManagement";
import { stations as initialStations } from "@/data/stations";

export default function StationsAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <StationManagement initialStations={initialStations} />
    </div>
  );
}
