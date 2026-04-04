import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { f as fallback, d as attr_class, g as clsx, a as attr, b as bind_props } from "./root.js";
const createNewChannel = async (token = "", channel) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...channel })
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
const getChannels = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/`, {
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
const getChannelById = async (token = "", channel_id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}`, {
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
const getChannelMembersById = async (token, channel_id, query, orderBy, direction, page = 1) => {
  let error = null;
  let res = null;
  const searchParams = new URLSearchParams();
  searchParams.set("page", `${page}`);
  {
    searchParams.set("order_by", orderBy);
  }
  {
    searchParams.set("direction", direction);
  }
  res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/members?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  ).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const removeMembersById = async (token = "", channel_id, formData) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update/members/remove`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...formData })
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
const updateChannelById = async (token = "", channel_id, channel) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...channel })
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
const getChannelMessages = async (token = "", channel_id, skip = 0, limit = 50) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      }
    }
  ).then(async (res2) => {
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
const getChannelPinnedMessages = async (token = "", channel_id, page = 1) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/pinned?page=${page}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      }
    }
  ).then(async (res2) => {
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
const getChannelThreadMessages = async (token = "", channel_id, message_id, skip = 0, limit = 50) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/thread?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      }
    }
  ).then(async (res2) => {
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
const sendMessage = async (token = "", channel_id, message) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/post`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...message })
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
const pinMessage = async (token = "", channel_id, message_id, is_pinned) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/pin`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ is_pinned })
    }
  ).then(async (res2) => {
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
const updateMessage = async (token = "", channel_id, message_id, message) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/update`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...message })
    }
  ).then(async (res2) => {
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
const addReaction = async (token = "", channel_id, message_id, name) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/add`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    }
  ).then(async (res2) => {
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
const removeReaction = async (token = "", channel_id, message_id, name) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/remove`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    }
  ).then(async (res2) => {
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
const deleteMessage = async (token = "", channel_id, message_id) => {
  let error = null;
  const res = await fetch(
    `${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/delete`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      }
    }
  ).then(async (res2) => {
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
const getChannelWebhooks = async (token = "", channel_id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks`, {
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
function Lock($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12H17.4C17.7314 12 18 12.2686 18 12.6V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4V12.6C6 12.2686 6.26863 12 6.6 12H8M16 12V8C16 6.66667 15.2 4 12 4C8.8 4 8 6.66667 8 8V12M16 12H8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Hashtag($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 3L6 21" stroke-linecap="round"></path><path d="M20.5 16H2.5" stroke-linecap="round"></path><path d="M22 7H4" stroke-linecap="round"></path><path d="M18 3L14 21" stroke-linecap="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Users($$renderer, $$props) {
  let className = fallback($$props["className"], "size-3");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  Hashtag as H,
  Lock as L,
  Users as U,
  getChannels as a,
  addReaction as b,
  createNewChannel as c,
  updateMessage as d,
  deleteMessage as e,
  getChannelMembersById as f,
  getChannelWebhooks as g,
  removeMembersById as h,
  getChannelPinnedMessages as i,
  getChannelThreadMessages as j,
  getChannelById as k,
  getChannelMessages as l,
  pinMessage as p,
  removeReaction as r,
  sendMessage as s,
  updateChannelById as u
};
//# sourceMappingURL=Users.js.map
