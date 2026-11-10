import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const frontendDir = resolve(backendDir, "../frontend");
const isWindows = process.platform === "win32";
const children = [];
let shuttingDown = false;

function start(name, command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: "inherit", shell: isWindows, windowsHide: true });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[${name}] ${error.message}`);
    shutdown(1);
  });
  child.on("exit", (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`[${name}] berhenti dengan kode ${code}`);
      shutdown(code);
    }
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 300);
}

const npm = isWindows ? "npm.cmd" : "npm";
start("Laravel API", "php", ["artisan", "serve"], backendDir);
start("Next.js", npm, ["run", "dev"], frontendDir);

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
