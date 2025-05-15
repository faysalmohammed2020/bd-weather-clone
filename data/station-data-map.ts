// station-data-map.ts

import dhakaStation from "./dhaka_station_level";
import dhakaSea from "./dhaka_sea_level";

import cxbStation from "./CXB-station_level";
import cxbSea from "./CXB-sea_level";

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
