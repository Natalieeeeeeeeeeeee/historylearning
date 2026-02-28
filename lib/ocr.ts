import { createWorker } from "tesseract.js";
import fs from "node:fs";
import path from "node:path";

function resolveWorkerPath() {
  const customWorker = path.join(process.cwd(), "lib", "tesseract-worker.cjs");
  if (fs.existsSync(customWorker)) return customWorker;

  return path.join(process.cwd(), "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js");
}

const langPath = process.env.TESSDATA_PREFIX || process.cwd();

export async function runOcr(buffer: Buffer) {
  const worker = await createWorker("vie+eng", 1, {
    logger: () => undefined,
    langPath,
    workerPath: resolveWorkerPath(),
    cachePath: "/tmp/tesseract"
  });
  try {
    const { data } = await worker.recognize(buffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
