import { W as WEBUI_BASE_URL } from "./constants.js";
import "./index3.js";
const getOpenAIModelsDirect = async (url, key) => {
  let error = null;
  const res = await fetch(`${url}/models`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...key && { authorization: `Bearer ${key}` }
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = `OpenAI: ${err?.error?.message ?? "Network Problem"}`;
    return [];
  });
  if (error) {
    throw error;
  }
  return res;
};
const generateOpenAIChatCompletion = async (token = "", body, url = `${WEBUI_BASE_URL}/api`) => {
  let error = null;
  const res = await fetch(`${url}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err?.detail ?? err;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getModels = async (token = "", connections = null, base = false, refresh = false) => {
  const searchParams = new URLSearchParams();
  if (refresh) {
    searchParams.append("refresh", "true");
  }
  let error = null;
  const res = await fetch(
    `${WEBUI_BASE_URL}/api/models${base ? "/base" : ""}?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...token && { authorization: `Bearer ${token}` }
      }
    }
  ).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    throw error;
  }
  let models = res?.data ?? [];
  if (connections && !base) {
    let localModels = [];
    if (connections) {
      const OPENAI_API_BASE_URLS = connections.OPENAI_API_BASE_URLS;
      const OPENAI_API_KEYS = connections.OPENAI_API_KEYS;
      const OPENAI_API_CONFIGS = connections.OPENAI_API_CONFIGS;
      const requests = [];
      for (const idx in OPENAI_API_BASE_URLS) {
        const url = OPENAI_API_BASE_URLS[idx];
        if (idx.toString() in OPENAI_API_CONFIGS) {
          const apiConfig = OPENAI_API_CONFIGS[idx.toString()] ?? {};
          const enable = apiConfig?.enable ?? true;
          const modelIds = apiConfig?.model_ids ?? [];
          if (enable) {
            if (modelIds.length > 0) {
              const modelList = {
                object: "list",
                data: modelIds.map((modelId) => ({
                  id: modelId,
                  name: modelId,
                  owned_by: "openai",
                  openai: { id: modelId },
                  urlIdx: idx
                }))
              };
              requests.push(
                (async () => {
                  return modelList;
                })()
              );
            } else {
              requests.push(
                (async () => {
                  return await getOpenAIModelsDirect(url, OPENAI_API_KEYS[idx]).then((res2) => {
                    return res2;
                  }).catch((err) => {
                    return {
                      object: "list",
                      data: [],
                      urlIdx: idx
                    };
                  });
                })()
              );
            }
          } else {
            requests.push(
              (async () => {
                return {
                  object: "list",
                  data: [],
                  urlIdx: idx
                };
              })()
            );
          }
        }
      }
      const responses = await Promise.all(requests);
      for (const idx in responses) {
        const response = responses[idx];
        const apiConfig = OPENAI_API_CONFIGS[idx.toString()] ?? {};
        let models2 = Array.isArray(response) ? response : response?.data ?? [];
        models2 = models2.map((model) => ({ ...model, openai: { id: model.id }, urlIdx: idx }));
        const prefixId = apiConfig.prefix_id;
        if (prefixId) {
          for (const model of models2) {
            model.id = `${prefixId}.${model.id}`;
          }
        }
        const tags = apiConfig.tags;
        if (tags) {
          for (const model of models2) {
            model.tags = tags;
          }
        }
        localModels = localModels.concat(models2);
      }
    }
    models = models.concat(
      localModels.map((model) => ({
        ...model,
        name: model?.name ?? model?.id,
        direct: true
      }))
    );
    const modelsMap = {};
    for (const model of models) {
      modelsMap[model.id] = model;
    }
    models = Object.values(modelsMap);
  }
  return models;
};
const chatAction = async (token, action_id, body) => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/chat/actions/${action_id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...token && { authorization: `Bearer ${token}` }
    },
    body: JSON.stringify(body)
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    if ("detail" in err) {
      error = err.detail;
    } else {
      error = err;
    }
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const stopTask = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/tasks/stop/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...token && { authorization: `Bearer ${token}` }
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    if ("detail" in err) {
      error = err.detail;
    } else {
      error = err;
    }
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getTaskIdsByChatId = async (token, chat_id) => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/tasks/chat/${chat_id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...token && { authorization: `Bearer ${token}` }
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    if ("detail" in err) {
      error = err.detail;
    } else {
      error = err;
    }
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const generateEmoji = async (token = "", model, prompt, chat_id) => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/v1/tasks/emoji/completions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model,
      prompt,
      ...chat_id && { chat_id }
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    if ("detail" in err) {
      error = err.detail;
    }
    return null;
  });
  if (error) {
    throw error;
  }
  const response = res?.choices[0]?.message?.content.replace(/["']/g, "") ?? null;
  if (response) {
    if (new RegExp("\\p{Extended_Pictographic}", "u").test(response)) {
      return response.match(new RegExp("\\p{Extended_Pictographic}", "gu"))[0];
    }
  }
  return null;
};
const generateMoACompletion = async (token = "", model, prompt, responses) => {
  const controller = new AbortController();
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/v1/tasks/moa/completions`, {
    signal: controller.signal,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model,
      prompt,
      responses,
      stream: true
    })
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    throw error;
  }
  return [res, controller];
};
const getUsage = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/usage`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...token && { Authorization: `Bearer ${token}` }
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getBackendConfig = async () => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/config`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    if (error instanceof TypeError) {
      try {
        const probeRes = await fetch(`${WEBUI_BASE_URL}/api/config`, {
          method: "GET",
          credentials: "include",
          redirect: "manual",
          headers: { "Content-Type": "application/json" }
        });
        if (probeRes.type === "opaqueredirect" || probeRes.status >= 300 && probeRes.status < 400) {
          throw { authRedirect: true };
        }
      } catch (probeErr) {
        if (probeErr?.authRedirect) throw probeErr;
      }
    }
    throw error;
  }
  return res;
};
const getChangelog = async () => {
  let error = null;
  const res = await fetch(`${WEBUI_BASE_URL}/api/changelog`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
export {
  getChangelog as a,
  getBackendConfig as b,
  generateEmoji as c,
  getTaskIdsByChatId as d,
  generateOpenAIChatCompletion as e,
  chatAction as f,
  getModels as g,
  generateMoACompletion as h,
  getUsage as i,
  stopTask as s
};
//# sourceMappingURL=index6.js.map
