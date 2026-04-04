const APP_NAME = "Open WebUI";
const WEBUI_BASE_URL = ``;
const WEBUI_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1`;
const OLLAMA_API_BASE_URL = `${WEBUI_BASE_URL}/ollama`;
const AUDIO_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/audio`;
const RETRIEVAL_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/retrieval`;
const WEBUI_VERSION = "0.8.12";
const DEFAULT_CAPABILITIES = {
  file_context: true,
  vision: true,
  file_upload: true,
  web_search: true,
  image_generation: true,
  code_interpreter: true,
  citations: true,
  status_updates: true,
  usage: void 0,
  builtin_tools: true
};
export {
  AUDIO_API_BASE_URL as A,
  DEFAULT_CAPABILITIES as D,
  OLLAMA_API_BASE_URL as O,
  RETRIEVAL_API_BASE_URL as R,
  WEBUI_BASE_URL as W,
  WEBUI_API_BASE_URL as a,
  WEBUI_VERSION as b,
  APP_NAME as c
};
//# sourceMappingURL=constants.js.map
