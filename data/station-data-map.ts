// station-data-map.ts

import dhakaStation from "./station_pressure_level/dhaka_station_level";
import dhakaSea from "./station_pressure_level/dhaka_sea_level";

import cxbStation from "./station_pressure_level/CXB-station_level";
import cxbSea from "./station_pressure_level/CXB-sea_level";

import ambaganStation from "./station_pressure_level/Ambagan-station_level";
import ambaganSea from "./station_pressure_level/Ambagan-sea_level";

import badalgachhiStation from "./station_pressure_level/Badalgachhi-station_level";
import badalgachhiSea from "./station_pressure_level/Badalgachhi-sea_level";

import bandarbanStation from "./station_pressure_level/Bandarban-station_level";
import bandarbanSea from "./station_pressure_level/Bandarban-sea_level";

import barisalStation from "./station_pressure_level/BSL-station_level";
import barisalSea from "./station_pressure_level/BSL-sea_level";

import chuadangaStation from "./station_pressure_level/CDG-station_level";
import chuadangaSea from "./station_pressure_level/CDG-sea_level";

import chandpurStation from "./station_pressure_level/CDP-station_level";
import chandpurSea from "./station_pressure_level/CDP-sea_level";

import dimlaStation from "./station_pressure_level/Dimla-station_level";
import dimlaSea from "./station_pressure_level/Dimla-sea_level";

import dinajpurStation from "./station_pressure_level/DJP-station_level";
import dinajpurSea from "./station_pressure_level/DJP-sea_level";

import feniStation from "./station_pressure_level/FNI-station_level";
import feniSea from "./station_pressure_level/FNI-sea_level";

import faridpurStation from "./station_pressure_level/FRD-station_level";
import faridpurSea from "./station_pressure_level/FRD-sea_level";

import gopalganjStation from "./station_pressure_level/Gopalganj-station_level";
import gopalganjSea from "./station_pressure_level/Gopalganj-sea_level";

import hatiyaStation from "./station_pressure_level/Hatiya-station_level";
import hatiyaSea from "./station_pressure_level/Hatiya-sea_level";

import jsrStation from "./station_pressure_level/JSR-station_level";
import jsrSea from "./station_pressure_level/JSR-sea_level";

import khulnaStation from "./station_pressure_level/Khulna-station_level";
import khulnaSea from "./station_pressure_level/Khulna-sea_level";

import madaripurStation from "./station_pressure_level/Madaripur-station_level";
import madaripurSea from "./station_pressure_level/Madaripur-sea_level";

import mymensinghStation from "./station_pressure_level/Mymensingh-station_level";
import mymensinghSea from "./station_pressure_level/Mymensingh-sea_level";

import nikliStation from "./station_pressure_level/Nikli-station_level";
import nikliSea from "./station_pressure_level/Nikli-sea_level";

import rajshahiStation from "./station_pressure_level/Rajshahi-station_level";
import rajshahiSea from "./station_pressure_level/Rajshahi-sea_level";

import sandwipStation from "./station_pressure_level/Sandwip-station_level";
import sandwipSea from "./station_pressure_level/Sandwip-sea_level";

import satkhiraStation from "./station_pressure_level/Satkhira-station_level";
import satkhiraSea from "./station_pressure_level/Satkhira-sea_level";

import srimangalStation from "./station_pressure_level/Srimangal-station_level";
import srimangalSea from "./station_pressure_level/Srimangal-sea_level";

import tarashStation from "./station_pressure_level/Tarash-station_level";
import tarashSea from "./station_pressure_level/Tarash-sea_level";

import tangailStation from "./station_pressure_level/Tangail-station_level";
import tangailSea from "./station_pressure_level/Tangail-sea_level";

export const stationDataMap = {
  [dhakaStation.station.station_no]: { station: dhakaStation, sea: dhakaSea },
  [cxbStation.station.station_no]: { station: cxbStation, sea: cxbSea },
  [ambaganStation.station.station_no]: {
    station: ambaganStation,
    sea: ambaganSea,
  },
  [badalgachhiStation.station.station_no]: {
    station: badalgachhiStation,
    sea: badalgachhiSea,
  },
  [bandarbanStation.station.station_no]: {
    station: bandarbanStation,
    sea: bandarbanSea,
  },
  [barisalStation.station.station_no]: {
    station: barisalStation,
    sea: barisalSea,
  },
  [chuadangaStation.station.station_no]: {
    station: chuadangaStation,
    sea: chuadangaSea,
  },
  [chandpurStation.station.station_no]: {
    station: chandpurStation,
    sea: chandpurSea,
  },
  [dimlaStation.station.station_no]: {
    station: dimlaStation, sea: dimlaSea
  },
  [dinajpurStation.station.station_no]: {
    station: dinajpurStation,
    sea: dinajpurSea,
  },
  [feniStation.station.station_no]: { station: feniStation, sea: feniSea },
  [faridpurStation.station.station_no]: {
    station: faridpurStation,
    sea: faridpurSea,
  },
  [gopalganjStation.station.station_no]: {
    station: gopalganjStation,
    sea: gopalganjSea,
  },
  [hatiyaStation.station.station_no]: {
    station: hatiyaStation,
    sea: hatiyaSea,
  },
  [jsrStation.station.station_no]: { station: jsrStation, sea: jsrSea },
  [khulnaStation.station.station_no]: {
    station: khulnaStation,
    sea: khulnaSea,
  },
  [madaripurStation.station.station_no]: {
    station: madaripurStation,
    sea: madaripurSea,
  },
  [mymensinghStation.station.station_no]: {
    station: mymensinghStation,
    sea: mymensinghSea,
  },
  [nikliStation.station.station_no]: { station: nikliStation, sea: nikliSea },
  [rajshahiStation.station.station_no]: {
    station: rajshahiStation,
    sea: rajshahiSea,
  },
  [sandwipStation.station.station_no]: {
    station: sandwipStation,
    sea: sandwipSea,
  },
  [satkhiraStation.station.station_no]: {
    station: satkhiraStation,
    sea: satkhiraSea,
  },
  [srimangalStation.station.station_no]: {
    station: srimangalStation,
    sea: srimangalSea,
  },
  [tarashStation.station.station_no]: {
    station: tarashStation,
    sea: tarashSea,
  },
  [tangailStation.station.station_no]: {
    station: tangailStation,
    sea: tangailSea,
  },
};
