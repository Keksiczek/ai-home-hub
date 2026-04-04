import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { I as splitStream } from "./index3.js";
const uploadFile = async (token, file, metadata, process) => {
  const data = new FormData();
  data.append("file", file);
  if (metadata) {
    data.append("metadata", JSON.stringify(metadata));
  }
  const searchParams = new URLSearchParams();
  if (process !== void 0 && process !== null) {
    searchParams.append("process", String(process));
  }
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/files/?${searchParams.toString()}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      authorization: `Bearer ${token}`
    },
    body: data
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail || err.message;
    return null;
  });
  if (error) {
    throw error;
  }
  if (res) {
    const status = await getFileProcessStatus(token, res.id);
    if (status && status.ok) {
      const reader = status.body.pipeThrough(new TextDecoderStream()).pipeThrough(splitStream("\n")).getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        try {
          let lines = value.split("\n");
          for (const line of lines) {
            if (line !== "") {
              /* @__PURE__ */ console.log(line);
              if (line === "data: [DONE]") {
                /* @__PURE__ */ console.log(line);
              } else {
                let data2 = JSON.parse(line.replace(/^data: /, ""));
                /* @__PURE__ */ console.log(data2);
                if (data2?.error) {
                  /* @__PURE__ */ console.error(data2.error);
                  res.error = data2.error;
                }
                if (res?.data) {
                  res.data = data2;
                }
              }
            }
          }
        } catch (error2) {
        }
      }
    }
  }
  if (error) {
    throw error;
  }
  return res;
};
const getFileProcessStatus = async (token, id) => {
  const queryParams = new URLSearchParams();
  queryParams.append("stream", "true");
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/files/${id}/process/status?${queryParams}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      authorization: `Bearer ${token}`
    }
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getFileById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/files/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getFileContentById = async (id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/files/${id}/content`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    credentials: "include"
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return await res2.arrayBuffer();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getKnowledgeById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const addFileToKnowledgeById = async (token, id, fileId) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/add`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      file_id: fileId
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
export {
  getFileById as a,
  getFileContentById as b,
  addFileToKnowledgeById as c,
  getKnowledgeById as g,
  uploadFile as u
};
//# sourceMappingURL=index11.js.map
