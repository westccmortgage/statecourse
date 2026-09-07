import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function californiaDocumentEnvironment() {
  const explicit = process.env.STATECOURSE_PYTHON_BIN;
  const candidates = explicit ? [explicit] : [
    "python3",
    path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"),
  ];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["-c", "import sys,pypdf;print(sys.executable)"], { encoding: "utf8" });
    if (probe.status !== 0) continue;
    const executable = probe.stdout.trim();
    // Existing PDF tests deliberately execute python3. Put the verified interpreter first.
    const python3 = path.join(path.dirname(executable), process.platform === "win32" ? "python3.exe" : "python3");
    if (!fs.existsSync(python3)) continue;
    const env = { ...process.env, PATH: `${path.dirname(executable)}${path.delimiter}${process.env.PATH ?? ""}` };
    const confirm = spawnSync("python3", ["-c", "import pypdf"], { env, encoding: "utf8" });
    if (confirm.status === 0) return { executable, env };
  }
  throw new Error("California document checks require Python 3 with pypdf. Install pypdf in your Python environment or set STATECOURSE_PYTHON_BIN to an interpreter that provides it.");
}

export function pdfPageCount(file, runtime) {
  const result = spawnSync(runtime.executable, ["-c", "import sys;from pypdf import PdfReader;print(len(PdfReader(sys.argv[1]).pages))", file], { encoding: "utf8", env: runtime.env });
  if (result.status !== 0) throw new Error(`Cannot read ${file}: ${result.stderr.trim()}`);
  const pages = Number(result.stdout.trim());
  if (!Number.isInteger(pages) || pages < 1) throw new Error(`Invalid page count for ${file}`);
  return pages;
}
