// 제주 자연·명승·역사문화 유산으로 구성한 학습용 여행 연결망.
// 상업시설·식당·쇼핑 장소는 포함하지 않는다. 좌표는 대표 진입 지점 기준이다.
const JEJU_DATA = {
  meta: {
    name: "제주 여행",
    categoryCount: 3,
    stationCount: 19,
  },
  lines: {
    JEJU_COAST: {
      id: "JEJU_COAST",
      name: "제주 해안·유산 길",
      color: "#147d8c",
      circular: true,
      stations: [
        "용두암", "제주목관아", "제주4·3평화공원", "함덕해수욕장", "만장굴", "비자림",
        "성산일출봉", "섭지코지", "성읍민속마을", "정방폭포", "천지연폭포", "주상절리대",
        "산방산", "용머리해안", "수월봉", "협재해변",
      ],
    },
    JEJU_FOREST: {
      id: "JEJU_FOREST",
      name: "제주 숲·오름 길",
      color: "#3b8a47",
      stations: ["제주4·3평화공원", "거문오름", "비자림", "사려니숲길", "한라산 성판악", "성읍민속마을"],
    },
  },
  stations: {
    "용두암": {
      name: "용두암", en: "Yongduam Rock", lat: 33.5169, lng: 126.5116,
      category: "nature", categoryLabel: "해안 명승", description: "제주시 해안의 용머리 모양 화산암 절벽",
    },
    "제주목관아": {
      name: "제주목관아", en: "Jeju Mokgwana", lat: 33.5134, lng: 126.5215,
      category: "heritage", categoryLabel: "역사 유산", description: "조선 시대 제주 행정의 중심이었던 관아 유적",
    },
    "제주4·3평화공원": {
      name: "제주4·3평화공원", en: "Jeju 4·3 Peace Park", lat: 33.4445, lng: 126.6744,
      category: "history", categoryLabel: "역사·기억", description: "제주4·3의 역사와 평화를 기억하는 추모 공간",
    },
    "함덕해수욕장": {
      name: "함덕해수욕장", en: "Hamdeok Beach", lat: 33.5430, lng: 126.6696,
      category: "nature", categoryLabel: "해안 명승", description: "맑은 바다와 현무암 해안이 어우러진 북동쪽 해변",
    },
    "거문오름": {
      name: "거문오름", en: "Geomun Oreum", lat: 33.4560, lng: 126.7160,
      category: "nature", categoryLabel: "세계 자연유산", description: "용암 동굴계의 출발점으로 알려진 화산체",
    },
    "만장굴": {
      name: "만장굴", en: "Manjanggul Lava Tube", lat: 33.5285, lng: 126.7715,
      category: "nature", categoryLabel: "세계 자연유산", description: "제주 화산 활동이 만든 대표적인 용암 동굴",
    },
    "비자림": {
      name: "비자림", en: "Bijarim Forest", lat: 33.4914, lng: 126.8097,
      category: "nature", categoryLabel: "숲길", description: "오래된 비자나무가 이어지는 제주의 숲",
    },
    "성산일출봉": {
      name: "성산일출봉", en: "Seongsan Ilchulbong", lat: 33.4581, lng: 126.9425,
      category: "nature", categoryLabel: "세계 자연유산", description: "바다에서 솟은 응회구와 일출 경관으로 유명한 명승",
    },
    "섭지코지": {
      name: "섭지코지", en: "Seopjikoji", lat: 33.4233, lng: 126.9278,
      category: "nature", categoryLabel: "해안 명승", description: "붉은 화산재 절벽과 초원이 만나는 동쪽 곶",
    },
    "성읍민속마을": {
      name: "성읍민속마을", en: "Seongeup Folk Village", lat: 33.3841, lng: 126.8003,
      category: "heritage", categoryLabel: "역사문화 유산", description: "제주의 전통 가옥과 마을 풍경이 남아 있는 생활 유산",
    },
    "사려니숲길": {
      name: "사려니숲길", en: "Saryeoni Forest Path", lat: 33.4228, lng: 126.6758,
      category: "nature", categoryLabel: "숲길", description: "삼나무와 난대림을 지나는 제주의 대표 숲길",
    },
    "한라산 성판악": {
      name: "한라산 성판악", en: "Hallasan Seongpanak", lat: 33.3856, lng: 126.6208,
      category: "nature", categoryLabel: "국립공원", description: "한라산 정상으로 향하는 대표 탐방로의 들머리",
    },
    "천지연폭포": {
      name: "천지연폭포", en: "Cheonjiyeon Falls", lat: 33.2464, lng: 126.5594,
      category: "nature", categoryLabel: "폭포 명승", description: "아열대 숲과 깊은 연못이 어우러진 서귀포 폭포",
    },
    "정방폭포": {
      name: "정방폭포", en: "Jeongbang Falls", lat: 33.2448, lng: 126.5715,
      category: "nature", categoryLabel: "폭포 명승", description: "바다로 바로 떨어지는 제주 남쪽 해안 폭포",
    },
    "주상절리대": {
      name: "주상절리대", en: "Jusangjeolli Cliffs", lat: 33.2381, lng: 126.4260,
      category: "nature", categoryLabel: "지질 명승", description: "파도가 빚은 육각형 현무암 기둥 절벽",
    },
    "산방산": {
      name: "산방산", en: "Sanbangsan Mountain", lat: 33.2362, lng: 126.3134,
      category: "nature", categoryLabel: "화산 지형", description: "남서쪽 해안에 우뚝 선 돔 형태의 화산체",
    },
    "용머리해안": {
      name: "용머리해안", en: "Yongmeori Coast", lat: 33.2317, lng: 126.3132,
      category: "nature", categoryLabel: "해안 명승", description: "층층이 드러난 퇴적암과 바다 절벽이 이어지는 해안",
    },
    "수월봉": {
      name: "수월봉", en: "Suwolbong Peak", lat: 33.2940, lng: 126.1669,
      category: "nature", categoryLabel: "지질 명승", description: "화산재 지층과 서쪽 바다 전망이 펼쳐지는 해안 봉우리",
    },
    "협재해변": {
      name: "협재해변", en: "Hyeopjae Beach", lat: 33.3945, lng: 126.2392,
      category: "nature", categoryLabel: "해안 명승", description: "비양도가 보이는 에메랄드빛 서쪽 해변",
    },
  },
  transfers: [["제주4·3평화공원"], ["비자림"], ["성읍민속마을"]],
};

