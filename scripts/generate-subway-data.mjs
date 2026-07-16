import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, "../src/mobility/data.js");
const service = "https://portal.esrikr.com/arcgis/rest/services/Hosted/KRIC_SubwayStation/FeatureServer/0/query";

const CAPITAL_LINES = new Set([
  "서울1호선", "서울2호선", "서울3호선", "서울4호선", "서울5호선", "서울6호선", "서울7호선", "서울8호선", "서울9호선",
  "인천1호선", "인천2호선", "경의중앙선", "수인분당선", "신분당선", "경춘선", "경강선", "서해선", "신림선",
  "우이신설경전철", "에버라인", "의정부경전철", "김포골드라인", "공항철도",
]);

const C = {
  L1: "#0052A4", L2: "#00A84D", L3: "#EF7C1C", L4: "#00A5DE", L5: "#996CAC", L6: "#CD7C2F",
  L7: "#747F00", L8: "#E6186C", L9: "#BDB092", I1: "#7CA8D5", I2: "#ED8B00", GJ: "#77C4A3",
  SB: "#F5A200", DX: "#D4003B", GC: "#0C8E72", GG: "#003DA5", SH: "#81A914", UI: "#B0CE18",
  SL: "#6789CA", EV: "#509F22", UJ: "#FDA600", GP: "#A17800", AR: "#0090D2", GTX: "#9A6292",
};

const line = (id, name, color, source, stations, extra = {}) => ({ id, name, color, source, stations, ...extra });

