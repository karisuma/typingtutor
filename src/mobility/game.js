// ============================================================
// 메트로 타이핑 게임 로직
// ============================================================

(function () {
  const $ = (sel) => document.querySelector(sel);

  // ---------------------- Map Setup ----------------------
  const map = L.map("map", {
    center: [37.5663, 126.9784],
    zoom: 12,
    minZoom: 2,
    maxZoom: 17,
    zoomControl: true,
    attributionControl: true,
    worldCopyJump: false,
    maxBoundsViscosity: 1,
  });

  // 비행 지도는 세계 타일을 좌우로 네 벌만 표시한다.
  // 가운데 두 벌(-360°~360°)에서만 카메라가 움직이고, 양 끝 두 벌은 자연스러운 여백 역할을 한다.
  const FLIGHT_TILE_BOUNDS = [[-85.0511, -720], [85.0511, 720]];
  const FLIGHT_ACTIVE_BOUNDS = [[-80, -360], [80, 360]];

  // 실제 도로·지형이 보이는 밝은 지도 베이스
  const lightBaseLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(map);
  const darkBaseLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  );
  const flightSatelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles © Esri",
      maxZoom: 18,
      noWrap: false,
      bounds: FLIGHT_TILE_BOUNDS,
    }
  );
  const flightReferenceLayer = L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Labels © Esri",
      maxZoom: 18,
      opacity: 0.58,
      noWrap: false,
      bounds: FLIGHT_TILE_BOUNDS,
    }
  );

  const subwayLayer = L.layerGroup().addTo(map);
  const highwayLayer = L.layerGroup();
  const flightLayer = L.layerGroup();
  const flightGeographyLayer = L.layerGroup();
  const jejuLayer = L.layerGroup();
  const jejuHighlightLayer = L.layerGroup();
  const subwayLineLayers = [];
  const highwayLineLayers = [];
  const flightLineLayers = [];
  const jejuLineLayers = [];
  const subwaySegmentPaths = new Map();
  const highwaySegmentPaths = new Map();
  const flightSegmentPaths = new Map();
  const jejuSegmentPaths = new Map();
  const LINE_SMOOTHING_SEGMENTS = 12;

  // 라벨 포함된 밝은 베이스 — 게임 분위기를 위해 단독으로 사용하지 않고 어두운 타일 사용
  // ---------------------- Line Drawing ----------------------
  function smoothLatLngs(points, segments = LINE_SMOOTHING_SEGMENTS) {
    if (points.length < 3) return points;
    const result = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      for (let step = 0; step < segments; step++) {
        const t = step / segments;
        const t2 = t * t;
        const t3 = t2 * t;
        const interpolate = (axis) =>
          0.5 *
          (2 * p1[axis] +
            (-p0[axis] + p2[axis]) * t +
            (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
            (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
        result.push([interpolate(0), interpolate(1)]);
      }
    }
    result.push(points[points.length - 1]);
    return result;
  }

  function drawLine(lineKey, line, data = SUBWAY_DATA, layer = subwayLayer, width = 5) {
    const list = line.seoulOnly || line.stations;
    const geometryStops = list.slice();
    const stationLatLngs = list
      .map((name) => data.stations[name])
      .filter(Boolean)
      .map((s) => [s.lat, s.lng]);

    if (line.circular && stationLatLngs.length > 2) {
      stationLatLngs.push(stationLatLngs[0]);
      geometryStops.push(geometryStops[0]);
    }

    if (stationLatLngs.length < 2) return;
    const latlngs = smoothLatLngs(stationLatLngs, LINE_SMOOTHING_SEGMENTS);
    const segmentStore = data === HIGHWAY_DATA
      ? highwaySegmentPaths
      : data === JEJU_ACTIVE_DATA
        ? jejuSegmentPaths
        : subwaySegmentPaths;
    for (let index = 0; index < geometryStops.length - 1; index++) {
      const from = geometryStops[index];
      const to = geometryStops[index + 1];
      const segment = stationLatLngs.length < 3
        ? stationLatLngs.slice(index, index + 2)
        : latlngs.slice(
          index * LINE_SMOOTHING_SEGMENTS,
          (index + 1) * LINE_SMOOTHING_SEGMENTS + 1
        );
      segmentStore.set(`${lineKey}|${from}|${to}`, segment);
      segmentStore.set(`${lineKey}|${to}|${from}`, segment.slice().reverse());
    }

    // 노선도 특유의 밝은 외곽선
    const outline = L.polyline(latlngs, {
      color: "#ffffff",
      weight: width + 4,
      opacity: 0.92,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(layer);

    // 본체
    const body = L.polyline(latlngs, {
      color: line.color,
      weight: width,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
      className: `line-${lineKey}`,
    }).addTo(layer);

    const collection = data === HIGHWAY_DATA
      ? highwayLineLayers
      : data === JEJU_ACTIVE_DATA
        ? jejuLineLayers
        : subwayLineLayers;
    collection.push({ outline, body, width });
  }

  Object.entries(SUBWAY_DATA.lines).forEach(([key, line]) => drawLine(key, line));
  Object.entries(HIGHWAY_DATA.lines).forEach(([key, line]) =>
    drawLine(key, line, HIGHWAY_DATA, highwayLayer, 4)
  );
  Object.entries(JEJU_ACTIVE_DATA.lines).forEach(([key, line]) =>
    drawLine(key, line, JEJU_ACTIVE_DATA, jejuLayer, 5)
  );

  function normalizeLongitude(lng) {
    return ((lng + 540) % 360) - 180;
  }

  // 현재 화면과 가장 가까운 중앙 월드 복사본의 경도를 선택한다.
  // 예: 피지(178°) → 사모아(-172°)는 178° → 188°으로 이어져 화면이 반대편으로 튀지 않는다.
  function flightDisplayLongitude(lng, referenceLng = map.getCenter().lng) {
    const candidates = [lng - 720, lng - 360, lng, lng + 360, lng + 720]
      .filter((candidate) => candidate >= FLIGHT_ACTIVE_BOUNDS[0][1] && candidate <= FLIGHT_ACTIVE_BOUNDS[1][1]);
    return candidates.reduce((nearest, candidate) =>
      Math.abs(candidate - referenceLng) < Math.abs(nearest - referenceLng) ? candidate : nearest
    );
  }

  function flightDisplayPoint(station, referenceLng = map.getCenter().lng) {
    return [station.lat, flightDisplayLongitude(station.lng, referenceLng)];
  }

  // 카메라 위치가 일시적으로 다른 세계 사본을 보고 있더라도, 현재 여정이
  // 선택한 경도 사본을 유지한다. 날짜 변경선 주변에서 인도양 쪽으로 튀는 것을 막는다.
  function flightJourneyDisplayPoint(name) {
    const station = FLIGHT_DATA.stations[name];
    if (!station) return null;
    const isCurrent = name === state.currentStation;
    const journeyPoint = state.journeyDisplayPoints[isCurrent
      ? state.journeyIndex
      : state.journeyIndex + 1];
    if (journeyPoint) return journeyPoint;

    const currentPoint = state.journeyDisplayPoints[state.journeyIndex];
    return flightDisplayPoint(station, currentPoint?.[1]);
  }

  function unwrapFlightPath(points, referenceLng = map.getCenter().lng) {
    let previousLng = referenceLng;
    return points.map(([lat, lng]) => {
      const displayLng = flightDisplayLongitude(lng, previousLng);
      previousLng = displayLng;
      return [lat, displayLng];
    });
  }

  function offsetGeoJsonLongitudes(geojson, offset) {
    if (!offset) return geojson;
    const offsetCoordinates = (coordinates) => {
      if (!Array.isArray(coordinates)) return coordinates;
      if (typeof coordinates[0] === "number") return [coordinates[0] + offset, ...coordinates.slice(1)];
      return coordinates.map(offsetCoordinates);
    };
    return {
      ...geojson,
      features: geojson.features.map((feature) => ({
        ...feature,
        geometry: feature.geometry && {
          ...feature.geometry,
          coordinates: offsetCoordinates(feature.geometry.coordinates),
        },
      })),
    };
  }

  // 지도 타일을 반복하지 않는 대신, 날짜 변경선을 통과하는 선은 양 끝에서 분리한다.
  // 이렇게 하면 같은 대륙이 화면 좌우에 한 번 더 나타나는 일이 없다.
  function splitAtDateLine(points) {
    const result = [];
    let current = [[points[0][0], normalizeLongitude(points[0][1])]];

    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const next = points[index];
      const lower = Math.min(previous[1], next[1]);
      const upper = Math.max(previous[1], next[1]);
      const crossing = Math.floor((lower + 180) / 360) * 360 + 180;

      if (crossing > lower && crossing < upper) {
        const ratio = (crossing - previous[1]) / (next[1] - previous[1]);
        const crossingLat = previous[0] + (next[0] - previous[0]) * ratio;
        const increasing = next[1] > previous[1];
        current.push([crossingLat, increasing ? 180 : -180]);
        result.push(current);
        current = [[crossingLat, increasing ? -180 : 180]];
      }
      current.push([next[0], normalizeLongitude(next[1])]);
    }

    result.push(current);
    return result.filter((segment) => segment.length >= 2);
  }

  function flightArc(from, to, segments = 36) {
    const points = [];
    const fromLng = from[1];
    const lngDelta = ((to[1] - fromLng + 540) % 360) - 180;
    const toLng = fromLng + lngDelta;
    const lift = Math.min(20, Math.max(4, Math.abs(lngDelta) * 0.12 + Math.abs(to[0] - from[0]) * 0.08));
    for (let index = 0; index <= segments; index++) {
      const progress = index / segments;
      points.push([
        from[0] + (to[0] - from[0]) * progress + Math.sin(Math.PI * progress) * lift,
        fromLng + (toLng - fromLng) * progress,
      ]);
    }
    return splitAtDateLine(points);
  }

  function drawFlightLine(lineKey, line) {
    const outline = L.featureGroup().addTo(flightLayer);
    const body = L.featureGroup().addTo(flightLayer);
    for (let index = 0; index < line.stations.length - 1; index++) {
      const from = FLIGHT_DATA.stations[line.stations[index]];
      const to = FLIGHT_DATA.stations[line.stations[index + 1]];
      if (!from || !to) continue;
      const arcs = flightArc([from.lat, from.lng], [to.lat, to.lng]);
      const movementPath = arcs.length === 1
        ? arcs[0]
        : [[from.lat, from.lng], [to.lat, to.lng]];
      flightSegmentPaths.set(`${lineKey}|${line.stations[index]}|${line.stations[index + 1]}`, movementPath);
      flightSegmentPaths.set(`${lineKey}|${line.stations[index +1]}|${line.stations[index]}`, movementPath.slice().reverse());
      arcs.forEach((arc) => {
        L.polyline(arc, {
          color: "#d8f6ff",
          weight: 4,
          opacity: 0.18,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(outline);
        L.polyline(arc, {
          color: line.color,
          weight: 1.6,
          opacity: 0.66,
          dashArray: "3 10",
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
          className: `flight-route flight-route-${lineKey}`,
        }).addTo(body);
      });
    }
    if (!outline.getLayers().length) {
      flightLayer.removeLayer(outline);
      flightLayer.removeLayer(body);
      return;
    }
    flightLineLayers.push({ key: lineKey, outline, body, width: 1.6 });
  }

  Object.entries(FLIGHT_DATA.lines).forEach(([key, line]) => drawFlightLine(key, line));

  // 선택된 여정을 지도 위에 강조한다.
  const journeyLayer = L.layerGroup().addTo(map);
  // 현재 목적지는 다른 경유지 표기보다 항상 위에 올린다.
  const journeyRouteLabelMarkers = new Map();

  // ---------------------- Station Markers ----------------------
  const stationMarkers = new Map(); // name -> leaflet marker
  const transferStations = new Set(SUBWAY_DATA.transfers.map((t) => t[0]));

  // 모든 노선에서 등장하는 역의 등장 노선 수 계산 (호선 표기용)
  const stationLineCount = new Map();
  Object.values(SUBWAY_DATA.lines).forEach((line) => {
    const list = line.seoulOnly || line.stations;
    list.forEach((s) => {
      stationLineCount.set(s, (stationLineCount.get(s) || 0) + 1);
    });
  });

  Object.entries(SUBWAY_DATA.stations).forEach(([name, s]) => {
    const isTransfer = transferStations.has(name);
    const icon = L.divIcon({
      className: "",
      iconSize: isTransfer ? [12, 12] : [10, 10],
      iconAnchor: isTransfer ? [6, 6] : [5, 5],
      html: `<div class="station-marker ${
        isTransfer ? "transfer" : ""
      }"></div>`,
    });

    const marker = L.marker([s.lat, s.lng], { icon, keyboard: false })
      .addTo(subwayLayer)
      .bindTooltip(s.name, {
        direction: "top",
        offset: [0, -6],
        className: "station-label",
        opacity: 1,
      });
    stationMarkers.set(name, marker);
  });

  const highwayMarkers = new Map();
  const highwayTransferStations = new Set(HIGHWAY_DATA.transfers.map((t) => t[0]));
  Object.entries(HIGHWAY_DATA.stations).forEach(([name, station]) => {
    const isJunction = highwayTransferStations.has(name);
    const icon = L.divIcon({
      className: "",
      iconSize: isJunction ? [15, 15] : [11, 11],
      iconAnchor: isJunction ? [7.5, 7.5] : [5.5, 5.5],
      html: `<div class="highway-marker ${isJunction ? "junction" : ""}"></div>`,
    });
    const marker = L.marker([station.lat, station.lng], { icon, keyboard: false })
      .addTo(highwayLayer)
      .bindTooltip(station.name, {
        direction: "top",
        offset: [0, -7],
        className: "station-label highway-label",
        opacity: 1,
      });
    highwayMarkers.set(name, marker);
  });

  const jejuMarkers = new Map();
  const jejuTransferStations = new Set(JEJU_ACTIVE_DATA.transfers.flat());
  Object.entries(JEJU_ACTIVE_DATA.stations).forEach(([name, station]) => {
    const marker = L.marker([station.lat, station.lng], {
      icon: L.divIcon({
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<div class="jeju-marker ${station.category || "nature"}" aria-label="${station.name}"></div>`,
      }),
      keyboard: false,
    })
      .addTo(jejuLayer)
      .bindTooltip(station.name, {
        direction: "top",
        offset: [0, -10],
        className: "station-label jeju-label",
      });
    jejuMarkers.set(name, marker);
  });

  const flightMarkers = new Map();
  Object.entries(FLIGHT_DATA.stations).forEach(([name, station]) => {
    const markerClass = station.kind === "water"
      ? "flight-water-marker"
      : `flight-airspace-marker${station.kind === "landmark" ? " flight-landmark-marker" : ""}`;
    const icon = L.divIcon({
      className: "",
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      html: `<div class="${markerClass}"></div>`,
    });
    const marker = L.marker([station.lat, station.lng], { icon, keyboard: false })
      .addTo(flightLayer)
      .bindTooltip(station.name, {
        direction: "top",
        offset: [0, -8],
        className: "station-label flight-label",
        opacity: 1,
      });
    flightMarkers.set(name, marker);
  });

  const flightAirportMarkers = new Map();
  Object.entries(FLIGHT_DATA.airports).forEach(([code, airport]) => {
    const icon = L.divIcon({
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: '<div class="flight-airport-marker">✦</div>',
    });
    const marker = L.marker([airport.lat, airport.lng], { icon, keyboard: false })
      .addTo(flightLayer)
      .bindTooltip(`${airport.city} · ${airport.code}`, {
        direction: "top",
        offset: [0, -13],
        className: "station-label flight-airport-label",
        opacity: 1,
      });
    flightAirportMarkers.set(code, marker);
  });

  let activeMode = "metro";
  let activeData = SUBWAY_DATA;
  let activeGraph = SUBWAY_GRAPH;
  let activeMarkers = stationMarkers;
  let activeTransferStations = transferStations;
  let setupMode = "world-tour";
  let lastWorldTourSignature = "";

  // 현재 타이핑 대상의 실제 국가 경계는 필요할 때만 불러와 캐시한다.
  // Esri World Countries 일반화 경계는 현재 사용 중인 위성/지명 타일과 같은 제공처다.
  const COUNTRY_BOUNDARY_SERVICE =
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0/query";
  const countryBoundaryCache = new Map();
  const continentByCountryName = new Map();
  let flightHighlightRequest = 0;
  let flightFocusFallbackTimer = null;
  let flightFocusFallbackRequest = 0;
  // 해외 영토가 넓게 퍼져 있는 나라는 전체 GeoJSON 경계로 확대하면 세계 전경으로 밀릴 수 있다.
  // 학습용 상세 화면에서는 본토 중심 범위를 우선 사용한다.
  const COUNTRY_FOCUS_BOUNDS = {
    US: [[24.2, -125.2], [49.7, -66.3]],
    // 날짜 변경선을 걸치는 섬나라는 전체 GeoJSON 경계가 거의 한 바퀴를 감싸기도 한다.
    // 학습에 쓰는 본섬 범위는 한쪽 세계 사본 안에서 명시적으로 고정한다.
    NZ: [[-48.5, 165.5], [-33.0, 179.8]],
    FJ: [[-21.8, 176.5], [-15.8, 182.0]],
    WS: [[-15.0, -173.2], [-13.3, -171.2]],
    AU: [[-43.8, 112.0], [-10.0, 154.0]],
  };
  const COUNTRY_FOCUS_ZOOMS = {
    US: 4.3,
    NZ: 5.35,
    FJ: 5.8,
    WS: 6.3,
    AU: 4.2,
  };

  Object.values(FLIGHT_DATA.worldTour.continents).forEach((continent) => {
    continent.countries.forEach((id) => {
      const station = FLIGHT_DATA.stations[id];
      if (station) continentByCountryName.set(station.name, continent.label);
    });
  });

  function countryBoundaryUrl(iso2) {
    const where = encodeURIComponent(`ISO='${iso2}'`);
    return `${COUNTRY_BOUNDARY_SERVICE}?where=${where}&outFields=ISO,COUNTRY&returnGeometry=true&f=geojson`;
  }

  function loadCountryBoundary(iso2) {
    if (!iso2) return Promise.resolve(null);
    if (!countryBoundaryCache.has(iso2)) {
      countryBoundaryCache.set(
        iso2,
        fetch(countryBoundaryUrl(iso2))
          .then((response) => response.ok ? response.json() : null)
          .then((data) => data?.features?.length ? data : null)
          .catch(() => null)
      );
    }
    return countryBoundaryCache.get(iso2);
  }

  function flightStudyIcon(station) {
    const type = station.kind === "water" ? "해역" : station.kind === "landmark" ? "대한민국 지리" : "나라";
    return L.divIcon({
      className: "",
      iconSize: [1, 1],
      iconAnchor: [0, 0],
      html: `<div class="flight-geography-label"><span>${type}</span><strong>${station.name}</strong></div>`,
    });
  }

  function updateFlightStudy(name) {
    const card = $("#geoStudy");
    const station = FLIGHT_DATA.stations[name];
    if (!card || activeMode !== "flight" || !station) {
      card?.classList.add("hidden");
      return;
    }
    const isWater = station.kind === "water";
    const isLandmark = station.kind === "landmark";
    const continent = continentByCountryName.get(station.name) || "세계 주요 지역";
    $("#geoStudyCategory").textContent = isWater
      ? "해역 · 세계 지리"
      : isLandmark
        ? "대한민국 · 동해"
        : `나라 · ${continent}`;
    $("#geoStudyName").textContent = station.name;
    $("#geoStudyEnglish").textContent = station.en || station.name;
    $("#geoStudyDescription").textContent = isWater || isLandmark
      ? station.description || "비행 경로가 지나는 주요 지리 학습 지점"
      : `${continent}의 나라 · 지도에서 실제 국경선과 위치를 확인하세요.`;
    card.classList.remove("hidden");

    $("#currentRole").textContent = isWater ? "현재 해역" : isLandmark ? "현재 지점" : "현재 영공";
    $("#nextRole").textContent = isWater ? "다음 해역 →" : isLandmark ? "다음 지점 →" : "다음 영공 →";
    $("#afterNextRole").textContent = isWater ? "다다음 해역 →" : isLandmark ? "다다음 지점 →" : "다다음 영공 →";
  }

  function clearFlightGeography() {
    flightHighlightRequest++;
    flightGeographyLayer.clearLayers();
    $("#geoStudy")?.classList.add("hidden");
  }

  function flightDetailZoom(station) {
    if (station.focusZoom) return station.focusZoom;
    const iso2 = station.iso2 || FLIGHT_DATA.countryIso2?.[station.name];
    if (COUNTRY_FOCUS_ZOOMS[iso2]) return COUNTRY_FOCUS_ZOOMS[iso2];
    if (station.kind !== "water") return 5.4;
    const radius = station.radiusKm || 900;
    if (radius <= 220) return 7.1;
    if (radius <= 500) return 6.1;
    if (radius <= 900) return 5.2;
    return 4.25;
  }

  function flightCameraDuration(target) {
    const source = map.getCenter();
    const longitudeDistance = Math.abs(target.lng - source.lng);
    const distance = Math.hypot(target.lat - source.lat, longitudeDistance * 0.72);
    return Math.max(0.65, Math.min(1.65, 0.58 + distance / 165));
  }

  function focusFlightFallback(station, displayPoint = flightDisplayPoint(station)) {
    map.invalidateSize({ pan: false });
    const target = L.latLng(displayPoint);
    // flyTo는 멀리 이동할 때 중간에 세계 전경까지 축소하는 곡선 궤적을 만든다.
    // setView 애니메이션은 현재 축척을 유지한 채 목표 축척·위치로 연속 전환한다.
    map.setView(target, flightDetailZoom(station), {
      animate: true,
      duration: flightCameraDuration(target),
      easeLinearity: 0.22,
    });
  }

  function focusFlightPoint(displayPoint, zoom) {
    const target = L.latLng(displayPoint);
    map.setView(target, zoom, {
      animate: true,
      duration: flightCameraDuration(target),
      easeLinearity: 0.22,
    });
  }

  function focusFlightBounds(bounds, maxZoom) {
    if (!bounds?.isValid()) return;
    const compact = window.innerWidth <= 720;
    const size = map.getSize();
    const horizontalPadding = Math.round(Math.min(compact ? 56 : 138, size.x * (compact ? 0.16 : 0.17)));
    const target = bounds.getCenter();
    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, compact ? 150 : 128],
      paddingBottomRight: [horizontalPadding, compact ? 104 : 112],
      maxZoom,
      animate: true,
      duration: flightCameraDuration(target),
      easeLinearity: 0.22,
    });
  }

  function displayFlightBounds(bounds, longitudeOffset = 0) {
    if (!bounds) return null;
    return L.latLngBounds(bounds.map(([lat, lng]) => [lat, lng + longitudeOffset]));
  }

  async function highlightFlightGeography(name, { focus = false, displayPoint: requestedDisplayPoint = null } = {}) {
    const station = FLIGHT_DATA.stations[name];
    if (!station) return;
    const request = ++flightHighlightRequest;
    const fallbackRequest = ++flightFocusFallbackRequest;
    const displayPoint = requestedDisplayPoint || flightJourneyDisplayPoint(name) || flightDisplayPoint(station);
    let fallbackStarted = false;
    clearTimeout(flightFocusFallbackTimer);
    flightFocusFallbackTimer = null;
    flightGeographyLayer.clearLayers();

    // 경계 데이터가 늦을 때에만 같은 여정 경도 사본으로 한 번 부드럽게 이동한다.
    // 이후 경계가 도착해도 이미 시작한 카메라를 다시 끊지 않는다.
    if (focus) {
      flightFocusFallbackTimer = setTimeout(() => {
        if (request === flightHighlightRequest && fallbackRequest === flightFocusFallbackRequest) {
          fallbackStarted = true;
          flightFocusFallbackTimer = null;
          focusFlightFallback(station, displayPoint);
        }
      }, 420);
    }

    if (station.kind === "landmark") {
      const landmarkArea = L.circle(displayPoint, {
        radius: (station.radiusKm || 24) * 1000,
        color: "#fff2a6",
        weight: 3.5,
        opacity: 1,
        fillColor: "#1fc9ff",
        fillOpacity: 0.3,
        interactive: false,
        className: "flight-landmark-highlight",
      }).addTo(flightGeographyLayer);
      if (focus) {
        clearTimeout(flightFocusFallbackTimer);
        flightFocusFallbackTimer = null;
        if (!fallbackStarted) focusFlightBounds(landmarkArea.getBounds(), flightDetailZoom(station));
      }
      return;
    }

    if (station.kind === "water") {
      const waterArea = L.circle(displayPoint, {
        radius: (station.radiusKm || 900) * 1000,
        color: "#8cf4ff",
        weight: 3,
        opacity: 0.94,
        dashArray: "7 8",
        fillColor: "#1fc9ff",
        fillOpacity: 0.2,
        interactive: false,
        className: "flight-water-highlight",
      }).addTo(flightGeographyLayer);
      if (focus) {
        clearTimeout(flightFocusFallbackTimer);
        flightFocusFallbackTimer = null;
        if (!fallbackStarted) focusFlightBounds(waterArea.getBounds(), flightDetailZoom(station));
      }
      return;
    }

    const iso2 = station.iso2 || FLIGHT_DATA.countryIso2?.[station.name];
    const geojson = await loadCountryBoundary(iso2);
    if (request !== flightHighlightRequest) return;

    let bounds;
    if (geojson) {
      const displayGeojson = offsetGeoJsonLongitudes(geojson, displayPoint[1] - station.lng);
      const boundary = L.geoJSON(displayGeojson, {
        style: {
          color: "#a7f7ff",
          weight: 3.5,
          opacity: 1,
          dashArray: "8 5",
          fillColor: "#17c9ff",
          fillOpacity: 0.22,
          className: "flight-country-highlight",
        },
        interactive: false,
      }).addTo(flightGeographyLayer);
      bounds = boundary.getBounds();
    } else {
      const fallback = L.circle(displayPoint, {
        radius: 360000,
        color: "#a7f7ff",
        weight: 3,
        fillColor: "#17c9ff",
        fillOpacity: 0.18,
        interactive: false,
      }).addTo(flightGeographyLayer);
      bounds = fallback.getBounds();
    }
    if (focus) {
      clearTimeout(flightFocusFallbackTimer);
      flightFocusFallbackTimer = null;
      const preferredBounds = station.focusBounds || COUNTRY_FOCUS_BOUNDS[iso2];
      const cameraBounds = preferredBounds
        ? displayFlightBounds(preferredBounds, displayPoint[1] - station.lng)
        : bounds;
      // 날짜 변경선 근처 섬나라는 경계 영역을 다시 계산하지 않고, 여정이 선택한
      // 지도 사본의 기준 좌표로 고정한다. 이때 인도양·세계 전경으로 튀지 않는다.
      const fixedZoom = COUNTRY_FOCUS_ZOOMS[iso2];
      if (!fallbackStarted) {
        if (fixedZoom) focusFlightPoint(displayPoint, fixedZoom);
        else focusFlightBounds(cameraBounds, station.focusZoom || 6.3);
      }
    }
  }

  // ---------------------- Train Sprite ----------------------
  const trainIcon = L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div class="train-marker" aria-label="현재 열차 위치">
        <div class="pulse"></div>
        <div class="body">
          <span class="train-window"></span>
          <span class="train-window"></span>
          <span class="train-light"></span>
        </div>
      </div>
    `,
  });

  const flightIcon = L.divIcon({
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: '<div class="flight-marker" aria-label="현재 항공기 위치">✈</div>',
  });

  const trainMarker = L.marker([37.4853, 126.9015], {
    icon: trainIcon,
    keyboard: false,
    zIndexOffset: 1000,
  }).addTo(map);

  // 시작 위치로 부드럽게 이동
  const START_STATION = "시청";
  const startCoord = SUBWAY_DATA.stations[START_STATION];
  trainMarker.setLatLng([startCoord.lat, startCoord.lng]);

  // ---------------------- Game State ----------------------
  const state = {
    currentStation: START_STATION,
    targetStation: null,
    journey: [],
    journeyLines: [],
    journeySegmentPaths: [],
    journeyDisplayPoints: [],
    journeyIndex: 0,
    journeyMode: "random",
    journeyLabel: "",
    awaitingStart: false,
    segmentMs: 380,
    isMoving: false,
    typedCorrect: 0,
    typedWrong: 0,
    movedCount: 0,
    startedAt: null, // when the current target started being typed
    firstKeyAt: null,
    isComposing: false,
    lastCountedValue: "",
    pendingInputTimer: null,
    startHandoffTimer: null,
    journeyCountdownTimer: null,
    staleCompositionChar: "",
    staleCompositionUntil: 0,
    suppressBlurProcessing: false,
  };

  // ---------------------- Helpers ----------------------
  // 역 이름으로 호선 정보 찾기
  function linesAtStation(name) {
    const result = [];
    const seen = new Set();
    Object.entries(activeData.lines).forEach(([key, line]) => {
      const list = line.seoulOnly || line.stations;
      if (list.includes(name) && !seen.has(line.id || key)) {
        seen.add(line.id || key);
        result.push({ key, name: line.name, color: line.color });
      }
    });
    return result;
  }

  function stationLabel(id) {
    return activeData.stations[id]?.name || id || "—";
  }

  function typingInstruction(starting = false) {
    if (activeMode === "flight") {
      return starting
        ? "출발 영공 이름을 입력해 이륙하세요"
        : "지나는 나라·바다 이름을 입력해 비행하세요";
    }
    if (activeMode === "jeju") {
      return starting
        ? "출발 명소 이름을 입력해 여행을 시작하세요"
        : "다음 제주 명소 이름을 입력해 이동하세요";
    }
    if (activeMode === "highway") {
      return starting ? "출발 지역 이름을 입력해 시작하세요" : "지역 이름을 입력해 이동하세요";
    }
    return starting ? "출발역 이름을 입력해 시작하세요" : "역 이름을 입력해 이동하세요";
  }

  function stationOptionLabel(id) {
    const station = activeData.stations[id];
    return station?.optionName || station?.name || id;
  }

  function resolveStationInput(value) {
    const input = String(value || "").trim();
    if (!input) return null;
    if (activeData.stations[input]) return input;
    const matches = Object.entries(activeData.stations)
      .filter(([, station]) => (station.optionName || station.name) === input || station.name === input)
      .map(([id]) => id);
    return matches.length === 1 ? matches[0] : null;
  }

  // 가독성 좋은 텍스트 색상 (밝은 배경 / 어두운 배경)
  function readableTextColor(hex) {
    if (!hex) return "#fff";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "#111" : "#fff";
  }

  function setHudStation(selector, value) {
    const element = $(selector);
    element.textContent = value;
    element.classList.toggle("long-name", Array.from(value).length >= 7);
  }

  function setHud(name) {
    const hasJourney = state.journey.length > 0;
    const targetIndex = hasJourney
      ? Math.min(
        state.awaitingStart ? state.journeyIndex : state.journeyIndex + 1,
        state.journey.length - 1
      )
      : -1;
    const targetName = targetIndex >= 0 ? state.journey[targetIndex] : (name || "출발 대기");
    const nextName = targetIndex >= 0 ? state.journey[targetIndex + 1] : null;
    const afterNextName = targetIndex >= 0 ? state.journey[targetIndex + 2] : null;

    setHudStation("#currentStation", stationLabel(targetName));
    setHudStation("#prevStation", hasJourney
      ? (state.journey[targetIndex - 1] ? stationLabel(state.journey[targetIndex - 1]) : "출발")
      : "—");
    setHudStation("#nextStation", hasJourney
      ? (nextName ? stationLabel(nextName) : "종착")
      : "여정 설정");
    setHudStation("#afterNextStation", hasJourney
      ? (afterNextName ? stationLabel(afterNextName) : (nextName ? "종착" : "—"))
      : "—");

    const tag = $("#routeTag");
    const hud = $(".hud");
    const previousLineKey = state.journeyLines[targetIndex - 1] || state.journeyLines[targetIndex];
    const nextLineKey = state.journeyLines[targetIndex] || previousLineKey;
    const followingLineKey = state.journeyLines[targetIndex + 1] || nextLineKey;
    const previousLine = activeData.lines[previousLineKey];
    const nextLine = activeData.lines[nextLineKey];
    const followingLine = activeData.lines[followingLineKey];
    if (previousLine || nextLine) {
      const incoming = previousLine || nextLine;
      const outgoing = nextLine || previousLine;
      const following = followingLine || outgoing;
      const isTransfer = incoming.id !== outgoing.id;
      tag.textContent = isTransfer
        ? `${incoming.name} → ${outgoing.name}`
        : outgoing.name;
      tag.style.background = isTransfer
        ? `linear-gradient(90deg, ${incoming.color} 0 50%, ${outgoing.color} 50% 100%)`
        : outgoing.color;
      tag.style.color = readableTextColor(outgoing.color);
      hud.style.setProperty("--previous-line", incoming.color);
      hud.style.setProperty("--next-line", outgoing.color);
      hud.style.setProperty("--following-line", following.color);
      hud.classList.toggle("is-transfer", isTransfer);
    } else {
      const lineInfos = linesAtStation(targetName);
      const primary = lineInfos[0];
      tag.textContent = primary ? primary.name : "—";
      tag.style.background = primary ? primary.color : "#4ade80";
      tag.style.color = primary ? readableTextColor(primary.color) : "#052e16";
      hud.style.setProperty("--previous-line", primary ? primary.color : "#079b45");
      hud.style.setProperty("--next-line", primary ? primary.color : "#079b45");
      hud.style.setProperty("--following-line", primary ? primary.color : "#079b45");
      hud.classList.remove("is-transfer");
    }

  }

  function neighborsOf(name) {
    return activeGraph.get(name) || [];
  }

  // BFS로 두 역 사이 최단 경로 (역 이름 배열)
  function findPath(from, to) {
    if (from === to) return [from];
    const prev = new Map();
    const visited = new Set([from]);
    const queue = [from];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur === to) break;
      for (const n of activeGraph.get(cur) || []) {
        if (!visited.has(n)) {
          visited.add(n);
          prev.set(n, cur);
          queue.push(n);
        }
      }
    }
    if (!prev.has(to) && from !== to) return null;
    const path = [to];
    let cur = to;
    while (cur !== from && prev.has(cur)) {
      cur = prev.get(cur);
      path.push(cur);
    }
    return path.reverse();
  }

  function edgeLines(from, to) {
    const result = [];
    Object.entries(activeData.lines).forEach(([key, line]) => {
      const list = line.seoulOnly || line.stations;
      for (let i = 0; i < list.length - 1; i++) {
        if (
          (list[i] === from && list[i + 1] === to) ||
          (list[i] === to && list[i + 1] === from)
        ) {
          result.push(key);
          break;
        }
      }
      if (
        line.circular && list.length > 2 &&
        ((list[0] === from && list.at(-1) === to) || (list[0] === to && list.at(-1) === from)) &&
        !result.includes(key)
      ) {
        result.push(key);
      }
    });
    return result;
  }

  function lineGroup(lineKey) {
    return activeData.lines[lineKey]?.id || lineKey;
  }

  function sameLineGroup(a, b) {
    return Boolean(a && b && lineGroup(a) === lineGroup(b));
  }

  function resolveRouteLineKeys(route) {
    let activeLine = null;
    return route.slice(0, -1).map((name, index) => {
      const candidates = edgeLines(name, route[index + 1]);
      const selected = activeLine && candidates.includes(activeLine)
        ? activeLine
        : candidates.find((candidate) => sameLineGroup(activeLine, candidate)) || candidates[0] || activeLine;
      activeLine = selected || activeLine;
      return selected || null;
    });
  }

  function routeLineColor(lineKey) {
    if (activeData.lines[lineKey]?.color) return activeData.lines[lineKey].color;
    if (activeMode === "flight") return "#45d7ff";
    return activeMode === "highway" ? "#e58b18" : "#08a449";
  }

  function railSegmentPath(from, to, lineKey) {
    const segmentStore = activeMode === "flight"
      ? flightSegmentPaths
      : activeMode === "jeju"
        ? jejuSegmentPaths
        : activeMode === "highway"
          ? highwaySegmentPaths
          : subwaySegmentPaths;
    const exact = lineKey ? segmentStore.get(`${lineKey}|${from}|${to}`) : null;
    if (exact?.length >= 2) return exact;

    const candidate = edgeLines(from, to)
      .map((key) => segmentStore.get(`${key}|${from}|${to}`))
      .find((segment) => segment?.length >= 2);
    if (candidate) return candidate;

    const origin = activeData.stations[from];
    const destination = activeData.stations[to];
    return origin && destination
      ? [[origin.lat, origin.lng], [destination.lat, destination.lng]]
      : [];
  }

  function routeTransferCount(route) {
    let activeLine = null;
    let transfers = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const candidates = edgeLines(route[i], route[i + 1]);
      if (activeLine && candidates.some((candidate) => sameLineGroup(activeLine, candidate))) continue;
      const nextLine = candidates[0] || null;
      if (activeLine && nextLine && !sameLineGroup(activeLine, nextLine)) transfers++;
      activeLine = nextLine;
    }
    return transfers;
  }

  function isSeoulArea(name) {
    const station = activeData.stations[name];
    return (
      station &&
      station.lat >= 37.43 &&
      station.lat <= 37.7 &&
      station.lng >= 126.76 &&
      station.lng <= 127.19
    );
  }

  function buildRandomJourney(count, transferStyle, regionMode, requestedStart) {
    const allowed = new Set(
      Array.from(activeGraph.keys()).filter(
        (name) => regionMode === "all" || (activeMode === "metro" && isSeoulArea(name))
      )
    );

    if (requestedStart && !allowed.has(requestedStart)) {
      throw new Error("선택한 지역 범위에 출발역이 없습니다.");
    }
    if (allowed.size < count) {
      throw new Error(`선택한 범위에서는 ${count}개 역 여정을 만들 수 없습니다.`);
    }

    const starts = requestedStart
      ? [requestedStart]
      : Array.from(allowed).sort(() => Math.random() - 0.5);

    function tryFrom(start) {
      const route = [start];
      const visited = new Set(route);
      let searchBudget = 12000;

      function walk(activeLine) {
        if (route.length === count) return true;
        if (--searchBudget <= 0) return false;

        const current = route[route.length - 1];
        const candidates = (activeGraph.get(current) || [])
          .filter((name) => allowed.has(name) && !visited.has(name))
          .map((name) => {
            const lines = edgeLines(current, name);
            const continues = activeLine && lines.some((lineKey) => sameLineGroup(activeLine, lineKey));
            const changes = activeLine && lines.length > 0 && !continues;
            let score = Math.random() * 10;
            if (transferStyle === "transfer") {
              if (changes) score += 35;
              if (activeTransferStations.has(name)) score += 12;
            } else if (transferStyle === "minimal") {
              if (continues) score += 35;
              if (changes) score -= 20;
            } else {
              if (continues) score += 12;
              if (changes) score += 10;
              if (activeTransferStations.has(name)) score += 4;
            }
            const onward = (activeGraph.get(name) || []).filter(
              (next) => allowed.has(next) && !visited.has(next)
            ).length;
            score += onward * 2;
            return { name, lines, continues, score };
          })
          .sort((a, b) => b.score - a.score);

        for (const candidate of candidates) {
          route.push(candidate.name);
          visited.add(candidate.name);
          const nextLine = candidate.continues
            ? candidate.lines.find((lineKey) => sameLineGroup(activeLine, lineKey)) || activeLine
            : candidate.lines[0] || activeLine;
          if (walk(nextLine)) return true;
          visited.delete(candidate.name);
          route.pop();
        }
        return false;
      }

      return walk(null) ? route : null;
    }

    const attempts = requestedStart ? 25 : Math.min(80, starts.length);
    for (let i = 0; i < attempts; i++) {
      const start = requestedStart || starts[i % starts.length];
      const route = tryFrom(start);
      if (!route) continue;
      if (new Set(route).size !== route.length) continue;
      if (transferStyle === "transfer" && routeTransferCount(route) === 0) continue;
      return route;
    }

    throw new Error("조건에 맞는 여정을 만들지 못했습니다. 역 수나 옵션을 바꿔주세요.");
  }

  function worldDistance(from, to) {
    const toRadians = Math.PI / 180;
    const latDelta = (to.lat - from.lat) * toRadians;
    const lngDelta = ((((to.lng - from.lng) + 540) % 360) - 180) * toRadians;
    const latitudeA = from.lat * toRadians;
    const latitudeB = to.lat * toRadians;
    const haversine = Math.sin(latDelta / 2) ** 2
      + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(lngDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  // 전체 국가 풀에서 무작위 출발점을 고른 뒤 가장 가까운 국가들을 이어,
  // 자주 등장하는 몇 나라로만 치우치지 않으면서도 지그재그를 줄인다.
  function pickNearbyWorldCountries(countryIds, count) {
    const available = countryIds
      .map((id) => ({ id, station: FLIGHT_DATA.stations[id] }))
      .filter(({ station }) => station);
    if (available.length <= count) return available.map(({ id }) => id);

    const chosen = [available.splice(Math.floor(Math.random() * available.length), 1)[0]];
    while (chosen.length < count && available.length) {
      const previous = chosen.at(-1).station;
      let closestIndex = 0;
      let closestDistance = Infinity;
      available.forEach((candidate, index) => {
        const distance = worldDistance(previous, candidate.station);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      chosen.push(available.splice(closestIndex, 1)[0]);
    }
    return chosen.map(({ id }) => id);
  }

  function worldTourWaterwaysBetween(fromId, toId) {
    const from = FLIGHT_DATA.stations[fromId];
    const to = FLIGHT_DATA.stations[toId];
    if (!from || !to) return [];
    const pair = `${from.continent}|${to.continent}`;
    const intercontinental = {
      "europe|northAmerica": ["WT_OCEAN_NORTH_ATLANTIC"],
      "northAmerica|southAmerica": ["WT_SEA_CARIBBEAN"],
      "southAmerica|africa": ["WT_OCEAN_SOUTH_ATLANTIC"],
      "africa|oceania": ["WT_OCEAN_INDIAN"],
    };
    if (intercontinental[pair]) return intercontinental[pair];
    if (from.continent === "oceania" && to.continent === "oceania" && worldDistance(from, to) > 900) {
      return ["WT_OCEAN_SOUTH_PACIFIC"];
    }
    return [];
  }

  function buildWorldTourJourney() {
    const makePlan = (counts) => FLIGHT_DATA.worldTour.continentOrder.map((key, index) => {
      const continent = FLIGHT_DATA.worldTour.continents[key];
      const count = counts[index];
      return {
        key,
        label: continent.label,
        countries: pickNearbyWorldCountries(continent.countries, count),
      };
    });

    let counts = [];
    let plan = [];
    let signature = "";
    // 새 여정은 바로 직전 세계일주와 적어도 한 대륙의 선택이 반드시 다르도록 한다.
    for (let attempt = 0; attempt < 8; attempt++) {
      counts = FLIGHT_DATA.worldTour.continentOrder.map(() => 2 + Math.floor(Math.random() * 4));
      plan = makePlan(counts);
      signature = plan.map(({ countries }) => countries.join(",")).join("|");
      if (signature !== lastWorldTourSignature) break;
    }
    if (signature === lastWorldTourSignature) {
      const changedIndex = Math.floor(Math.random() * counts.length);
      counts[changedIndex] = counts[changedIndex] === 5 ? 2 : counts[changedIndex] + 1;
      plan = makePlan(counts);
      signature = plan.map(({ countries }) => countries.join(",")).join("|");
    }
    lastWorldTourSignature = signature;
    const route = [];
    const appendWaterways = (waterways) => {
      waterways.forEach((waterway) => {
        // 같은 바다를 여러 섬 구간에서 다시 지나더라도, 입력 대상은 한 번만 둔다.
        if (!route.includes(waterway)) route.push(waterway);
      });
    };
    plan.forEach(({ countries }) => {
      const previousCountry = route.at(-1);
      if (previousCountry) appendWaterways(worldTourWaterwaysBetween(previousCountry, countries[0]));
      countries.forEach((country, index) => {
        route.push(country);
        const nextCountry = countries[index + 1];
        if (nextCountry) appendWaterways(worldTourWaterwaysBetween(country, nextCountry));
      });
    });
    const waterCount = route.filter((id) => FLIGHT_DATA.stations[id]?.kind === "water").length;
    const countryPool = FLIGHT_DATA.worldTour.countryCount || 195;
    const label = `세계 ${countryPool}개국 · ${plan.map(({ label: continent, countries }) => `${continent} ${countries.length}개`).join(" · ")} · 해역 ${waterCount}곳`;
    return { route, label };
  }

  function drawJourney(route) {
    journeyLayer.clearLayers();
    journeyRouteLabelMarkers.clear();
    const isFlight = activeMode === "flight";
    const rawStationLatLngs = route.map((name) => {
      const station = activeData.stations[name];
      return [station.lat, station.lng];
    });
    let previousFlightLng = map.getCenter().lng;
    state.journeySegmentPaths = route.slice(0, -1).map((name, index) => {
      const segment = railSegmentPath(name, route[index + 1], state.journeyLines[index]);
      if (!isFlight) return segment;
      const displaySegment = unwrapFlightPath(segment, previousFlightLng);
      previousFlightLng = displaySegment.at(-1)?.[1] ?? previousFlightLng;
      return displaySegment;
    });
    const stationLatLngs = isFlight && state.journeySegmentPaths.length
      ? [state.journeySegmentPaths[0][0], ...state.journeySegmentPaths.map((segment) => segment.at(-1))]
      : rawStationLatLngs;
    state.journeyDisplayPoints = stationLatLngs;
    const latlngs = state.journeySegmentPaths.reduce((points, segment, index) => {
      points.push(...(index === 0 ? segment : segment.slice(1)));
      return points;
    }, []);
    L.polyline(latlngs, {
      color: isFlight ? "#d8f6ff" : "#ffffff",
      weight: isFlight ? 7 : 18,
      opacity: isFlight ? 0.22 : 0.94,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(journeyLayer);
    state.journeyLines.forEach((lineKey, index) => {
      const segmentLatLngs = state.journeySegmentPaths[index];
      L.polyline(segmentLatLngs, {
        color: routeLineColor(lineKey),
        weight: isFlight ? 3.5 : 10,
        opacity: 1,
        dashArray: isFlight ? "8 11" : null,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
        className: `journey-segment journey-line-${lineKey || "unknown"}`,
      }).addTo(journeyLayer);
    });

    route.forEach((name, index) => {
      const station = activeData.stations[name];
      const lineKey = state.journeyLines[index] || state.journeyLines[index - 1];
      const routeColor = routeLineColor(lineKey);
      const routeText = readableTextColor(routeColor);
      const endpointClass = index === 0 || index === route.length - 1 ? " endpoint" : "";
      const positionClass = index % 2 === 0 ? " above" : " below";
      const labelIcon = L.divIcon({
        className: "route-label-icon",
        iconSize: [1, 1],
        iconAnchor: [0, 0],
        html: `<div class="route-stop-label${isFlight ? " flight-stop-label" : ""}${endpointClass}${positionClass}" data-route-index="${index}" style="--route-color:${routeColor};--route-text:${routeText}"><span>${index + 1}</span><strong>${stationLabel(name)}</strong></div>`,
      });
      const routeLabelMarker = L.marker(stationLatLngs[index], {
        icon: labelIcon,
        keyboard: false,
        zIndexOffset: 1400 + index,
      }).addTo(journeyLayer);
      journeyRouteLabelMarkers.set(index, routeLabelMarker);
    });

    if (isFlight) {
      // 전체 여정은 구형 개요 화면에서만 보여준다. 상세 지도는 카운트다운 뒤 첫 목표로 전환된다.
      const start = activeData.stations[route[0]];
      if (start) focusFlightFallback(start, stationLatLngs[0]);
    } else {
      map.fitBounds(L.latLngBounds(stationLatLngs), {
        padding: [70, 70],
        maxZoom: 13,
      });
    }
  }

  function cancelJourneyCountdown() {
    clearTimeout(state.journeyCountdownTimer);
    state.journeyCountdownTimer = null;
    $("#journeyCountdown").classList.add("hidden");
  }

  function startJourneyCountdown(onComplete) {
    const countdown = $("#journeyCountdown");
    const number = $("#journeyCountdownNumber");
    const values = [3, 2, 1, 0];
    const stepMs = 700;
    let index = 0;

    cancelJourneyCountdown();
    countdown.classList.remove("hidden");

    function showNextNumber() {
      number.textContent = values[index];
      number.classList.remove("is-ticking");
      void number.offsetWidth;
      number.classList.add("is-ticking");

      if (index < values.length - 1) {
        index++;
        state.journeyCountdownTimer = setTimeout(showNextNumber, stepMs);
        return;
      }

      state.journeyCountdownTimer = setTimeout(() => {
        state.journeyCountdownTimer = null;
        countdown.classList.add("hidden");
        onComplete();
      }, stepMs);
    }

    showNextNumber();
  }

  function setFlightMissionVisibility(active) {
    const lineKey = state.journeyLines.find(Boolean);
    const mission = lineKey ? FLIGHT_DATA.lines[lineKey] : null;
    const visibleAirports = active && mission?.origin && mission?.destination
      ? new Set([mission.origin, mission.destination])
      : null;
    flightAirportMarkers.forEach((marker, code) => {
      const visible = !visibleAirports || visibleAirports.has(code);
      marker.setOpacity(visible ? 1 : 0);
      if (visible && visibleAirports) marker.openTooltip();
      else marker.closeTooltip();
    });
  }

  function setJourneyFocus(active, route = []) {
    document.body.classList.toggle("journey-active", active);
    const lineLayers = activeMode === "flight"
      ? flightLineLayers
      : activeMode === "jeju"
        ? jejuLineLayers
        : activeMode === "highway"
          ? highwayLineLayers
          : subwayLineLayers;
    const selectedFlightLines = new Set(state.journeyLines.filter(Boolean));
    lineLayers.forEach(({ key, outline, body, width }) => {
      const baseOutlineOpacity = activeMode === "flight" ? 0.18 : 0.92;
      const baseBodyOpacity = activeMode === "flight" ? 0.66 : 1;
      const isSelectedFlightLine = activeMode !== "flight" || selectedFlightLines.has(key);
      outline.setStyle({
        opacity: active ? (isSelectedFlightLine ? 0.08 : 0) : baseOutlineOpacity,
        weight: width + 4,
      });
      body.setStyle({
        opacity: active ? (isSelectedFlightLine ? 0.1 : 0) : baseBodyOpacity,
        weight: width,
      });
    });

    if (activeMode === "flight") setFlightMissionVisibility(active);

    activeMarkers.forEach((marker) => {
      const element = marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker, .jeju-marker, .flight-airspace-marker, .flight-water-marker");
      if (dot) {
        dot.classList.remove("selected-route");
        dot.style.removeProperty("--route-color");
      }
    });
    route.forEach((name, index) => {
      const marker = activeMarkers.get(name);
      const element = marker && marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker, .jeju-marker, .flight-airspace-marker, .flight-water-marker");
      if (dot) {
        const lineKey = state.journeyLines[index] || state.journeyLines[index - 1];
        dot.style.setProperty("--route-color", routeLineColor(lineKey));
        dot.classList.add("selected-route");
      }
    });
  }

  function updateRouteLabelState() {
    const targetIndex = state.journey.length
      ? Math.min(state.awaitingStart ? state.journeyIndex : state.journeyIndex + 1, state.journey.length - 1)
      : -1;
    document.querySelectorAll(".route-stop-label").forEach((label) => {
      const index = Number(label.dataset.routeIndex);
      label.classList.toggle("completed", index < targetIndex);
      label.classList.toggle("current", index === targetIndex);
      label.classList.toggle("next", index === targetIndex + 1);
    });
    // Leaflet의 마커는 위도와 생성 순서에 따라 겹침 순서가 달라진다.
    // 현재 목적지에는 충분히 큰 z-index를 주어 어떤 경유지에도 가려지지 않게 한다.
    journeyRouteLabelMarkers.forEach((marker, index) => {
      const zIndexOffset = index === targetIndex
        ? 300000
        : index === targetIndex + 1
          ? 200000
          : 100000 + index;
      marker.setZIndexOffset(zIndexOffset);
    });
    state.journey.forEach((name, index) => {
      const marker = activeMarkers.get(name);
      const element = marker && marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker, .jeju-marker, .flight-airspace-marker, .flight-water-marker");
      if (!dot) return;
      dot.classList.toggle("current-route", index === targetIndex);
      dot.classList.toggle("next-route", index === targetIndex + 1);
      dot.classList.toggle("completed-route", index < targetIndex);
    });
  }

  function updateJourneyProgress() {
    const total = state.journey.length;
    const current = total ? (state.awaitingStart ? 0 : state.journeyIndex + 1) : 0;
    $("#journeyProgress").textContent = `${current} / ${total}`;
    $("#hint").textContent = state.journeyLabel || "여정을 설정하세요";
    updateRouteLabelState();
  }

  function populateStationList() {
    const list = $("#stationList");
    list.innerHTML = Object.keys(activeData.stations)
      .sort((a, b) => stationOptionLabel(a).localeCompare(stationOptionLabel(b), "ko"))
      .map((id) => `<option value="${stationOptionLabel(id)}"></option>`)
      .join("");
  }

  function populateFlightRoutes() {
    const select = $("#flightRoute");
    select.innerHTML = Object.entries(FLIGHT_DATA.lines)
      .filter(([, route]) => route.origin && route.destination)
      .map(([key, route]) => {
        const origin = FLIGHT_DATA.airports[route.origin];
        const destination = FLIGHT_DATA.airports[route.destination];
        return `<option value="${key}">${origin.city} (${origin.code}) → ${destination.city} (${destination.code}) · ${route.stations.length}개 영공</option>`;
      })
      .join("");
  }

  function setActiveMode(mode) {
    setJourneyFocus(false);
    activeMode = mode;
    document.body.classList.toggle("highway-mode", mode === "highway");
    document.body.classList.toggle("flight-mode", mode === "flight");
    document.body.classList.toggle("jeju-mode", mode === "jeju");
    trainMarker.setIcon(mode === "flight" ? flightIcon : trainIcon);
    if (mode === "flight") {
      if (map.hasLayer(lightBaseLayer)) map.removeLayer(lightBaseLayer);
      if (map.hasLayer(darkBaseLayer)) map.removeLayer(darkBaseLayer);
      flightSatelliteLayer.addTo(map);
      flightReferenceLayer.addTo(map);
      if (map.hasLayer(subwayLayer)) map.removeLayer(subwayLayer);
      if (map.hasLayer(highwayLayer)) map.removeLayer(highwayLayer);
      if (map.hasLayer(jejuLayer)) map.removeLayer(jejuLayer);
      if (map.hasLayer(jejuHighlightLayer)) map.removeLayer(jejuHighlightLayer);
      clearJejuStudy();
      flightLayer.addTo(map);
      flightGeographyLayer.addTo(map);
      clearFlightGeography();
      window.FlightGlobe?.show();
      activeData = FLIGHT_DATA;
      activeGraph = FLIGHT_GRAPH;
      activeMarkers = flightMarkers;
      activeTransferStations = new Set();
      setupMode = "world-tour";
      $("#brandIcon").textContent = "✈";
      $("#brandTitle").textContent = "코딩101 여행가자 타자연습";
      $("#movedLabel").textContent = "통과 영공";
      $("#typingInstruction").textContent = "나라·바다 이름을 입력해 비행하세요";
      $("#previousRole").textContent = "← 이전 영공";
      $("#currentRole").textContent = "현재 영공";
      $("#nextRole").textContent = "다음 영공 →";
      $("#afterNextRole").textContent = "다다음 영공 →";
      $("#setupModeLabel").textContent = "2. 세계일주 설정";
      $("#flightModeTabs").classList.remove("hidden");
      document.querySelectorAll(".flight-mode-tab").forEach((button) => {
        const selected = button.dataset.flightMode === "world-tour";
        button.classList.toggle("active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
      $("#worldTourOptions").classList.remove("hidden");
      $("#flightOptions").classList.add("hidden");
      $(".mode-tabs").classList.add("hidden");
      $("#randomOptions").classList.add("hidden");
      $("#customOptions").classList.add("hidden");
      $("#randomAdvanced").classList.add("hidden");
      populateFlightRoutes();
      map.setMinZoom(3);
      map.setMaxBounds(FLIGHT_ACTIVE_BOUNDS);
      map.fitBounds([[-55, -350], [72, 350]], { padding: [28, 28] });
    } else if (mode === "jeju") {
      if (map.hasLayer(darkBaseLayer)) map.removeLayer(darkBaseLayer);
      if (map.hasLayer(lightBaseLayer)) map.removeLayer(lightBaseLayer);
      flightSatelliteLayer.addTo(map);
      flightReferenceLayer.addTo(map);
      if (map.hasLayer(subwayLayer)) map.removeLayer(subwayLayer);
      if (map.hasLayer(highwayLayer)) map.removeLayer(highwayLayer);
      if (map.hasLayer(flightLayer)) map.removeLayer(flightLayer);
      if (map.hasLayer(flightGeographyLayer)) map.removeLayer(flightGeographyLayer);
      if (map.hasLayer(jejuLayer)) map.removeLayer(jejuLayer);
      if (map.hasLayer(jejuHighlightLayer)) map.removeLayer(jejuHighlightLayer);
      clearJejuStudy();
      clearFlightGeography();
      window.FlightGlobe?.hide();
      jejuLayer.addTo(map);
      jejuHighlightLayer.addTo(map);
      activeData = JEJU_ACTIVE_DATA;
      activeGraph = JEJU_GRAPH;
      activeMarkers = jejuMarkers;
      activeTransferStations = jejuTransferStations;
      $("#brandIcon").textContent = "🌋";
      $("#brandTitle").textContent = "코딩101 여행가자 타자연습";
      $("#movedLabel").textContent = "방문 명소";
      $("#typingInstruction").textContent = JEJU_ACTIVE_DATA.meta.sponsoredDisclosure
        ? "명소 이름을 입력해 여행하세요 · 광고 포함"
        : "명소 이름을 입력해 제주를 여행하세요";
      $("#previousRole").textContent = "← 이전 명소";
      $("#currentRole").textContent = "현재 명소";
      $("#nextRole").textContent = "다음 명소 →";
      $("#afterNextRole").textContent = "다다음 명소 →";
      $("#setupModeLabel").textContent = "2. 제주 여행 설정";
      $("#countLabel").textContent = "몇 곳을 여행할까요?";
      $("#countUnit").textContent = "개 명소";
      $("#randomStartLabel").textContent = "시작 명소 지정";
      $("#fromLabel").textContent = "출발 명소";
      $("#toLabel").textContent = "도착 명소";
      $("#customHelp").textContent = "두 제주 명소 사이의 중복 없는 연결 경로로 여행합니다.";
      $("#randomStart").placeholder = "비워두면 제주 전역에서 랜덤";
      $("#fromStation").placeholder = "예: 성산일출봉";
      $("#toStation").placeholder = "예: 한라산 성판악";
      $("#transferLegend").textContent = "여행길 선택";
      $("#balancedHelp").textContent = "자연스럽게 명소 연결";
      $("#transferStrongLabel").textContent = "여러 길 경험";
      $("#transferStrongHelp").textContent = "해안·숲길을 함께 여행";
      $("#transferMinLabel").textContent = "길 변경 최소";
      $("#transferMinHelp").textContent = "한 길을 길게 여행";
      $("#regionMode").innerHTML = '<option value="all">제주 전역</option>';
      if (setupMode === "world-tour" || setupMode === "mission") setupMode = "random";
      $("#flightModeTabs").classList.add("hidden");
      $("#worldTourOptions").classList.add("hidden");
      $("#flightOptions").classList.add("hidden");
      $(".mode-tabs").classList.remove("hidden");
      $("#randomOptions").classList.toggle("hidden", setupMode !== "random");
      $("#customOptions").classList.toggle("hidden", setupMode !== "custom");
      $("#randomAdvanced").classList.toggle("hidden", setupMode !== "random");
      $("#stationCount").max = String(JEJU_ACTIVE_DATA.meta.stationCount);
      if (Number($("#stationCount").value) > JEJU_ACTIVE_DATA.meta.stationCount) $("#stationCount").value = "12";
      map.setMinZoom(9);
      map.setMaxBounds(jejuBounds.pad(0.16));
      map.fitBounds(jejuBounds, { padding: [42, 42], maxZoom: 11 });
    } else if (mode === "highway") {
      if (map.hasLayer(darkBaseLayer)) map.removeLayer(darkBaseLayer);
      if (map.hasLayer(flightSatelliteLayer)) map.removeLayer(flightSatelliteLayer);
      if (map.hasLayer(flightReferenceLayer)) map.removeLayer(flightReferenceLayer);
      lightBaseLayer.addTo(map);
      if (map.hasLayer(flightLayer)) map.removeLayer(flightLayer);
      if (map.hasLayer(flightGeographyLayer)) map.removeLayer(flightGeographyLayer);
      if (map.hasLayer(jejuLayer)) map.removeLayer(jejuLayer);
      if (map.hasLayer(jejuHighlightLayer)) map.removeLayer(jejuHighlightLayer);
      clearJejuStudy();
      clearFlightGeography();
      window.FlightGlobe?.hide();
      $("#brandIcon").textContent = "🛣️";
      $("#brandTitle").textContent = "코딩101 여행가자 타자연습";
      $("#movedLabel").textContent = "이동한 지역";
      $("#typingInstruction").textContent = "지역 이름을 입력해 이동하세요";
      $("#previousRole").textContent = "← 이전 지역";
      $("#currentRole").textContent = "현재 지역";
      $("#nextRole").textContent = "다음 지역 →";
      $("#afterNextRole").textContent = "다다음 지역 →";
      $("#setupModeLabel").textContent = "2. 어떻게 연습할까요?";
      if (map.hasLayer(subwayLayer)) map.removeLayer(subwayLayer);
      highwayLayer.addTo(map);
      activeData = HIGHWAY_DATA;
      activeGraph = HIGHWAY_GRAPH;
      activeMarkers = highwayMarkers;
      activeTransferStations = highwayTransferStations;
      $("#countLabel").textContent = "몇 개 지역을 연습할까요?";
      $("#countUnit").textContent = "개 지역";
      $("#randomStartLabel").textContent = "시작 지역 지정";
      $("#fromLabel").textContent = "출발 지역";
      $("#toLabel").textContent = "도착 지역";
      $("#customHelp").textContent = "두 지역 사이의 중복 없는 최단 연결 경로로 연습합니다.";
      $("#randomStart").placeholder = "비워두면 전국에서 랜덤";
      $("#fromStation").placeholder = "예: 서울";
      $("#toStation").placeholder = "예: 부산";
      $("#transferLegend").textContent = "고속도로 분기 스타일";
      $("#balancedHelp").textContent = "자연스럽게 도로 변경";
      $("#transferStrongLabel").textContent = "분기 적극";
      $("#transferStrongHelp").textContent = "여러 고속도로를 경험";
      $("#transferMinLabel").textContent = "분기 최소";
      $("#transferMinHelp").textContent = "한 도로를 길게 연습";
      $("#regionMode").innerHTML = '<option value="all">전국 주요 도시</option>';
      if (setupMode === "world-tour" || setupMode === "mission") setupMode = "random";
      $("#flightModeTabs").classList.add("hidden");
      $("#worldTourOptions").classList.add("hidden");
      $("#flightOptions").classList.add("hidden");
      $(".mode-tabs").classList.remove("hidden");
      $("#randomOptions").classList.toggle("hidden", setupMode !== "random");
      $("#customOptions").classList.toggle("hidden", setupMode !== "custom");
      $("#randomAdvanced").classList.toggle("hidden", setupMode !== "random");
      $("#stationCount").max = "50";
      $("#stationCount").max = "50";
      map.setMinZoom(2);
      map.setMaxBounds(null);
      map.fitBounds([[34.5, 126.0], [38.4, 129.7]], { padding: [28, 28] });
    } else {
      if (map.hasLayer(darkBaseLayer)) map.removeLayer(darkBaseLayer);
      if (map.hasLayer(flightSatelliteLayer)) map.removeLayer(flightSatelliteLayer);
      if (map.hasLayer(flightReferenceLayer)) map.removeLayer(flightReferenceLayer);
      lightBaseLayer.addTo(map);
      if (map.hasLayer(flightLayer)) map.removeLayer(flightLayer);
      if (map.hasLayer(flightGeographyLayer)) map.removeLayer(flightGeographyLayer);
      clearFlightGeography();
      window.FlightGlobe?.hide();
      $("#brandIcon").textContent = "🚇";
      $("#brandTitle").textContent = "코딩101 여행가자 타자연습";
      $("#movedLabel").textContent = "이동한 역";
      $("#typingInstruction").textContent = "역 이름을 입력해 이동하세요";
      $("#previousRole").textContent = "← 이전역";
      $("#currentRole").textContent = "현재역";
      $("#nextRole").textContent = "다음역 →";
      $("#afterNextRole").textContent = "다다음역 →";
      $("#setupModeLabel").textContent = "2. 어떻게 연습할까요?";
      if (map.hasLayer(highwayLayer)) map.removeLayer(highwayLayer);
      subwayLayer.addTo(map);
      activeData = SUBWAY_DATA;
      activeGraph = SUBWAY_GRAPH;
      activeMarkers = stationMarkers;
      activeTransferStations = transferStations;
      $("#countLabel").textContent = "몇 개 역을 연습할까요?";
      $("#countUnit").textContent = "개 역";
      $("#randomStartLabel").textContent = "시작역 지정";
      $("#fromLabel").textContent = "출발역";
      $("#toLabel").textContent = "도착역";
      $("#customHelp").textContent = "두 역 사이의 중복 없는 최단 경로로 연습합니다.";
      $("#randomStart").placeholder = "비워두면 랜덤";
      $("#fromStation").placeholder = "예: 김포공항";
      $("#toStation").placeholder = "예: 서울역";
      $("#transferLegend").textContent = "환승 스타일";
      $("#balancedHelp").textContent = "자연스럽게 노선 변경";
      $("#transferStrongLabel").textContent = "환승 적극";
      $("#transferStrongHelp").textContent = "여러 노선을 경험";
      $("#transferMinLabel").textContent = "환승 최소";
      $("#transferMinHelp").textContent = "한 노선을 길게 연습";
      $("#regionMode").innerHTML = '<option value="seoul">서울 중심</option><option value="all">수도권 전체</option>';
      if (setupMode === "world-tour" || setupMode === "mission") setupMode = "random";
      $("#flightModeTabs").classList.add("hidden");
      $("#worldTourOptions").classList.add("hidden");
      $("#flightOptions").classList.add("hidden");
      $(".mode-tabs").classList.remove("hidden");
      $("#randomOptions").classList.toggle("hidden", setupMode !== "random");
      $("#customOptions").classList.toggle("hidden", setupMode !== "custom");
      $("#randomAdvanced").classList.toggle("hidden", setupMode !== "random");
      map.setMinZoom(2);
      map.setMaxBounds(null);
      map.fitBounds(metroBounds, { padding: [32, 32] });
    }
    journeyLayer.clearLayers();
    $("#randomStart").value = "";
    $("#fromStation").value = "";
    $("#toStation").value = "";
    populateStationList();
  }

  function resetRunStats() {
    state.typedCorrect = 0;
    state.typedWrong = 0;
    state.movedCount = 0;
    state.firstKeyAt = null;
    updateStats();
  }

  function startJourney(route, label, pace, journeyMode = activeMode) {
    if (!route || route.length < 2) throw new Error("두 곳 이상 연결된 여정이 필요합니다.");
    if (new Set(route).size !== route.length) throw new Error("중복 역이 포함된 여정은 시작할 수 없습니다.");

    state.journey = route.slice();
    state.journeyMode = journeyMode;
    state.journeyLines = journeyMode === "world-tour"
      ? route.slice(0, -1).map(() => "WORLD_TOUR")
      : resolveRouteLineKeys(route);
    state.journeyIndex = 0;
    state.journeyLabel = label;
    state.awaitingStart = true;
    state.segmentMs = pace === "slow" ? 620 : pace === "fast" ? 220 : 380;
    state.currentStation = route[0];
    state.targetStation = route[0];
    state.isMoving = false;
    resetRunStats();

    setHud(state.currentStation);
    drawJourney(route);
    const start = activeData.stations[state.currentStation];
    trainMarker.setLatLng(
      activeMode === "flight" && state.journeyDisplayPoints[0]
        ? state.journeyDisplayPoints[0]
        : [start.lat, start.lng]
    );
    setJourneyFocus(true, route);
    if (activeMode === "flight") {
      window.FlightGlobe?.setRoute(route, state.journeyLines.find(Boolean));
    }
    updateJourneyProgress();
    setTarget(route[0], { focus: false });
    $("#typingInstruction").textContent = typingInstruction(true);
    $("#journeyCountdownLabel").textContent = activeMode === "flight" ? "이륙 준비" : "여정 출발";
    $("#input").disabled = true;
    $("#setupModal").classList.add("hidden");
    $("#completeModal").classList.add("hidden");
    startJourneyCountdown(() => {
      // 구형 개요를 닫은 뒤 한 프레임을 기다려 실제 지도 크기를 다시 계산한다.
      // 이 순서를 지켜야 시작 지점 상세 화면이 전체 항로 보기로 되돌아가지 않는다.
      window.FlightGlobe?.focusSegment(state.currentStation, state.targetStation);
      requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
        focusCurrentStep(state.targetStation);
        $("#input").disabled = false;
        $("#input").focus();
      });
    });
  }

  function finishJourney() {
    const total = state.typedCorrect + state.typedWrong;
    const accuracy = total ? Math.round((state.typedCorrect / total) * 100) : 100;
    $("#completeCount").textContent = state.journey.length;
    $("#completeAccuracy").textContent = accuracy + "%";
    $("#completeSummary").textContent = `${stationLabel(state.journey[0])}에서 ${stationLabel(state.journey[state.journey.length - 1])}까지 완주했습니다.`;
    $("#input").disabled = true;
    $("#targetName").textContent = "여정 완료";
    setHudStation("#nextStation", "종착");
    setHudStation("#afterNextStation", "—");
    $("#typingFeedback").innerHTML = '<span class="char-correct">여정 완료</span>';
    $("#inputStatus").textContent = "완주";
    $("#inputWrapper").className = "input-wrapper is-complete";
    $("#completeModal").classList.remove("hidden");
  }

  function advanceJourney() {
    state.journeyIndex++;
    setHud(state.currentStation);
    updateJourneyProgress();
    if (state.journeyIndex >= state.journey.length - 1) {
      finishJourney();
      return;
    }
    setTarget(state.journey[state.journeyIndex + 1]);
  }

  function repeatJourney() {
    if (!state.journey.length) return;
    startJourney(
      state.journey,
      state.journeyLabel,
      state.segmentMs >= 600 ? "slow" : state.segmentMs <= 240 ? "fast" : "normal",
      state.journeyMode
    );
  }

  function openJourneySetup() {
    if (state.isMoving) return;
    cancelJourneyCountdown();
    setJourneyFocus(false);
    journeyLayer.clearLayers();
    $("#completeModal").classList.add("hidden");
    $("#setupError").textContent = "";
    $("#setupModal").classList.remove("hidden");
  }

  // ---------------------- Movement ----------------------
  function animateTrainAlong(path, onDone, railPoints = null) {
    if (!path || path.length < 2) {
      onDone && onDone();
      return;
    }
    state.isMoving = true;
    const stationPoints = path.map((name) => {
      const station = activeData.stations[name];
      return [station.lat, station.lng];
    });
    const animationPoints = railPoints?.length >= 2
      ? railPoints
      : smoothLatLngs(stationPoints, 18);
    const duration = (path.length - 1) * state.segmentMs;
    const startedAt = performance.now();

    function step(now) {
      // 일부 브라우저에서는 첫 requestAnimationFrame의 타임스탬프가
      // performance.now()보다 아주 작게 전달될 수 있다. 이때 음수 인덱스가
      // 만들어지지 않도록 진행률과 보간 인덱스를 양쪽 경계에서 제한한다.
      const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
      const lastIndex = animationPoints.length - 1;
      const exactIndex = progress * lastIndex;
      const index = Math.max(0, Math.min(lastIndex - 1, Math.floor(exactIndex)));
      const localProgress = exactIndex - index;
      const from = animationPoints[index];
      const to = animationPoints[Math.min(lastIndex, index + 1)];
      const lat = from[0] + (to[0] - from[0]) * localProgress;
      const lng = from[1] + (to[1] - from[1]) * localProgress;
      trainMarker.setLatLng([lat, lng]);

      if (progress < 1) requestAnimationFrame(step);
      else {
        state.isMoving = false;
        onDone && onDone();
      }
    }
    requestAnimationFrame(step);
  }

  // ---------------------- Target Generation ----------------------
  function pickRandomTarget() {
    const all = Array.from(stationMarkers.keys());
    let tries = 0;
    while (tries < 100) {
      const cand = all[Math.floor(Math.random() * all.length)];
      const path = findPath(state.currentStation, cand);
      if (path && path.length >= 2 && path.length <= 12) return cand;
      tries++;
    }
    // 폴백: 아무거나
    return all[Math.floor(Math.random() * all.length)];
  }

  function renderTypingFeedback(value, target) {
    const feedback = $("#typingFeedback");
    feedback.textContent = "";
    const targetChars = Array.from(target || "");
    const valueChars = Array.from(value || "");
    const length = Math.max(targetChars.length, valueChars.length);

    for (let index = 0; index < length; index++) {
      const span = document.createElement("span");
      if (index >= valueChars.length) {
        span.className = "char-pending";
        span.textContent = targetChars[index] || "";
      } else if (valueChars[index] === targetChars[index]) {
        span.className = "char-correct";
        span.textContent = valueChars[index];
      } else {
        span.className = "char-wrong";
        span.textContent = valueChars[index];
      }
      feedback.appendChild(span);
    }
  }

  function focusCurrentStep(targetName) {
    const origin = activeData.stations[state.currentStation];
    if (activeMode === "flight") {
      window.FlightGlobe?.focusSegment(state.currentStation, targetName);
      highlightFlightGeography(targetName, { focus: true });
      return;
    }
    const focusedTarget = targetName;
    const destination = activeData.stations[focusedTarget];
    if (!origin || !destination) return;

    const compact = window.innerWidth <= 720;
    const mapSize = map.getSize();
    const horizontalPadding = Math.round(Math.min(
      compact ? 68 : 128,
      mapSize.x * (compact ? 0.18 : 0.16)
    ));
    const verticalPadding = compact ? 92 : 108;

    // 이전 카메라 애니메이션과 충돌하지 않도록 현재 이동을 멈춘 뒤,
    // 현재역과 다음역(큰 역명 라벨 포함)이 모두 보이는 범위로 맞춘다.
    map.stop();
    const flightSegment = activeMode === "flight"
      ? railSegmentPath(state.currentStation, focusedTarget, state.journeyLines[state.journeyIndex])
      : null;
    const focusPoints = flightSegment?.length >= 2
      ? flightSegment
      : [[origin.lat, origin.lng], [destination.lat, destination.lng]];
    map.fitBounds(
      L.latLngBounds(focusPoints),
      {
        paddingTopLeft: [horizontalPadding, verticalPadding],
        paddingBottomRight: [horizontalPadding, verticalPadding],
        maxZoom: compact ? 14 : 15,
        animate: true,
        duration: 0.7,
      }
    );
  }

  function clearJejuStudy() {
    $("#jejuStudy")?.classList.add("hidden");
    jejuHighlightLayer.clearLayers();
  }

  function updateJejuStudy(name) {
    const place = JEJU_ACTIVE_DATA.stations[name];
    if (activeMode !== "jeju" || !place) {
      clearJejuStudy();
      return;
    }
    $("#jejuStudyCategory").textContent = place.categoryLabel || "제주 명승";
    $("#jejuStudyName").textContent = place.name;
    $("#jejuStudyEnglish").textContent = place.en || "Jeju destination";
    $("#jejuStudyDescription").textContent = place.description || "제주 여행지의 위치를 지도에서 확인하세요.";
    $("#jejuStudy").classList.remove("hidden");

    jejuHighlightLayer.clearLayers();
    L.circleMarker([place.lat, place.lng], {
      radius: 25,
      color: "#fff6bf",
      weight: 3,
      fillColor: "#20b992",
      fillOpacity: 0.24,
      className: "jeju-target-halo",
      interactive: false,
    }).addTo(jejuHighlightLayer);
  }

  function setTarget(name, { focus = true } = {}) {
    clearTimeout(state.pendingInputTimer);
    clearTimeout(state.startHandoffTimer);
    state.pendingInputTimer = null;
    state.startHandoffTimer = null;
    state.targetStation = name;
    state.startedAt = null;
    state.firstKeyAt = null;
    state.isComposing = false;
    state.lastCountedValue = "";
    const targetLabel = stationLabel(name);
    $("#targetName").textContent = targetLabel;
    $("#inputStatus").textContent = "한글로 입력";
    $("#inputWrapper").className = "input-wrapper";
    renderTypingFeedback("", targetLabel);
    $("#input").value = "";
    $("#input").setAttribute("aria-label", `${targetLabel} 입력`);

    activeMarkers.forEach((marker) => marker.closeTooltip());
    if (activeMode === "flight") {
      updateFlightStudy(name);
      highlightFlightGeography(name);
    }
    if (activeMode === "jeju") updateJejuStudy(name);
    if (focus) setTimeout(() => focusCurrentStep(name), 0);
  }

  // ---------------------- Stats ----------------------
  function updateStats() {
    const total = state.typedCorrect + state.typedWrong;
    const accuracy = total === 0 ? 100 : Math.round((state.typedCorrect / total) * 100);
    $("#accuracy").textContent = accuracy + "%";

    let elapsedMin = 0;
    if (state.firstKeyAt) {
      elapsedMin = (Date.now() - state.firstKeyAt) / 60000;
    }
    // "타수" = 평균 CPM (chars per minute) — 한글 기준 타자연습 표기
    const cpm = elapsedMin > 0 ? Math.round(state.typedCorrect / elapsedMin) : 0;
    $("#wpm").textContent = cpm;
    $("#moved").textContent = state.movedCount;
  }

  // ---------------------- Toast ----------------------
  function showToast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(() => t.classList.remove("show"), 1600);
  }

  // ---------------------- Typing Logic ----------------------
  function scoreCommittedInput(value, target) {
    const previousChars = Array.from(state.lastCountedValue);
    const valueChars = Array.from(value);
    const targetChars = Array.from(target);
    let commonLength = 0;

    while (
      commonLength < previousChars.length &&
      commonLength < valueChars.length &&
      previousChars[commonLength] === valueChars[commonLength]
    ) {
      commonLength++;
    }

    for (let index = commonLength; index < valueChars.length; index++) {
      if (valueChars[index] === targetChars[index]) state.typedCorrect++;
      else state.typedWrong++;
    }
    state.lastCountedValue = value;
  }

  function processCommittedInput(value) {
    if (state.isMoving) return;
    if (!state.targetStation) return;

    const targetId = state.targetStation;
    const target = stationLabel(targetId);

    // 처음 키 입력 시각 기록
    if (state.firstKeyAt === null && value.length > 0) {
      state.firstKeyAt = Date.now();
    }

    // 한글 IME의 조합 중간 자모가 아니라 확정된 글자만 집계한다.
    scoreCommittedInput(value, target);

    const valueChars = Array.from(value);
    const targetChars = Array.from(target);
    const hasError = valueChars.some((char, index) => char !== targetChars[index]);
    const inputWrapper = $("#inputWrapper");
    inputWrapper.classList.toggle("has-error", hasError);
    inputWrapper.classList.toggle("has-input", value.length > 0 && !hasError);
    $("#inputStatus").textContent = hasError
      ? "오타를 고쳐주세요"
      : value.length > 0
        ? "정확해요"
        : "한글로 입력";
    renderTypingFeedback(value, target);

    // 정답 완전 일치 시 이동
    if (value === target) {
      moveTrainTo(targetId);
    }
    updateStats();
  }

  function cancelPendingInputProcessing() {
    clearTimeout(state.pendingInputTimer);
    state.pendingInputTimer = null;
  }

  function scheduleInputProcessing(input, delay = 90, allowWhileComposing = false) {
    cancelPendingInputProcessing();
    state.pendingInputTimer = setTimeout(() => {
      state.pendingInputTimer = null;
      if (state.isMoving || !state.targetStation) return;
      if (state.isComposing && !allowWhileComposing) return;
      processCommittedInput(input.value);
    }, delay);
  }

  function finishStartingComposition(input) {
    cancelPendingInputProcessing();
    const expectedTarget = state.targetStation;
    const expectedLabel = stationLabel(expectedTarget);
    state.pendingInputTimer = setTimeout(() => {
      state.pendingInputTimer = null;
      if (!state.awaitingStart || input.value !== expectedLabel) return;

      // blur가 현재 한글 조합을 먼저 확정한다. 조합이 끝나기 전에 입력값을
      // 지우면 마지막 음절이 다음 목표 입력창으로 넘어갈 수 있다.
      input.blur();
      clearTimeout(state.startHandoffTimer);
      state.startHandoffTimer = setTimeout(() => {
        state.startHandoffTimer = null;
        if (!state.awaitingStart || state.targetStation !== expectedTarget) return;
        state.isComposing = false;
        processCommittedInput(input.value);
      }, 120);
    }, 180);
  }

  function handleInput(e) {
    if (state.isMoving || !state.targetStation) return;

    const value = e.target.value;
    const isStaleStartCharacter =
      performance.now() < state.staleCompositionUntil &&
      !e.isComposing &&
      e.inputType === "insertCompositionText" &&
      e.data === state.staleCompositionChar &&
      value === state.staleCompositionChar;
    if (isStaleStartCharacter) {
      e.target.value = "";
      state.staleCompositionChar = "";
      state.staleCompositionUntil = 0;
      cancelPendingInputProcessing();
      return;
    }
    if (state.firstKeyAt === null && value.length > 0) {
      state.firstKeyAt = Date.now();
    }

    // 한글 조합 중에는 class, textContent, 통계 등 어떤 DOM도 변경하지 않는다.
    // compositionend 직후 다음 음절이 시작되는 빠른 입력에서 동기 DOM 갱신이
    // IME 조합을 취소해 앞 음절을 잃는 브라우저 타이밍 문제를 피한다.
    if (e.isComposing || state.isComposing) {
      cancelPendingInputProcessing();
      // 일부 IME는 단어 전체가 완성돼도 compositionend를 늦게 보낸다.
      // 정답일 때만 충분한 무입력 시간을 둔 뒤 판정한다.
      if (value === stationLabel(state.targetStation)) {
        if (state.awaitingStart) finishStartingComposition(e.target);
        else scheduleInputProcessing(e.target, 180, true);
      }
      return;
    }

    // 일반 입력도 즉시 DOM을 갱신하지 않고 짧게 합쳐서 한 번만 판정한다.
    scheduleInputProcessing(e.target);
  }

  function shouldRestoreTypingFocus(event, input) {
    if (
      !state.targetStation ||
      state.isMoving ||
      input.disabled ||
      document.querySelector("#setupModal:not(.hidden), #completeModal:not(.hidden), #helpModal:not(.hidden)") ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return false;
    }

    // 지도 조작 뒤의 일반 문자·한글 IME 시작 키만 입력창으로 되돌린다.
    // Tab, Esc, 화살표와 버튼·선택 상자 조작은 기존 포커스를 그대로 존중한다.
    if (!["Process", "Unidentified"].includes(event.key) && event.key.length !== 1) return false;
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, select, textarea, input:not(#input), [contenteditable='true']")) {
      return false;
    }
    return true;
  }

  function moveTrainTo(destName) {
    if (state.awaitingStart && destName === state.currentStation) {
      const input = $("#input");
      clearTimeout(state.startHandoffTimer);
      state.startHandoffTimer = null;
      cancelPendingInputProcessing();
      state.suppressBlurProcessing = true;
      input.blur();
      input.disabled = true;
      cancelPendingInputProcessing();
      state.awaitingStart = false;
      updateJourneyProgress();
      setHud(state.currentStation);
      showToast(activeMode === "flight"
        ? `${stationLabel(destName)} 영공에서 이륙합니다`
        : `${stationLabel(destName)}에서 출발합니다`);

      const next = state.journey[1];
      $("#typingInstruction").textContent = typingInstruction();
      $("#inputStatus").textContent = "출발 준비";
      state.staleCompositionChar = Array.from(stationLabel(destName)).at(-1) || "";
      state.staleCompositionUntil = performance.now() + 400;
      state.startHandoffTimer = setTimeout(() => {
        state.startHandoffTimer = null;
        if (next) setTarget(next);
        input.disabled = false;
        state.suppressBlurProcessing = false;
        input.focus();
      }, 80);
      return;
    }

    const path = state.journeyMode === "world-tour"
      ? [state.currentStation, destName]
      : findPath(state.currentStation, destName);
    if (!path || path.length < 2) {
      // 이미 그 위치
      advanceJourney();
      return;
    }
    // 입력 잠금 (선택적 — UX를 위해 짧게 유지)
    $("#input").value = "";
    $("#input").disabled = true;
    renderTypingFeedback(stationLabel(destName), stationLabel(destName));
    $("#inputStatus").textContent = "이동 중";
    $("#inputWrapper").className = "input-wrapper is-moving";

    // 도착 역 표시 (toast)
    showToast(`${stationLabel(state.currentStation)} → ${stationLabel(destName)}`);

    const railPoints =
      state.journey[state.journeyIndex] === state.currentStation &&
      state.journey[state.journeyIndex + 1] === destName
        ? state.journeySegmentPaths[state.journeyIndex]
        : null;

    animateTrainAlong(path, () => {
      state.currentStation = destName;
      if (activeMode === "flight") window.FlightGlobe?.moveTo(destName);
      state.movedCount++;
      updateStats();
      $("#input").disabled = false;
      $("#input").focus();
      advanceJourney();
    }, railPoints);
  }

  // ---------------------- Init ----------------------
  function init() {
    const coverage = $("#metroCoverage");
    if (coverage && SUBWAY_DATA.meta) {
      coverage.textContent = `${SUBWAY_DATA.meta.categoryCount}개 노선 · ${SUBWAY_DATA.meta.stationCount}개 역`;
    }
    setHud(state.currentStation);
    const input = $("#input");
    input.addEventListener("input", handleInput);
    document.addEventListener("keydown", (event) => {
      if (!shouldRestoreTypingFocus(event, input)) return;
      if (document.activeElement !== input) input.focus({ preventScroll: true });
    }, true);
    input.addEventListener("compositionstart", () => {
      state.isComposing = true;
      cancelPendingInputProcessing();
    });
    input.addEventListener("compositionend", () => {
      state.isComposing = false;
      scheduleInputProcessing(input);
    });
    input.addEventListener("blur", () => {
      if (!state.isComposing && !state.suppressBlurProcessing) scheduleInputProcessing(input, 0);
    });
    input.disabled = true;
    $("#targetName").textContent = "여정을 설정하세요";
    setHudStation("#nextStation", "여정 설정");
    setHudStation("#afterNextStation", "—");
    $("#typingFeedback").innerHTML = '<span class="char-pending">시작 화면에서 여정을 선택하세요</span>';

    document.querySelectorAll(".network-card").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".network-card").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        setActiveMode(button.dataset.network);
      });
    });

    document.querySelectorAll(".mode-tab").forEach((button) => {
      button.addEventListener("click", () => {
        setupMode = button.dataset.mode;
        document.querySelectorAll(".mode-tab").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        $("#randomOptions").classList.toggle("hidden", setupMode !== "random");
        $("#customOptions").classList.toggle("hidden", setupMode !== "custom");
        $("#randomAdvanced").classList.toggle("hidden", setupMode !== "random");
        $("#setupError").textContent = "";
      });
    });

    document.querySelectorAll(".flight-mode-tab").forEach((button) => {
      button.addEventListener("click", () => {
        setupMode = button.dataset.flightMode;
        document.querySelectorAll(".flight-mode-tab").forEach((item) => {
          const selected = item === button;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        $("#worldTourOptions").classList.toggle("hidden", setupMode !== "world-tour");
        $("#flightOptions").classList.toggle("hidden", setupMode !== "mission");
        $("#setupError").textContent = "";
      });
    });

    document.querySelectorAll(".count-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const countInput = $("#stationCount");
        const next = Number(countInput.value || 20) + Number(button.dataset.delta);
      const maxCount = activeMode === "jeju" ? JEJU_ACTIVE_DATA.meta.stationCount : 50;
      countInput.value = Math.max(3, Math.min(maxCount, next));
      });
    });

    $("#setupForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const error = $("#setupError");
      error.textContent = "";
      try {
        const pace = $("#paceMode").value;
        let route;
        let label;
        let journeyMode = activeMode;
        if (activeMode === "flight") {
          if (setupMode === "world-tour") {
            const worldTour = buildWorldTourJourney();
            route = worldTour.route;
            label = worldTour.label;
            journeyMode = "world-tour";
          } else {
            const flightKey = $("#flightRoute").value;
            const flight = FLIGHT_DATA.lines[flightKey];
            if (!flight) throw new Error("비행 미션을 선택해주세요.");
            const origin = FLIGHT_DATA.airports[flight.origin];
            const destination = FLIGHT_DATA.airports[flight.destination];
            route = flight.stations.slice();
            label = `${origin.city} (${origin.code}) → ${destination.city} (${destination.code}) · ${route.length}개 영공`;
          }
        } else if (setupMode === "random") {
    const maxCount = activeMode === "jeju" ? JEJU_ACTIVE_DATA.meta.stationCount : 50;
    const count = Math.max(3, Math.min(maxCount, Number($("#stationCount").value) || 20));
          $("#stationCount").value = count;
          const startValue = $("#randomStart").value.trim();
          const start = startValue ? resolveStationInput(startValue) : null;
          if (startValue && !start) {
            throw new Error(activeMode === "metro" ? "정확한 출발역 이름을 선택해주세요." : "정확한 출발 지역 이름을 선택해주세요.");
          }
          const style = document.querySelector('input[name="transferStyle"]:checked').value;
          route = buildRandomJourney(count, style, $("#regionMode").value, start || null);
          const branchLabel = activeMode === "metro" ? "환승" : "분기";
          label = `랜덤 ${count}개 · ${branchLabel} ${routeTransferCount(route)}회`;
        } else {
          const from = resolveStationInput($("#fromStation").value);
          const to = resolveStationInput($("#toStation").value);
          if (!from || !to) {
            throw new Error(activeMode === "metro" ? "출발역과 도착역을 목록에서 선택해주세요." : "출발 지역과 도착 지역을 목록에서 선택해주세요.");
          }
          if (from === to) throw new Error("출발지와 도착지는 서로 달라야 합니다.");
          route = findPath(from, to);
          if (!route) throw new Error("두 지점을 연결하는 경로를 찾지 못했습니다.");
          label = `${stationLabel(from)} → ${stationLabel(to)} · ${route.length}개`;
        }
        startJourney(route, label, pace, journeyMode);
      } catch (setupError) {
        error.textContent = setupError.message;
      }
    });

    $("#restartBtn").addEventListener("click", repeatJourney);
    $("#newJourneyBtn").addEventListener("click", openJourneySetup);
    $("#repeatJourneyBtn").addEventListener("click", repeatJourney);
    $("#completeNewBtn").addEventListener("click", openJourneySetup);

    $("#helpBtn").addEventListener("click", () => {
      $("#helpModal").classList.remove("hidden");
    });
    $("#closeHelp").addEventListener("click", () => {
      $("#helpModal").classList.add("hidden");
    });

    updateStats();
    updateJourneyProgress();
    setActiveMode("flight");
  }

  // 지도 시작시 시청 중심으로 맞춤
  map.setView(
    [
      SUBWAY_DATA.stations[START_STATION].lat,
      SUBWAY_DATA.stations[START_STATION].lng,
    ],
    12
  );

  // 시작 화면에서는 수도권 전체 운영 구간을 보여주고, 여정 시작 뒤에는 현재 단계로 확대한다.
  const jejuBounds = L.latLngBounds(
    Object.values(JEJU_ACTIVE_DATA.stations).map((station) => [station.lat, station.lng])
  );

  const metroBounds = L.latLngBounds(
    Object.values(SUBWAY_DATA.stations).map((station) => [station.lat, station.lng])
  );
  const flightBounds = L.latLngBounds([[-55, -170], [72, 180]]);
  map.fitBounds(metroBounds, { padding: [32, 32] });

  init();
})();
