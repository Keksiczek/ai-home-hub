import { a as WEBUI_API_BASE_URL } from "./constants.js";
const getTerminalServers = async (token) => {
  const res = await fetch(`${WEBUI_API_BASE_URL}/terminals/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch(() => null);
  if (!res || !res.ok) return [];
  return res.json().catch(() => []);
};
const getTerminalConfig = async (baseUrl, apiKey) => {
  const url = `${baseUrl.replace(/\/$/, "")}/api/config`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
};
const getCwd = async (baseUrl, apiKey) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/cwd`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.cwd ?? null;
};
const listFiles = async (baseUrl, apiKey, path = "/") => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/list?directory=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    return null;
  });
  return res?.entries ?? null;
};
const readFile = async (baseUrl, apiKey, path) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/read?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch((err) => {
    return null;
  });
  if (!res || !res.ok) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.startsWith("image/") || contentType.startsWith("application/octet")) {
    return `[Binary file: ${contentType}]`;
  }
  const json = await res.json().catch(() => null);
  return json?.content ?? null;
};
const downloadFileBlob = async (baseUrl, apiKey, path) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/view?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const filename = path.split("/").pop() ?? "file";
  const blob = await res.blob();
  return { blob, filename };
};
const archiveFromTerminal = async (baseUrl, apiKey, paths) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/archive`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paths })
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "download.zip";
  const blob = await res.blob();
  return { blob, filename };
};
const uploadToTerminal = async (baseUrl, apiKey, directory, file) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/upload?directory=${encodeURIComponent(directory)}`;
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    return null;
  });
  return res;
};
const setCwd = async (baseUrl, apiKey, path) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/cwd`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ path })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    return null;
  });
  return res;
};
const moveEntry = async (baseUrl, apiKey, source, destination) => {
  const url = `${baseUrl.replace(/\/$/, "")}/files/move`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ source, destination })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    return { error: err?.detail ?? "Move failed" };
  });
  return res;
};
const getListeningPorts = async (baseUrl, apiKey) => {
  const url = `${baseUrl.replace(/\/$/, "")}/ports`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch(() => null);
  if (!res || !res.ok) return [];
  const json = await res.json().catch(() => null);
  return json?.ports ?? [];
};
const getPortProxyUrl = (baseUrl, port, path = "") => {
  return `${baseUrl.replace(/\/$/, "")}/proxy/${port}/${path}`;
};
export {
  getListeningPorts as a,
  getPortProxyUrl as b,
  getTerminalConfig as c,
  getCwd as d,
  archiveFromTerminal as e,
  downloadFileBlob as f,
  getTerminalServers as g,
  listFiles as l,
  moveEntry as m,
  readFile as r,
  setCwd as s,
  uploadToTerminal as u
};
//# sourceMappingURL=index9.js.map
