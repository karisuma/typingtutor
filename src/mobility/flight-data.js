// 교육용 주요 항로 데이터입니다. 실제 운항 경로·영공 통과 순서는 기상, 관제, 항공사에 따라 달라질 수 있습니다.
// 공항 좌표와 항로 구성은 OurAirports / OpenFlights 공개 데이터 구조를 참고해 큐레이션했습니다.
const FLIGHT_DATA = {
  meta: {
    routeCount: 7,
    airportCount: 12,
  },
  airports: {
    ICN: { code: "ICN", name: "인천국제공항", city: "서울", lat: 37.4602, lng: 126.4407 },
    LAX: { code: "LAX", name: "로스앤젤레스 국제공항", city: "로스앤젤레스", lat: 33.9416, lng: -118.4085 },
    DXB: { code: "DXB", name: "두바이 국제공항", city: "두바이", lat: 25.2532, lng: 55.3657 },
    LHR: { code: "LHR", name: "런던 히드로 공항", city: "런던", lat: 51.4700, lng: -0.4543 },
    SIN: { code: "SIN", name: "싱가포르 창이 공항", city: "싱가포르", lat: 1.3644, lng: 103.9915 },
    SYD: { code: "SYD", name: "시드니 킹스퍼드 스미스 공항", city: "시드니", lat: -33.9399, lng: 151.1753 },
    FRA: { code: "FRA", name: "프랑크푸르트 공항", city: "프랑크푸르트", lat: 50.0379, lng: 8.5622 },
    JFK: { code: "JFK", name: "존 F. 케네디 국제공항", city: "뉴욕", lat: 40.6413, lng: -73.7781 },
    DOH: { code: "DOH", name: "하마드 국제공항", city: "도하", lat: 25.2731, lng: 51.6081 },
    IST: { code: "IST", name: "이스탄불 공항", city: "이스탄불", lat: 41.2753, lng: 28.7519 },
    GRU: { code: "GRU", name: "상파울루 과룰류스 국제공항", city: "상파울루", lat: -23.4356, lng: -46.4731 },
    NRT: { code: "NRT", name: "나리타 국제공항", city: "도쿄", lat: 35.7720, lng: 140.3929 },
  },
  lines: {
    ICN_LAX: {
      id: "ICN_LAX",
      name: "인천 → 로스앤젤레스",
      color: "#45d7ff",
      origin: "ICN",
      destination: "LAX",
      stations: ["ICN_LAX_KR", "ICN_LAX_JP", "ICN_LAX_CA", "ICN_LAX_US"],
    },
    ICN_DXB: {
      id: "ICN_DXB",
      name: "인천 → 두바이",
      color: "#58f0b6",
      origin: "ICN",
      destination: "DXB",
      stations: ["ICN_DXB_KR", "ICN_DXB_CN", "ICN_DXB_IN", "ICN_DXB_AE"],
    },
    LHR_SIN: {
      id: "LHR_SIN",
      name: "런던 → 싱가포르",
      color: "#b58cff",
      origin: "LHR",
      destination: "SIN",
      stations: ["LHR_SIN_GB", "LHR_SIN_DE", "LHR_SIN_TR", "LHR_SIN_IN", "LHR_SIN_SG"],
    },
    SIN_SYD: {
      id: "SIN_SYD",
      name: "싱가포르 → 시드니",
      color: "#ffb34d",
      origin: "SIN",
      destination: "SYD",
      stations: ["SIN_SYD_SG", "SIN_SYD_ID", "SIN_SYD_AU"],
    },
    FRA_JFK: {
      id: "FRA_JFK",
      name: "프랑크푸르트 → 뉴욕",
      color: "#ff75b5",
      origin: "FRA",
      destination: "JFK",
      stations: ["FRA_JFK_DE", "FRA_JFK_GB", "FRA_JFK_CA", "FRA_JFK_US"],
    },
    DOH_IST: {
      id: "DOH_IST",
      name: "도하 → 이스탄불",
      color: "#72b8ff",
      origin: "DOH",
      destination: "IST",
      stations: ["DOH_IST_QA", "DOH_IST_SA", "DOH_IST_TR"],
    },
    WORLD_TOUR: {
      id: "WORLD_TOUR",
      name: "세계일주",
      color: "#38cdf7",
      stations: [],
    },
  },
  worldTour: {
    continentOrder: ["asia", "europe", "africa", "northAmerica", "southAmerica", "oceania"],
    continents: {
      asia: {
        label: "아시아",
        countries: ["WT_ASIA_KR", "WT_ASIA_JP", "WT_ASIA_CN", "WT_ASIA_IN", "WT_ASIA_TH"],
      },
      europe: {
        label: "유럽",
        countries: ["WT_EU_GB", "WT_EU_FR", "WT_EU_DE", "WT_EU_IT", "WT_EU_ES"],
      },
      africa: {
        label: "아프리카",
        countries: ["WT_AF_EG", "WT_AF_KE", "WT_AF_NG", "WT_AF_ZA", "WT_AF_MA"],
      },
      northAmerica: {
        label: "북아메리카",
        countries: ["WT_NA_CA", "WT_NA_US", "WT_NA_MX", "WT_NA_CU", "WT_NA_CR"],
      },
      southAmerica: {
        label: "남아메리카",
        countries: ["WT_SA_BR", "WT_SA_AR", "WT_SA_CL", "WT_SA_PE", "WT_SA_CO"],
      },
      oceania: {
        label: "오세아니아",
        countries: ["WT_OC_AU", "WT_OC_NZ", "WT_OC_FJ", "WT_OC_PG", "WT_OC_WS"],
      },
    },
  },
  stations: {
    ICN_LAX_KR: { name: "대한민국", en: "South Korea", lat: 37.4602, lng: 126.4407 },
    ICN_LAX_JP: { name: "일본", en: "Japan", lat: 40.0, lng: 147.0 },
    ICN_LAX_CA: { name: "캐나다", en: "Canada", lat: 52.0, lng: -152.0 },
    ICN_LAX_US: { name: "미국", en: "United States", lat: 33.9416, lng: -118.4085 },
    ICN_DXB_KR: { name: "대한민국", en: "South Korea", lat: 37.4602, lng: 126.4407 },
    ICN_DXB_CN: { name: "중국", en: "China", lat: 34.0, lng: 108.0 },
    ICN_DXB_IN: { name: "인도", en: "India", lat: 22.0, lng: 77.0 },
    ICN_DXB_AE: { name: "아랍에미리트", en: "United Arab Emirates", lat: 25.2532, lng: 55.3657 },
    LHR_SIN_GB: { name: "영국", en: "United Kingdom", lat: 51.4700, lng: -0.4543 },
    LHR_SIN_DE: { name: "독일", en: "Germany", lat: 50.0, lng: 10.0 },
    LHR_SIN_TR: { name: "튀르키예", en: "Türkiye", lat: 39.0, lng: 35.0 },
    LHR_SIN_IN: { name: "인도", en: "India", lat: 18.0, lng: 75.0 },
    LHR_SIN_SG: { name: "싱가포르", en: "Singapore", lat: 1.3644, lng: 103.9915 },
    SIN_SYD_SG: { name: "싱가포르", en: "Singapore", lat: 1.3644, lng: 103.9915 },
    SIN_SYD_ID: { name: "인도네시아", en: "Indonesia", lat: -5.0, lng: 110.0 },
    SIN_SYD_AU: { name: "호주", en: "Australia", lat: -33.9399, lng: 151.1753 },
    FRA_JFK_DE: { name: "독일", en: "Germany", lat: 50.0379, lng: 8.5622 },
    FRA_JFK_GB: { name: "영국", en: "United Kingdom", lat: 54.0, lng: -4.0 },
    FRA_JFK_CA: { name: "캐나다", en: "Canada", lat: 52.0, lng: -60.0 },
    FRA_JFK_US: { name: "미국", en: "United States", lat: 40.6413, lng: -73.7781 },
    DOH_IST_QA: { name: "카타르", en: "Qatar", lat: 25.2731, lng: 51.6081 },
    DOH_IST_SA: { name: "사우디아라비아", en: "Saudi Arabia", lat: 29.0, lng: 45.0 },
    DOH_IST_TR: { name: "튀르키예", en: "Türkiye", lat: 41.2753, lng: 28.7519 },
    WT_ASIA_KR: { name: "대한민국", en: "South Korea", lat: 36.5, lng: 127.8 },
    WT_ASIA_JP: { name: "일본", en: "Japan", lat: 36.2, lng: 138.3 },
    WT_ASIA_CN: { name: "중국", en: "China", lat: 35.9, lng: 104.2 },
    WT_ASIA_IN: { name: "인도", en: "India", lat: 22.9, lng: 78.9 },
    WT_ASIA_TH: { name: "태국", en: "Thailand", lat: 15.9, lng: 100.9 },
    WT_EU_GB: { name: "영국", en: "United Kingdom", lat: 54.2, lng: -2.8 },
    WT_EU_FR: { name: "프랑스", en: "France", lat: 46.2, lng: 2.2 },
    WT_EU_DE: { name: "독일", en: "Germany", lat: 51.2, lng: 10.5 },
    WT_EU_IT: { name: "이탈리아", en: "Italy", lat: 41.9, lng: 12.6 },
    WT_EU_ES: { name: "스페인", en: "Spain", lat: 40.3, lng: -3.7 },
    WT_AF_EG: { name: "이집트", en: "Egypt", lat: 26.8, lng: 30.8 },
    WT_AF_KE: { name: "케냐", en: "Kenya", lat: 0.2, lng: 37.9 },
    WT_AF_NG: { name: "나이지리아", en: "Nigeria", lat: 9.1, lng: 8.7 },
    WT_AF_ZA: { name: "남아프리카공화국", en: "South Africa", lat: -30.6, lng: 22.9 },
    WT_AF_MA: { name: "모로코", en: "Morocco", lat: 31.8, lng: -7.1 },
    WT_NA_CA: { name: "캐나다", en: "Canada", lat: 56.1, lng: -106.3 },
    WT_NA_US: { name: "미국", en: "United States", lat: 39.8, lng: -98.6 },
    WT_NA_MX: { name: "멕시코", en: "Mexico", lat: 23.6, lng: -102.6 },
    WT_NA_CU: { name: "쿠바", en: "Cuba", lat: 21.5, lng: -79.5 },
    WT_NA_CR: { name: "코스타리카", en: "Costa Rica", lat: 9.8, lng: -83.8 },
    WT_SA_BR: { name: "브라질", en: "Brazil", lat: -10.8, lng: -52.9 },
    WT_SA_AR: { name: "아르헨티나", en: "Argentina", lat: -38.4, lng: -63.6 },
    WT_SA_CL: { name: "칠레", en: "Chile", lat: -35.7, lng: -71.5 },
    WT_SA_PE: { name: "페루", en: "Peru", lat: -9.2, lng: -75.0 },
    WT_SA_CO: { name: "콜롬비아", en: "Colombia", lat: 4.6, lng: -74.3 },
    WT_OC_AU: { name: "호주", en: "Australia", lat: -25.3, lng: 133.8 },
    WT_OC_NZ: { name: "뉴질랜드", en: "New Zealand", lat: -41.0, lng: 174.9 },
    WT_OC_FJ: { name: "피지", en: "Fiji", lat: -17.7, lng: 178.1 },
    WT_OC_PG: { name: "파푸아뉴기니", en: "Papua New Guinea", lat: -6.3, lng: 143.9 },
    WT_OC_WS: { name: "사모아", en: "Samoa", lat: -13.8, lng: -172.1 },
  },
};

function buildFlightGraph() {
  const graph = new Map();
  const addEdge = (a, b) => {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  };
  Object.values(FLIGHT_DATA.lines).forEach((route) => {
    route.stations.forEach((station) => {
      if (!graph.has(station)) graph.set(station, []);
    });
    for (let index = 0; index < route.stations.length - 1; index++) {
      addEdge(route.stations[index], route.stations[index + 1]);
    }
  });
  return graph;
}

const FLIGHT_GRAPH = buildFlightGraph();
FLIGHT_DATA.transfers = [];
