import { spawnSync } from "node:child_process";

import { existsSync } from "node:fs";
import path from "node:path";

const windows = process.platform === "win32";
const run = (command, args) => spawnSync(command, args, {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: windows,
});

const builtHtml = path.join(process.cwd(), "public", "opendesign", "index.html");
const alreadyBuilt = existsSync(builtHtml);

const installed = run("pnpm", ["--version"]).status === 0;
const command = installed ? "pnpm" : "npx";
const prefix = installed ? [] : ["--yes", "pnpm@10"];

if (!installed) {
  console.log("pnpm belum ada; menyiapkan versi yang dipatok melalui npx.");
  const bootstrap = run("npx", ["--yes", "pnpm@10", "--version"]);
  if (bootstrap.status !== 0) {
    if (alreadyBuilt) {
      console.warn("Peringatan: bootstrapping pnpm dilewati karena bundle OpenDesign sudah tersedia di public/opendesign.");
      process.exit(0);
    }
    process.exit(bootstrap.status ?? 1);
  }
}

for (const args of [
  [...prefix, "--dir", "opendesign", "install", "--frozen-lockfile"],
  [...prefix, "--dir", "opendesign", "build"],
]) {
  const result = run(command, args);
  if (result.status !== 0) {
    if (alreadyBuilt) {
      console.warn("Peringatan: Build OpenDesign menggunakan bundle yang sudah ada di public/opendesign.");
      process.exit(0);
    }
    process.exit(result.status ?? 1);
  }
}
