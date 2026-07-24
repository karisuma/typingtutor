// 제주 자연·명승·역사문화 유산으로 구성한 학습용 여행 연결망.
// 상업시설·식당·쇼핑 장소는 포함하지 않는다. 좌표는 대표 진입 지점 기준이다.
const JEJU_DATA = {
  meta: {
    name: "제주 여행",
    categoryCount: 5,
    stationCount: 56,
  },
  lines: {
    JEJU_COAST: {
      id: "JEJU_COAST",
      name: "제주 해안 명승 길",
      color: "#147d8c",
      circular: true,
      stations: [
        "성산일출봉", "섭지코지", "신양섭지해수욕장", "세화해변", "표선해변", "쇠소깍",
        "원앙폭포", "정방폭포", "외돌개", "천지연폭포", "주상절리대", "천제연폭포",
        "중문색달해변", "송악산", "산방산", "사계해안", "용머리해안", "화순금모래해변", "수월봉",
        "차귀도", "금능해변", "협재해변", "곽지해수욕장", "이호테우해변", "도두봉",
        "용두암", "제주목관아", "삼양해수욕장", "제주 4 3 평화공원", "함덕해수욕장",
        "김녕해수욕장", "월정리해변", "만장굴", "비자림",
      ],
    },
    JEJU_FOREST: {
      id: "JEJU_FOREST",
      name: "제주 숲·오름 길",
      color: "#3b8a47",
      stations: ["비자림", "거문오름", "용눈이오름", "다랑쉬오름", "백약이오름", "아부오름", "산굼부리", "사려니숲길", "절물자연휴양림", "물영아리오름", "따라비오름", "성읍민속마을", "한라산 성판악", "사라오름", "백록담", "한라산 영실"],
    },
    JEJU_OREUM: {
      id: "JEJU_OREUM",
      name: "제주 대표 오름 길",
      color: "#b06b2d",
      stations: ["곽지해수욕장", "새별오름", "금오름", "노꼬메오름", "한라산 어리목", "백록담", "사라오름", "한라산 성판악", "따라비오름", "성읍민속마을"],
    },
    JEJU_ISLANDS: {
      id: "JEJU_ISLANDS",
      name: "제주 동부 섬길",
      color: "#5e78bb",
      stations: ["성산일출봉", "우도", "신양섭지해수욕장"],
    },
    JEJU_WEST_ISLANDS: {
      id: "JEJU_WEST_ISLANDS",
      name: "제주 서부 섬길",
      color: "#5e78bb",
      stations: ["협재해변", "비양도", "차귀도"],
    },
    JEJU_SOUTH_ISLAND: {
      id: "JEJU_SOUTH_ISLAND",
      name: "제주 남부 섬길",
      color: "#5e78bb",
      stations: ["송악산", "마라도"],
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
    "함덕해수욕장": {
      name: "함덕해수욕장", en: "Hamdeok Beach", lat: 33.5430, lng: 126.6696,
      category: "nature", categoryLabel: "해안 명승", description: "맑은 바다와 현무암 해안이 어우러진 북동쪽 해변",
    },
    "이호테우해변": {
      name: "이호테우해변", en: "Iho Tewoo Beach", lat: 33.5028, lng: 126.4527,
      category: "nature", categoryLabel: "해안 명승", description: "제주시 서쪽의 말 등대와 검은 모래 해안으로 알려진 해변",
    },
    "곽지해수욕장": {
      name: "곽지해수욕장", en: "Gwakji Beach", lat: 33.4507, lng: 126.3045,
      category: "nature", categoryLabel: "해안 명승", description: "애월 해안의 맑은 바다와 용천수가 만나는 해변",
    },
    "금능해변": {
      name: "금능해변", en: "Geumneung Beach", lat: 33.3901, lng: 126.2353,
      category: "nature", categoryLabel: "해안 명승", description: "비양도와 얕은 에메랄드빛 바다가 펼쳐지는 서쪽 해변",
    },
    "중문색달해변": {
      name: "중문색달해변", en: "Jungmun Saekdal Beach", lat: 33.2453, lng: 126.4126,
      category: "nature", categoryLabel: "해안 명승", description: "파도와 넓은 모래사장이 어우러진 서귀포 중문 해안",
    },
    "표선해변": {
      name: "표선해변", en: "Pyoseon Beach", lat: 33.3263, lng: 126.8383,
      category: "nature", categoryLabel: "해안 명승", description: "밀물과 썰물에 따라 넓은 모래사장이 드러나는 동남쪽 해변",
    },
    "김녕해수욕장": {
      name: "김녕해수욕장", en: "Gimnyeong Beach", lat: 33.5589, lng: 126.7584,
      category: "nature", categoryLabel: "해안 명승", description: "투명한 바다와 검은 현무암이 대비되는 제주시 동쪽 해변",
    },
    "월정리해변": {
      name: "월정리해변", en: "Woljeongri Beach", lat: 33.5565, lng: 126.7958,
      category: "nature", categoryLabel: "해안 명승", description: "밝은 모래와 옥빛 바다로 알려진 제주 동북 해안",
    },
    "거문오름": {
      name: "거문오름", en: "Geomun Oreum", lat: 33.4560, lng: 126.7160,
      category: "nature", categoryLabel: "세계 자연유산", description: "용암 동굴계의 출발점으로 알려진 화산체",
    },
    "새별오름": {
      name: "새별오름", en: "Saebyeol Oreum", lat: 33.3667, lng: 126.3576,
      category: "oreum", categoryLabel: "오름", description: "완만한 능선과 서쪽 들판 전망으로 유명한 제주 서부 오름",
    },
    "다랑쉬오름": {
      name: "다랑쉬오름", en: "Darangshi Oreum", lat: 33.4770, lng: 126.8215,
      category: "oreum", categoryLabel: "오름", description: "깊은 원형 분화구와 동부 오름 지대를 조망할 수 있는 오름",
    },
    "용눈이오름": {
      name: "용눈이오름", en: "Yongnuni Oreum", lat: 33.4591, lng: 126.8326,
      category: "oreum", categoryLabel: "오름", description: "부드러운 능선과 여러 봉우리가 이어지는 동부 오름",
    },
    "아부오름": {
      name: "아부오름", en: "Abu Oreum", lat: 33.4485, lng: 126.7771,
      category: "oreum", categoryLabel: "오름", description: "완만한 분화구와 초지가 둘러싼 제주 동부 오름",
    },
    "산굼부리": {
      name: "산굼부리", en: "Sangumburi Crater", lat: 33.4328, lng: 126.6930,
      category: "oreum", categoryLabel: "분화구·오름", description: "넓고 깊은 화산 분화구로 알려진 제주의 지질 명승",
    },
    "따라비오름": {
      name: "따라비오름", en: "Ttarabi Oreum", lat: 33.3872, lng: 126.7520,
      category: "oreum", categoryLabel: "오름", description: "여러 봉우리와 능선이 이어지는 남동부 오름 지대",
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
    "제주 4 3 평화공원": {
      name: "제주 4 3 평화공원", en: "Jeju Peace Park", lat: 33.4445, lng: 126.6744,
      category: "heritage", categoryLabel: "평화 문화공간", description: "제주의 평화와 인권의 가치를 기억하는 공원",
    },
    "신양섭지해수욕장": {
      name: "신양섭지해수욕장", en: "Sinyang Seopji Beach", lat: 33.4354, lng: 126.9199,
      category: "nature", categoryLabel: "해안 명승", description: "섭지코지 곁의 잔잔한 바다와 모래사장이 이어지는 해변",
    },
    "세화해변": {
      name: "세화해변", en: "Sehwa Beach", lat: 33.5255, lng: 126.8594,
      category: "nature", categoryLabel: "해안 명승", description: "동북 해안의 맑은 바다와 검은 현무암이 어우러진 해변",
    },
    "삼양해수욕장": {
      name: "삼양해수욕장", en: "Samyang Black Sand Beach", lat: 33.5215, lng: 126.5860,
      category: "nature", categoryLabel: "해안 명승", description: "검은 모래와 푸른 바다가 대비되는 제주시 동쪽 해변",
    },
    "화순금모래해변": {
      name: "화순금모래해변", en: "Hwasun Golden Sand Beach", lat: 33.2390, lng: 126.3348,
      category: "nature", categoryLabel: "해안 명승", description: "산방산 아래의 고운 모래와 잔잔한 물빛이 펼쳐지는 해변",
    },
    "사계해안": {
      name: "사계해안", en: "Sagye Coast", lat: 33.2288, lng: 126.3025,
      category: "nature", categoryLabel: "해안 명승", description: "산방산과 송악산을 바라볼 수 있는 남서쪽 해안 풍경",
    },
    "쇠소깍": {
      name: "쇠소깍", en: "Soesokkak Estuary", lat: 33.2525, lng: 126.6239,
      category: "nature", categoryLabel: "하천 지형", description: "담수와 바닷물이 만나는 깊은 물길과 기암 절벽의 지형",
    },
    "원앙폭포": {
      name: "원앙폭포", en: "Wonang Falls", lat: 33.2600, lng: 126.6200,
      category: "nature", categoryLabel: "폭포 명승", description: "울창한 숲과 맑은 소가 어우러진 서귀포의 작은 폭포",
    },
    "외돌개": {
      name: "외돌개", en: "Oedolgae Rock", lat: 33.2395, lng: 126.5450,
      category: "nature", categoryLabel: "해안 명승", description: "서귀포 앞바다에 홀로 솟은 화산암 바위 기둥",
    },
    "천제연폭포": {
      name: "천제연폭포", en: "Cheonjeyeon Falls", lat: 33.2528, lng: 126.4181,
      category: "nature", categoryLabel: "폭포 명승", description: "중문 계곡의 숲과 연못을 따라 이어지는 폭포 지형",
    },
    "송악산": {
      name: "송악산", en: "Songaksan Mountain", lat: 33.1995, lng: 126.2896,
      category: "nature", categoryLabel: "화산 지형", description: "남서 해안과 마라도 방향을 조망할 수 있는 해안 오름",
    },
    "차귀도": {
      name: "차귀도", en: "Chagwido Island", lat: 33.3083, lng: 126.1600,
      category: "nature", categoryLabel: "섬·해안 지형", description: "제주 서쪽 바다의 해식 절벽과 작은 섬들이 이루는 경관",
    },
    "도두봉": {
      name: "도두봉", en: "Dodubong Peak", lat: 33.5078, lng: 126.4732,
      category: "oreum", categoryLabel: "오름", description: "제주 시내와 바다를 함께 조망할 수 있는 낮은 해안 오름",
    },
    "우도": {
      name: "우도", en: "Udo Island", lat: 33.5030, lng: 126.9510,
      category: "nature", categoryLabel: "섬·해안 지형", description: "성산 앞바다의 섬으로 해안 절벽과 초원 풍경이 이어집니다",
    },
    "비양도": {
      name: "비양도", en: "Biyangdo Island", lat: 33.4097, lng: 126.2277,
      category: "nature", categoryLabel: "섬·화산 지형", description: "협재 앞바다에 있는 작은 화산섬과 해안 경관",
    },
    "마라도": {
      name: "마라도", en: "Marado Island", lat: 33.1171, lng: 126.2674,
      category: "nature", categoryLabel: "섬·해안 지형", description: "제주 남쪽 바다의 섬으로 낮은 초원과 해안 절벽이 펼쳐집니다",
    },
    "백약이오름": {
      name: "백약이오름", en: "Baegyagi Oreum", lat: 33.4363, lng: 126.7894,
      category: "oreum", categoryLabel: "오름", description: "완만한 분화구와 동부 오름 지대를 바라볼 수 있는 오름",
    },
    "물영아리오름": {
      name: "물영아리오름", en: "Mulyeongari Oreum", lat: 33.3689, lng: 126.6936,
      category: "oreum", categoryLabel: "오름", description: "습지와 분화구 지형이 공존하는 남동부 오름",
    },
    "사라오름": {
      name: "사라오름", en: "Sara Oreum", lat: 33.3623, lng: 126.5618,
      category: "oreum", categoryLabel: "오름", description: "한라산 동쪽 능선에서 백록담과 제주시 방향을 조망하는 오름",
    },
    "백록담": {
      name: "백록담", en: "Baengnokdam Crater Lake", lat: 33.3617, lng: 126.5335,
      category: "nature", categoryLabel: "한라산 정상", description: "한라산 정상 분화구에 자리한 제주 화산 지형의 상징",
    },
    "한라산 어리목": {
      name: "한라산 어리목", en: "Hallasan Eorimok", lat: 33.3921, lng: 126.4975,
      category: "nature", categoryLabel: "국립공원", description: "한라산 서쪽 탐방로의 들머리와 고지대 숲 풍경",
    },
    "한라산 영실": {
      name: "한라산 영실", en: "Hallasan Yeongsil", lat: 33.3617, lng: 126.4968,
      category: "nature", categoryLabel: "국립공원", description: "기암 봉우리와 고산 식생을 만나는 한라산 서남쪽 탐방 구간",
    },
    "금오름": {
      name: "금오름", en: "Geum Oreum", lat: 33.3554, lng: 126.3054,
      category: "oreum", categoryLabel: "오름", description: "서부 평야와 비양도 방향을 넓게 조망할 수 있는 오름",
    },
    "노꼬메오름": {
      name: "노꼬메오름", en: "Nokkome Oreum", lat: 33.3660, lng: 126.4564,
      category: "oreum", categoryLabel: "오름", description: "한라산 서쪽 중산간에서 능선과 숲길을 만나는 오름",
    },
    "절물자연휴양림": {
      name: "절물자연휴양림", en: "Jeolmul Natural Forest", lat: 33.4394, lng: 126.6384,
      category: "nature", categoryLabel: "숲길", description: "삼나무 숲과 화산 지형을 따라 걸을 수 있는 자연 휴양림",
    },
  },
  transfers: [["비자림"], ["성읍민속마을"], ["곽지해수욕장"], ["산굼부리"], ["한라산 성판악"], ["따라비오름"], ["협재해변"], ["차귀도"], ["송악산"], ["신양섭지해수욕장"]],
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
