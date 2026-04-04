import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";
env.backends.onnx.wasm.wasmPaths = "/wasm/";
let tts;
let isInitialized = false;
const DEFAULT_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
self.onmessage = async (event) => {
  const { type, payload } = event.data;
  if (type === "init") {
    let { model_id, dtype } = payload;
    model_id = model_id || DEFAULT_MODEL_ID;
    self.postMessage({ status: "init:start" });
    try {
      tts = await KokoroTTS.from_pretrained(model_id, {
        dtype,
        device: !!navigator?.gpu ? "webgpu" : "wasm"
        // Detect WebGPU
      });
      isInitialized = true;
      self.postMessage({ status: "init:complete" });
    } catch (error) {
      isInitialized = false;
      self.postMessage({ status: "init:error", error: error.message });
    }
  }
  if (type === "generate") {
    if (!isInitialized || !tts) {
      self.postMessage({ status: "generate:error", error: "TTS model not initialized" });
      return;
    }
    const { text, voice } = payload;
    self.postMessage({ status: "generate:start" });
    try {
      const rawAudio = await tts.generate(text, { voice });
      const blob = await rawAudio.toBlob();
      const blobUrl = URL.createObjectURL(blob);
      self.postMessage({ status: "generate:complete", audioUrl: blobUrl });
    } catch (error) {
      self.postMessage({ status: "generate:error", error: error.message });
    }
  }
  if (type === "status") {
    self.postMessage({ status: "status:check", initialized: isInitialized });
  }
};
//# sourceMappingURL=kokoro.worker-Rcpmmj56.js.map