// 광고·제휴 장소는 기본 여행지와 반드시 분리한다.
// 계약 후 아래 배열에만 장소를 추가하고, JEJU_PARTNER_PROGRAM.enabled를 true로 바꾸면
// 연결선과 학습 경유지가 자동 생성된다. 광고가 켜진 경우에는 UI에 고지 문구를 표시한다.
// {
//   name: "예시 파트너 파크",
//   en: "Example Partner Park",
//   lat: 33.0000,
//   lng: 126.0000,
//   categoryLabel: "파트너 장소",
//   description: "광고·제휴 장소임을 명확히 밝히는 설명",
//   connectTo: "성산일출봉", // 기존 제주 여행지 하나를 지정
//   color: "#c7792d",
// }
const JEJU_SPONSORED_DESTINATIONS = [];
const JEJU_PARTNER_PROGRAM = Object.freeze({
  enabled: false,
  disclosure: "이 여정에는 유료 광고·제휴 장소가 포함되어 있습니다.",
});

function getJejuTravelData({ includeSponsored = JEJU_PARTNER_PROGRAM.enabled } = {}) {
  const data = {
    meta: { ...JEJU_DATA.meta, sponsoredCount: 0, sponsoredDisclosure: "" },
    lines: Object.fromEntries(
      Object.entries(JEJU_DATA.lines).map(([key, line]) => [key, { ...line, stations: line.stations.slice() }])
    ),
    stations: { ...JEJU_DATA.stations },
    transfers: JEJU_DATA.transfers.map((transfer) => transfer.slice()),
  };

  if (!includeSponsored) return data;

  JEJU_SPONSORED_DESTINATIONS.forEach((place, index) => {
    if (!place?.name || !data.stations[place.connectTo]) return;
    data.stations[place.name] = {
      ...place,
      category: "sponsored",
      categoryLabel: place.categoryLabel || "파트너 장소",
    };
    const lineKey = `JEJU_PARTNER_${index + 1}`;
    data.lines[lineKey] = {
      id: lineKey,
      name: "제주 파트너 경유",
      color: place.color || "#c7792d",
      stations: [place.connectTo, place.name],
      sponsored: true,
    };
    data.meta.sponsoredCount += 1;
  });

  if (data.meta.sponsoredCount) data.meta.sponsoredDisclosure = JEJU_PARTNER_PROGRAM.disclosure;
  return data;
}

// 게임은 이 값만 사용한다. 기본값은 광고·상업 장소 0곳이다.
const JEJU_ACTIVE_DATA = getJejuTravelData();

function buildJejuGraph(data = JEJU_ACTIVE_DATA) {
  const graph = new Map();
  const addEdge = (from, to) => {
    if (!graph.has(from)) graph.set(from, []);
    if (!graph.has(to)) graph.set(to, []);
    graph.get(from).push(to);
    graph.get(to).push(from);
  };
  Object.values(data.lines).forEach((line) => {
    line.stations.forEach((station) => {
      if (!graph.has(station)) graph.set(station, []);
    });
    for (let index = 0; index < line.stations.length - 1; index++) {
      addEdge(line.stations[index], line.stations[index + 1]);
    }
    if (line.circular && line.stations.length > 2) addEdge(line.stations.at(-1), line.stations[0]);
  });
  return graph;
}

const JEJU_GRAPH = buildJejuGraph();
