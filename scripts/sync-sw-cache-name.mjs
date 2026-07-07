import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"));
const serviceWorkerPath = resolve(rootDir, "public/sw.js");
const serviceWorkerSource = readFileSync(serviceWorkerPath, "utf8");
const nextCacheName = `timer-display-v${packageJson.version}`;
const nextSource = serviceWorkerSource.replace(
  /^const CACHE_NAME = "timer-display-[^"]+";/m,
  `const CACHE_NAME = "${nextCacheName}";`
);

if (nextSource !== serviceWorkerSource) {
  writeFileSync(serviceWorkerPath, nextSource);
}
