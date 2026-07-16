// ============================================================
// 메트로 타이핑 게임 로직
// ============================================================

(function () {
  const $ = (sel) => document.querySelector(sel);

  // ---------------------- Map Setup ----------------------
  const map = L.map("map", {
    center: [37.5663, 126.9784],
    zoom: 12,
    minZoom: 11,
    maxZoom: 17,
    zoomControl: true,
    attributionControl: true,
  });

  // 실제 도로·지형이 보이는 밝은 지도 베이스
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(map);

  const subwayLayer = L.layerGroup().addTo(map);
  const highwayLayer = L.layerGroup();
  const subwayLineLayers = [];
  const highwayLineLayers = [];

  // 라벨 포함된 밝은 베이스 — 게임 분위기를 위해 단독으로 사용하지 않고 어두운 타일 사용
  // ---------------------- Line Drawing ----------------------
  function smoothLatLngs(points, segments = 12) {
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
    const stationLatLngs = list
      .map((name) => data.stations[name])
      .filter(Boolean)
      .map((s) => [s.lat, s.lng]);

    if (stationLatLngs.length < 2) return;
    const latlngs = smoothLatLngs(stationLatLngs);

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

    const collection = data === HIGHWAY_DATA ? highwayLineLayers : subwayLineLayers;
    collection.push({ outline, body, width });
  }

  Object.entries(SUBWAY_DATA.lines).forEach(([key, line]) => drawLine(key, line));
  Object.entries(HIGHWAY_DATA.lines).forEach(([key, line]) =>
    drawLine(key, line, HIGHWAY_DATA, highwayLayer, 4)
  );

  // 선택된 여정을 지도 위에 강조한다.
  const journeyLayer = L.layerGroup().addTo(map);

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

  let activeMode = "metro";
  let activeData = SUBWAY_DATA;
  let activeGraph = SUBWAY_GRAPH;
  let activeMarkers = stationMarkers;
  let activeTransferStations = transferStations;

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
    journeyIndex: 0,
    journeyMode: "random",
    journeyLabel: "",
    segmentMs: 380,
    isMoving: false,
    typedCorrect: 0,
    typedWrong: 0,
    movedCount: 0,
    startedAt: null, // when the current target started being typed
    firstKeyAt: null,
  };

  // ---------------------- Helpers ----------------------
  // 역 이름으로 호선 정보 찾기
  function linesAtStation(name) {
    const result = [];
    Object.entries(activeData.lines).forEach(([key, line]) => {
      const list = line.seoulOnly || line.stations;
      if (list.includes(name)) {
        result.push({ key, name: line.name, color: line.color });
      }
    });
    return result;
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

  function setHud(name, en) {
    $("#currentStation").textContent = name || "출발 대기";
    $("#currentStationEn").textContent = en || "—";

    const lineInfos = linesAtStation(name);
    const tag = $("#routeTag");
    if (lineInfos.length > 0) {
      tag.textContent = lineInfos.map((l) => l.name).join(" · ");
      const primary = lineInfos[0];
      tag.style.background = primary.color;
      tag.style.color = readableTextColor(primary.color);
    } else {
      tag.textContent = "—";
      tag.style.background = "#4ade80";
      tag.style.color = "#052e16";
    }

    // prev / next (현재 호선 위주의 인접역 표시)
    const neighbors = neighborsOf(name);
    if (neighbors.length > 0) {
      $("#nextStation").textContent = "→ " + neighbors[0];
      $("#prevStation").textContent = "← " + (neighbors[1] || neighbors[0]);
    } else {
      $("#nextStation").textContent = "— 다음역 —";
      $("#prevStation").textContent = "— 이전역 —";
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
    });
    return result;
  }

  function routeTransferCount(route) {
    let activeLine = null;
    let transfers = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const candidates = edgeLines(route[i], route[i + 1]);
      if (activeLine && candidates.includes(activeLine)) continue;
      const nextLine = candidates[0] || null;
      if (activeLine && nextLine && nextLine !== activeLine) transfers++;
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
            const continues = activeLine && lines.includes(activeLine);
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
            ? activeLine
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

  function drawJourney(route) {
    journeyLayer.clearLayers();
    const stationLatLngs = route.map((name) => {
      const station = activeData.stations[name];
      return [station.lat, station.lng];
    });
    const latlngs = smoothLatLngs(stationLatLngs, 16);
    L.polyline(latlngs, {
      color: "#ffffff",
      weight: 18,
      opacity: 0.94,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(journeyLayer);
    L.polyline(latlngs, {
      color: "#08a449",
      weight: 10,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(journeyLayer);

    route.forEach((name, index) => {
      const station = activeData.stations[name];
      const endpointClass = index === 0 || index === route.length - 1 ? " endpoint" : "";
      const positionClass = index % 2 === 0 ? " above" : " below";
      const labelIcon = L.divIcon({
        className: "route-label-icon",
        iconSize: [1, 1],
        iconAnchor: [0, 0],
        html: `<div class="route-stop-label${endpointClass}${positionClass}" data-route-index="${index}"><span>${index + 1}</span><strong>${name}</strong></div>`,
      });
      L.marker([station.lat, station.lng], {
        icon: labelIcon,
        keyboard: false,
        zIndexOffset: 700 + index,
      }).addTo(journeyLayer);
    });

    map.fitBounds(L.latLngBounds(stationLatLngs), { padding: [70, 70], maxZoom: 13 });
  }

  function setJourneyFocus(active, route = []) {
    document.body.classList.toggle("journey-active", active);
    const lineLayers = activeMode === "highway" ? highwayLineLayers : subwayLineLayers;
    lineLayers.forEach(({ outline, body, width }) => {
      outline.setStyle({ opacity: active ? 0.3 : 0.92, weight: width + 4 });
      body.setStyle({ opacity: active ? 0.16 : 1, weight: width });
    });

    activeMarkers.forEach((marker) => {
      const element = marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker");
      if (dot) dot.classList.remove("selected-route");
    });
    route.forEach((name) => {
      const marker = activeMarkers.get(name);
      const element = marker && marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker");
      if (dot) dot.classList.add("selected-route");
    });
  }

  function updateRouteLabelState() {
    document.querySelectorAll(".route-stop-label").forEach((label) => {
      const index = Number(label.dataset.routeIndex);
      label.classList.toggle("completed", index < state.journeyIndex);
      label.classList.toggle("current", index === state.journeyIndex);
      label.classList.toggle("next", index === state.journeyIndex + 1);
    });
  }

  function updateJourneyProgress() {
    const total = state.journey.length;
    const current = total ? state.journeyIndex + 1 : 0;
    $("#journeyProgress").textContent = `${current} / ${total}`;
    $("#hint").textContent = state.journeyLabel || "여정을 설정하세요";
    updateRouteLabelState();
  }

  function populateStationList() {
    const list = $("#stationList");
    list.innerHTML = Object.keys(activeData.stations)
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((name) => `<option value="${name}"></option>`)
      .join("");
  }

  function setActiveMode(mode) {
    setJourneyFocus(false);
    activeMode = mode;
    document.body.classList.toggle("highway-mode", mode === "highway");
    if (mode === "highway") {
      $("#brandTitle").textContent = "고속도로 타이핑";
      if (map.hasLayer(subwayLayer)) map.removeLayer(subwayLayer);
      highwayLayer.addTo(map);
      activeData = HIGHWAY_DATA;
      activeGraph = HIGHWAY_GRAPH;
      activeMarkers = highwayMarkers;
      activeTransferStations = highwayTransferStations;
      $("#countLabel").textContent = "지역 수";
      $("#countUnit").textContent = "개 지역";
      $("#randomStartLabel").textContent = "출발 지역";
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
      map.fitBounds([[34.5, 126.0], [38.4, 129.7]], { padding: [28, 28] });
    } else {
      $("#brandTitle").textContent = "메트로 타이핑";
      if (map.hasLayer(highwayLayer)) map.removeLayer(highwayLayer);
      subwayLayer.addTo(map);
      activeData = SUBWAY_DATA;
      activeGraph = SUBWAY_GRAPH;
      activeMarkers = stationMarkers;
      activeTransferStations = transferStations;
      $("#countLabel").textContent = "정거장 수";
      $("#countUnit").textContent = "개 역";
      $("#randomStartLabel").textContent = "출발역";
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
      map.fitBounds([[37.43, 126.76], [37.7, 127.19]], { padding: [32, 32] });
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

  function startJourney(route, label, pace) {
    if (!route || route.length < 2) throw new Error("두 곳 이상 연결된 여정이 필요합니다.");
    if (new Set(route).size !== route.length) throw new Error("중복 역이 포함된 여정은 시작할 수 없습니다.");

    state.journey = route.slice();
    state.journeyIndex = 0;
    state.journeyLabel = label;
    state.segmentMs = pace === "slow" ? 620 : pace === "fast" ? 220 : 380;
    state.currentStation = route[0];
    state.targetStation = route[1];
    state.isMoving = false;
    resetRunStats();

    const start = activeData.stations[state.currentStation];
    trainMarker.setLatLng([start.lat, start.lng]);
    setHud(state.currentStation, start.en);
    drawJourney(route);
    setJourneyFocus(true, route);
    updateJourneyProgress();
    setTarget(route[1]);
    $("#input").disabled = false;
    $("#setupModal").classList.add("hidden");
    $("#completeModal").classList.add("hidden");
    $("#input").focus();
  }

  function finishJourney() {
    const total = state.typedCorrect + state.typedWrong;
    const accuracy = total ? Math.round((state.typedCorrect / total) * 100) : 100;
    $("#completeCount").textContent = state.journey.length;
    $("#completeAccuracy").textContent = accuracy + "%";
    $("#completeSummary").textContent = `${state.journey[0]}에서 ${state.journey[state.journey.length - 1]}까지 완주했습니다.`;
    $("#input").disabled = true;
    $("#targetName").textContent = "여정 완료";
    $("#targetEn").textContent = "Journey complete";
    $("#typedCorrect").textContent = "";
    $("#typedRemaining").textContent = "";
    $("#completeModal").classList.remove("hidden");
  }

  function advanceJourney() {
    state.journeyIndex++;
    updateJourneyProgress();
    if (state.journeyIndex >= state.journey.length - 1) {
      finishJourney();
      return;
    }
    setTarget(state.journey[state.journeyIndex + 1]);
  }

  function repeatJourney() {
    if (!state.journey.length) return;
    startJourney(state.journey, state.journeyLabel, state.segmentMs >= 600 ? "slow" : state.segmentMs <= 240 ? "fast" : "normal");
  }

  function openJourneySetup() {
    if (state.isMoving) return;
    setJourneyFocus(false);
    journeyLayer.clearLayers();
    $("#completeModal").classList.add("hidden");
    $("#setupError").textContent = "";
    $("#setupModal").classList.remove("hidden");
  }

  // ---------------------- Movement ----------------------
  function animateTrainAlong(path, onDone) {
    if (!path || path.length < 2) {
      onDone && onDone();
      return;
    }
    state.isMoving = true;
    const stationPoints = path.map((name) => {
      const station = activeData.stations[name];
      return [station.lat, station.lng];
    });
    const animationPoints = smoothLatLngs(stationPoints, 18);
    const duration = (path.length - 1) * state.segmentMs;
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const exactIndex = progress * (animationPoints.length - 1);
      const index = Math.min(animationPoints.length - 2, Math.floor(exactIndex));
      const localProgress = exactIndex - index;
      const from = animationPoints[index];
      const to = animationPoints[index + 1];
      const lat = from[0] + (to[0] - from[0]) * localProgress;
      const lng = from[1] + (to[1] - from[1]) * localProgress;
      trainMarker.setLatLng([lat, lng]);

      const el = trainMarker.getElement();
      if (el) {
        const body = el.querySelector(".body");
        if (body) {
          const angle = computeAngle(
            { lat: from[0], lng: from[1] },
            { lat: to[0], lng: to[1] }
          );
          body.style.transform = `translate(-50%, -50%) rotate(${-angle}deg)`;
        }
      }

      if (progress < 1) requestAnimationFrame(step);
      else {
        state.isMoving = false;
        onDone && onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function computeAngle(a, b) {
    const dy = b.lat - a.lat;
    const dx = b.lng - a.lng;
    // 지도의 y는 위로 갈수록 큼 → atan2(-dy, dx)
    return (Math.atan2(-dy, dx) * 180) / Math.PI;
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

  function setTarget(name) {
    state.targetStation = name;
    state.startedAt = null;
    state.firstKeyAt = null;
    const s = activeData.stations[name];
    $("#targetName").textContent = name;
    $("#targetName").classList.remove("dim");
    $("#targetEn").textContent = s ? s.en : "";
    $("#typedCorrect").textContent = "";
    $("#typedCursor").textContent = "|";
    $("#typedRemaining").textContent = name;
    $("#input").value = "";

    activeMarkers.forEach((marker) => marker.closeTooltip());
    const targetMarker = activeMarkers.get(name);
    if (targetMarker) targetMarker.openTooltip();
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
  function handleInput(e) {
    if (state.isMoving) return;
    if (!state.targetStation) return;

    const value = e.target.value;
    const target = state.targetStation;

    // 처음 키 입력 시각 기록
    if (state.firstKeyAt === null && value.length > 0) {
      state.firstKeyAt = Date.now();
    }

    // 정확/오타 추적 (마지막 키 기준으로 단순화)
    if (value.length > 0) {
      // 마지막으로 추가된 글자가 target과 일치하면 정타
      const lastIdx = value.length - 1;
      if (value[lastIdx] === target[lastIdx]) {
        state.typedCorrect++;
      } else {
        state.typedWrong++;
      }
    }

    // 타이핑 박스 업데이트
    const correctPart = value;
    const remaining = target.slice(value.length);
    $("#typedCorrect").textContent = correctPart;
    $("#typedCursor").textContent = value.length < target.length ? "|" : " ";
    $("#typedRemaining").textContent = remaining;

    // 정답 완전 일치 시 이동
    if (value === target) {
      moveTrainTo(target);
    }
    updateStats();
  }

  function moveTrainTo(destName) {
    const path = findPath(state.currentStation, destName);
    if (!path || path.length < 2) {
      // 이미 그 위치
      advanceJourney();
      return;
    }
    // 입력 잠금 (선택적 — UX를 위해 짧게 유지)
    $("#input").value = "";
    $("#input").disabled = true;
    $("#typedCorrect").textContent = destName;
    $("#typedCursor").textContent = " ";
    $("#typedRemaining").textContent = "";
    $("#targetName").classList.add("dim");

    // 도착 역 표시 (toast)
    showToast(`${state.currentStation} → ${destName}`);

    animateTrainAlong(path, () => {
      state.currentStation = destName;
      state.movedCount++;
      setHud(state.currentStation, activeData.stations[destName].en);
      updateStats();
      map.panTo([
        activeData.stations[destName].lat,
        activeData.stations[destName].lng,
      ]);
      $("#input").disabled = false;
      $("#input").focus();
      advanceJourney();
    });
  }

  // ---------------------- Init ----------------------
  function init() {
    setHud(state.currentStation, SUBWAY_DATA.stations[state.currentStation].en);
    const input = $("#input");
    input.addEventListener("input", handleInput);
    input.disabled = true;
    $("#targetName").textContent = "여정을 설정하세요";
    $("#targetEn").textContent = "Choose a journey";
    $("#typedRemaining").textContent = "";

    let setupMode = "random";

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
        $("#setupError").textContent = "";
      });
    });

    document.querySelectorAll(".count-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const countInput = $("#stationCount");
        const next = Number(countInput.value || 20) + Number(button.dataset.delta);
        countInput.value = Math.max(3, Math.min(50, next));
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
        if (setupMode === "random") {
          const count = Math.max(3, Math.min(50, Number($("#stationCount").value) || 20));
          $("#stationCount").value = count;
          const start = $("#randomStart").value.trim();
          if (start && !activeData.stations[start]) {
            throw new Error(activeMode === "metro" ? "정확한 출발역 이름을 선택해주세요." : "정확한 출발 지역 이름을 선택해주세요.");
          }
          const style = document.querySelector('input[name="transferStyle"]:checked').value;
          route = buildRandomJourney(count, style, $("#regionMode").value, start || null);
          const branchLabel = activeMode === "metro" ? "환승" : "분기";
          label = `랜덤 ${count}개 · ${branchLabel} ${routeTransferCount(route)}회`;
        } else {
          const from = $("#fromStation").value.trim();
          const to = $("#toStation").value.trim();
          if (!activeData.stations[from] || !activeData.stations[to]) {
            throw new Error(activeMode === "metro" ? "출발역과 도착역을 목록에서 선택해주세요." : "출발 지역과 도착 지역을 목록에서 선택해주세요.");
          }
          if (from === to) throw new Error("출발지와 도착지는 서로 달라야 합니다.");
          route = findPath(from, to);
          if (!route) throw new Error("두 지점을 연결하는 경로를 찾지 못했습니다.");
          label = `${from} → ${to} · ${route.length}개`;
        }
        state.journeyMode = activeMode;
        startJourney(route, label, pace);
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
    setActiveMode("metro");
  }

  // 지도 시작시 시청 중심으로 맞춤
  map.setView(
    [
      SUBWAY_DATA.stations[START_STATION].lat,
      SUBWAY_DATA.stations[START_STATION].lng,
    ],
    12
  );

  // 서울 시내 권역만 초기 화면에 맞춘다. 외곽 목적지는 이동 시 지도를 따라가게 한다.
  const seoulBounds = L.latLngBounds([
    [37.43, 126.76],
    [37.70, 127.19],
  ]);
  map.fitBounds(seoulBounds, { padding: [32, 32] });

  init();
})();
