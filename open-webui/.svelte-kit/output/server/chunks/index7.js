import { a as WEBUI_API_BASE_URL } from "./constants.js";
const getFunctions = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/`, {
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
const loadFunctionByUrl = async (token = "", url) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/load/url`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      url
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
const getFunctionValvesById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves`, {
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
const getFunctionValvesSpecById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/spec`, {
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
const getUserValvesById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user`, {
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
const getUserValvesSpecById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user/spec`, {
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
export {
  getUserValvesSpecById as a,
  getFunctionValvesById as b,
  getFunctionValvesSpecById as c,
  getFunctions as d,
  getUserValvesById as g,
  loadFunctionByUrl as l
};
//# sourceMappingURL=index7.js.map