const routes = {
  L1_MAIN: line("L1", "1호선", C.L1, "서울1호선", [
    "연천","전곡","청산","소요산","동두천","보산","동두천중앙","지행","덕정","덕계","양주","녹양","가능","의정부","회룡","망월사","도봉산","도봉","방학","창동","녹천","월계","광운대","석계","신이문","외대앞","회기","청량리","제기동","신설동","동묘앞","동대문","종로5가","종로3가","종각","시청","서울역","남영","용산","노량진","대방","신길","영등포","신도림","구로","가산디지털단지","독산","금천구청","석수","관악","안양","명학","금정","군포","당정","의왕","성균관대","화서","수원","세류","병점","세마","오산대","오산","진위","송탄","서정리","평택지제","평택","성환","직산","두정","천안","봉명","쌍용","아산","탕정","배방","온양온천","신창"
  ]),
  L1_INCHEON: line("L1", "1호선", C.L1, "서울1호선", ["구로","구일","개봉","오류동","온수","역곡","소사","부천","중동","송내","부개","부평","백운","동암","간석","주안","도화","제물포","도원","동인천","인천"]),
  L1_GWANGMYEONG: line("L1", "1호선", C.L1, "서울1호선", ["금천구청","광명"]),
  L1_SEODONGTAN: line("L1", "1호선", C.L1, "서울1호선", ["병점","서동탄"]),

  L2_CIRCLE: line("L2", "2호선", C.L2, "서울2호선", [
    "시청","을지로입구","을지로3가","을지로4가","동대문역사문화공원","신당","상왕십리","왕십리","한양대","뚝섬","성수","건대입구","구의","강변","잠실나루","잠실","잠실새내","종합운동장","삼성","선릉","역삼","강남","교대","서초","방배","사당","낙성대","서울대입구","봉천","신림","신대방","구로디지털단지","대림","신도림","문래","영등포구청","당산","합정","홍대입구","신촌","이대","아현","충정로"
  ], { circular: true }),
  L2_SEONGSU: line("L2", "2호선", C.L2, "서울2호선", ["성수","용답","신답","용두","신설동"]),
  L2_SINJEONG: line("L2", "2호선", C.L2, "서울2호선", ["신도림","도림천","양천구청","신정네거리","까치산"]),

  L3: line("L3", "3호선", C.L3, "서울3호선", ["대화","주엽","정발산","마두","백석","대곡","화정","원당","원흥","삼송","지축","구파발","연신내","불광","녹번","홍제","무악재","독립문","경복궁","안국","종로3가","을지로3가","충무로","동대입구","약수","금호","옥수","압구정","신사","잠원","고속터미널","교대","남부터미널","양재","매봉","도곡","대치","학여울","대청","일원","수서","가락시장","경찰병원","오금"]),
  L4: line("L4", "4호선", C.L4, "서울4호선", ["진접","오남","별내별가람","불암산","상계","노원","창동","쌍문","수유","미아","미아사거리","길음","성신여대입구","한성대입구","혜화","동대문","동대문역사문화공원","충무로","명동","회현","서울역","숙대입구","삼각지","신용산","이촌","동작","총신대입구","사당","남태령","선바위","경마공원","대공원","과천","정부과천청사","인덕원","평촌","범계","금정","산본","수리산","대야미","반월","상록수","한대앞","중앙","고잔","초지","안산","능길","정왕","오이도"]),
  L5_MAIN: line("L5", "5호선", C.L5, "서울5호선", ["방화","개화산","김포공항","송정","마곡","발산","우장산","화곡","까치산","신정","목동","오목교","양평","영등포구청","영등포시장","신길","여의도","여의나루","마포","공덕","애오개","충정로","서대문","광화문","종로3가","을지로4가","동대문역사문화공원","청구","신금호","행당","왕십리","마장","답십리","장한평","군자","아차산","광나루","천호","강동","길동","굽은다리","명일","고덕","상일동","강일","미사","하남풍산","하남시청","하남검단산"]),
  L5_MACHEON: line("L5", "5호선", C.L5, "서울5호선", ["강동","둔촌동","올림픽공원","방이","오금","개롱","거여","마천"]),
  L6_MAIN: line("L6", "6호선", C.L6, "서울6호선", ["응암","새절","증산","디지털미디어시티","월드컵경기장","마포구청","망원","합정","상수","광흥창","대흥","공덕","효창공원앞","삼각지","녹사평","이태원","한강진","버티고개","약수","청구","신당","동묘앞","창신","보문","안암","고려대","월곡","상월곡","돌곶이","석계","태릉입구","화랑대","봉화산","신내"]),
  L6_LOOP: line("L6", "6호선", C.L6, "서울6호선", ["응암","역촌","불광","독바위","연신내","구산"], { circular: true }),
  L7: line("L7", "7호선", C.L7, "서울7호선", ["장암","도봉산","수락산","마들","노원","중계","하계","공릉","태릉입구","먹골","중화","상봉","면목","사가정","용마산","중곡","군자","어린이대공원","건대입구","자양","청담","강남구청","학동","논현","반포","고속터미널","내방","이수","남성","숭실대입구","상도","장승배기","신대방삼거리","보라매","신풍","대림","남구로","가산디지털단지","철산","광명사거리","천왕","온수","까치울","부천종합운동장","춘의","신중동","부천시청","상동","삼산체육관","굴포천","부평구청","산곡","석남"]),
  L8: line("L8", "8호선", C.L8, "서울8호선", ["별내","다산","동구릉","구리","장자호수공원","암사역사공원","암사","천호","강동구청","몽촌토성","잠실","석촌","송파","가락시장","문정","장지","복정","남위례","산성","남한산성입구","단대오거리","신흥","수진","모란"]),
  L9: line("L9", "9호선", C.L9, "서울9호선", ["개화","김포공항","공항시장","신방화","마곡나루","양천향교","가양","증미","등촌","염창","신목동","선유도","당산","국회의사당","여의도","샛강","노량진","노들","흑석","동작","구반포","신반포","고속터미널","사평","신논현","언주","선정릉","삼성중앙","봉은사","종합운동장","삼전","석촌고분","석촌","송파나루","한성백제","올림픽공원","둔촌오륜","중앙보훈병원"]),

  I1: line("I1", "인천 1호선", C.I1, "인천1호선", ["검단호수공원","신검단중앙","아라","계양","귤현","박촌","임학","계산","경인교대입구","작전","갈산","부평구청","부평시장","부평","동수","부평삼거리","간석오거리","인천시청","예술회관","인천터미널","문학경기장","선학","신연수","원인재","동춘","동막","캠퍼스타운","테크노파크","지식정보단지","인천대입구","센트럴파크","국제업무지구","송도달빛축제공원"]),
  I2: line("I2", "인천 2호선", C.I2, "인천2호선", ["검단오류","왕길","검단사거리","마전","완정","독정","검암","검바위","아시아드경기장","서구청","가정","가정중앙시장","석남","서부여성회관","인천가좌","가재울","주안국가산단","주안","시민공원","석바위시장","인천시청","석천사거리","모래내시장","만수","남동구청","인천대공원","운연"]),
  GJ_MAIN: line("GJ", "경의·중앙선", C.GJ, "경의중앙선", ["임진강","운천","문산","파주","월롱","금촌","금릉","운정","야당","탄현","일산","풍산","백마","곡산","대곡","능곡","행신","강매","한국항공대","수색","디지털미디어시티","가좌","홍대입구","서강대","공덕","효창공원앞","용산","이촌","서빙고","한남","옥수","응봉","왕십리","청량리","회기","중랑","상봉","망우","양원","구리","도농","양정","덕소","도심","팔당","운길산","양수","신원","국수","아신","오빈","양평","원덕","용문","지평"]),
  GJ_SEOUL: line("GJ", "경의·중앙선", C.GJ, "경의중앙선", ["가좌","신촌","서울역"]),
  GJ_GWANGUN: line("GJ", "경의·중앙선", C.GJ, "경의중앙선", ["회기","광운대"]),
  SB: line("SB", "수인·분당선", C.SB, "수인분당선", ["왕십리","서울숲","압구정로데오","강남구청","선정릉","선릉","한티","도곡","구룡","개포동","대모산입구","수서","복정","가천대","태평","모란","야탑","이매","서현","수내","정자","미금","오리","죽전","보정","구성","신갈","기흥","상갈","청명","영통","망포","매탄권선","수원시청","매교","수원","고색","오목천","어천","야목","사리","한대앞","중앙","고잔","초지","안산","능길","정왕","오이도","달월","월곶","소래포구","인천논현","호구포","남동인더스파크","원인재","연수","송도","인하대","숭의","신포","인천"]),
  DX: line("DX", "신분당선", C.DX, "신분당선", ["신사","논현","신논현","강남","양재","양재시민의숲","청계산입구","판교","정자","미금","동천","수지구청","성복","상현","광교중앙","광교"]),
  GC: line("GC", "경춘선", C.GC, "경춘선", ["청량리","회기","중랑","상봉","망우","신내","갈매","별내","퇴계원","사릉","금곡","평내호평","천마산","마석","대성리","청평","상천","가평","굴봉산","백양리","강촌","김유정","남춘천","춘천"]),
  GG: line("GG", "경강선", C.GG, "경강선", ["판교","성남","이매","삼동","경기광주","초월","곤지암","신둔도예촌","이천","부발","세종대왕릉","여주"]),
  SH: line("SH", "서해선", C.SH, "서해선", ["일산","풍산","백마","곡산","대곡","능곡","김포공항","원종","부천종합운동장","소사","소새울","시흥대야","신천","신현","시흥시청","시흥능곡","달미","선부","초지","시우","원시"]),
  UI: line("UI", "우이신설선", C.UI, "우이신설경전철", ["북한산우이","솔밭공원","4.19민주묘지","가오리","화계","삼양","삼양사거리","솔샘","북한산보국문","정릉","성신여대입구","보문","신설동"]),
  SL: line("SL", "신림선", C.SL, "신림선", ["샛강","대방","서울지방병무청","보라매","보라매공원","보라매병원","당곡","신림","서원","서울대벤처타운","관악산"]),
  EV: line("EV", "용인 에버라인", C.EV, "에버라인", ["기흥","강남대","지석","어정","동백","초당","삼가","시청·용인대","명지대","김량장","용인중앙시장","고진","보평","둔전","전대·에버랜드"]),
  UJ: line("UJ", "의정부경전철", C.UJ, "의정부경전철", ["발곡","회룡","범골","경전철의정부","의정부시청","흥선","의정부중앙","동오","새말","경기도청북부청사","효자","곤제","어룡","송산","탑석"]),
  GP: line("GP", "김포골드라인", C.GP, "김포골드라인", ["양촌","구래","마산","장기","운양","걸포북변","사우","풍무","고촌","김포공항"]),
  AR: line("AR", "공항철도", C.AR, "공항철도", ["서울역","공덕","홍대입구","디지털미디어시티","마곡나루","김포공항","계양","검암","청라국제도시","영종","운서","공항화물청사","인천공항1터미널","인천공항2터미널"]),
  GTX_NORTH: line("GTX-A", "GTX-A", C.GTX, "GTX-A", ["운정중앙","킨텍스","대곡","연신내","서울역"]),
  GTX_SOUTH: line("GTX-A", "GTX-A", C.GTX, "GTX-A", ["수서","성남","구성","동탄"]),
};

