// 비행 여정의 전체 경로를 보여주는 지구본 개요 화면.
// 카운트다운 후에는 기존 Leaflet 위성 지도로 자연스럽게 전환해 상세 영공을 보여준다.
(function () {
  const root = document.getElementById("flightGlobe");
  if (!root || !window.L || typeof FLIGHT_DATA === "undefined") return;

  const sphere = document.createElement("div");
  sphere.className = "flight-globe-sphere";
  root.appendChild(sphere);
  const worldBounds = L.latLngBounds([[-82, -179.9], [82, 179.9]]);

  const globeMap = L.map(sphere, {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    touchZoom: false,
    zoomControl: false,
    zoomSnap: 0,
    minZoom: 1.55,
    maxZoom: 1.55,
    worldCopyJump: false,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1,
  }).setView([20, 0], 1.55);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18, noWrap: true, bounds: worldBounds }
  ).addTo(globeMap);
  L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18, opacity: 0.92, noWrap: true, bounds: worldBounds }
  ).addTo(globeMap);

  const routeLayer = L.layerGroup().addTo(globeMap);

  function normalizeLongitude(lng) {
    return ((lng + 540) % 360) - 180;
  }

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

  function flightArc(from, to) {
    const points = [];
    const deltaLng = ((to.lng - from.lng + 540) % 360) - 180;
    const targetLng = from.lng + deltaLng;
    const lift = Math.min(20, Math.max(5, Math.abs(deltaLng) * 0.12 + Math.abs(to.lat - from.lat) * 0.08));
    for (let index = 0; index <= 42; index++) {
      const progress = index / 42;
      points.push([
        from.lat + (to.lat - from.lat) * progress + Math.sin(Math.PI * progress) * lift,
        from.lng + (targetLng - from.lng) * progress,
      ]);
    }
    return splitAtDateLine(points);
  }

  function pointIcon(kind, label) {
    return L.divIcon({
      className: "",
      iconSize: [1, 1],
      iconAnchor: [0, 0],
      html: `<div class="globe-point globe-point-${kind}">${label}</div>`,
    });
  }

  function addAirport(airport, position) {
    L.marker([airport.lat, airport.lng], {
      icon: pointIcon("airport", `<b>${airport.code}</b><span>${airport.city}</span>`),
      keyboard: false,
    }).addTo(routeLayer);
  }

  function setRoute(route, lineKey) {
    routeLayer.clearLayers();
    const line = FLIGHT_DATA.lines[lineKey];
    if (!line || route.length < 2) return;

    for (let index = 0; index < route.length - 1; index++) {
      const from = FLIGHT_DATA.stations[route[index]];
      const to = FLIGHT_DATA.stations[route[index + 1]];
      if (!from || !to) continue;
      flightArc(from, to).forEach((arc) => {
        L.polyline(arc, {
          color: "#e4fbff",
          weight: 8,
          opacity: 0.72,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(routeLayer);
        L.polyline(arc, {
          color: line.color || "#38cdf7",
          weight: 3,
          opacity: 1,
          dashArray: "5 10",
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(routeLayer);
      });
    }

    route.forEach((id, index) => {
      const station = FLIGHT_DATA.stations[id];
      if (!station) return;
      L.marker([station.lat, station.lng], {
        icon: pointIcon(index === 0 ? "start" : "checkpoint", `<i>${index + 1}</i><strong>${station.name}</strong>`),
        keyboard: false,
      }).addTo(routeLayer);
    });

    if (line.origin && line.destination) {
      addAirport(FLIGHT_DATA.airports[line.origin]);
      addAirport(FLIGHT_DATA.airports[line.destination]);
    }
    L.marker([FLIGHT_DATA.stations[route[0]].lat, FLIGHT_DATA.stations[route[0]].lng], {
      icon: pointIcon("plane", "✈"),
      keyboard: false,
    }).addTo(routeLayer);

    globeMap.setView([20, 0], 1.55, { animate: false });
    setTimeout(() => globeMap.invalidateSize(), 0);
  }

  window.FlightGlobe = {
    show() {
      document.body.classList.add("flight-globe-ready");
      root.removeAttribute("hidden");
      setTimeout(() => globeMap.invalidateSize(), 0);
    },
    hide() {
      document.body.classList.remove("flight-globe-ready");
      root.setAttribute("hidden", "");
    },
    setRoute,
    focusSegment() {
      // 전체 항로 개요 후에는 실제 위성 지도 상세 보기로 넘어간다.
      document.body.classList.remove("flight-globe-ready");
    },
    moveTo() {},
  };
})();
