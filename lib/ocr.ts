import { createWorker } from "tesseract.js";
import path from "node:path";

const workerPath = path.join(process.cwd(), "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js");
const langPath = process.env.TESSDATA_PREFIX || process.cwd();

export async function runOcr(buffer: Buffer) {
  const worker = await createWorker("vie+eng", 1, {
    logger: () => undefined,
    langPath,
    workerPath,
    cachePath: "/tmp/tesseract"
  });
  try {
    const { data } = await worker.recognize(buffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
