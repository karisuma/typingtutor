import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../src/mobility/data.js", import.meta.url), "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(`${source}\nglobalThis.result = { data: SUBWAY_DATA, graph: SUBWAY_GRAPH };`, context);

const { data, graph } = context.result;
const errors = [];
const categories = new Set(Object.values(data.lines).map((line) => line.id));
if (categories.size !== data.meta.categoryCount) errors.push("노선 분류 수가 메타데이터와 다릅니다.");
if (Object.keys(data.stations).length !== data.meta.stationCount) errors.push("역 수가 메타데이터와 다릅니다.");

for (const [key, line] of Object.entries(data.lines)) {
  if (line.stations.length < 2) errors.push(`${key}: 역이 2개 미만입니다.`);
  for (const id of line.stations) {
    if (!data.stations[id]) errors.push(`${key}: ${id} 좌표가 없습니다.`);
  }
  for (let index = 0; index < line.stations.length - 1; index++) {
    const a = data.stations[line.stations[index]];
    const b = data.stations[line.stations[index + 1]];
    if (!a || !b) continue;
    const latKm = (a.lat - b.lat) * 111;
    const lngKm = (a.lng - b.lng) * 88;
    const distance = Math.hypot(latKm, lngKm);
    if (distance > 25 && line.id !== "GTX-A") {
      errors.push(`${key}: ${a.name}–${b.name} 간격이 ${distance.toFixed(1)}km입니다.`);
    }
  }
}

const seen = new Set();
const components = [];
for (const start of graph.keys()) {
  if (seen.has(start)) continue;
  const component = [];
  const queue = [start];
  seen.add(start);
  while (queue.length) {
    const current = queue.shift();
    component.push(current);
    for (const next of graph.get(current) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  components.push(component);
}
if (components.length !== 1) errors.push(`그래프가 ${components.length}개 구역으로 분리되어 있습니다: ${components.map((part) => part.length).join(", ")}`);

const required = [
  "L9", "I1", "I2", "GJ", "SB", "DX", "GC", "GG", "SH", "UI", "SL", "EV", "UJ", "GP", "AR", "GTX-A",
];
for (const id of required) {
  if (!categories.has(id)) errors.push(`${id} 노선이 없습니다.`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${categories.size}개 노선, ${Object.keys(data.stations).length}개 역, 환승역 ${data.transfers.length}개, 단일 연결 그래프`);
