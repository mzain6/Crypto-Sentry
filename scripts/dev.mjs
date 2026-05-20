import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npxCommand = isWindows ? "npx.cmd" : "npx";
const nextArgs = ["next", "dev", ...process.argv.slice(2)];

const processes = [
  spawn(npxCommand, nextArgs, {
    env: {
      ...process.env,
      COIN_INGEST_INTERVAL_SECONDS:
        process.env.COIN_INGEST_INTERVAL_SECONDS || "30",
    },
    shell: isWindows,
    stdio: "inherit",
  }),
  spawn(npxCommand, ["tsx", "src/server/ingestion/run-ingestion.ts", "--watch"], {
    env: {
      ...process.env,
      COIN_INGEST_INTERVAL_SECONDS:
        process.env.COIN_INGEST_INTERVAL_SECONDS || "30",
    },
    shell: isWindows,
    stdio: "inherit",
  }),
];

function shutdown() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
}

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", () => {
  shutdown();
  process.exit();
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit();
});
