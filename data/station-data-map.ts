// station-data-map.ts

import ammanMarkaAirportStation from "./station_pressure_level/ammanMarkaAirport_station_level";
import ammanMarkaAirportSea from "./station_pressure_level/ammanMarkaAirport_sea_level";

import MadabaStation from "./station_pressure_level/Madaba-station_level";
import MadabaSea from "./station_pressure_level/Madaba-sea_level";

import ammanQueenAliaAirportStation from "./station_pressure_level/ammanQueenAliaAirport-station_level";
import ammanQueenAliaAirportSea from "./station_pressure_level/ammanQueenAliaAirport-sea_level";

import aqabaKingHusseinAirportStation from "./station_pressure_level/aqabaKingHusseinAirport-station_level";
import aqabaKingHusseinAirportSea from "./station_pressure_level/aqabaKingHusseinAirport-sea_level";

import IrbidStation from "./station_pressure_level/Irbid-station_level";
import IrbidSea from "./station_pressure_level/Irbid-sea_level";

import MAANStation from "./station_pressure_level/MAAN-station_level";
import MAANSea from "./station_pressure_level/MAAN-sea_level";

import MafraqStation from "./station_pressure_level/Mafraq-station_level";
import MafraqSea from "./station_pressure_level/Mafraq-sea_level";

import ZarqaStation from "./station_pressure_level/Zarqa-station_level";
import ZarqaSea from "./station_pressure_level/Zarqa-sea_level";

import DEADStation from "./station_pressure_level/DEAD-station_level";
import DEADSea from "./station_pressure_level/DEAD-sea_level";

import RuwaishedStation from "./station_pressure_level/RUWS-station_level";
import RuwaishedSea from "./station_pressure_level/RUWS-sea_level";

import SafawiStation from "./station_pressure_level/Safawi-station_level";
import SafawiSea from "./station_pressure_level/Safawi-sea_level";

import SaltStation from "./station_pressure_level/Salt-station_level";
import SaltSea from "./station_pressure_level/Salt-sea_level";

import AjlounStation from "./station_pressure_level/Ajloun-station_level";
import AjlounSea from "./station_pressure_level/Ajloun-sea_level";

import JerashStation from "./station_pressure_level/Jerash-station_level";
import JerashSea from "./station_pressure_level/Jerash-sea_level";

import BalqaStation from "./station_pressure_level/Balqa-station_level";
import BalqaSea from "./station_pressure_level/Balqa-sea_level";

import KarakStation from "./station_pressure_level/Karak-station_level";
import KarakSea from "./station_pressure_level/Karak-sea_level";

import TafilahStation from "./station_pressure_level/Tafilah-station_level";
import TafilahSea from "./station_pressure_level/Tafilah-sea_level";

import JerichoStation from "./station_pressure_level/Jericho-station_level";
import JerichoSea from "./station_pressure_level/Jericho-sea_level";

import DeirAllaStation from "./station_pressure_level/DEIR-station_level";
import DeirAllaSea from "./station_pressure_level/DEIR-sea_level";

import BaquraStation from "./station_pressure_level/Baqura-station_level";
import BaquraSea from "./station_pressure_level/Baqura-sea_level";

import ErabStation from "./station_pressure_level/ERAB-station_level";
import ErabSea from "./station_pressure_level/ERAB-sea_level";

import ghorSafiStation from "./station_pressure_level/ghorSafi-station_level";
import ghorSafiSea from "./station_pressure_level/ghorSafi-sea_level";

import H4Station from "./station_pressure_level/H4-station_level";
import H4Sea from "./station_pressure_level/H4-sea_level";

import princeHasanAirportStation from "./station_pressure_level/princeHasanAirport-station_level";
import princeHasanAirportSea from "./station_pressure_level/princeHasanAirport-sea_level";

import rasMuneefStation from "./station_pressure_level/rasMuneef-station_level";
import rasMuneefSea from "./station_pressure_level/rasMuneef-sea_level";

import QatranehStation from "./station_pressure_level/Qatraneh-station_level";
import QatranehSea from "./station_pressure_level/Qatraneh-sea_level";