const MANUAL_POINTS = {
  "운정중앙": [37.71416, 126.73401],
  "킨텍스": [37.66794, 126.74811],
  "동탄": [37.20034, 127.09567],
  // KRIC 2026.1의 양원역 좌표가 경북 봉화의 동명 철도역으로 잘못 연결되어 있어 보정한다.
  "양원": [37.60662, 127.10795],
};

function normalize(raw, lineName = "") {
  let name = String(raw || "").trim().replace(/역$/, "").replace(/\([^)]*\)/g, "").trim();
  if (lineName === "공항철도" && name === "서울") name = "서울역";
  return name;
}

function stationId(name, source) {
  if (name !== "양평") return name;
  return source === "서울5호선" ? "양평__서울" : "양평__경기";
}

async function fetchRows() {
  const url = new URL(service);
  url.search = new URLSearchParams({
    f: "json",
    where: "1=1",
    outFields: "stationname,linename,stationlatitude,stationlongitude,updateddate",
    returnGeometry: "false",
    resultRecordCount: "2000",
  });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`KRIC request failed: ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return (json.features || []).map((feature) => feature.attributes).filter((row) => CAPITAL_LINES.has(row.linename));
}

const rows = await fetchRows();
const bySourceAndName = new Map();
const byName = new Map();
for (const row of rows) {
  const name = normalize(row.stationname, row.linename);
  const point = { name, lat: Number(row.stationlatitude), lng: Number(row.stationlongitude), source: row.linename };
  bySourceAndName.set(`${row.linename}|${name}`, point);
  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(point);
}

function resolvePoint(name, source) {
  if (MANUAL_POINTS[name]) {
    const [lat, lng] = MANUAL_POINTS[name];
    return { name, lat, lng, source: name === "양원" ? "KRIC 좌표 오류 보정" : "GTX-A 공식 노선" };
  }
  const exact = bySourceAndName.get(`${source}|${name}`);
  if (exact) return exact;
  const candidates = byName.get(name) || [];
  if (candidates.length) return candidates[0];
  throw new Error(`Missing coordinate: ${name} (${source})`);
}

const stations = {};
const generatedLines = {};
for (const [key, route] of Object.entries(routes)) {
  const ids = route.stations.map((name) => {
    const point = resolvePoint(name, route.source);
    const id = stationId(name, route.source);
    const optionName = name === "양평" ? (route.source === "서울5호선" ? "양평(서울)" : "양평(경기)") : name;
    stations[id] ||= { name, optionName, lat: point.lat, lng: point.lng };
    return id;
  });
  generatedLines[key] = {
    id: route.id,
    name: route.name,
    color: route.color,
    stations: ids,
    ...(route.circular ? { circular: true } : {}),
  };
}

const stationGroups = new Map();
for (const route of Object.values(generatedLines)) {
  for (const id of new Set(route.stations)) {
    if (!stationGroups.has(id)) stationGroups.set(id, new Set());
    stationGroups.get(id).add(route.id);
  }
}
const transfers = Array.from(stationGroups.entries())
  .filter(([, groups]) => groups.size > 1)
  .map(([id, groups]) => [id, Array.from(groups)])
  .sort((a, b) => a[0].localeCompare(b[0], "ko"));

const categoryCount = new Set(Object.values(generatedLines).map((item) => item.id)).size;
const data = {
  meta: {
    scope: "수도권 전철 및 도시철도 운영 구간",
    categoryCount,
    stationCount: Object.keys(stations).length,
    updated: "2026-07-16",
    sourceDate: "2026-02-28",
    source: "국가철도공단 철도산업정보센터(KRIC) 전국 지하철역 정보 2026.1",
    sourceUrl: "https://portal.esrikr.com/arcgis/home/item.html?id=6822f8bb52d0423c94b0f7d8ba997aa1",
    note: "GTX-A는 공식 개통 상태에 따라 운정중앙–서울역, 수서–동탄을 분리 연결함",
  },
  lines: generatedLines,
  stations,
  transfers,
};

const banner = `// 타이핑101 수도권 전철 데이터\n// 자동 생성: scripts/generate-subway-data.mjs\n// 기준: KRIC 2026.1 (2026-02-28) + GTX-A 공식 개통 구간 (2026-07-16 확인)\n\n`;
const graphCode = `\n\nfunction buildGraph(data) {\n  const graph = new Map();\n  const addEdge = (a, b) => {\n    if (!graph.has(a)) graph.set(a, []);\n    if (!graph.has(b)) graph.set(b, []);\n    if (!graph.get(a).includes(b)) graph.get(a).push(b);\n    if (!graph.get(b).includes(a)) graph.get(b).push(a);\n  };\n  Object.values(data.lines).forEach((line) => {\n    const list = line.stations;\n    for (let i = 0; i < list.length - 1; i++) {\n      if (data.stations[list[i]] && data.stations[list[i + 1]]) addEdge(list[i], list[i + 1]);\n    }\n    if (line.circular && list.length > 2) addEdge(list.at(-1), list[0]);\n  });\n  Object.keys(data.stations).forEach((id) => {\n    if (!graph.has(id)) graph.set(id, []);\n  });\n  return graph;\n}\n\nconst SUBWAY_GRAPH = buildGraph(SUBWAY_DATA);\n`;
await fs.writeFile(outputPath, `${banner}const SUBWAY_DATA = ${JSON.stringify(data, null, 2)};${graphCode}`, "utf8");
console.log(`Generated ${categoryCount} categories, ${Object.keys(generatedLines).length} route segments, ${Object.keys(stations).length} stations.`);
