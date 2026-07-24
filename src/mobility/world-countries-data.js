// 세계일주 후보: UN 회원국 193개국과 바티칸 시국·팔레스타인을 포함한 195개 국가.
// 정적 데이터로 포함해 네트워크 연결 없이도 국가명·위치를 학습할 수 있다.
const WORLD_COUNTRIES = [
  {
    "id": "WC_GH",
    "iso2": "GH",
    "name": "가나",
    "en": "Ghana",
    "lat": 8,
    "lng": -2,
    "continent": "africa"
  },
  {
    "id": "WC_GA",
    "iso2": "GA",
    "name": "가봉",
    "en": "Gabon",
    "lat": -1,
    "lng": 11.75,
    "continent": "africa"
  },
  {
    "id": "WC_GM",
    "iso2": "GM",
    "name": "감비아",
    "en": "Gambia",
    "lat": 13.4667,
    "lng": -16.5667,
    "continent": "africa"
  },
  {
    "id": "WC_GN",
    "iso2": "GN",
    "name": "기니",
    "en": "Guinea",
    "lat": 11,
    "lng": -10,
    "continent": "africa"
  },
  {
    "id": "WC_GW",
    "iso2": "GW",
    "name": "기니비사우",
    "en": "Guinea-Bissau",
    "lat": 12,
    "lng": -15,
    "continent": "africa"
  },
  {
    "id": "WC_NA",
    "iso2": "NA",
    "name": "나미비아",
    "en": "Namibia",
    "lat": -22,
    "lng": 17,
    "continent": "africa"
  },
  {
    "id": "WC_NG",
    "iso2": "NG",
    "name": "나이지리아",
    "en": "Nigeria",
    "lat": 10,
    "lng": 8,
    "continent": "africa"
  },
  {
    "id": "WC_SS",
    "iso2": "SS",
    "name": "남수단",
    "en": "South Sudan",
    "lat": 7,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_ZA",
    "iso2": "ZA",
    "name": "남아프리카",
    "en": "South Africa",
    "lat": -29,
    "lng": 24,
    "continent": "africa"
  },
  {
    "id": "WC_NE",
    "iso2": "NE",
    "name": "니제르",
    "en": "Niger",
    "lat": 16,
    "lng": 8,
    "continent": "africa"
  },
  {
    "id": "WC_LR",
    "iso2": "LR",
    "name": "라이베리아",
    "en": "Liberia",
    "lat": 6.5,
    "lng": -9.5,
    "continent": "africa"
  },
  {
    "id": "WC_LS",
    "iso2": "LS",
    "name": "레소토",
    "en": "Lesotho",
    "lat": -29.5,
    "lng": 28.5,
    "continent": "africa"
  },
  {
    "id": "WC_RW",
    "iso2": "RW",
    "name": "르완다",
    "en": "Rwanda",
    "lat": -2,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_LY",
    "iso2": "LY",
    "name": "리비아",
    "en": "Libya",
    "lat": 25,
    "lng": 17,
    "continent": "africa"
  },
  {
    "id": "WC_MG",
    "iso2": "MG",
    "name": "마다가스카르",
    "en": "Madagascar",
    "lat": -20,
    "lng": 47,
    "continent": "africa"
  },
  {
    "id": "WC_MW",
    "iso2": "MW",
    "name": "말라위",
    "en": "Malawi",
    "lat": -13.5,
    "lng": 34,
    "continent": "africa"
  },
  {
    "id": "WC_ML",
    "iso2": "ML",
    "name": "말리",
    "en": "Mali",
    "lat": 17,
    "lng": -4,
    "continent": "africa"
  },
  {
    "id": "WC_MA",
    "iso2": "MA",
    "name": "모로코",
    "en": "Morocco",
    "lat": 32,
    "lng": -5,
    "continent": "africa"
  },
  {
    "id": "WC_MU",
    "iso2": "MU",
    "name": "모리셔스",
    "en": "Mauritius",
    "lat": -20.2833,
    "lng": 57.55,
    "continent": "africa"
  },
  {
    "id": "WC_MR",
    "iso2": "MR",
    "name": "모리타니",
    "en": "Mauritania",
    "lat": 20,
    "lng": -12,
    "continent": "africa"
  },
  {
    "id": "WC_MZ",
    "iso2": "MZ",
    "name": "모잠비크",
    "en": "Mozambique",
    "lat": -18.25,
    "lng": 35,
    "continent": "africa"
  },
  {
    "id": "WC_BJ",
    "iso2": "BJ",
    "name": "베냉",
    "en": "Benin",
    "lat": 9.5,
    "lng": 2.25,
    "continent": "africa"
  },
  {
    "id": "WC_BW",
    "iso2": "BW",
    "name": "보츠와나",
    "en": "Botswana",
    "lat": -22,
    "lng": 24,
    "continent": "africa"
  },
  {
    "id": "WC_BI",
    "iso2": "BI",
    "name": "부룬디",
    "en": "Burundi",
    "lat": -3.5,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_BF",
    "iso2": "BF",
    "name": "부르키나파소",
    "en": "Burkina Faso",
    "lat": 13,
    "lng": -2,
    "continent": "africa"
  },
  {
    "id": "WC_ST",
    "iso2": "ST",
    "name": "상투메 프린시페",
    "en": "São Tomé and Príncipe",
    "lat": 1,
    "lng": 7,
    "continent": "africa"
  },
  {
    "id": "WC_SN",
    "iso2": "SN",
    "name": "세네갈",
    "en": "Senegal",
    "lat": 14,
    "lng": -14,
    "continent": "africa"
  },
  {
    "id": "WC_SC",
    "iso2": "SC",
    "name": "세이셸",
    "en": "Seychelles",
    "lat": -4.5833,
    "lng": 55.6667,
    "continent": "africa"
  },
  {
    "id": "WC_SO",
    "iso2": "SO",
    "name": "소말리아",
    "en": "Somalia",
    "lat": 10,
    "lng": 49,
    "continent": "africa"
  },
  {
    "id": "WC_SD",
    "iso2": "SD",
    "name": "수단",
    "en": "Sudan",
    "lat": 15,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_SL",
    "iso2": "SL",
    "name": "시에라리온",
    "en": "Sierra Leone",
    "lat": 8.5,
    "lng": -11.5,
    "continent": "africa"
  },
  {
    "id": "WC_DZ",
    "iso2": "DZ",
    "name": "알제리",
    "en": "Algeria",
    "lat": 28,
    "lng": 3,
    "continent": "africa"
  },
  {
    "id": "WC_AO",
    "iso2": "AO",
    "name": "앙골라",
    "en": "Angola",
    "lat": -12.5,
    "lng": 18.5,
    "continent": "africa"
  },
  {
    "id": "WC_ER",
    "iso2": "ER",
    "name": "에리트레아",
    "en": "Eritrea",
    "lat": 15,
    "lng": 39,
    "continent": "africa"
  },
  {
    "id": "WC_SZ",
    "iso2": "SZ",
    "name": "에스와티니",
    "en": "Eswatini",
    "lat": -26.5,
    "lng": 31.5,
    "continent": "africa"
  },
  {
    "id": "WC_ET",
    "iso2": "ET",
    "name": "에티오피아",
    "en": "Ethiopia",
    "lat": 8,
    "lng": 38,
    "continent": "africa"
  },
  {
    "id": "WC_UG",
    "iso2": "UG",
    "name": "우간다",
    "en": "Uganda",
    "lat": 1,
    "lng": 32,
    "continent": "africa"
  },
  {
    "id": "WC_EG",
    "iso2": "EG",
    "name": "이집트",
    "en": "Egypt",
    "lat": 27,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_ZM",
    "iso2": "ZM",
    "name": "잠비아",
    "en": "Zambia",
    "lat": -15,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_GQ",
    "iso2": "GQ",
    "name": "적도 기니",
    "en": "Equatorial Guinea",
    "lat": 2,
    "lng": 10,
    "continent": "africa"
  },
  {
    "id": "WC_CF",
    "iso2": "CF",
    "name": "중앙아프리카 공화국",
    "en": "Central African Republic",
    "lat": 7,
    "lng": 21,
    "continent": "africa"
  },
  {
    "id": "WC_DJ",
    "iso2": "DJ",
    "name": "지부티",
    "en": "Djibouti",
    "lat": 11.5,
    "lng": 43,
    "continent": "africa"
  },
  {
    "id": "WC_ZW",
    "iso2": "ZW",
    "name": "짐바브웨",
    "en": "Zimbabwe",
    "lat": -20,
    "lng": 30,
    "continent": "africa"
  },
  {
    "id": "WC_TD",
    "iso2": "TD",
    "name": "차드",
    "en": "Chad",
    "lat": 15,
    "lng": 19,
    "continent": "africa"
  },
  {
    "id": "WC_CM",
    "iso2": "CM",
    "name": "카메룬",
    "en": "Cameroon",
    "lat": 6,
    "lng": 12,
    "continent": "africa"
  },
  {
    "id": "WC_CV",
    "iso2": "CV",
    "name": "카보베르데",
    "en": "Cape Verde",
    "lat": 16,
    "lng": -24,
    "continent": "africa"
  },
  {
    "id": "WC_KE",
    "iso2": "KE",
    "name": "케냐",
    "en": "Kenya",
    "lat": 1,
    "lng": 38,
    "continent": "africa"
  },
  {
    "id": "WC_KM",
    "iso2": "KM",
    "name": "코모로",
    "en": "Comoros",
    "lat": -12.1667,
    "lng": 44.25,
    "continent": "africa"
  },
  {
    "id": "WC_CI",
    "iso2": "CI",
    "name": "코트디부아르",
    "en": "Ivory Coast",
    "lat": 8,
    "lng": -5,
    "continent": "africa"
  },
  {
    "id": "WC_CG",
    "iso2": "CG",
    "name": "콩고",
    "en": "Congo",
    "lat": -1,
    "lng": 15,
    "continent": "africa"
  },
  {
    "id": "WC_CD",
    "iso2": "CD",
    "name": "콩고 민주 공화국",
    "en": "DR Congo",
    "lat": 0,
    "lng": 25,
    "continent": "africa"
  },
  {
    "id": "WC_TZ",
    "iso2": "TZ",
    "name": "탄자니아",
    "en": "Tanzania",
    "lat": -6,
    "lng": 35,
    "continent": "africa"
  },
  {
    "id": "WC_TG",
    "iso2": "TG",
    "name": "토고",
    "en": "Togo",
    "lat": 8,
    "lng": 1.1667,
    "continent": "africa"
  },
  {
    "id": "WC_TN",
    "iso2": "TN",
    "name": "튀니지",
    "en": "Tunisia",
    "lat": 34,
    "lng": 9,
    "continent": "africa"
  },
  {
    "id": "WC_NP",
    "iso2": "NP",
    "name": "네팔",
    "en": "Nepal",
    "lat": 28,
    "lng": 84,
    "continent": "asia"
  },
  {
    "id": "WC_KR",
    "iso2": "KR",
    "name": "대한민국",
    "en": "South Korea",
    "lat": 37,
    "lng": 127.5,
    "continent": "asia"
  },
  {
    "id": "WC_TL",
    "iso2": "TL",
    "name": "동티모르",
    "en": "Timor-Leste",
    "lat": -8.8333,
    "lng": 125.9167,
    "continent": "asia"
  },
  {
    "id": "WC_LA",
    "iso2": "LA",
    "name": "라오스",
    "en": "Laos",
    "lat": 18,
    "lng": 105,
    "continent": "asia"
  },
  {
    "id": "WC_LB",
    "iso2": "LB",
    "name": "레바논",
    "en": "Lebanon",
    "lat": 33.8333,
    "lng": 35.8333,
    "continent": "asia"
  },
  {
    "id": "WC_MY",
    "iso2": "MY",
    "name": "말레이시아",
    "en": "Malaysia",
    "lat": 2.5,
    "lng": 112.5,
    "continent": "asia"
  },
  {
    "id": "WC_MV",
    "iso2": "MV",
    "name": "몰디브",
    "en": "Maldives",
    "lat": 3.25,
    "lng": 73,
    "continent": "asia"
  },
  {
    "id": "WC_MN",
    "iso2": "MN",
    "name": "몽골국",
    "en": "Mongolia",
    "lat": 46,
    "lng": 105,
    "continent": "asia"
  },
  {
    "id": "WC_MM",
    "iso2": "MM",
    "name": "미얀마",
    "en": "Myanmar",
    "lat": 22,
    "lng": 98,
    "continent": "asia"
  },
  {
    "id": "WC_BH",
    "iso2": "BH",
    "name": "바레인",
    "en": "Bahrain",
    "lat": 26,
    "lng": 50.55,
    "continent": "asia"
  },
  {
    "id": "WC_BD",
    "iso2": "BD",
    "name": "방글라데시",
    "en": "Bangladesh",
    "lat": 24,
    "lng": 90,
    "continent": "asia"
  },
  {
    "id": "WC_VN",
    "iso2": "VN",
    "name": "베트남",
    "en": "Vietnam",
    "lat": 16.1667,
    "lng": 107.8333,
    "continent": "asia"
  },
  {
    "id": "WC_BT",
    "iso2": "BT",
    "name": "부탄",
    "en": "Bhutan",
    "lat": 27.5,
    "lng": 90.5,
    "continent": "asia"
  },
  {
    "id": "WC_BN",
    "iso2": "BN",
    "name": "브루나이",
    "en": "Brunei",
    "lat": 4.5,
    "lng": 114.6667,
    "continent": "asia"
  },
  {
    "id": "WC_SA",
    "iso2": "SA",
    "name": "사우디아라비아",
    "en": "Saudi Arabia",
    "lat": 25,
    "lng": 45,
    "continent": "asia"
  },
  {
    "id": "WC_LK",
    "iso2": "LK",
    "name": "스리랑카",
    "en": "Sri Lanka",
    "lat": 7,
    "lng": 81,
    "continent": "asia"
  },
  {
    "id": "WC_SY",
    "iso2": "SY",
    "name": "시리아",
    "en": "Syria",
    "lat": 35,
    "lng": 38,
    "continent": "asia"
  },
  {
    "id": "WC_SG",
    "iso2": "SG",
    "name": "싱가포르",
    "en": "Singapore",
    "lat": 1.3667,
    "lng": 103.8,
    "continent": "asia"
  },
  {
    "id": "WC_AE",
    "iso2": "AE",
    "name": "아랍에미리트",
    "en": "United Arab Emirates",
    "lat": 24,
    "lng": 54,
    "continent": "asia"
  },
  {
    "id": "WC_AM",
    "iso2": "AM",
    "name": "아르메니아",
    "en": "Armenia",
    "lat": 40,
    "lng": 45,
    "continent": "asia"
  },
  {
    "id": "WC_AZ",
    "iso2": "AZ",
    "name": "아제르바이잔",
    "en": "Azerbaijan",
    "lat": 40.5,
    "lng": 47.5,
    "continent": "asia"
  },
  {
    "id": "WC_AF",
    "iso2": "AF",
    "name": "아프가니스탄",
    "en": "Afghanistan",
    "lat": 33,
    "lng": 65,
    "continent": "asia"
  },
  {
    "id": "WC_YE",
    "iso2": "YE",
    "name": "예멘",
    "en": "Yemen",
    "lat": 15,
    "lng": 48,
    "continent": "asia"
  },
  {
    "id": "WC_OM",
    "iso2": "OM",
    "name": "오만",
    "en": "Oman",
    "lat": 21,
    "lng": 57,
    "continent": "asia"
  },
  {
    "id": "WC_JO",
    "iso2": "JO",
    "name": "요르단",
    "en": "Jordan",
    "lat": 31,
    "lng": 36,
    "continent": "asia"
  },
  {
    "id": "WC_UZ",
    "iso2": "UZ",
    "name": "우즈베키스탄",
    "en": "Uzbekistan",
    "lat": 41,
    "lng": 64,
    "continent": "asia"
  },
  {
    "id": "WC_IQ",
    "iso2": "IQ",
    "name": "이라크",
    "en": "Iraq",
    "lat": 33,
    "lng": 44,
    "continent": "asia"
  },
  {
    "id": "WC_IR",
    "iso2": "IR",
    "name": "이란",
    "en": "Iran",
    "lat": 32,
    "lng": 53,
    "continent": "asia"
  },
  {
    "id": "WC_IL",
    "iso2": "IL",
    "name": "이스라엘",
    "en": "Israel",
    "lat": 31.47,
    "lng": 35.13,
    "continent": "asia"
  },
  {
    "id": "WC_IN",
    "iso2": "IN",
    "name": "인도",
    "en": "India",
    "lat": 20,
    "lng": 77,
    "continent": "asia"
  },
  {
    "id": "WC_ID",
    "iso2": "ID",
    "name": "인도네시아",
    "en": "Indonesia",
    "lat": -5,
    "lng": 120,
    "continent": "asia"
  },
  {
    "id": "WC_JP",
    "iso2": "JP",
    "name": "일본",
    "en": "Japan",
    "lat": 36,
    "lng": 138,
    "continent": "asia"
  },
  {
    "id": "WC_KP",
    "iso2": "KP",
    "name": "북한",
    "en": "North Korea",
    "lat": 40,
    "lng": 127,
    "continent": "asia"
  },
  {
    "id": "WC_GE",
    "iso2": "GE",
    "name": "조지아",
    "en": "Georgia",
    "lat": 42,
    "lng": 43.5,
    "continent": "asia"
  },
  {
    "id": "WC_CN",
    "iso2": "CN",
    "name": "중국",
    "en": "China",
    "lat": 35,
    "lng": 105,
    "continent": "asia"
  },
  {
    "id": "WC_KZ",
    "iso2": "KZ",
    "name": "카자흐스탄",
    "en": "Kazakhstan",
    "lat": 48,
    "lng": 68,
    "continent": "asia"
  },
  {
    "id": "WC_QA",
    "iso2": "QA",
    "name": "카타르",
    "en": "Qatar",
    "lat": 25.5,
    "lng": 51.25,
    "continent": "asia"
  },
  {
    "id": "WC_KH",
    "iso2": "KH",
    "name": "캄보디아",
    "en": "Cambodia",
    "lat": 13,
    "lng": 105,
    "continent": "asia"
  },
  {
    "id": "WC_KW",
    "iso2": "KW",
    "name": "쿠웨이트",
    "en": "Kuwait",
    "lat": 29.5,
    "lng": 45.75,
    "continent": "asia"
  },
  {
    "id": "WC_KG",
    "iso2": "KG",
    "name": "키르기스스탄",
    "en": "Kyrgyzstan",
    "lat": 41,
    "lng": 75,
    "continent": "asia"
  },
  {
    "id": "WC_TJ",
    "iso2": "TJ",
    "name": "타지키스탄",
    "en": "Tajikistan",
    "lat": 39,
    "lng": 71,
    "continent": "asia"
  },
  {
    "id": "WC_TH",
    "iso2": "TH",
    "name": "태국",
    "en": "Thailand",
    "lat": 15,
    "lng": 100,
    "continent": "asia"
  },
  {
    "id": "WC_TM",
    "iso2": "TM",
    "name": "투르크메니스탄",
    "en": "Turkmenistan",
    "lat": 40,
    "lng": 60,
    "continent": "asia"
  },
  {
    "id": "WC_TR",
    "iso2": "TR",
    "name": "튀르키예",
    "en": "Türkiye",
    "lat": 39,
    "lng": 35,
    "continent": "asia"
  },
  {
    "id": "WC_PK",
    "iso2": "PK",
    "name": "파키스탄",
    "en": "Pakistan",
    "lat": 30,
    "lng": 70,
    "continent": "asia"
  },
  {
    "id": "WC_PS",
    "iso2": "PS",
    "name": "팔레스타인",
    "en": "Palestine",
    "lat": 31.9,
    "lng": 35.2,
    "continent": "asia"
  },
  {
    "id": "WC_PH",
    "iso2": "PH",
    "name": "필리핀",
    "en": "Philippines",
    "lat": 13,
    "lng": 122,
    "continent": "asia"
  },
  {
    "id": "WC_GR",
    "iso2": "GR",
    "name": "그리스",
    "en": "Greece",
    "lat": 39,
    "lng": 22,
    "continent": "europe"
  },
  {
    "id": "WC_NL",
    "iso2": "NL",
    "name": "네덜란드",
    "en": "Netherlands",
    "lat": 52.5,
    "lng": 5.75,
    "continent": "europe"
  },
  {
    "id": "WC_NO",
    "iso2": "NO",
    "name": "노르웨이",
    "en": "Norway",
    "lat": 62,
    "lng": 10,
    "continent": "europe"
  },
  {
    "id": "WC_DK",
    "iso2": "DK",
    "name": "덴마크",
    "en": "Denmark",
    "lat": 56,
    "lng": 10,
    "continent": "europe"
  },
  {
    "id": "WC_DE",
    "iso2": "DE",
    "name": "독일",
    "en": "Germany",
    "lat": 51,
    "lng": 9,
    "continent": "europe"
  },
  {
    "id": "WC_LV",
    "iso2": "LV",
    "name": "라트비아",
    "en": "Latvia",
    "lat": 57,
    "lng": 25,
    "continent": "europe"
  },
  {
    "id": "WC_RU",
    "iso2": "RU",
    "name": "러시아",
    "en": "Russia",
    "lat": 60,
    "lng": 100,
    "continent": "europe"
  },
  {
    "id": "WC_RO",
    "iso2": "RO",
    "name": "루마니아",
    "en": "Romania",
    "lat": 46,
    "lng": 25,
    "continent": "europe"
  },
  {
    "id": "WC_LU",
    "iso2": "LU",
    "name": "룩셈부르크",
    "en": "Luxembourg",
    "lat": 49.75,
    "lng": 6.1667,
    "continent": "europe"
  },
  {
    "id": "WC_LT",
    "iso2": "LT",
    "name": "리투아니아",
    "en": "Lithuania",
    "lat": 56,
    "lng": 24,
    "continent": "europe"
  },
  {
    "id": "WC_LI",
    "iso2": "LI",
    "name": "리히텐슈타인",
    "en": "Liechtenstein",
    "lat": 47.2667,
    "lng": 9.5333,
    "continent": "europe"
  },
  {
    "id": "WC_MC",
    "iso2": "MC",
    "name": "모나코",
    "en": "Monaco",
    "lat": 43.7333,
    "lng": 7.4,
    "continent": "europe"
  },
  {
    "id": "WC_ME",
    "iso2": "ME",
    "name": "몬테네그로",
    "en": "Montenegro",
    "lat": 42.5,
    "lng": 19.3,
    "continent": "europe"
  },
  {
    "id": "WC_MD",
    "iso2": "MD",
    "name": "몰도바",
    "en": "Moldova",
    "lat": 47,
    "lng": 29,
    "continent": "europe"
  },
  {
    "id": "WC_MT",
    "iso2": "MT",
    "name": "몰타",
    "en": "Malta",
    "lat": 35.8333,
    "lng": 14.5833,
    "continent": "europe"
  },
  {
    "id": "WC_VA",
    "iso2": "VA",
    "name": "바티칸 시국",
    "en": "Vatican City",
    "lat": 41.9,
    "lng": 12.45,
    "continent": "europe"
  },
  {
    "id": "WC_BE",
    "iso2": "BE",
    "name": "벨기에",
    "en": "Belgium",
    "lat": 50.8333,
    "lng": 4,
    "continent": "europe"
  },
  {
    "id": "WC_BY",
    "iso2": "BY",
    "name": "벨라루스",
    "en": "Belarus",
    "lat": 53,
    "lng": 28,
    "continent": "europe"
  },
  {
    "id": "WC_BA",
    "iso2": "BA",
    "name": "보스니아 헤르체고비나",
    "en": "Bosnia and Herzegovina",
    "lat": 44,
    "lng": 18,
    "continent": "europe"
  },
  {
    "id": "WC_MK",
    "iso2": "MK",
    "name": "북마케도니아",
    "en": "North Macedonia",
    "lat": 41.8333,
    "lng": 22,
    "continent": "europe"
  },
  {
    "id": "WC_BG",
    "iso2": "BG",
    "name": "불가리아",
    "en": "Bulgaria",
    "lat": 43,
    "lng": 25,
    "continent": "europe"
  },
  {
    "id": "WC_SM",
    "iso2": "SM",
    "name": "산마리노",
    "en": "San Marino",
    "lat": 43.7667,
    "lng": 12.4167,
    "continent": "europe"
  },
  {
    "id": "WC_RS",
    "iso2": "RS",
    "name": "세르비아",
    "en": "Serbia",
    "lat": 44,
    "lng": 21,
    "continent": "europe"
  },
  {
    "id": "WC_SE",
    "iso2": "SE",
    "name": "스웨덴",
    "en": "Sweden",
    "lat": 62,
    "lng": 15,
    "continent": "europe"
  },
  {
    "id": "WC_CH",
    "iso2": "CH",
    "name": "스위스",
    "en": "Switzerland",
    "lat": 47,
    "lng": 8,
    "continent": "europe"
  },
  {
    "id": "WC_ES",
    "iso2": "ES",
    "name": "스페인",
    "en": "Spain",
    "lat": 40,
    "lng": -4,
    "continent": "europe"
  },
  {
    "id": "WC_SK",
    "iso2": "SK",
    "name": "슬로바키아",
    "en": "Slovakia",
    "lat": 48.6667,
    "lng": 19.5,
    "continent": "europe"
  },
  {
    "id": "WC_SI",
    "iso2": "SI",
    "name": "슬로베니아",
    "en": "Slovenia",
    "lat": 46.1167,
    "lng": 14.8167,
    "continent": "europe"
  },
  {
    "id": "WC_IS",
    "iso2": "IS",
    "name": "아이슬란드",
    "en": "Iceland",
    "lat": 65,
    "lng": -18,
    "continent": "europe"
  },
  {
    "id": "WC_IE",
    "iso2": "IE",
    "name": "아일랜드",
    "en": "Ireland",
    "lat": 53,
    "lng": -8,
    "continent": "europe"
  },
  {
    "id": "WC_AD",
    "iso2": "AD",
    "name": "안도라",
    "en": "Andorra",
    "lat": 42.5,
    "lng": 1.5,
    "continent": "europe"
  },
  {
    "id": "WC_AL",
    "iso2": "AL",
    "name": "알바니아",
    "en": "Albania",
    "lat": 41,
    "lng": 20,
    "continent": "europe"
  },
  {
    "id": "WC_EE",
    "iso2": "EE",
    "name": "에스토니아",
    "en": "Estonia",
    "lat": 59,
    "lng": 26,
    "continent": "europe"
  },
  {
    "id": "WC_GB",
    "iso2": "GB",
    "name": "영국",
    "en": "United Kingdom",
    "lat": 54,
    "lng": -2,
    "continent": "europe"
  },
  {
    "id": "WC_AT",
    "iso2": "AT",
    "name": "오스트리아",
    "en": "Austria",
    "lat": 47.3333,
    "lng": 13.3333,
    "continent": "europe"
  },
  {
    "id": "WC_UA",
    "iso2": "UA",
    "name": "우크라이나",
    "en": "Ukraine",
    "lat": 49,
    "lng": 32,
    "continent": "europe"
  },
  {
    "id": "WC_IT",
    "iso2": "IT",
    "name": "이탈리아",
    "en": "Italy",
    "lat": 42.8333,
    "lng": 12.8333,
    "continent": "europe"
  },
  {
    "id": "WC_CZ",
    "iso2": "CZ",
    "name": "체코",
    "en": "Czechia",
    "lat": 49.75,
    "lng": 15.5,
    "continent": "europe"
  },
  {
    "id": "WC_HR",
    "iso2": "HR",
    "name": "크로아티아",
    "en": "Croatia",
    "lat": 45.1667,
    "lng": 15.5,
    "continent": "europe"
  },
  {
    "id": "WC_CY",
    "iso2": "CY",
    "name": "키프로스",
    "en": "Cyprus",
    "lat": 35,
    "lng": 33,
    "continent": "europe"
  },
  {
    "id": "WC_PT",
    "iso2": "PT",
    "name": "포르투갈",
    "en": "Portugal",
    "lat": 39.5,
    "lng": -8,
    "continent": "europe"
  },
  {
    "id": "WC_PL",
    "iso2": "PL",
    "name": "폴란드",
    "en": "Poland",
    "lat": 52,
    "lng": 20,
    "continent": "europe"
  },
  {
    "id": "WC_FR",
    "iso2": "FR",
    "name": "프랑스",
    "en": "France",
    "lat": 46,
    "lng": 2,
    "continent": "europe"
  },
  {
    "id": "WC_FI",
    "iso2": "FI",
    "name": "핀란드",
    "en": "Finland",
    "lat": 64,
    "lng": 26,
    "continent": "europe"
  },
  {
    "id": "WC_HU",
    "iso2": "HU",
    "name": "헝가리",
    "en": "Hungary",
    "lat": 47,
    "lng": 20,
    "continent": "europe"
  },
  {
    "id": "WC_GT",
    "iso2": "GT",
    "name": "과테말라",
    "en": "Guatemala",
    "lat": 15.5,
    "lng": -90.25,
    "continent": "northAmerica"
  },
  {
    "id": "WC_GD",
    "iso2": "GD",
    "name": "그레나다",
    "en": "Grenada",
    "lat": 12.1167,
    "lng": -61.6667,
    "continent": "northAmerica"
  },
  {
    "id": "WC_NI",
    "iso2": "NI",
    "name": "니카라과",
    "en": "Nicaragua",
    "lat": 13,
    "lng": -85,
    "continent": "northAmerica"
  },
  {
    "id": "WC_DM",
    "iso2": "DM",
    "name": "도미니카 공화국",
    "en": "Dominica",
    "lat": 15.4167,
    "lng": -61.3333,
    "continent": "northAmerica"
  },
  {
    "id": "WC_DO",
    "iso2": "DO",
    "name": "도미니카 공화국",
    "en": "Dominican Republic",
    "lat": 19,
    "lng": -70.6667,
    "continent": "northAmerica"
  },
  {
    "id": "WC_MX",
    "iso2": "MX",
    "name": "멕시코",
    "en": "Mexico",
    "lat": 23,
    "lng": -102,
    "continent": "northAmerica"
  },
  {
    "id": "WC_US",
    "iso2": "US",
    "name": "미국",
    "en": "United States",
    "lat": 38,
    "lng": -97,
    "continent": "northAmerica"
  },
  {
    "id": "WC_BB",
    "iso2": "BB",
    "name": "바베이도스",
    "en": "Barbados",
    "lat": 13.1667,
    "lng": -59.5333,
    "continent": "northAmerica"
  },
  {
    "id": "WC_BS",
    "iso2": "BS",
    "name": "바하마",
    "en": "Bahamas",
    "lat": 24.25,
    "lng": -76,
    "continent": "northAmerica"
  },
  {
    "id": "WC_BZ",
    "iso2": "BZ",
    "name": "벨리즈",
    "en": "Belize",
    "lat": 17.25,
    "lng": -88.75,
    "continent": "northAmerica"
  },
  {
    "id": "WC_LC",
    "iso2": "LC",
    "name": "세인트루시아",
    "en": "Saint Lucia",
    "lat": 13.8833,
    "lng": -60.9667,
    "continent": "northAmerica"
  },
  {
    "id": "WC_VC",
    "iso2": "VC",
    "name": "세인트빈센트 그레나딘",
    "en": "Saint Vincent and the Grenadines",
    "lat": 13.25,
    "lng": -61.2,
    "continent": "northAmerica"
  },
  {
    "id": "WC_KN",
    "iso2": "KN",
    "name": "세인트키츠 네비스",
    "en": "Saint Kitts and Nevis",
    "lat": 17.3333,
    "lng": -62.75,
    "continent": "northAmerica"
  },
  {
    "id": "WC_HT",
    "iso2": "HT",
    "name": "아이티",
    "en": "Haiti",
    "lat": 19,
    "lng": -72.4167,
    "continent": "northAmerica"
  },
  {
    "id": "WC_AG",
    "iso2": "AG",
    "name": "앤티가 바부다",
    "en": "Antigua and Barbuda",
    "lat": 17.05,
    "lng": -61.8,
    "continent": "northAmerica"
  },
  {
    "id": "WC_SV",
    "iso2": "SV",
    "name": "엘살바도르",
    "en": "El Salvador",
    "lat": 13.8333,
    "lng": -88.9167,
    "continent": "northAmerica"
  },
  {
    "id": "WC_HN",
    "iso2": "HN",
    "name": "온두라스",
    "en": "Honduras",
    "lat": 15,
    "lng": -86.5,
    "continent": "northAmerica"
  },
  {
    "id": "WC_JM",
    "iso2": "JM",
    "name": "자메이카",
    "en": "Jamaica",
    "lat": 18.25,
    "lng": -77.5,
    "continent": "northAmerica"
  },
  {
    "id": "WC_CA",
    "iso2": "CA",
    "name": "캐나다",
    "en": "Canada",
    "lat": 60,
    "lng": -95,
    "continent": "northAmerica"
  },
  {
    "id": "WC_CR",
    "iso2": "CR",
    "name": "코스타리카",
    "en": "Costa Rica",
    "lat": 10,
    "lng": -84,
    "continent": "northAmerica"
  },
  {
    "id": "WC_CU",
    "iso2": "CU",
    "name": "쿠바",
    "en": "Cuba",
    "lat": 21.5,
    "lng": -80,
    "continent": "northAmerica"
  },
  {
    "id": "WC_TT",
    "iso2": "TT",
    "name": "트리니다드 토바고",
    "en": "Trinidad and Tobago",
    "lat": 11,
    "lng": -61,
    "continent": "northAmerica"
  },
  {
    "id": "WC_PA",
    "iso2": "PA",
    "name": "파나마",
    "en": "Panama",
    "lat": 9,
    "lng": -80,
    "continent": "northAmerica"
  },
  {
    "id": "WC_NR",
    "iso2": "NR",
    "name": "나우루",
    "en": "Nauru",
    "lat": -0.5333,
    "lng": 166.9167,
    "continent": "oceania"
  },
  {
    "id": "WC_NZ",
    "iso2": "NZ",
    "name": "뉴질랜드",
    "en": "New Zealand",
    "lat": -41,
    "lng": 174,
    "continent": "oceania"
  },
  {
    "id": "WC_MH",
    "iso2": "MH",
    "name": "마셜 제도",
    "en": "Marshall Islands",
    "lat": 9,
    "lng": 168,
    "continent": "oceania"
  },
  {
    "id": "WC_FM",
    "iso2": "FM",
    "name": "미크로네시아",
    "en": "Micronesia",
    "lat": 6.9167,
    "lng": 158.25,
    "continent": "oceania"
  },
  {
    "id": "WC_VU",
    "iso2": "VU",
    "name": "바누아투",
    "en": "Vanuatu",
    "lat": -16,
    "lng": 167,
    "continent": "oceania"
  },
  {
    "id": "WC_WS",
    "iso2": "WS",
    "name": "사모아",
    "en": "Samoa",
    "lat": -13.5833,
    "lng": -172.3333,
    "continent": "oceania"
  },
  {
    "id": "WC_SB",
    "iso2": "SB",
    "name": "솔로몬 제도",
    "en": "Solomon Islands",
    "lat": -8,
    "lng": 159,
    "continent": "oceania"
  },
  {
    "id": "WC_KI",
    "iso2": "KI",
    "name": "키리바시",
    "en": "Kiribati",
    "lat": 1.4167,
    "lng": 173,
    "continent": "oceania"
  },
  {
    "id": "WC_TO",
    "iso2": "TO",
    "name": "통가",
    "en": "Tonga",
    "lat": -20,
    "lng": -175,
    "continent": "oceania"
  },
  {
    "id": "WC_TV",
    "iso2": "TV",
    "name": "투발루",
    "en": "Tuvalu",
    "lat": -8,
    "lng": 178,
    "continent": "oceania"
  },
  {
    "id": "WC_PG",
    "iso2": "PG",
    "name": "파푸아뉴기니",
    "en": "Papua New Guinea",
    "lat": -6,
    "lng": 147,
    "continent": "oceania"
  },
  {
    "id": "WC_PW",
    "iso2": "PW",
    "name": "팔라우",
    "en": "Palau",
    "lat": 7.5,
    "lng": 134.5,
    "continent": "oceania"
  },
  {
    "id": "WC_FJ",
    "iso2": "FJ",
    "name": "피지",
    "en": "Fiji",
    "lat": -18,
    "lng": 175,
    "continent": "oceania"
  },
  {
    "id": "WC_AU",
    "iso2": "AU",
    "name": "호주",
    "en": "Australia",
    "lat": -27,
    "lng": 133,
    "continent": "oceania"
  },
  {
    "id": "WC_GY",
    "iso2": "GY",
    "name": "가이아나",
    "en": "Guyana",
    "lat": 5,
    "lng": -59,
    "continent": "southAmerica"
  },
  {
    "id": "WC_VE",
    "iso2": "VE",
    "name": "베네수엘라",
    "en": "Venezuela",
    "lat": 8,
    "lng": -66,
    "continent": "southAmerica"
  },
  {
    "id": "WC_BO",
    "iso2": "BO",
    "name": "볼리비아",
    "en": "Bolivia",
    "lat": -17,
    "lng": -65,
    "continent": "southAmerica"
  },
  {
    "id": "WC_BR",
    "iso2": "BR",
    "name": "브라질",
    "en": "Brazil",
    "lat": -10,
    "lng": -55,
    "continent": "southAmerica"
  },
  {
    "id": "WC_SR",
    "iso2": "SR",
    "name": "수리남",
    "en": "Suriname",
    "lat": 4,
    "lng": -56,
    "continent": "southAmerica"
  },
  {
    "id": "WC_AR",
    "iso2": "AR",
    "name": "아르헨티나",
    "en": "Argentina",
    "lat": -34,
    "lng": -64,
    "continent": "southAmerica"
  },
  {
    "id": "WC_EC",
    "iso2": "EC",
    "name": "에콰도르",
    "en": "Ecuador",
    "lat": -2,
    "lng": -77.5,
    "continent": "southAmerica"
  },
  {
    "id": "WC_UY",
    "iso2": "UY",
    "name": "우루과이",
    "en": "Uruguay",
    "lat": -33,
    "lng": -56,
    "continent": "southAmerica"
  },
  {
    "id": "WC_CL",
    "iso2": "CL",
    "name": "칠레",
    "en": "Chile",
    "lat": -30,
    "lng": -71,
    "continent": "southAmerica"
  },
  {
    "id": "WC_CO",
    "iso2": "CO",
    "name": "콜롬비아",
    "en": "Colombia",
    "lat": 4,
    "lng": -72,
    "continent": "southAmerica"
  },
  {
    "id": "WC_PY",
    "iso2": "PY",
    "name": "파라과이",
    "en": "Paraguay",
    "lat": -23,
    "lng": -58,
    "continent": "southAmerica"
  },
  {
    "id": "WC_PE",
    "iso2": "PE",
    "name": "페루",
    "en": "Peru",
    "lat": -10,
    "lng": -76,
    "continent": "southAmerica"
  }
];
