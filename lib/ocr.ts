import { createWorker } from "tesseract.js";
import path from "node:path";

export async function runOcr(buffer: Buffer) {
  const worker = await createWorker("vie+eng", 1, {
    logger: () => undefined,
    langPath: process.env.TESSDATA_PREFIX,
    workerPath: path.resolve(process.cwd(), "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js"),
    corePath: path.resolve(process.cwd(), "node_modules", "tesseract.js-core", "tesseract-core.wasm.js")
  });
  await worker.load();
  await worker.loadLanguage("vie+eng");
  await worker.initialize("vie+eng");
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text;
}
