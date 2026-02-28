const { parentPort } = require("worker_threads");
const worker = require("tesseract.js/src/worker-script");
const getCore = require("tesseract.js/src/worker-script/node/getCore");
const gunzip = require("tesseract.js/src/worker-script/node/gunzip");
const cache = require("tesseract.js/src/worker-script/node/cache");

const fetchImpl =
  typeof globalThis.fetch === "function"
    ? (...args) => globalThis.fetch(...args)
    : require("node-fetch");

parentPort.on("message", (packet) => {
  worker.dispatchHandlers(packet, (obj) => parentPort.postMessage(obj));
});

worker.setAdapter({
  getCore,
  gunzip,
  fetch: fetchImpl,
  ...cache
});
