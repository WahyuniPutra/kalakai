import { spawnSync } from "node:child_process";

const windows = process.platform === "win32";
const run = (command, args) => spawnSync(command, args, {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: windows,
});

const installed = run("pnpm", ["--version"]).status === 0;
const command = installed ? "pnpm" : "npx";
const prefix = installed ? [] : ["--yes", "pnpm@11.25.0"];

if (!installed) {
  console.log("pnpm belum ada; menyiapkan versi yang dipatok melalui npx.");
  const bootstrap = run("npx", ["--yes", "pnpm@11.25.0", "--version"]);
  if (bootstrap.status !== 0) process.exit(bootstrap.status ?? 1);
}

for (const args of [
  [...prefix, "--dir", "opendesign", "install", "--frozen-lockfile"],
  [...prefix, "--dir", "opendesign", "build"],
]) {
  const result = run(command, args);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
