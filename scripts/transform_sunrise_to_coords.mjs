import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  console.error("data directory not found");
  process.exit(1);
}

// find latest rise_set_results_ file
const files = fs
  .readdirSync(dataDir)
  .filter((f) => f.startsWith("rise_set_results_") && f.endsWith(".json"));
if (!files.length) {
  console.error("No rise_set_results_*.json files found in data/");
  process.exit(1);
}

files.sort();
const latest = files[files.length - 1];
const inputPath = path.join(dataDir, latest);
console.log("Reading", inputPath);

const raw = fs.readFileSync(inputPath, "utf8");
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error("Failed to parse JSON:", e.message);
  process.exit(1);
}

const results = parsed.results || [];

const sunrise_result = results.map((r) => {
  const location = r.location || (r.items && r.items.location) || null;
  // latitudeNum and longitudeNum may be under items
  const lat =
    r.items &&
    (r.items.latitudeNum ?? r.items.latitude_num ?? r.items.lat ?? null);
  const lng =
    r.items &&
    (r.items.longitudeNum ?? r.items.longitude_num ?? r.items.lng ?? null);

  // try to coerce to number
  const latNum = lat !== null && lat !== undefined ? Number(lat) : null;
  const lngNum = lng !== null && lng !== undefined ? Number(lng) : null;

  return {
    location,
    lat: isNaN(latNum) ? null : latNum,
    lng: isNaN(lngNum) ? null : lngNum,
  };
});

const out = { sunrise_result };
const outFile = path.join(
  dataDir,
  `sunrise_coords_${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);
fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
console.log("Wrote", outFile);
