const remarksData = {
  "00": {
    symbol: "⚪",
    description:
      "Cloud development not observed or not observable during past hour",
  },
  "01": {
    symbol: "⊖",
    description:
      "Clouds generally dissolving or becoming less developed during past hour",
  },
  "02": {
    symbol: "⊙",
    description: "State of sky on the whole unchanged during past hour",
  },
  "03": {
    symbol: "⊕",
    description: "Clouds generally forming or developing during past hour",
  },
  "04": {
    symbol: "〰️",
    description: "Visibility reduced by smoke",
  },
  "05": {
    symbol: "∞",
    description: "Haze",
  },
  "06": {
    symbol: "S",
    description:
      "Widespread dust in suspension in the air, not raised by wind at time of observation",
  },
  "07": {
    symbol: "$",
    description: "Dust or sand raised by wind at time of observation",
  },
  "08": {
    symbol: "⌇",
    description: "Well developed dust devil(s) within past hour",
  },
  "09": {
    symbol: "(S)",
    description:
      "Duststorm or sandstorm within sight of station or at station during past hour",
  },
  "10": {
    symbol: "≡",
    description: "Light fog (BR)",
  },
  "11": {
    symbol: "≡ ≡",
    description:
      "Patches of shallow fog at station not deeper than 6 feet on land",
  },
  "12": {
    symbol: "≡ ≡",
    description:
      "More or less continuous shallow fog at station not deeper than 6 feet on land (MIFG)",
  },
  "13": {
    symbol: "ϟ",
    description: "Lightning visible, no thunder heard (VCTS)",
  },
  "14": {
    symbol: "·",
    description:
      "Precipitation within sight, but not reaching the ground (VIRGA)",
  },
  "15": {
    symbol: ")·(",
    description:
      "Precipitation within sight, reaching ground, but distant from station",
  },
  "16": {
    symbol: "(·)",
    description:
      "Precipitation within sight, reaching the ground, near to but not at station (VCSH)",
  },
  "17": {
    symbol: "TS",
    description: "Thunder heard but no precipitation at the station",
  },
  "18": {
    symbol: "▽",
    description: "Squall(s) within sight during past hour (SQ)",
  },
  "19": {
    symbol: ")(",
    description: "Funnel cloud(s) within sight during past hour (FU/+FC)",
  },
  "20": {
    symbol: "﹈",
    description:
      "Drizzle (not freezing, not showers) during past hour, not at time of obs",
  },
  "21": {
    symbol: "﹈•",
    description:
      "Rain (not freezing, not showers) during past hour, not at time of obs",
  },
  "22": {
    symbol: "*﹈",
    description:
      "Snow (not falling as showers) during past hour, not at time of obs",
  },
  "23": {
    symbol: "﹈*•",
    description:
      "Rain and snow (not showers) during past hour, not at time of obs",
  },
  "24": {
    symbol: "﹈⌇",
    description:
      "Freezing drizzle or rain (not showers) during past hour, not at time of obs",
  },
  "25": {
    symbol: "﹈•",
    description: "Showers of rain during past hour, but not at time of obs",
  },
  "26": {
    symbol: "﹈*",
    description:
      "Showers of snow, or of rain and snow during past hour, but not at time of obs",
  },
  "27": {
    symbol: "﹈▴",
    description:
      "Showers of hail, or of hail and rain during past hour, but not at time of obs",
  },
  "28": {
    symbol: "≡▯",
    description: "Fog during past hour, but not at time of obs",
  },
  "29": {
    symbol: "☍",
    description:
      "Thunderstorm (with or without precip) during past hour, but not at time of obs",
  },
  "30": {
    symbol: "∕",
    description:
      "Slight or moderate duststorm or sandstorm, has decreased during past hour",
  },
  "31": {
    symbol: "SS DRSA ∕ DS DRDU",
    description:
      "Slight or moderate duststorm or sandstorm, no appreciable change during past hour",
  },
  "32": {
    symbol: "∕",
    description:
      "Slight or moderate duststorm or sandstorm, has increased during past hour",
  },
  "33": {
    symbol: "∕",
    description:
      "Severe duststorm or sandstorm, has decreased during past hour",
  },
  "34": {
    symbol: "∕",
    description:
      "Severe duststorm or sandstorm, no appreciable change during past hour",
  },
  "35": {
    symbol: "∕",
    description:
      "Severe duststorm or sandstorm, has increased during past hour",
  },
  "36": {
    symbol: "+",
    description: "Slight or moderate drifting snow, generally low",
  },
  "37": { symbol: "+", description: "Heavy drifting snow, generally low" },
  "38": {
    symbol: "+",
    description: "Slight or moderate drifting snow, generally high",
  },
  "39": { symbol: "+", description: "Heavy drifting snow, generally high" },

  "40": {
    symbol: "=",
    description:
      "Fog at distance at time of obs but not at station during past hour (VCFG)",
  },
  "41": { symbol: "= =", description: "Fog in patches (BCFG)" },
  "42": {
    symbol: "=",
    description:
      "Fog, sky discernable, has become thinner during past hour (PRFG)",
  },
  "43": {
    symbol: "=",
    description:
      "Fog, sky not discernable, has become thinner during past hour",
  },
  "44": {
    symbol: "=",
    description: "Fog, sky discernable, no appreciable change during past hour",
  },
  "45": {
    symbol: "=",
    description:
      "Fog, sky not discernable, no appreciable change during past hour (FG)",
  },
  "46": {
    symbol: "=",
    description:
      "Fog, sky discernable, has begun or become thicker during past hour",
  },
  "47": {
    symbol: "=",
    description:
      "Fog, sky not discernable, has begun or become thicker during past hour",
  },
  "48": {
    symbol: "=",
    description: "Fog, depositing rime, sky discernable",
  },
  "49": {
    symbol: "=",
    description: "Fog, depositing rime, sky not discernable (FZFG)",
  },

  "50": {
    symbol: "’",
    description: "Intermittent drizzle (not freezing), slight at time of obs",
  },
  "51": {
    symbol: "’ ’",
    description:
      "Continuous drizzle (not freezing), slight at time of obs (-DZ)",
  },
  "52": {
    symbol: "’",
    description: "Intermittent drizzle (not freezing), moderate at time of obs",
  },
  "53": {
    symbol: "’ ’",
    description:
      "Continuous drizzle (not freezing), moderate at time of obs (DZ)",
  },
  "54": {
    symbol: "’",
    description: "Intermittent drizzle (not freezing), thick at time of obs",
  },
  "55": {
    symbol: "’ ’",
    description:
      "Continuous drizzle (not freezing), thick at time of obs (+DZ)",
  },
  "56": { symbol: "⏝", description: "Slight freezing drizzle (-FZDZ)" },
  "57": {
    symbol: "⏝",
    description: "Moderate or thick freezing drizzle (FZDZ)",
  },
  "58": {
    symbol: "’ .",
    description:
      "Drizzle and rain, slight or moderate (-DZRA; -DZ RA; -DZR -RA)",
  },
  "59": {
    symbol: "’ .",
    description:
      "Drizzle and rain, moderate or heavy (DZRA; +DZRA; DZ +RA; DZRA)",
  },
  "60": {
    symbol: "•",
    description: "Intermittent rain (not freezing), slight at time of obs",
  },
  "61": {
    symbol: "••",
    description: "Continuous rain (not freezing), slight at time of obs (-RA)",
  },
  "62": {
    symbol: "• •",
    description: "Intermittent rain (not freezing), moderate at time of obs",
  },
  "63": {
    symbol: "•••",
    description: "Continuous rain (not freezing), moderate at time of obs (RA)",
  },
  "64": {
    symbol: "• • •",
    description: "Intermittent rain (not freezing), heavy at time of obs",
  },
  "65": {
    symbol: "••••",
    description: "Continuous rain (not freezing), heavy at time of obs (+RA)",
  },
  "66": { symbol: "⏝", description: "Slight freezing rain (-FZRA)" },
  "67": {
    symbol: "⏝",
    description: "Moderate or heavy freezing rain (FZRA)",
  },
  "68": {
    symbol: "•*",
    description:
      "Rain or drizzle and snow, slight (-RN -SN; -RA SN; -DZ SN; RA -SN; DZ -SN)",
  },
  "69": {
    symbol: "+RA *",
    description:
      "Rain or drizzle and snow, moderate or heavy (RA SN; DZ SN; RA +SN; +RA SN; +DZ SN)",
  },
  "70": {
    symbol: "❄",
    description:
      "Intermittent fall of snowflakes, slight or moderate at time of obs",
  },
  "71": {
    symbol: "❄•",
    description: "Continuous fall of snowflakes, slight at time of obs",
  },
  "72": {
    symbol: "❄❄",
    description: "Intermittent fall of snowflakes, moderate at time of obs",
  },
  "73": {
    symbol: "❄❄•",
    description: "Continuous fall of snowflakes, moderate at time of obs",
  },
  "74": {
    symbol: "❄❄❄",
    description: "Intermittent fall of snowflakes, heavy at time of obs",
  },
  "75": {
    symbol: "❄❄❄•",
    description: "Continuous fall of snowflakes, heavy at time of obs",
  },
  "76": {
    symbol: "🧊",
    description: "Ice pellets, with or without rain at time of obs",
  },
  "77": {
    symbol: "✨",
    description: "Snow grains or snow crystals with or without rain",
  },
  "78": {
    symbol: "🌨",
    description: "Slight shower(s) of snow or small hail",
  },
  "79": {
    symbol: "🌨🌨",
    description: "Moderate or heavy shower(s) of snow or small hail",
  },
  "80": { symbol: "🌧", description: "Slight rain shower(s)" },
  "81": { symbol: "🌧🌧", description: "Moderate or heavy rain shower(s)" },
  "82": { symbol: "🌧⚡", description: "Violent rain shower(s)" },
  "83": {
    symbol: "🌨💧",
    description: "Slight shower(s) of rain and snow mixed",
  },
  "84": {
    symbol: "🌨🌧",
    description: "Moderate or heavy shower(s) of rain and snow",
  },
  "85": { symbol: "❄🌧", description: "Slight snow shower(s)" },
  "86": { symbol: "❄🌧🌧", description: "Moderate or heavy snow shower(s)" },
  "87": {
    symbol: "🌨🧊",
    description: "Slight shower(s) of snow or small hail with or without rain",
  },
  "88": {
    symbol: "🌨🧊🧊",
    description: "Moderate or heavy shower(s) of snow or small hail",
  },
  "89": {
    symbol: "🧊🌧",
    description: "Slight shower(s) of ice pellets, sleet, or hail",
  },
  "90": {
    symbol: "⚡",
    description: "Thunderstorm without precipitation at time of obs",
  },
  "91": {
    symbol: "⚡🌧",
    description: "Thunderstorm with rain at time of obs",
  },
  "92": {
    symbol: "⚡🧊",
    description: "Thunderstorm with hail at time of obs",
  },
  "93": {
    symbol: "🌩🌧",
    description: "Slight thunderstorm with rain at time of obs",
  },
  "94": {
    symbol: "🌩🌧🌧",
    description: "Moderate or heavy thunderstorm with rain at time of obs",
  },
  "95": {
    symbol: "🌩🧊",
    description: "Heavy thunderstorm with hail at time of obs",
  },
  "96": {
    symbol: "⛈",
    description:
      "Slight or moderate thunderstorm with rain or hail but not at time of obs",
  },
  "97": {
    symbol: "⛈⛈",
    description:
      "Moderate or heavy thunderstorm with rain and hail, but not at time of obs",
  },
  "98": {
    symbol: "⛈💨",
    description: "Thunderstorm with rain and strong wind at time of obs",
  },
  "99": {
    symbol: "⛈🧊💥",
    description: "Heavy thunderstorm with hail, not at time of obs",
  },
};
export default remarksData;
