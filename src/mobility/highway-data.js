// 주요 고속도로와 도시·지역의 학습용 연결망.
// 좌표는 각 지역의 중심 좌표이며 실제 주행 경로 안내용이 아닙니다.
const HIGHWAY_DATA = {
  lines: {
    GYEONGBU: { name: "경부고속도로", color: "#2563EB", stations: ["서울", "성남", "수원", "오산", "평택", "천안", "세종", "대전", "영동", "김천", "구미", "대구", "경주", "울산", "부산"] },
    SEOHAEAN: { name: "서해안고속도로", color: "#0F766E", stations: ["서울", "광명", "안산", "화성", "평택", "당진", "서산", "홍성", "보령", "군산", "부안", "고창", "무안", "목포"] },
    YEONGDONG: { name: "영동고속도로", color: "#7C3AED", stations: ["인천", "안산", "군포", "수원", "용인", "이천", "여주", "원주", "평창", "강릉"] },
    JUNGBU: { name: "중부고속도로", color: "#EA580C", stations: ["하남", "경기광주", "이천", "음성", "진천", "청주", "대전"] },
    JUNGBUNAERYUK: { name: "중부내륙고속도로", color: "#65A30D", stations: ["양평", "여주", "충주", "괴산", "문경", "상주", "김천", "성주", "고령", "대구"] },
    HONAM: { name: "호남고속도로", color: "#DB2777", stations: ["대전", "논산", "익산", "전주", "정읍", "장성", "광주", "곡성", "순천"] },
    NAMHAE: { name: "남해고속도로", color: "#0891B2", stations: ["영암", "강진", "순천", "광양", "사천", "진주", "함안", "창원", "김해", "부산"] },
    JUNGANG: { name: "중앙고속도로", color: "#9333EA", stations: ["부산", "김해", "밀양", "청도", "대구", "군위", "의성", "안동", "영주", "제천", "원주", "홍천", "춘천"] },
    SEOUL_YANGYANG: { name: "서울양양고속도로", color: "#DC2626", stations: ["서울", "하남", "남양주", "양평", "홍천", "인제", "양양"] },
    GWANGJU_DAEGU: { name: "광주대구고속도로", color: "#CA8A04", stations: ["광주", "담양", "순창", "남원", "함양", "거창", "고령", "대구"] },
    DAEJEON_TONGYEONG: { name: "통영대전고속도로", color: "#4F46E5", stations: ["대전", "금산", "무주", "함양", "산청", "진주", "고성", "통영"] },
    DONGHAE_NORTH: { name: "동해고속도로 북부", color: "#0284C7", stations: ["삼척", "동해", "강릉", "양양", "속초"] },
    DONGHAE_SOUTH: { name: "동해고속도로 남부", color: "#0369A1", stations: ["부산", "울산", "경주", "포항"] },
  },
  stations: {
    "서울": { name: "서울", en: "Seoul", lat: 37.5665, lng: 126.9780 },
    "성남": { name: "성남", en: "Seongnam", lat: 37.4200, lng: 127.1267 },
    "수원": { name: "수원", en: "Suwon", lat: 37.2636, lng: 127.0286 },
    "오산": { name: "오산", en: "Osan", lat: 37.1498, lng: 127.0772 },
    "평택": { name: "평택", en: "Pyeongtaek", lat: 36.9921, lng: 127.1129 },
    "천안": { name: "천안", en: "Cheonan", lat: 36.8151, lng: 127.1139 },
    "세종": { name: "세종", en: "Sejong", lat: 36.4800, lng: 127.2890 },
    "대전": { name: "대전", en: "Daejeon", lat: 36.3504, lng: 127.3845 },
    "영동": { name: "영동", en: "Yeongdong", lat: 36.1750, lng: 127.7834 },
    "김천": { name: "김천", en: "Gimcheon", lat: 36.1398, lng: 128.1136 },
    "구미": { name: "구미", en: "Gumi", lat: 36.1195, lng: 128.3446 },
    "대구": { name: "대구", en: "Daegu", lat: 35.8714, lng: 128.6014 },
    "경주": { name: "경주", en: "Gyeongju", lat: 35.8562, lng: 129.2247 },
    "울산": { name: "울산", en: "Ulsan", lat: 35.5384, lng: 129.3114 },
    "부산": { name: "부산", en: "Busan", lat: 35.1796, lng: 129.0756 },
    "광명": { name: "광명", en: "Gwangmyeong", lat: 37.4786, lng: 126.8644 },
    "안산": { name: "안산", en: "Ansan", lat: 37.3219, lng: 126.8309 },
    "화성": { name: "화성", en: "Hwaseong", lat: 37.1995, lng: 126.8312 },
    "당진": { name: "당진", en: "Dangjin", lat: 36.8896, lng: 126.6458 },
    "서산": { name: "서산", en: "Seosan", lat: 36.7845, lng: 126.4503 },
    "홍성": { name: "홍성", en: "Hongseong", lat: 36.6012, lng: 126.6608 },
    "보령": { name: "보령", en: "Boryeong", lat: 36.3335, lng: 126.6129 },
    "군산": { name: "군산", en: "Gunsan", lat: 35.9677, lng: 126.7366 },
    "부안": { name: "부안", en: "Buan", lat: 35.7316, lng: 126.7330 },
    "고창": { name: "고창", en: "Gochang", lat: 35.4358, lng: 126.7020 },
    "무안": { name: "무안", en: "Muan", lat: 34.9904, lng: 126.4817 },
    "목포": { name: "목포", en: "Mokpo", lat: 34.8118, lng: 126.3922 },
    "인천": { name: "인천", en: "Incheon", lat: 37.4563, lng: 126.7052 },
    "군포": { name: "군포", en: "Gunpo", lat: 37.3617, lng: 126.9352 },
    "용인": { name: "용인", en: "Yongin", lat: 37.2411, lng: 127.1776 },
    "이천": { name: "이천", en: "Icheon", lat: 37.2720, lng: 127.4350 },
    "여주": { name: "여주", en: "Yeoju", lat: 37.2982, lng: 127.6372 },
    "원주": { name: "원주", en: "Wonju", lat: 37.3422, lng: 127.9202 },
    "평창": { name: "평창", en: "Pyeongchang", lat: 37.3705, lng: 128.3903 },
    "강릉": { name: "강릉", en: "Gangneung", lat: 37.7519, lng: 128.8761 },
    "하남": { name: "하남", en: "Hanam", lat: 37.5393, lng: 127.2148 },
    "경기광주": { name: "경기광주", en: "Gwangju, Gyeonggi", lat: 37.4095, lng: 127.2550 },
    "음성": { name: "음성", en: "Eumseong", lat: 36.9403, lng: 127.6905 },
    "진천": { name: "진천", en: "Jincheon", lat: 36.8554, lng: 127.4356 },
    "청주": { name: "청주", en: "Cheongju", lat: 36.6424, lng: 127.4890 },
    "양평": { name: "양평", en: "Yangpyeong", lat: 37.4917, lng: 127.4874 },
    "충주": { name: "충주", en: "Chungju", lat: 36.9910, lng: 127.9259 },
    "괴산": { name: "괴산", en: "Goesan", lat: 36.8154, lng: 127.7867 },
    "문경": { name: "문경", en: "Mungyeong", lat: 36.5861, lng: 128.1860 },
    "상주": { name: "상주", en: "Sangju", lat: 36.4109, lng: 128.1591 },
    "성주": { name: "성주", en: "Seongju", lat: 35.9190, lng: 128.2829 },
    "고령": { name: "고령", en: "Goryeong", lat: 35.7261, lng: 128.2629 },
    "논산": { name: "논산", en: "Nonsan", lat: 36.1871, lng: 127.0987 },
    "익산": { name: "익산", en: "Iksan", lat: 35.9483, lng: 126.9576 },
    "전주": { name: "전주", en: "Jeonju", lat: 35.8242, lng: 127.1480 },
    "정읍": { name: "정읍", en: "Jeongeup", lat: 35.5699, lng: 126.8560 },
    "장성": { name: "장성", en: "Jangseong", lat: 35.3019, lng: 126.7848 },
    "광주": { name: "광주", en: "Gwangju", lat: 35.1595, lng: 126.8526 },
    "곡성": { name: "곡성", en: "Gokseong", lat: 35.2820, lng: 127.2918 },
    "순천": { name: "순천", en: "Suncheon", lat: 34.9506, lng: 127.4872 },
    "영암": { name: "영암", en: "Yeongam", lat: 34.8002, lng: 126.6968 },
    "강진": { name: "강진", en: "Gangjin", lat: 34.6420, lng: 126.7672 },
    "광양": { name: "광양", en: "Gwangyang", lat: 34.9407, lng: 127.6959 },
    "사천": { name: "사천", en: "Sacheon", lat: 35.0037, lng: 128.0642 },
    "진주": { name: "진주", en: "Jinju", lat: 35.1800, lng: 128.1076 },
    "함안": { name: "함안", en: "Haman", lat: 35.2724, lng: 128.4065 },
    "창원": { name: "창원", en: "Changwon", lat: 35.2281, lng: 128.6811 },
    "김해": { name: "김해", en: "Gimhae", lat: 35.2285, lng: 128.8894 },
    "밀양": { name: "밀양", en: "Miryang", lat: 35.5038, lng: 128.7466 },
    "청도": { name: "청도", en: "Cheongdo", lat: 35.6474, lng: 128.7340 },
    "군위": { name: "군위", en: "Gunwi", lat: 36.2428, lng: 128.5728 },
    "의성": { name: "의성", en: "Uiseong", lat: 36.3527, lng: 128.6971 },
    "안동": { name: "안동", en: "Andong", lat: 36.5684, lng: 128.7294 },
    "영주": { name: "영주", en: "Yeongju", lat: 36.8057, lng: 128.6240 },
    "제천": { name: "제천", en: "Jecheon", lat: 37.1326, lng: 128.1910 },
    "홍천": { name: "홍천", en: "Hongcheon", lat: 37.6972, lng: 127.8885 },
    "춘천": { name: "춘천", en: "Chuncheon", lat: 37.8813, lng: 127.7298 },
    "남양주": { name: "남양주", en: "Namyangju", lat: 37.6360, lng: 127.2165 },
    "인제": { name: "인제", en: "Inje", lat: 38.0697, lng: 128.1707 },
    "양양": { name: "양양", en: "Yangyang", lat: 38.0754, lng: 128.6190 },
    "담양": { name: "담양", en: "Damyang", lat: 35.3213, lng: 126.9882 },
    "순창": { name: "순창", en: "Sunchang", lat: 35.3745, lng: 127.1374 },
    "남원": { name: "남원", en: "Namwon", lat: 35.4164, lng: 127.3904 },
    "함양": { name: "함양", en: "Hamyang", lat: 35.5205, lng: 127.7252 },
    "거창": { name: "거창", en: "Geochang", lat: 35.6867, lng: 127.9095 },
    "금산": { name: "금산", en: "Geumsan", lat: 36.1087, lng: 127.4880 },
    "무주": { name: "무주", en: "Muju", lat: 36.0068, lng: 127.6608 },
    "산청": { name: "산청", en: "Sancheong", lat: 35.4156, lng: 127.8735 },
    "고성": { name: "고성", en: "Goseong", lat: 34.9731, lng: 128.3223 },
    "통영": { name: "통영", en: "Tongyeong", lat: 34.8544, lng: 128.4331 },
    "삼척": { name: "삼척", en: "Samcheok", lat: 37.4499, lng: 129.1652 },
    "동해": { name: "동해", en: "Donghae", lat: 37.5247, lng: 129.1143 },
    "속초": { name: "속초", en: "Sokcho", lat: 38.2070, lng: 128.5918 },
    "포항": { name: "포항", en: "Pohang", lat: 36.0190, lng: 129.3435 },
  },
};

function buildHighwayGraph() {
  const graph = new Map();
  const addEdge = (a, b) => {
    if (!HIGHWAY_DATA.stations[a] || !HIGHWAY_DATA.stations[b]) return;
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    if (!graph.get(a).includes(b)) graph.get(a).push(b);
    if (!graph.get(b).includes(a)) graph.get(b).push(a);
  };
  Object.values(HIGHWAY_DATA.lines).forEach((line) => {
    line.stations.forEach((name) => {
      if (!graph.has(name)) graph.set(name, []);
    });
    for (let i = 0; i < line.stations.length - 1; i++) addEdge(line.stations[i], line.stations[i + 1]);
  });
  return graph;
}

const HIGHWAY_GRAPH = buildHighwayGraph();
HIGHWAY_DATA.transfers = Array.from(HIGHWAY_GRAPH.keys())
  .filter((name) => Object.values(HIGHWAY_DATA.lines).filter((line) => line.stations.includes(name)).length > 1)
  .map((name) => [name]);
