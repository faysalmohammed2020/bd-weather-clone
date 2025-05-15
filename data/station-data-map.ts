// station-data-map.ts

import dhakaStation from "./station_pressure_level/dhaka_station_level";
import dhakaSea from "./station_pressure_level/dhaka_sea_level";

import cxbStation from "./station_pressure_level/CXB-station_level";
import cxbSea from "./station_pressure_level/CXB-sea_level";

export const stationDataMap = {
  [dhakaStation.station.station_no]: {
    station: dhakaStation,
    sea: dhakaSea,
  },
  [cxbStation.station.station_no]: {
    station: cxbStation,
    sea: cxbSea,
  },
};