import wadiRayanStation from "./station_pressure_level/WadiRayan-station_level";
import wadiRayanSea from "./station_pressure_level/WadiRayan-sea_level";

import jerusalemAirportStation from "./station_pressure_level/jerusalemAirport-station_level";
import jerusalemAirportSea from "./station_pressure_level/jerusalemAirport-sea_level";

import ghorSafiTwoStation from "./station_pressure_level/ghorSafiTwo-station_level";
import ghorSafiTwoSea from "./station_pressure_level/ghorSafiTwo-sea_level";
import H4TwoStation from "./station_pressure_level/H4-station_level";
import H4TwoSea from "./station_pressure_level/H4-sea_level";

export const stationDataMap = {
  [ammanMarkaAirportStation.station.station_no]: { station: ammanMarkaAirportStation, sea: ammanMarkaAirportSea },
  [MadabaStation.station.station_no]: { station: MadabaStation, sea: MadabaSea },
  [ammanQueenAliaAirportStation.station.station_no]: {
    station: ammanQueenAliaAirportStation,
    sea: ammanQueenAliaAirportSea,
  },
  [aqabaKingHusseinAirportStation.station.station_no]: {
    station: aqabaKingHusseinAirportStation,
    sea: aqabaKingHusseinAirportSea,
  },
  [IrbidStation.station.station_no]: {
    station: IrbidStation,
    sea: IrbidSea,
  },
  [MAANStation.station.station_no]: {
    station: MAANStation,
    sea: MAANSea,
  },
  [MafraqStation.station.station_no]: {
    station: MafraqStation,
    sea: MafraqSea,
  },
  [ZarqaStation.station.station_no]: {
    station: ZarqaStation,
    sea: ZarqaSea,
  },
  [DEADStation.station.station_no]: {
    station: DEADStation, sea: DEADSea
  },
  [RuwaishedStation.station.station_no]: {
    station: RuwaishedStation,
    sea: RuwaishedSea,
  },
  [SafawiStation.station.station_no]: { station: SafawiStation, sea: SafawiSea },
  [SaltStation.station.station_no]: {
    station: SaltStation,
    sea: SaltSea,
  },
  [AjlounStation.station.station_no]: {
    station: AjlounStation,
    sea: AjlounSea,
  },
  [JerashStation.station.station_no]: {
    station: JerashStation,
    sea: JerashSea,
  },
  [BalqaStation.station.station_no]: { station: BalqaStation, sea: BalqaSea },
  [KarakStation.station.station_no]: {
    station: KarakStation,
    sea: KarakSea,
  },
  [TafilahStation.station.station_no]: {
    station: TafilahStation,
    sea: TafilahSea,
  },
  [JerichoStation.station.station_no]: {
    station: JerichoStation,
    sea: JerichoSea,
  },
  [DeirAllaStation.station.station_no]: { station: DeirAllaStation, sea: DeirAllaSea },
  [BaquraStation.station.station_no]: {
    station: BaquraStation,
    sea: BaquraSea,
  },
  [ErabStation.station.station_no]: {
    station: ErabStation,
    sea: ErabSea,
  },
  [ghorSafiStation.station.station_no]: {
    station: ghorSafiStation,
    sea: ghorSafiSea,
  },
  [H4Station.station.station_no]: {
    station: H4Station,
    sea: H4Sea,
  },
  [princeHasanAirportStation.station.station_no]: {
    station: princeHasanAirportStation,
    sea: princeHasanAirportSea,
  },
  [rasMuneefStation.station.station_no]: {
    station: rasMuneefStation,
    sea: rasMuneefSea,
  },
  [QatranehStation.station.station_no]: {
    station: QatranehStation,
    sea: QatranehSea,
  },
  [wadiRayanStation.station.station_no]: {
    station: wadiRayanStation,
    sea: wadiRayanSea,
  },
  [jerusalemAirportStation.station.station_no]: {
    station: jerusalemAirportStation,
    sea: jerusalemAirportSea,
  },
  [ghorSafiTwoStation.station.station_no]: {
    station: ghorSafiTwoStation,
    sea: ghorSafiTwoSea,
  },
  [H4TwoStation.station.station_no]: {
    station: H4TwoStation,
    sea: H4TwoSea,
  },
};
