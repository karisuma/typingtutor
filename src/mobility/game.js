// ============================================================
// 메트로 타이핑 게임 로직
// ============================================================

(function () {
  const $ = (sel) => document.querySelector(sel);

  // ---------------------- Map Setup ----------------------
  const map = L.map("map", {
    center: [37.5663, 126.9784],
    zoom: 12,
    minZoom: 7,
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
  const subwaySegmentPaths = new Map();
  const highwaySegmentPaths = new Map();
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
    const segmentStore = data === HIGHWAY_DATA ? highwaySegmentPaths : subwaySegmentPaths;
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
    journeyLines: [],
    journeySegmentPaths: [],
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
    return activeData.lines[lineKey]?.color || (activeMode === "highway" ? "#e58b18" : "#08a449");
  }

  function railSegmentPath(from, to, lineKey) {
    const segmentStore = activeMode === "highway" ? highwaySegmentPaths : subwaySegmentPaths;
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

  function drawJourney(route) {
    journeyLayer.clearLayers();
    const stationLatLngs = route.map((name) => {
      const station = activeData.stations[name];
      return [station.lat, station.lng];
    });
    state.journeySegmentPaths = route.slice(0, -1).map((name, index) =>
      railSegmentPath(name, route[index + 1], state.journeyLines[index])
    );
    const latlngs = state.journeySegmentPaths.reduce((points, segment, index) => {
      points.push(...(index === 0 ? segment : segment.slice(1)));
      return points;
    }, []);
    L.polyline(latlngs, {
      color: "#ffffff",
      weight: 18,
      opacity: 0.94,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(journeyLayer);
    state.journeyLines.forEach((lineKey, index) => {
      const segmentLatLngs = state.journeySegmentPaths[index];
      L.polyline(segmentLatLngs, {
        color: routeLineColor(lineKey),
        weight: 10,
        opacity: 1,
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
        html: `<div class="route-stop-label${endpointClass}${positionClass}" data-route-index="${index}" style="--route-color:${routeColor};--route-text:${routeText}"><span>${index + 1}</span><strong>${stationLabel(name)}</strong></div>`,
      });
      L.marker([station.lat, station.lng], {
        icon: labelIcon,
        keyboard: false,
        zIndexOffset: 1400 + index,
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
      if (dot) {
        dot.classList.remove("selected-route");
        dot.style.removeProperty("--route-color");
      }
    });
    route.forEach((name, index) => {
      const marker = activeMarkers.get(name);
      const element = marker && marker.getElement();
      const dot = element && element.querySelector(".station-marker, .highway-marker");
      if (dot) {
        const lineKey = state.journeyLines[index] || state.journeyLines[index - 1];
        dot.style.setProperty("--route-color", routeLineColor(lineKey));
        dot.classList.add("selected-route");
      }
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

  function setActiveMode(mode) {
    setJourneyFocus(false);
    activeMode = mode;
    document.body.classList.toggle("highway-mode", mode === "highway");
    if (mode === "highway") {
      $("#brandTitle").textContent = "타이핑101";
      $("#typingInstruction").textContent = "지역 이름을 입력해 이동하세요";
      $("#previousRole").textContent = "← 이전 지역";
      $("#currentRole").textContent = "현재 지역";
      $("#nextRole").textContent = "다음 지역 →";
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
      map.fitBounds([[34.5, 126.0], [38.4, 129.7]], { padding: [28, 28] });
    } else {
      $("#brandTitle").textContent = "타이핑101";
      $("#typingInstruction").textContent = "역 이름을 입력해 이동하세요";
      $("#previousRole").textContent = "← 이전역";
      $("#currentRole").textContent = "현재역";
      $("#nextRole").textContent = "다음역 →";
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

  function startJourney(route, label, pace) {
    if (!route || route.length < 2) throw new Error("두 곳 이상 연결된 여정이 필요합니다.");
    if (new Set(route).size !== route.length) throw new Error("중복 역이 포함된 여정은 시작할 수 없습니다.");

    state.journey = route.slice();
    state.journeyLines = resolveRouteLineKeys(route);
    state.journeyIndex = 0;
    state.journeyLabel = label;
    state.awaitingStart = true;
    state.segmentMs = pace === "slow" ? 620 : pace === "fast" ? 220 : 380;
    state.currentStation = route[0];
    state.targetStation = route[0];
    state.isMoving = false;
    resetRunStats();

    const start = activeData.stations[state.currentStation];
    trainMarker.setLatLng([start.lat, start.lng]);
    setHud(state.currentStation);
    drawJourney(route);
    setJourneyFocus(true, route);
    updateJourneyProgress();
    setTarget(route[0], { focus: false });
    $("#typingInstruction").textContent = activeMode === "metro"
      ? "출발역 이름을 입력해 시작하세요"
      : "출발 지역 이름을 입력해 시작하세요";
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
    const destination = activeData.stations[targetName];
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
    map.fitBounds(
      L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]),
      {
        paddingTopLeft: [horizontalPadding, verticalPadding],
        paddingBottomRight: [horizontalPadding, verticalPadding],
        maxZoom: compact ? 14 : 15,
        animate: true,
        duration: 0.7,
      }
    );
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
      showToast(`${stationLabel(destName)}에서 출발합니다`);

      const next = state.journey[1];
      $("#typingInstruction").textContent = activeMode === "metro"
        ? "역 이름을 입력해 이동하세요"
        : "지역 이름을 입력해 이동하세요";
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

    const path = findPath(state.currentStation, destName);
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
        $("#randomAdvanced").classList.toggle("hidden", setupMode !== "random");
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

  // 시작 화면에서는 수도권 전체 운영 구간을 보여주고, 여정 시작 뒤에는 현재 단계로 확대한다.
  const metroBounds = L.latLngBounds(
    Object.values(SUBWAY_DATA.stations).map((station) => [station.lat, station.lng])
  );
  map.fitBounds(metroBounds, { padding: [32, 32] });

  init();
})();
