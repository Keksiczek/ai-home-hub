import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, o as getContext, k as escape_html, c as store_get, e as ensure_array_like, t as stringify, u as unsubscribe_stores, j as slot } from "./root.js";
import { t as tick } from "./index-server.js";
import { p as page } from "./stores.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { h as settings, c as config, m as models, u as user, y as terminalServers } from "./index2.js";
import { g as getModels, b as getBackendConfig } from "./index6.js";
import fileSaver from "file-saver";
import { a as copyToClipboard } from "./index3.js";
import "dompurify";
import "sortablejs";
import { S as Spinner } from "./Spinner.js";
import "./codemirror.js";
/* empty css                                     */
import "clsx";
import { marked } from "marked";
import { d as deleteAllModels, g as getBaseModels, u as updateModelById, c as createNewModel } from "./index8.js";
import { g as goto } from "./client.js";
import { B as Badge, u as updateUserSettings } from "./Badge.js";
import { C as Check, S as Search } from "./Check.js";
import { T as Tooltip } from "./Tooltip.js";
import { S as Switch_1 } from "./Switch.js";
import { a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL, D as DEFAULT_CAPABILITIES } from "./constants.js";
import "dayjs";
import { D as Dropdown } from "./Dropdown.js";
/* empty css                */
import "panzoom";
import "dayjs/locale/af.js";
import "dayjs/locale/am.js";
import "dayjs/locale/ar.js";
import "dayjs/locale/az.js";
import "dayjs/locale/be.js";
import "dayjs/locale/bg.js";
import "dayjs/locale/bi.js";
import "dayjs/locale/bm.js";
import "dayjs/locale/bn.js";
import "dayjs/locale/bo.js";
import "dayjs/locale/br.js";
import "dayjs/locale/bs.js";
import "dayjs/locale/ca.js";
import "dayjs/locale/cs.js";
import "dayjs/locale/cv.js";
import "dayjs/locale/cy.js";
import "dayjs/locale/da.js";
import "dayjs/locale/de.js";
import "dayjs/locale/dv.js";
import "dayjs/locale/el.js";
import "dayjs/locale/en.js";
import "dayjs/locale/eo.js";
import "dayjs/locale/es.js";
import "dayjs/locale/eu.js";
import "dayjs/locale/fa.js";
import "dayjs/locale/fi.js";
import "dayjs/locale/fo.js";
import "dayjs/locale/fr.js";
import "dayjs/locale/fy.js";
import "dayjs/locale/ga.js";
import "dayjs/locale/gd.js";
import "dayjs/locale/gl.js";
import "dayjs/locale/gu.js";
import "dayjs/locale/he.js";
import "dayjs/locale/hi.js";
import "dayjs/locale/hr.js";
import "dayjs/locale/ht.js";
import "dayjs/locale/hu.js";
import "dayjs/locale/id.js";
import "dayjs/locale/is.js";
import "dayjs/locale/it.js";
import "dayjs/locale/ja.js";
import "dayjs/locale/jv.js";
import "dayjs/locale/ka.js";
import "dayjs/locale/kk.js";
import "dayjs/locale/km.js";
import "dayjs/locale/kn.js";
import "dayjs/locale/ko.js";
import "dayjs/locale/ku.js";
import "dayjs/locale/ky.js";
import "dayjs/locale/lb.js";
import "dayjs/locale/lo.js";
import "dayjs/locale/lt.js";
import "dayjs/locale/lv.js";
import "dayjs/locale/me.js";
import "dayjs/locale/mi.js";
import "dayjs/locale/mk.js";
import "dayjs/locale/ml.js";
import "dayjs/locale/mn.js";
import "dayjs/locale/mr.js";
import "dayjs/locale/ms.js";
import "dayjs/locale/mt.js";
import "dayjs/locale/my.js";
import "dayjs/locale/nb.js";
import "dayjs/locale/ne.js";
import "dayjs/locale/nl.js";
import "dayjs/locale/nn.js";
import "dayjs/locale/pl.js";
import "dayjs/locale/pt.js";
import "dayjs/locale/ro.js";
import "dayjs/locale/ru.js";
import "dayjs/locale/rw.js";
import "dayjs/locale/sd.js";
import "dayjs/locale/se.js";
import "dayjs/locale/si.js";
import "dayjs/locale/sk.js";
import "dayjs/locale/sl.js";
import "dayjs/locale/sq.js";
import "dayjs/locale/sr.js";
import "dayjs/locale/ss.js";
import "dayjs/locale/sv.js";
import "dayjs/locale/sw.js";
import "dayjs/locale/ta.js";
import "dayjs/locale/te.js";
import "dayjs/locale/tet.js";
import "dayjs/locale/tg.js";
import "dayjs/locale/th.js";
import "dayjs/locale/tk.js";
import "dayjs/locale/tlh.js";
import "dayjs/locale/tr.js";
import "dayjs/locale/tzl.js";
import "dayjs/locale/tzm.js";
import "dayjs/locale/uk.js";
import "dayjs/locale/ur.js";
import "dayjs/locale/uz.js";
import "dayjs/locale/vi.js";
import "dayjs/locale/yo.js";
import "dayjs/locale/zh.js";
import "dayjs/locale/zh-tw.js";
import "dayjs/locale/et.js";
import "dayjs/locale/en-gb.js";
import "dayjs/plugin/duration.js";
import "dayjs/plugin/relativeTime.js";
import { D as DocumentDuplicate, a as CheckCircle } from "./CheckCircle.js";
/* empty css                                    */
/* empty css                                            */
import { P as Pagination_1 } from "./Pagination.js";
/* empty css                                            */
import { M as Modal, X as XMark } from "./Modal.js";
import { S as SensitiveInput, C as ConfirmDialog } from "./ConfirmDialog.js";
import { C as ChevronDown } from "./ChevronDown.js";
import { D as Download } from "./Download.js";
import { P as PinSlash, a as Pin } from "./Pin.js";
import { L as Link } from "./Link.js";
import { E as EllipsisHorizontal } from "./EllipsisHorizontal.js";
import { E as EyeSlash } from "./EyeSlash.js";
import { P as Plus } from "./Plus.js";
import { a as Tags, T as Textarea } from "./Textarea.js";
import "socket.io-client";
import { A as AccessControl } from "./AccessControl.js";
import { v4 } from "uuid";
import { g as getTerminalServers } from "./index9.js";
import { W as WrenchAlt, C as Cog6 } from "./WrenchAlt.js";
import { L as LockClosed, A as AccessControlModal } from "./LockClosed.js";
var TTS_RESPONSE_SPLIT = /* @__PURE__ */ ((TTS_RESPONSE_SPLIT2) => {
  TTS_RESPONSE_SPLIT2["PUNCTUATION"] = "punctuation";
  TTS_RESPONSE_SPLIT2["PARAGRAPHS"] = "paragraphs";
  TTS_RESPONSE_SPLIT2["NONE"] = "none";
  return TTS_RESPONSE_SPLIT2;
})(TTS_RESPONSE_SPLIT || {});
const setToolServerConnections = async (token, connections) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/configs/tool_servers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...connections
    })
  }).then(async (res2) => {
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
const setTerminalServerConnections = async (token, connections) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/configs/terminal_servers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...connections
    })
  }).then(async (res2) => {
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
const getModelsConfig = async (token) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/configs/models`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
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
function Minus($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function PencilSolid($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"${attr_class(clsx(className))}><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AddConnectionModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let ollama = fallback($$props["ollama"], false);
    let direct = fallback($$props["direct"], false);
    let connection = fallback($$props["connection"], null);
    let url = "";
    let key = "";
    let auth_type = "bearer";
    let connectionType = "external";
    let azure = false;
    let prefixId = "";
    let enable = true;
    let apiVersion = "";
    let apiType = "";
    let headers = "";
    let tags = [];
    let modelId = "";
    let modelIds = [];
    let loading = false;
    let showDeleteConfirmDialog = false;
    const init = () => {
      if (connection) {
        url = connection.url;
        key = connection.key;
        auth_type = connection.config.auth_type ?? "bearer";
        headers = connection.config?.headers ? JSON.stringify(connection.config.headers, null, 2) : "";
        enable = connection.config?.enable ?? true;
        tags = connection.config?.tags ?? [];
        prefixId = connection.config?.prefix_id ?? "";
        modelIds = connection.config?.model_ids ?? [];
        if (ollama) {
          connectionType = connection.config?.connection_type ?? "local";
        } else {
          connectionType = connection.config?.connection_type ?? "external";
          azure = connection.config?.azure ?? false;
          apiVersion = connection.config?.api_version ?? "";
          apiType = connection.config?.api_type ?? "";
        }
      }
    };
    azure = (url.includes("azure.") || url.includes("cognitive.microsoft.com")) && !direct ? true : false;
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-1.5"><h1 class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Connection"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Connection"))}`);
          }
          $$renderer4.push(`<!--]--></h1> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close modal"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1">`);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex gap-2"><div class="flex w-full justify-between items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connection Type"))}</div> <div><button type="button" class="text-xs text-gray-700 dark:text-gray-300">`);
            if (connectionType === "local") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Local"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("External"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-1.5"><div class="flex flex-col w-full"><label for="url-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</label> <div class="flex-1"><input id="url-input"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", url)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Base URL"))} autocomplete="off"${attr("list", ollama ? void 0 : "suggestions")} required=""/> `);
          if (!ollama) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<datalist id="suggestions">`);
            $$renderer4.option({ value: "https://api.openai.com/v1" }, ($$renderer5) => {
            });
            $$renderer4.option({ value: "https://api.anthropic.com/v1" }, ($$renderer5) => {
            });
            $$renderer4.option(
              {
                value: "https://generativelanguage.googleapis.com/v1beta/openai"
              },
              ($$renderer5) => {
              }
            );
            $$renderer4.option({ value: "https://api.mistral.ai/v1" }, ($$renderer5) => {
            });
            $$renderer4.option({ value: "https://api.groq.com/openai/v1" }, ($$renderer5) => {
            });
            $$renderer4.option({ value: "https://openrouter.ai/api/v1" }, ($$renderer5) => {
            });
            $$renderer4.option({ value: "https://api.x.ai/v1" }, ($$renderer5) => {
            });
            $$renderer4.push(`</datalist>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div> `);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"),
            className: "self-end -mb-1",
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition" type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="w-4 h-4"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <div class="flex flex-col shrink-0 self-end"><label class="sr-only" for="toggle-connection">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Toggle whether current connection is active."))}</label> `);
          Tooltip($$renderer4, {
            content: enable ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
            children: ($$renderer5) => {
              Switch_1($$renderer5, {
                id: "toggle-connection",
                get state() {
                  return enable;
                },
                set state($$value) {
                  enable = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="select-bearer-or-session"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Auth"))}</label> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
          $$renderer4.select(
            {
              id: "select-bearer-or-session",
              class: `dark:bg-gray-900 w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
              value: auth_type
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "none" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
              });
              $$renderer5.option({ value: "bearer" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Bearer"))}`);
              });
              if (!ollama) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.option({ value: "session" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Session"))}`);
                });
                $$renderer5.push(` `);
                if (!direct) {
                  $$renderer5.push("<!--[0-->");
                  $$renderer5.option({ value: "system_oauth" }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth"))}`);
                  });
                  $$renderer5.push(` `);
                  if (azure) {
                    $$renderer5.push("<!--[0-->");
                    $$renderer5.option({ value: "microsoft_entra_id" }, ($$renderer6) => {
                      $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Entra ID"))}`);
                    });
                  } else {
                    $$renderer5.push("<!--[-1-->");
                  }
                  $$renderer5.push(`<!--]-->`);
                } else {
                  $$renderer5.push("<!--[-1-->");
                }
                $$renderer5.push(`<!--]-->`);
              } else {
                $$renderer5.push("<!--[-1-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
          if (auth_type === "bearer") {
            $$renderer4.push("<!--[0-->");
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("API Key"),
              required: false,
              get value() {
                return key;
              },
              set value($$value) {
                key = $$value;
                $$settled = false;
              }
            });
          } else if (auth_type === "none") {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No authentication"))}</div>`);
          } else if (auth_type === "session") {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user session credentials to authenticate"))}</div>`);
          } else if (auth_type === "system_oauth") {
            $$renderer4.push("<!--[3-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user OAuth access token to authenticate"))}</div>`);
          } else if (["azure_ad", "microsoft_entra_id"].includes(auth_type)) {
            $$renderer4.push("<!--[4-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uses DefaultAzureCredential to authenticate"))}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div></div></div> `);
          if (!ollama && !direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="headers-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Headers"))}</label> <div class="flex-1">`);
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t('Enter additional headers in JSON format (e.g. {"X-Custom-Header": "value"}'),
              children: ($$renderer5) => {
                Textarea($$renderer5, {
                  className: "w-full text-sm outline-hidden",
                  placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter additional headers in JSON format"),
                  required: false,
                  minSize: 30,
                  get value() {
                    return headers;
                  },
                  set value($$value) {
                    headers = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="prefix-id-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID"))}</label> <div class="flex-1">`);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID is used to avoid conflicts with other connections by adding a prefix to the model IDs - leave empty to disable"),
            children: ($$renderer5) => {
              $$renderer5.push(`<input${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text" id="prefix-id-input"${attr("value", prefixId)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID"))} autocomplete="off"/>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div></div> `);
          if (!ollama && !direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-row justify-between items-center w-full mt-2"><label for="prefix-id-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Provider Type"))}</label> <div><button type="button" class="text-xs text-gray-700 dark:text-gray-300">${escape_html(azure ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure OpenAI") : store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}</button></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (azure) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="api-version-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("API Version"))}</label> <div class="flex-1"><input id="api-version-input"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", apiVersion)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Version"))} autocomplete="off" required=""/></div></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (!ollama && !direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-row justify-between items-center w-full mt-1"><label for="api-type-toggle"${attr_class(`mb-0.5 text-xs text-gray-500
							${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("API Type"))}</label> <div><button type="button" id="api-type-toggle" class="text-xs text-gray-700 dark:text-gray-300">`);
            if (apiType === "responses") {
              $$renderer4.push("<!--[0-->");
              Tooltip($$renderer4, {
                className: "flex items-center gap-1",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This feature is currently experimental and may not work as expected."),
                children: ($$renderer5) => {
                  $$renderer5.push(`<span class="text-gray-400 dark:text-gray-600">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Experimental"))}</span> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Responses"))}`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat Completions"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex flex-col w-full mt-2"><div class="mb-1 flex justify-between"><div${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model IDs"))}</div></div> `);
          if (modelIds.length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<ul class="flex flex-col"><!--[-->`);
            const each_array = ensure_array_like(modelIds);
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let modelId2 = each_array[modelIdx];
              $$renderer4.push(`<li class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(modelId2)}</div> <div class="shrink-0"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t(`Remove {{MODELID}} from list.`, { MODELID: modelId2 }))} type="button">`);
              Minus($$renderer4, { strokeWidth: "2", className: "size-3.5" });
              $$renderer4.push(`<!----></button></div></li>`);
            }
            $$renderer4.push(`<!--]--></ul>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div${attr_class(`text-gray-500 text-xs text-center py-2 px-10
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>`);
            if (ollama) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('Leave empty to include all models from "{{url}}/api/tags" endpoint', { url }))}`);
            } else if (azure) {
              $$renderer4.push("<!--[1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Deployment names are required for Azure OpenAI"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('Leave empty to include all models from "{{url}}/models" endpoint', { url }))}`);
            }
            $$renderer4.push(`<!--]--></div>`);
          }
          $$renderer4.push(`<!--]--></div> <div class="flex items-center"><label class="sr-only" for="add-model-id-input">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add a model ID"))}</label> <input${attr_class(`w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:placeholder:text-gray-100 placeholder:text-gray-700" : "placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden")}`)}${attr("value", modelId)} id="add-model-id-input"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add a model ID"))}/> <div><button type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}>`);
          Plus($$renderer4, { className: "size-3.5", strokeWidth: "2" });
          $$renderer4.push(`<!----></button></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tags"))}</div> <div class="flex-1 mt-0.5">`);
          Tags($$renderer4, {
            get tags() {
              return tags;
            },
            set tags($$value) {
              tags = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div></div> <div class="flex justify-between items-center pt-3 text-sm font-medium"><div>`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="px-1 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to delete this connection? This action cannot be undone."),
        confirmLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, onDelete, show, edit, ollama, direct, connection });
  });
}
function AddToolServerModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let direct = fallback($$props["direct"], false);
    let connection = fallback($$props["connection"], null);
    let type = "openapi";
    let url = "";
    let auth_type = "bearer";
    let key = "";
    let functionNameFilterList = "";
    let accessGrants = [];
    let id = "";
    let name = "";
    let description = "";
    let oauthClientInfo = null;
    let oauthClientId = "";
    let oauthClientSecret = "";
    let enable = true;
    let loading = false;
    let showAccessControlModal = false;
    let showDeleteConfirmDialog = false;
    const init = () => {
      if (connection) {
        type = connection?.type ?? "openapi";
        url = connection.url;
        connection?.spec_type ?? "url";
        connection?.spec ?? "";
        connection?.path ?? "openapi.json";
        auth_type = connection?.auth_type ?? "bearer";
        connection?.headers ? JSON.stringify(connection.headers, null, 2) : "";
        key = connection?.key ?? "";
        id = connection.info?.id ?? "";
        name = connection.info?.name ?? "";
        description = connection.info?.description ?? "";
        oauthClientInfo = connection.info?.oauth_client_info ?? null;
        oauthClientId = connection.info?.oauth_client_id ?? "";
        oauthClientSecret = connection.info?.oauth_client_secret ?? "";
        enable = connection.config?.enable ?? true;
        functionNameFilterList = connection.config?.function_name_filter_list ?? "";
        accessGrants = connection.config?.access_grants ?? [];
      }
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><h1 class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Connection"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Connection"))}`);
          }
          $$renderer4.push(`<!--]--></h1> <div class="flex items-center gap-3"><div class="flex gap-1.5 text-xs justify-end"><button class="hover:underline" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))}</button> <button class="hover:underline" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</button></div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Configure Connection Modal"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><input type="file" hidden="" accept=".json"/> <form class="flex flex-col w-full"><div class="px-1"><div class="flex gap-2 mb-1.5"><div class="flex w-full justify-between items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Type"))}</div> <div>`);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button type="button" class="text-xs text-gray-700 dark:text-gray-300">`);
            if (["", "openapi"].includes(type)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI"))}`);
            } else if (type === "mcp") {
              $$renderer4.push("<!--[1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP"))} <span class="text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Streamable HTTP"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="text-xs text-gray-700 dark:text-gray-300">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI"))}</div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div> <div class="flex gap-2"><div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><label for="enter-name"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</label></div> <div class="flex flex-1 items-center"><input id="enter-name"${attr_class(`w-full flex-1 text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter name"))} autocomplete="off"/></div></div> `);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><label for="enter-id"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ID"))} `);
            if (type !== "mcp") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="opacity-50">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("optional"))})</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></label></div> <div class="flex flex-1 items-center"><input id="enter-id"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", id)} placeholder="auto" autocomplete="off"${attr("required", type === "mcp", true)}/></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex flex-col w-full mt-1 mb-1.5"><label for="description"${attr_class(`mb-0.5 text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Description"))}</label> <div class="flex-1"><input id="description"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", description)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter description"))} autocomplete="off"/></div></div> <div class="flex gap-2"><div class="flex flex-col w-full"><div class="flex justify-between mb-0.5"><label for="api-base-url"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</label></div> <div class="flex flex-1 items-center"><input id="api-base-url"${attr_class(`w-full flex-1 text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", url)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Base URL"))} autocomplete="off" required=""/> `);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"),
            className: "shrink-0 flex items-center mr-1",
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"))} type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Tooltip($$renderer4, {
            content: enable ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
            children: ($$renderer5) => {
              Switch_1($$renderer5, {
                get state() {
                  return enable;
                },
                set state($$value) {
                  enable = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between items-center"><div class="flex gap-2 items-center"><div for="select-bearer-or-session"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Auth"))}</div></div> `);
          if (["oauth_2.1", "oauth_2.1_static"].includes(auth_type)) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex items-center gap-2"><div class="flex flex-col justify-end items-center shrink-0">`);
            Tooltip($$renderer4, {
              content: oauthClientInfo ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Again") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Client"),
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="text-xs underline dark:text-gray-500 dark:hover:text-gray-200 text-gray-700 hover:text-gray-900 transition" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Client"))}</button>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div> `);
            if (!oauthClientInfo) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="text-xs font-medium px-1.5 rounded-md bg-yellow-500/20 text-yellow-700 dark:text-yellow-200">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Not Registered"))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<div class="text-xs font-medium px-1.5 rounded-md bg-green-500/20 text-green-700 dark:text-green-200">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Registered"))}</div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
          $$renderer4.select(
            {
              id: "select-bearer-or-session",
              class: `dark:bg-gray-900 w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
              value: auth_type
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "none" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
              });
              $$renderer5.option({ value: "bearer" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Bearer"))}`);
              });
              $$renderer5.option({ value: "session" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Session"))}`);
              });
              if (!direct) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.option({ value: "system_oauth" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth"))}`);
                });
                $$renderer5.push(` `);
                if (type === "mcp") {
                  $$renderer5.push("<!--[0-->");
                  $$renderer5.option({ value: "oauth_2.1" }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth 2.1"))}`);
                  });
                  $$renderer5.push(` `);
                  $$renderer5.option({ value: "oauth_2.1_static" }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth 2.1 (Static)"))}`);
                  });
                } else {
                  $$renderer5.push("<!--[-1-->");
                }
                $$renderer5.push(`<!--]-->`);
              } else {
                $$renderer5.push("<!--[-1-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
          if (auth_type === "bearer") {
            $$renderer4.push("<!--[0-->");
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("API Key"),
              required: false,
              get value() {
                return key;
              },
              set value($$value) {
                key = $$value;
                $$settled = false;
              }
            });
          } else if (auth_type === "none") {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No authentication"))}</div>`);
          } else if (auth_type === "session") {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user session credentials to authenticate"))}</div>`);
          } else if (auth_type === "system_oauth") {
            $$renderer4.push("<!--[3-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user OAuth access token to authenticate"))}</div>`);
          } else if (auth_type === "oauth_2.1") {
            $$renderer4.push("<!--[4-->");
            $$renderer4.push(`<div${attr_class(`flex items-center text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uses OAuth 2.1 Dynamic Client Registration"))}</div>`);
          } else if (auth_type === "oauth_2.1_static") {
            $$renderer4.push("<!--[5-->");
            $$renderer4.push(`<div class="flex flex-col gap-1.5 w-full mt-0.5">`);
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Client ID"),
              required: false,
              get value() {
                return oauthClientId;
              },
              set value($$value) {
                oauthClientId = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Client Secret"),
              required: false,
              get value() {
                return oauthClientSecret;
              },
              set value($$value) {
                oauthClientSecret = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div></div></div> <div class="flex items-center justify-between"><button type="button" class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition mt-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`w-3 h-3 transition-transform ${stringify("")}`)}><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Advanced"))}</button> `);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2 py-1 object-cover rounded-full flex gap-1 items-center mt-2" type="button">`);
            LockClosed($$renderer4, { strokeWidth: "2.5", className: "size-3.5 shrink-0" });
            $$renderer4.push(`<!----> <div class="text-xs font-medium shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</div></button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<hr class="border-gray-100/50 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex flex-col w-full mt-2"><label for="function-name-filter-list"${attr_class(`mb-1 text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100 placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Function Name Filter List"))}</label> <div class="flex-1"><input id="function-name-filter-list"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", functionNameFilterList)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter function name filter list (e.g. func1, !func2)"))} autocomplete="off"/></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> `);
          if (type === "mcp") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="bg-yellow-500/20 text-yellow-700 dark:text-yellow-200 rounded-2xl text-xs px-4 py-3 mb-2 mt-1"><span class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Warning"))}:</span> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP support is experimental and its specification changes often, which can lead to incompatibilities. OpenAPI specification support is directly maintained by the Open WebUI team, making it the more reliable option for compatibility."))} <a class="font-medium underline" href="https://docs.openwebui.com/features/mcp" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Read more →"))}</a></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex justify-between items-center pt-3 text-sm font-medium"><div>`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="px-1 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      AccessControlModal($$renderer3, {
        get show() {
          return showAccessControlModal;
        },
        set show($$value) {
          showAccessControlModal = $$value;
          $$settled = false;
        },
        get accessGrants() {
          return accessGrants;
        },
        set accessGrants($$value) {
          accessGrants = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to delete this connection? This action cannot be undone."),
        confirmLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, onDelete, show, edit, direct, connection });
  });
}
function Connection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let connection = fallback($$props["connection"], null);
    let direct = fallback($$props["direct"], false);
    let showConfigModal = false;
    let showDeleteConfirmDialog = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddToolServerModal($$renderer3, {
        edit: true,
        direct,
        connection,
        onDelete: () => {
          showDeleteConfirmDialog = true;
        },
        onSubmit: (c) => {
          connection = c;
          onSubmit(c);
        },
        get show() {
          return showConfigModal;
        },
        set show($$value) {
          showConfigModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex w-full gap-2 items-center">`);
      Tooltip($$renderer3, {
        className: "w-full relative",
        content: "",
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full"><div${attr_class(`flex-1 relative flex gap-1.5 items-center ${stringify(!(connection?.config?.enable ?? true) ? "opacity-50" : "")}`)}>`);
          Tooltip($$renderer4, {
            content: connection?.type === "mcp" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP") : store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI"),
            children: ($$renderer5) => {
              WrenchAlt($$renderer5, {});
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          if (connection?.info?.name) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="capitalize outline-hidden w-full bg-transparent">${escape_html(connection?.info?.name ?? connection?.url)} <span class="text-gray-500">${escape_html(connection?.info?.id ?? "")}</span></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div>${escape_html(connection?.url)}</div>`);
          }
          $$renderer4.push(`<!--]--></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> <div class="flex gap-1 items-center">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Configure"),
        className: "self-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition" type="button">`);
          Cog6($$renderer4, {});
          $$renderer4.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Tooltip($$renderer3, {
        content: connection?.config?.enable ?? true ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
        children: ($$renderer4) => {
          Switch_1($$renderer4, { state: connection?.config?.enable ?? true });
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onDelete, onSubmit, connection, direct });
  });
}
function AddTerminalServerModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let direct = fallback($$props["direct"], false);
    let connection = fallback($$props["connection"], null);
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let url = "";
    let key = "";
    let name = "";
    let id = "";
    let auth_type = "bearer";
    let showAccessControlModal = false;
    let showDeleteConfirmDialog = false;
    let accessGrants = [];
    let serverType = null;
    let verifying = false;
    let policyId = "";
    let policyImage = "";
    let policyEnvPairs = [];
    let policyCpu = "1";
    let policyMemory = "1Gi";
    let policyStorage = "ephemeral";
    let policyStorageSize = "5Gi";
    let policyIdleTimeout = 30;
    const init = () => {
      if (connection) {
        id = connection?.id ?? "";
        url = connection.url;
        key = connection?.key ?? "";
        name = connection?.name ?? "";
        auth_type = connection?.auth_type ?? "bearer";
        connection?.path ?? "/openapi.json";
        connection?.enabled ?? true;
        accessGrants = connection?.config?.access_grants ?? [];
        serverType = connection?.server_type ?? null;
        policyId = connection?.policy_id ?? "";
        const p = connection?.policy ?? {};
        policyImage = p.image ?? "";
        policyIdleTimeout = p.idle_timeout_minutes ?? 30;
        policyStorage = p.storage ? "persistent" : "ephemeral";
        policyStorageSize = p.storage ?? "5Gi";
        const env = p.env ?? {};
        policyEnvPairs = Object.entries(env).map(([k, v]) => ({ key: k, value: v }));
        policyCpu = p.cpu_limit ?? "1";
        policyMemory = p.memory_limit ?? "1Gi";
      } else {
        id = "";
        url = "";
        key = "";
        name = "";
        auth_type = "bearer";
        accessGrants = [];
        serverType = null;
        policyId = "";
        policyImage = "";
        policyEnvPairs = [];
        policyCpu = "1";
        policyMemory = "1Gi";
        policyStorage = "ephemeral";
        policyStorageSize = "5Gi";
        policyIdleTimeout = 30;
      }
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><h1 class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Terminal Connection"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Terminal Connection"))}`);
          }
          $$renderer4.push(`<!--]--></h1> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1"><div class="flex gap-2"><div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><label for="terminal-name"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</label></div> <div class="flex flex-1 items-center"><input id="terminal-name"${attr_class(`w-full flex-1 text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("My Terminal"))} autocomplete="off"/></div></div> `);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><label for="terminal-id"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ID"))} <span class="opacity-50">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("optional"))})</span></label></div> <div class="flex flex-1 items-center"><input id="terminal-id"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", id)} placeholder="auto" autocomplete="off"/></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between mb-0.5"><label for="terminal-url"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</label></div> <div class="flex flex-1 items-center"><input id="terminal-url"${attr_class(`w-full flex-1 text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", url)} placeholder="http://localhost:9900" required="" autocomplete="off"/></div></div> `);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"),
            className: "self-end -mb-1",
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition" type="button"${attr("disabled", verifying, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"))}>`);
              {
                $$renderer5.push("<!--[-1-->");
                $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="w-4 h-4"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"></path></svg>`);
              }
              $$renderer5.push(`<!--]--></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div> `);
          if (serverType === "orchestrator" && !direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Policy ID"))}</div></div> <div class="flex flex-1 items-center"><input id="policy-id"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", policyId)} placeholder="python-ds" autocomplete="off"${attr("disabled", edit && !!connection?.policy_id, true)}/></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Image"))} <span class="opacity-50">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("optional"))})</span></div></div> <div class="flex flex-1 items-center"><input id="policy-image"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", policyImage)} placeholder="ghcr.io/open-webui/open-terminal:latest" autocomplete="off"/></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("CPU"))}</div></div> <div class="flex flex-1 items-center"><input id="policy-cpu"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", policyCpu)} placeholder="1" autocomplete="off"/></div></div> <div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Memory"))}</div></div> <div class="flex flex-1 items-center"><input id="policy-memory"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", policyMemory)} placeholder="1Gi" autocomplete="off"/></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Storage"))}</div></div> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
            $$renderer4.select(
              {
                class: `dark:bg-gray-900 w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
                value: policyStorage
              },
              ($$renderer5) => {
                $$renderer5.option({ value: "ephemeral" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ephemeral"))}`);
                });
                $$renderer5.option({ value: "persistent" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Persistent"))}`);
                });
              }
            );
            $$renderer4.push(`</div> `);
            if (policyStorage === "persistent") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex flex-1 items-center"><input id="policy-storage-size"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", policyStorageSize)} placeholder="5Gi" autocomplete="off"/></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div></div> <div class="flex flex-col flex-1"><div class="flex justify-between mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Idle Timeout"))} <span class="opacity-50">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("min"))})</span></div></div> <div class="flex flex-1 items-center"><input id="idle-timeout"${attr_class(`w-full flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="number" min="0"${attr("value", policyIdleTimeout)} placeholder="30" autocomplete="off"/></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between items-center mb-0.5"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Environment Variables"))}</div> <button type="button" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">+ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}</button></div> <!--[-->`);
            const each_array = ensure_array_like(policyEnvPairs);
            for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
              let pair = each_array[idx];
              $$renderer4.push(`<div class="flex gap-1.5 mb-1"><input${attr_class(`flex-1 text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", pair.key)} placeholder="KEY"/> <input${attr_class(`flex-[2] text-sm bg-transparent font-mono ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", pair.value)} placeholder="value"/> <button type="button" class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition px-1">`);
              XMark($$renderer4, { className: "size-3" });
              $$renderer4.push(`<!----></button></div>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex items-center justify-between"><button type="button" class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition mt-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`w-3 h-3 transition-transform ${stringify("")}`)}><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Advanced"))}</button> `);
          if (!direct) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2 py-1 object-cover rounded-full flex gap-1 items-center mt-2" type="button">`);
            LockClosed($$renderer4, { strokeWidth: "2.5", className: "size-3.5 shrink-0" });
            $$renderer4.push(`<!----> <div class="text-xs font-medium shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</div></button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between items-center"><div class="flex gap-2 items-center"><div${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Auth"))}</div></div></div> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
          $$renderer4.select(
            {
              class: `dark:bg-gray-900 w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
              value: auth_type
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "none" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
              });
              $$renderer5.option({ value: "bearer" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Bearer"))}`);
              });
              if (!direct) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.option({ value: "session" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Session"))}`);
                });
                $$renderer5.push(` `);
                $$renderer5.option({ value: "system_oauth" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth"))}`);
                });
              } else {
                $$renderer5.push("<!--[-1-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
          if (auth_type === "bearer") {
            $$renderer4.push("<!--[0-->");
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("API Key"),
              required: false,
              get value() {
                return key;
              },
              set value($$value) {
                key = $$value;
                $$settled = false;
              }
            });
          } else if (auth_type === "none") {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No authentication"))}</div>`);
          } else if (auth_type === "session") {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user session credentials to authenticate"))}</div>`);
          } else if (auth_type === "system_oauth") {
            $$renderer4.push("<!--[3-->");
            $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user OAuth access token to authenticate"))}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div></div></div> <div class="flex justify-between items-center pt-3 text-sm font-medium"><div>`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="px-1 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      AccessControlModal($$renderer3, {
        get show() {
          return showAccessControlModal;
        },
        set show($$value) {
          showAccessControlModal = $$value;
          $$settled = false;
        },
        get accessGrants() {
          return accessGrants;
        },
        set accessGrants($$value) {
          accessGrants = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to delete this connection? This action cannot be undone."),
        confirmLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, edit, direct, connection, onSubmit, onDelete });
  });
}
function Cloud($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4C6 4 6 8 6 10C4.33333 10 1 11 1 15C1 19 4.33333 20 6 20H18C19.6667 20 23 19 23 15C23 11 19.6667 10 18 10C18 8 18 4 12 4Z" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AdjustmentsHorizontal($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="currentColor"${attr_class(clsx(className))}${attr("stroke-width", strokeWidth)}><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Select($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedLabel;
    let value = fallback($$props["value"], "");
    let items = fallback($$props["items"], () => [], true);
    let placeholder = fallback($$props["placeholder"], "");
    let onChange = fallback($$props["onChange"], () => {
    });
    let triggerClass = fallback($$props["triggerClass"], "");
    let labelClass = fallback($$props["labelClass"], "");
    let contentClass = fallback($$props["contentClass"], "rounded-2xl min-w-[170px] p-1 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850 dark:text-white shadow-lg");
    let itemClass = fallback($$props["itemClass"], "flex w-full gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl");
    let align = fallback($$props["align"], "start");
    let onClose = fallback($$props["onClose"], () => {
    });
    let open = fallback($$props["open"], false);
    function selectItem(item) {
      value = item.value;
      open = false;
      onChange(value);
    }
    selectedLabel = items.find((i) => i.value === value)?.label ?? placeholder;
    $$renderer2.push(`<button${attr_class(clsx(triggerClass))}${attr("aria-label", placeholder)} type="button"><!--[-->`);
    slot($$renderer2, $$props, "trigger", { selectedLabel, open }, () => {
      $$renderer2.push(`<span${attr_class(clsx(labelClass))}>${escape_html(selectedLabel)}</span>`);
    });
    $$renderer2.push(`<!--]--></button> `);
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(clsx(contentClass))}><!--[-->`);
      slot($$renderer2, $$props, "default", { open, selectItem }, () => {
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer2.push(`<button${attr_class(clsx(itemClass))} type="button"><!--[-->`);
          slot($$renderer2, $$props, "item", { item, selected: value === item.value }, () => {
            $$renderer2.push(`${escape_html(item.label)}`);
          });
          $$renderer2.push(`<!--]--></button>`);
        }
        $$renderer2.push(`<!--]-->`);
      });
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      value,
      items,
      placeholder,
      onChange,
      triggerClass,
      labelClass,
      contentClass,
      itemClass,
      align,
      onClose,
      open,
      selectItem
    });
  });
}
function Database($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    $$renderer2.push(`<div class="flex flex-col h-full justify-between text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full"><input id="config-json-input" hidden="" type="file" accept=".json"/> <div><div class="mb-1 text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Config"))}</div> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import Config"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))}</span></button></div></div> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export Config"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</span></button></div></div></div> `);
    if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_admin_export ?? true) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div><div class="mb-1 text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Database"))}</div> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download Database"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}</span></button></div></div> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export All Chats (All Users)"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</span></button></div></div> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export Users"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</span></button></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function General($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Pipelines($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex justify-center h-full"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { saveHandler });
  });
}
function Audio($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let TTS_ENGINE = "";
    let TTS_VOICE = "";
    let TTS_SPLIT_ON = TTS_RESPONSE_SPLIT.PUNCTUATION;
    let STT_ENGINE = "";
    let STT_SUPPORTED_CONTENT_TYPES = "";
    let STT_WHISPER_MODEL = "";
    let STT_WHISPER_MODEL_LOADING = false;
    let voices = [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full"><div class="flex flex-col gap-3"><div><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Speech-to-Text"))}</div> <hr class="border-gray-100/30 dark:border-gray-850/30 my-2"/> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="mb-2"><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Supported MIME Types"))}</div> <div class="flex w-full"><div class="flex-1"><input class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"${attr("value", STT_SUPPORTED_CONTENT_TYPES)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g., audio/wav,audio/mpeg,video/* (leave blank for defaults)"))}/></div></div></div>`);
      }
      $$renderer3.push(`<!--]--> <div class="mb-2 py-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Speech-to-Text Engine"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "cursor-pointer w-fit pr-8 rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          value: STT_ENGINE,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select an engine")
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Whisper (Local)"))}`);
          });
          $$renderer4.option({ value: "openai" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}`);
          });
          $$renderer4.option({ value: "web" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Web API"))}`);
          });
          $$renderer4.option({ value: "deepgram" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Deepgram"))}`);
          });
          $$renderer4.option({ value: "azure" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure AI Speech"))}`);
          });
          $$renderer4.option({ value: "mistral" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MistralAI"))}`);
          });
        }
      );
      $$renderer3.push(`</div></div> `);
      {
        $$renderer3.push("<!--[4-->");
        $$renderer3.push(`<div><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("STT Model"))}</div> <div class="flex w-full"><div class="flex-1 mr-2"><input class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Set whisper model"))}${attr("value", STT_WHISPER_MODEL)}/></div> <button class="px-2.5 bg-gray-50 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-100 rounded-lg transition"${attr("disabled", STT_WHISPER_MODEL_LOADING, true)}>`);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z"></path><path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z"></path></svg>`);
        }
        $$renderer3.push(`<!--]--></button></div> <div class="mt-2 mb-1 text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Open WebUI uses faster-whisper internally.`))} <a class="hover:underline dark:text-gray-200 text-gray-800" href="https://github.com/SYSTRAN/faster-whisper" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Click here to learn more about faster-whisper and see the available models.`))}</a></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Text-to-Speech"))}</div> <hr class="border-gray-100/30 dark:border-gray-850/30 my-2"/> <div class="mb-2 py-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Text-to-Speech Engine"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "w-fit pr-8 cursor-pointer rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          value: TTS_ENGINE,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a mode")
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Web API"))}`);
          });
          $$renderer4.option({ value: "transformers" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Transformers"))} (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Local"))})`);
          });
          $$renderer4.option({ value: "openai" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}`);
          });
          $$renderer4.option({ value: "elevenlabs" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ElevenLabs"))}`);
          });
          $$renderer4.option({ value: "azure" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure AI Speech"))}`);
          });
        }
      );
      $$renderer3.push(`</div></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="mb-2">`);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("TTS Voice"))}</div> <div class="flex w-full"><div class="flex-1">`);
        $$renderer3.select(
          {
            class: "w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden",
            value: TTS_VOICE
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "", selected: TTS_VOICE !== "" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}`);
            });
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(voices);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let voice = each_array[$$index];
              $$renderer4.option(
                {
                  value: voice.voiceURI,
                  class: "bg-gray-100 dark:bg-gray-700",
                  selected: TTS_VOICE === voice.voiceURI
                },
                ($$renderer5) => {
                  $$renderer5.push(`${escape_html(voice.name)}`);
                }
              );
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(`</div></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="pt-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Response splitting"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "w-fit pr-8 cursor-pointer rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Select how to split message text for TTS requests"),
          value: TTS_SPLIT_ON
        },
        ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array_6 = ensure_array_like(Object.values(TTS_RESPONSE_SPLIT));
          for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
            let split = each_array_6[$$index_6];
            $$renderer4.option({ value: split }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(split.charAt(0).toUpperCase() + split.slice(1)))}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div></div> <div class="mt-2 mb-1 text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Control how message text is split for TTS requests. 'Punctuation' splits into sentences, 'paragraphs' splits into paragraphs, and 'none' keeps the message as a single string."))}</div></div></div></div> <div class="flex justify-end text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Images($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let loading = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden pr-2">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Interface($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="h-full w-full flex justify-center items-center">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function ModelSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let title = fallback($$props["title"], "");
    let tooltip = fallback($$props["tooltip"], "");
    let models2 = fallback($$props["models"], () => [], true);
    let modelIds = fallback($$props["modelIds"], () => [], true);
    let selectedModelId = "";
    $$renderer2.push(`<div><div class="flex flex-col w-full"><div class="mb-1 flex justify-between"><div class="text-xs text-gray-500 flex items-center gap-1">${escape_html(title)} `);
    if (tooltip) {
      $$renderer2.push("<!--[0-->");
      Tooltip($$renderer2, {
        content: tooltip,
        className: "cursor-help",
        children: ($$renderer3) => {
          $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></svg>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex items-center -mr-1">`);
    $$renderer2.select(
      {
        class: `w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden`,
        value: selectedModelId
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"))}`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(models2);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let model = each_array[$$index];
          if (!modelIds.includes(model.id)) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.option({ value: model.id, class: "bg-gray-50 dark:bg-gray-700" }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(model.name)}`);
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> `);
    if (modelIds.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex flex-col"><!--[-->`);
      const each_array_1 = ensure_array_like(modelIds);
      for (let modelIdx = 0, $$length = each_array_1.length; modelIdx < $$length; modelIdx++) {
        let modelId = each_array_1[modelIdx];
        $$renderer2.push(`<div class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(models2.find((model) => model.id === modelId)?.name)}</div> <div class="shrink-0"><button type="button">`);
        Minus($$renderer2, { strokeWidth: "2", className: "size-3.5" });
        $$renderer2.push(`<!----></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="text-gray-500 text-xs text-center py-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models selected"))}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { title, tooltip, models: models2, modelIds });
  });
}
function ArenaModelModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let model = fallback($$props["model"], null);
    let name = "";
    let id = "";
    const generateId = () => {
      if (!edit) {
        id = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      }
    };
    let profileImageUrl = `${WEBUI_BASE_URL}/favicon.png`;
    let description = "";
    let selectedModelId = "";
    let modelIds = [];
    let filterMode = "include";
    let accessGrants = [];
    let loading = false;
    let showDeleteConfirmDialog = false;
    const initModel = () => {
      if (model) {
        name = model.name;
        id = model.id;
        profileImageUrl = model.meta.profile_image_url;
        description = model.meta.description;
        modelIds = model.meta.model_ids || [];
        filterMode = model.meta?.filter_mode ?? "include";
        accessGrants = model.meta.access_grants ?? [];
      }
    };
    if (name) {
      generateId();
    }
    if (show) {
      initModel();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Arena Model"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Arena Model"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1"><div class="flex justify-center pb-3"><input type="file" hidden="" accept="image/*"/> <button class="relative rounded-full w-fit h-fit shrink-0" type="button"><img${attr("src", profileImageUrl)} class="size-16 rounded-full object-cover shrink-0"${attr("alt", store_get($$store_subs ??= {}, "$i18n", i18n).t("Profile"))}/> <div class="absolute flex justify-center rounded-full bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-gray-700 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-50"><div class="my-auto text-white">`);
          PencilSolid($$renderer4, { className: "size-4" });
          $$renderer4.push(`<!----></div></div></button></div> <div class="flex gap-2"><div class="flex flex-col w-full"><div class="mb-0.5 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Model Name"))} autocomplete="off" required=""/></div></div> <div class="flex flex-col w-full"><div class="mb-0.5 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ID"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", id)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Model ID"))} autocomplete="off" required=""${attr("disabled", edit, true)}/></div></div></div> <div class="flex flex-col w-full mt-2"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Description"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", description)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter description"))} autocomplete="off"/></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="my-2">`);
          AccessControl($$renderer4, {
            get accessGrants() {
              return accessGrants;
            },
            set accessGrants($$value) {
              accessGrants = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex flex-col w-full"><div class="mb-1 flex justify-between"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))}</div> <div><button class="text-xs text-gray-500" type="button">`);
          if (filterMode === "include") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Include"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Exclude"))}`);
          }
          $$renderer4.push(`<!--]--></button></div></div> `);
          if (modelIds.length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col"><!--[-->`);
            const each_array = ensure_array_like(modelIds);
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let modelId = each_array[modelIdx];
              $$renderer4.push(`<div class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$models", models).find((model2) => model2.id === modelId)?.name)}</div> <div class="shrink-0"><button type="button">`);
              Minus($$renderer4, { strokeWidth: "2", className: "size-3.5" });
              $$renderer4.push(`<!----></button></div></div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="text-gray-500 text-xs text-center py-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Leave empty to include all models or select specific models"))}</div>`);
          }
          $$renderer4.push(`<!--]--></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex items-center">`);
          $$renderer4.select(
            {
              class: `w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden`,
              value: selectedModelId
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"))}`);
              });
              $$renderer5.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$models", models).filter((m) => m?.owned_by !== "arena"));
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let model2 = each_array_1[$$index_1];
                $$renderer5.option({ value: model2.id, class: "bg-gray-50 dark:bg-gray-700" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(model2.name)}`);
                });
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(` <div><button type="button">`);
          Plus($$renderer4, { className: "size-3.5", strokeWidth: "2" });
          $$renderer4.push(`<!----></button></div></div></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-gray-950 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, edit, model });
  });
}
function Eye($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ModelSettingsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let initHandler = fallback($$props["initHandler"], () => {
    });
    let config$1 = null;
    let defaultModelIds = [];
    let defaultPinnedModelIds = [];
    let loading = false;
    let showResetModal = false;
    const init = async () => {
      config$1 = await getModelsConfig(localStorage.token);
      if (config$1?.DEFAULT_MODELS) {
        defaultModelIds = config$1?.DEFAULT_MODELS.split(",").filter((id) => id);
      } else {
        defaultModelIds = [];
      }
      if (config$1?.DEFAULT_PINNED_MODELS) {
        defaultPinnedModelIds = config$1?.DEFAULT_PINNED_MODELS.split(",").filter((id) => id);
      } else {
        defaultPinnedModelIds = [];
      }
      const modelOrderList = config$1.MODEL_ORDER_LIST || [];
      const allModelIds = store_get($$store_subs ??= {}, "$models", models).map((model) => model.id);
      const orderedSet = new Set(modelOrderList);
      [
        // Add all IDs from MODEL_ORDER_LIST that exist in allModelIds
        ...modelOrderList.filter((id) => orderedSet.has(id) && allModelIds.includes(id)),
        // Add remaining IDs not in MODEL_ORDER_LIST, sorted alphabetically
        ...allModelIds.filter((id) => !orderedSet.has(id)).sort((a, b) => a.localeCompare(b))
      ];
      const savedMeta = config$1?.DEFAULT_MODEL_METADATA;
      if (savedMeta && Object.keys(savedMeta).length > 0) {
        savedMeta.capabilities ?? { ...DEFAULT_CAPABILITIES };
        savedMeta.defaultFeatureIds ?? [];
        savedMeta.builtinTools ?? {};
      }
      config$1?.DEFAULT_MODEL_PARAMS ?? {};
      store_get($$store_subs ??= {}, "$_config", config)?.default_prompt_suggestions ?? [];
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset All Models"),
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("This will delete all models including custom models and cannot be undone."),
        onConfirm: async () => {
          const res = deleteAllModels(localStorage.token);
          if (res) {
            toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("All models deleted successfully"));
            initHandler();
          }
        },
        get show() {
          return showResetModal;
        },
        set show($$value) {
          showResetModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        size: "lg",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">`);
          if (config$1) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<form class="flex flex-col w-full"><div class="flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4"><div id="admin-settings-tabs-container" class="tabs flex flex-row overflow-x-auto gap-2.5 max-w-full lg:gap-1 lg:flex-col lg:flex-none lg:w-40 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"><button${attr_class(`px-0.5 py-1 max-w-fit w-fit rounded-lg flex-1 lg:flex-none flex text-right transition ${stringify(
              ""
            )}`)} type="button"><div class="self-center mr-2">`);
            AdjustmentsHorizontal($$renderer4, {});
            $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Defaults"))}</div></button> <button${attr_class(`px-0.5 py-1 max-w-fit w-fit rounded-lg flex-1 lg:flex-none flex text-right transition ${stringify(" text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)} type="button"><div class="self-center mr-2">`);
            Eye($$renderer4, {});
            $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Display"))}</div></button></div> <div class="flex-1 mt-1 lg:mt-1 lg:h-[30rem] lg:max-h-[30rem] flex flex-col min-w-0"><div class="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hidden">`);
            {
              $$renderer4.push("<!--[0-->");
              ModelSelector($$renderer4, {
                title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Selected Models"),
                tooltip: store_get($$store_subs ??= {}, "$i18n", i18n).t("Set the default models that are automatically selected for all users when a new chat is created."),
                models: store_get($$store_subs ??= {}, "$models", models),
                get modelIds() {
                  return defaultModelIds;
                },
                set modelIds($$value) {
                  defaultModelIds = $$value;
                  $$settled = false;
                }
              });
              $$renderer4.push(`<!----> <hr class="border-gray-50 dark:border-gray-800/10 my-2.5 w-full"/> `);
              ModelSelector($$renderer4, {
                title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Pinned Models"),
                tooltip: store_get($$store_subs ??= {}, "$i18n", i18n).t("Set the models that are automatically pinned to the sidebar for all users."),
                models: store_get($$store_subs ??= {}, "$models", models),
                get modelIds() {
                  return defaultPinnedModelIds;
                },
                set modelIds($$value) {
                  defaultPinnedModelIds = $$value;
                  $$settled = false;
                }
              });
              $$renderer4.push(`<!----> <hr class="border-gray-50 dark:border-gray-800/10 my-2.5 w-full"/> <div><button class="flex w-full justify-between items-center" type="button"><div class="text-xs text-gray-500 font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Suggestions"))}</div> <div>`);
              {
                $$renderer4.push("<!--[-1-->");
                ChevronDown($$renderer4, { className: "size-3" });
              }
              $$renderer4.push(`<!--]--></div></button> `);
              {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div> <hr class="border-gray-50 dark:border-gray-800/10 my-2.5 w-full"/> <div><button class="flex w-full justify-between items-center" type="button"><div class="text-xs text-gray-500 font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model Capabilities"))}</div> <div>`);
              {
                $$renderer4.push("<!--[-1-->");
                ChevronDown($$renderer4, { className: "size-3" });
              }
              $$renderer4.push(`<!--]--></div></button> `);
              {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div> <hr class="border-gray-50 dark:border-gray-800/10 my-2.5 w-full"/> <div><button class="flex w-full justify-between items-center" type="button"><div class="text-xs text-gray-500 font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model Parameters"))}</div> <div>`);
              {
                $$renderer4.push("<!--[-1-->");
                ChevronDown($$renderer4, { className: "size-3" });
              }
              $$renderer4.push(`<!--]--></div></button> `);
              {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div>`);
            }
            $$renderer4.push(`<!--]--></div> <div class="flex justify-between items-center pt-3 text-sm font-medium gap-1.5"><div>`);
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This will delete all models including custom models"),
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="text-sm font-normal text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition hover:underline" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset"))}</button>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
            {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></button></div></div></div></form>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div>`);
            Spinner($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, initHandler });
  });
}
function ManageModelsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Models"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-3 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">`);
          {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="py-5">`);
            Spinner($$renderer4, {});
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show });
  });
}
function ModelMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let user2 = $$props["user"];
    let model = $$props["model"];
    let exportHandler = $$props["exportHandler"];
    let hideHandler = $$props["hideHandler"];
    let pinModelHandler = $$props["pinModelHandler"];
    let copyLinkHandler = $$props["copyLinkHandler"];
    let cloneHandler = $$props["cloneHandler"];
    let onClose = $$props["onClose"];
    let show = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        onOpenChange: (state) => {
          if (state === false) {
            onClose();
          }
        },
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("More"),
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="min-w-[170px] rounded-xl p-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-sm"><button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">`);
            if (model?.meta?.hidden ?? false) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path></svg>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>`);
            }
            $$renderer4.push(`<!--]--> <div class="flex items-center">`);
            if (model?.meta?.hidden ?? false) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Show Model"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hide Model"))}`);
            }
            $$renderer4.push(`<!--]--></div></button> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">`);
            if ((store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(model?.id)) {
              $$renderer4.push("<!--[0-->");
              PinSlash($$renderer4, {});
            } else {
              $$renderer4.push("<!--[-1-->");
              Pin($$renderer4, {});
            }
            $$renderer4.push(`<!--]--> <div class="flex items-center">`);
            if ((store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(model?.id)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hide from Sidebar"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Keep in Sidebar"))}`);
            }
            $$renderer4.push(`<!--]--></div></button> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">`);
            Link($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Link"))}</div></button> `);
            if (model?.is_active ?? true) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">`);
              DocumentDuplicate($$renderer4, {});
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Clone"))}</div></button>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">`);
            Download($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</div></button></div></div>`);
          }
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      user: user2,
      model,
      exportHandler,
      hideHandler,
      pinModelHandler,
      copyLinkHandler,
      cloneHandler,
      onClose
    });
  });
}
function AdminViewSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Select view"), true);
    let onChange = fallback($$props["onChange"], () => {
    });
    const items = [
      {
        value: "",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("All")
      },
      {
        value: "enabled",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled")
      },
      {
        value: "disabled",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled")
      },
      {
        value: "visible",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Visible")
      },
      {
        value: "hidden",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Hidden")
      },
      {
        value: "public",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Public")
      },
      {
        value: "private",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Private")
      }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Select($$renderer3, {
        items,
        placeholder,
        triggerClass: "relative w-full flex items-center gap-0.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-850 rounded-xl",
        labelClass: "inline-flex h-input px-0.5 w-full outline-hidden bg-transparent truncate placeholder-gray-400 focus:outline-hidden",
        onChange: () => onChange(value),
        get value() {
          return value;
        },
        set value($$value) {
          value = $$value;
          $$settled = false;
        },
        $$slots: {
          trigger: ($$renderer4, { selectedLabel }) => {
            {
              $$renderer4.push(`<span class="inline-flex h-input px-0.5 w-full outline-hidden bg-transparent truncate placeholder-gray-400 focus:outline-hidden">${escape_html(selectedLabel)}</span> `);
              ChevronDown($$renderer4, { className: "size-3.5", strokeWidth: "2.5" });
              $$renderer4.push(`<!---->`);
            }
          },
          item: ($$renderer4, { item, selected }) => {
            {
              $$renderer4.push(`${escape_html(item.label)} <div${attr_class(`ml-auto ${stringify(selected ? "" : "invisible")}`)}>`);
              Check($$renderer4, {});
              $$renderer4.push(`<!----></div>`);
            }
          }
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { value, placeholder, onChange });
  });
}
function Models($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let modelsImportInProgress = false;
    let models$1 = null;
    let workspaceModels = null;
    let baseModels = null;
    let filteredModels = [];
    let showConfigModal = false;
    let showManageModal = false;
    let viewOption = "";
    const perPage = 30;
    let currentPage = 1;
    const isPublicModel = (model) => {
      return (model?.access_grants ?? []).some((g) => g.principal_type === "user" && g.principal_id === "*" && g.permission === "read");
    };
    let searchValue = "";
    const init = async () => {
      models$1 = null;
      workspaceModels = await getBaseModels(localStorage.token);
      baseModels = await getModels(localStorage.token, null, true);
      models$1 = baseModels.map((m) => {
        const workspaceModel = workspaceModels.find((wm) => wm.id === m.id);
        if (workspaceModel) {
          return { ...m, ...workspaceModel };
        } else {
          return { ...m, id: m.id, name: m.name, is_active: true };
        }
      });
      models.set(await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null)));
    };
    const upsertModelHandler = async (model, overrides = {}, showToast = true) => {
      model = { ...model, base_model_id: null, ...overrides };
      if (workspaceModels.find((m) => m.id === model.id)) {
        const res = await updateModelById(localStorage.token, model.id, model).catch((error) => {
          return null;
        });
        if (res && showToast) {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model updated successfully"));
        }
      } else {
        const res = await createNewModel(localStorage.token, {
          meta: {},
          id: model.id,
          name: model.name,
          base_model_id: null,
          params: {},
          access_grants: [],
          ...model
        }).catch((error) => {
          return null;
        });
        if (res && showToast) {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model updated successfully"));
          await init();
        }
      }
    };
    const hideModelHandler = async (model) => {
      model.meta = { ...model.meta, hidden: !(model?.meta?.hidden ?? false) };
      /* @__PURE__ */ console.debug(model);
      upsertModelHandler(model, { meta: model.meta }, false);
      toast.success(model.meta.hidden ? store_get($$store_subs ??= {}, "$i18n", i18n).t(`Model {{name}} is now hidden`, { name: model.id }) : store_get($$store_subs ??= {}, "$i18n", i18n).t(`Model {{name}} is now visible`, { name: model.id }));
    };
    const copyLinkHandler = async (model) => {
      const baseUrl = window.location.origin;
      const res = await copyToClipboard(`${baseUrl}/?model=${encodeURIComponent(model.id)}`);
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copied link to clipboard"));
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to copy link"));
      }
    };
    const cloneHandler = async (model) => {
      sessionStorage.model = JSON.stringify({
        ...model,
        base_model_id: model.id,
        id: `${model.id}-clone`,
        name: `${model.name} (Clone)`
      });
      goto();
    };
    const exportModelHandler = async (model) => {
      let blob = new Blob([JSON.stringify([model])], { type: "application/json" });
      saveAs(blob, `${model.id}-${Date.now()}.json`);
    };
    const pinModelHandler = async (modelId) => {
      let pinnedModels = store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? [];
      if (pinnedModels.includes(modelId)) {
        pinnedModels = pinnedModels.filter((id) => id !== modelId);
      } else {
        pinnedModels = [.../* @__PURE__ */ new Set([...pinnedModels, modelId])];
      }
      settings.set({
        ...store_get($$store_subs ??= {}, "$settings", settings),
        pinnedModels
      });
      await updateUserSettings(localStorage.token, { ui: store_get($$store_subs ??= {}, "$settings", settings) });
    };
    if (models$1) {
      filteredModels = models$1.filter((m) => searchValue === "").filter((m) => {
        if (viewOption === "enabled") return m?.is_active ?? true;
        if (viewOption === "disabled") return !(m?.is_active ?? true);
        if (viewOption === "visible") return !(m?.meta?.hidden ?? false);
        if (viewOption === "hidden") return m?.meta?.hidden === true;
        if (viewOption === "public") return isPublicModel(m);
        if (viewOption === "private") return !isPublicModel(m);
        return true;
      }).sort((a, b) => {
        return (a?.name ?? a?.id ?? "").localeCompare(b?.name ?? b?.id ?? "");
      });
    }
    if (viewOption !== void 0) {
      currentPage = 1;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ModelSettingsModal($$renderer3, {
        initHandler: init,
        get show() {
          return showConfigModal;
        },
        set show($$value) {
          showConfigModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ManageModelsModal($$renderer3, {
        get show() {
          return showManageModal;
        },
        set show($$value) {
          showManageModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (models$1 !== null) {
        $$renderer3.push("<!--[0-->");
        {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex flex-col gap-1 mt-1.5 mb-2"><div class="flex justify-between items-center"><div class="flex items-center md:self-center text-xl font-medium px-0.5 gap-2 shrink-0"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))}</div> <div class="text-lg font-medium text-gray-500 dark:text-gray-500">${escape_html(filteredModels.length)}</div></div> <div class="flex w-full justify-end gap-1.5">`);
          if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<input id="models-import-input" type="file" accept=".json" hidden=""/> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition"${attr("disabled", modelsImportInProgress, true)}>`);
            {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <div class="self-center font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))}</div></button> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition"><div class="self-center font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</div></button>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition" type="button"><div class="self-center font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage"))}</div></button> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black transition font-medium" type="button"><div class="self-center font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))}</div></button></div></div></div> <div class="py-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/30 dark:border-gray-850/30"><div class="px-3.5 flex flex-1 items-center w-full space-x-2 py-0.5 pb-2"><div class="flex flex-1 items-center"><div class="self-center ml-1 mr-3">`);
          Search($$renderer3, { className: "size-3.5" });
          $$renderer3.push(`<!----></div> <input class="w-full text-sm py-1 rounded-r-xl outline-hidden bg-transparent"${attr("value", searchValue)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search Models"))}/> `);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div></div> <div class="px-3 flex w-full items-center bg-transparent overflow-x-auto scrollbar-none"><div class="flex gap-0.5 w-fit text-center text-sm rounded-full bg-transparent whitespace-nowrap">`);
          AdminViewSelector($$renderer3, {
            get value() {
              return viewOption;
            },
            set value($$value) {
              viewOption = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></div> <div class="flex-1"></div> `);
          Dropdown($$renderer3, {
            children: ($$renderer4) => {
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Actions"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<button class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" type="button">`);
                  EllipsisHorizontal($$renderer5, { className: "size-4" });
                  $$renderer5.push(`<!----></button>`);
                },
                $$slots: { default: true }
              });
            },
            $$slots: {
              default: true,
              content: ($$renderer4) => {
                $$renderer4.push(`<div slot="content"><div class="w-[170px] rounded-xl p-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-sm"><button class="select-none flex w-full gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" type="button">`);
                CheckCircle($$renderer4, { className: "size-4" });
                $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Enable All"))}</div></button> <button class="select-none flex w-full gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" type="button">`);
                Minus($$renderer4, { className: "size-4" });
                $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Disable All"))}</div></button> <hr class="border-gray-100 dark:border-gray-800 my-1"/> <button class="select-none flex w-full gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" type="button">`);
                Eye($$renderer4, { className: "size-4" });
                $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Show All"))}</div></button> <button class="select-none flex w-full gap-2 items-center px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md" type="button">`);
                EyeSlash($$renderer4, { className: "size-4" });
                $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hide All"))}</div></button></div></div>`);
              }
            }
          });
          $$renderer3.push(`<!----></div> <div class="px-3 my-2" id="model-list">`);
          if (filteredModels.length > 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<!--[-->`);
            const each_array = ensure_array_like(filteredModels.slice((currentPage - 1) * perPage, currentPage * perPage));
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let model = each_array[modelIdx];
              $$renderer3.push(`<div${attr_class(` flex space-x-4 cursor-pointer w-full px-3 py-2 dark:hover:bg-white/5 hover:bg-black/5 rounded-xl transition ${stringify(model?.meta?.hidden ? "opacity-50 dark:opacity-50" : "")}`)}${attr("id", `model-item-${stringify(model.id)}`)}><button class="flex flex-1 text-left space-x-3.5 cursor-pointer w-full" type="button"><div class="self-center w-9"><div${attr_class(` rounded-full object-cover ${stringify(model?.is_active ?? true ? "" : "opacity-50 dark:opacity-50")} `)}><img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model.id}`)} alt="modelfile profile" class="rounded-full w-full h-auto object-cover"/></div></div> <div${attr_class(` flex-1 self-center ${stringify(model?.is_active ?? true ? "" : "text-gray-500")}`)}>`);
              Tooltip($$renderer3, {
                content: marked.parse(!!model?.meta?.description ? model?.meta?.description : model?.ollama?.digest ? `${model?.ollama?.digest} **(${model?.ollama?.modified_at})**` : model.id),
                className: " w-fit",
                placement: "top-start",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="font-medium line-clamp-1 flex items-center gap-2">${escape_html(model.name)} `);
                  Badge($$renderer4, {
                    type: (model?.access_grants ?? []).some((g) => g.principal_type === "user" && g.principal_id === "*" && g.permission === "read") ? "success" : "muted",
                    content: (model?.access_grants ?? []).some((g) => g.principal_type === "user" && g.principal_id === "*" && g.permission === "read") ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Public") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Private")
                  });
                  $$renderer4.push(`<!----></div>`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!----> <div class="text-xs overflow-hidden text-ellipsis line-clamp-1 flex items-center gap-1 text-gray-500"><span class="line-clamp-1">${escape_html(!!model?.meta?.description ? model?.meta?.description : model?.ollama?.digest ? `${model.id} (${model?.ollama?.digest})` : model.id)}</span></div></div></button> <div class="flex flex-row gap-0.5 items-center self-center">`);
              {
                $$renderer3.push("<!--[-1-->");
                $$renderer3.push(`<button class="self-center w-fit text-sm px-2 py-2 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl" type="button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"></path></svg></button> `);
                ModelMenu($$renderer3, {
                  user: store_get($$store_subs ??= {}, "$user", user),
                  model,
                  exportHandler: () => {
                    exportModelHandler(model);
                  },
                  hideHandler: () => {
                    hideModelHandler(model);
                  },
                  pinModelHandler: () => {
                    pinModelHandler(model.id);
                  },
                  copyLinkHandler: () => {
                    copyLinkHandler(model);
                  },
                  cloneHandler: () => {
                    cloneHandler(model);
                  },
                  onClose: () => {
                  },
                  children: ($$renderer4) => {
                    $$renderer4.push(`<button class="self-center w-fit text-sm p-1.5 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl" type="button">`);
                    EllipsisHorizontal($$renderer4, { className: "size-5" });
                    $$renderer4.push(`<!----></button>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer3.push(`<!----> <div class="ml-1">`);
                Tooltip($$renderer3, {
                  content: model?.is_active ?? true ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
                  children: ($$renderer4) => {
                    Switch_1($$renderer4, {
                      get state() {
                        return model.is_active;
                      },
                      set state($$value) {
                        model.is_active = $$value;
                        $$settled = false;
                      }
                    });
                  },
                  $$slots: { default: true }
                });
                $$renderer3.push(`<!----></div>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div class="w-full h-full flex flex-col justify-center items-center my-16 mb-24"><div class="max-w-md text-center"><div class="text-3xl mb-3">😕</div> <div class="text-lg font-medium mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models found"))}</div> <div class="text-gray-500 text-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Try adjusting your search or filter to find what you are looking for."))}</div></div></div>`);
          }
          $$renderer3.push(`<!--]--></div> `);
          if (filteredModels.length > perPage) {
            $$renderer3.push("<!--[0-->");
            Pagination_1($$renderer3, {
              count: filteredModels.length,
              perPage,
              get page() {
                return currentPage;
              },
              set page($$value) {
                currentPage = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="h-full w-full flex justify-center items-center">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Connections($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let OLLAMA_BASE_URLS = [""];
    let OLLAMA_API_CONFIGS = {};
    let OPENAI_API_KEYS = [""];
    let OPENAI_API_BASE_URLS = [""];
    let OPENAI_API_CONFIGS = {};
    let showAddOpenAIConnectionModal = false;
    let showAddOllamaConnectionModal = false;
    const updateOpenAIHandler = async () => {
    };
    const updateOllamaHandler = async () => {
    };
    const addOpenAIConnectionHandler = async (connection) => {
      OPENAI_API_BASE_URLS = [...OPENAI_API_BASE_URLS, connection.url];
      OPENAI_API_KEYS = [...OPENAI_API_KEYS, connection.key];
      OPENAI_API_CONFIGS[OPENAI_API_BASE_URLS.length - 1] = connection.config;
      await updateOpenAIHandler();
    };
    const addOllamaConnectionHandler = async (connection) => {
      OLLAMA_BASE_URLS = [...OLLAMA_BASE_URLS, connection.url];
      OLLAMA_API_CONFIGS[OLLAMA_BASE_URLS.length - 1] = { ...connection.config, key: connection.key };
      await updateOllamaHandler();
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddConnectionModal($$renderer3, {
        onSubmit: addOpenAIConnectionHandler,
        get show() {
          return showAddOpenAIConnectionModal;
        },
        set show($$value) {
          showAddOpenAIConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      AddConnectionModal($$renderer3, {
        ollama: true,
        onSubmit: addOllamaConnectionHandler,
        get show() {
          return showAddOllamaConnectionModal;
        },
        set show($$value) {
          showAddOllamaConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Documents($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let showResetConfirm = false;
    let showResetUploadDirConfirm = false;
    let showReindexConfirm = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showResetUploadDirConfirm;
        },
        set show($$value) {
          showResetUploadDirConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showResetConfirm;
        },
        set show($$value) {
          showResetConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showReindexConfirm;
        },
        set show($$value) {
          showReindexConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between space-y-3 text-sm">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex items-center justify-center h-full">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function WebSearch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Evaluations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let showAddModel = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ArenaModelModal($$renderer3, {
        get show() {
          return showAddModel;
        },
        set show($$value) {
          showAddModel = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function CodeExecution($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Integrations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveSettings = $$props["saveSettings"];
    let servers = null;
    let showConnectionModal = false;
    let terminalConnections = [];
    let showAddTerminalModal = false;
    let editTerminalIdx = null;
    let showDeleteTerminalConfirm = false;
    const addConnectionHandler = async (server) => {
      servers = [...servers, server];
      await updateHandler();
    };
    const updateHandler = async () => {
      const res = await setToolServerConnections(localStorage.token, { TOOL_SERVER_CONNECTIONS: servers }).catch((err) => {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to save connections"));
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connections saved successfully"));
      }
    };
    const saveTerminalServers = async () => {
      const res = await setTerminalServerConnections(localStorage.token, { TERMINAL_SERVER_CONNECTIONS: terminalConnections }).catch((err) => {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to save terminal servers"));
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Terminal servers saved"));
        const existingDirectTerminals = (store_get($$store_subs ??= {}, "$terminalServers", terminalServers) ?? []).filter((t) => !t.id);
        const systemTerminals = await getTerminalServers(localStorage.token);
        const systemEntries = systemTerminals.map((t) => ({
          id: t.id,
          url: `${WEBUI_API_BASE_URL}/terminals/${t.id}`,
          name: t.name,
          key: localStorage.token
        }));
        terminalServers.set([...existingDirectTerminals, ...systemEntries]);
      }
    };
    const addTerminalConnection = (server) => {
      terminalConnections = [
        ...terminalConnections,
        { ...server, id: server.id ?? v4() }
      ];
      saveTerminalServers();
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddToolServerModal($$renderer3, {
        onSubmit: addConnectionHandler,
        get show() {
          return showConnectionModal;
        },
        set show($$value) {
          showConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      AddTerminalServerModal($$renderer3, {
        edit: editTerminalIdx !== null,
        connection: null,
        onSubmit: (c) => {
          {
            addTerminalConnection(c);
          }
        },
        onDelete: () => {
        },
        get show() {
          return showAddTerminalModal;
        },
        set show($$value) {
          showAddTerminalModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteTerminalConfirm;
        },
        set show($$value) {
          showDeleteTerminalConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      if (servers !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div><div class="mb-3"><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("General"))}</div> <hr class="border-gray-100/30 dark:border-gray-850/30 my-2"/> <div class="mb-2.5 flex flex-col w-full justify-between"><div class="flex justify-between items-center mb-0.5"><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Tool Servers"))}</div> `);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Add Connection`),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="px-1" type="button">`);
            Plus($$renderer4, {});
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1"><!--[-->`);
        const each_array = ensure_array_like(servers);
        for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
          let server = each_array[idx];
          Connection($$renderer3, {
            onSubmit: () => {
              updateHandler();
            },
            onDelete: () => {
              servers = servers.filter((_, i) => i !== idx);
              updateHandler();
            },
            get connection() {
              return server;
            },
            set connection($$value) {
              server = $$value;
              $$settled = false;
            }
          });
        }
        $$renderer3.push(`<!--]--></div> `);
        if (servers.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No tool server connections configured."))}</div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="my-1.5"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connect to your own OpenAPI compatible external tool servers."))}</div></div></div> <hr class="border-gray-100/30 dark:border-gray-850/30 my-4"/> <div class="mb-2.5 flex flex-col w-full"><div class="flex justify-between items-center mb-1"><div class="flex items-center gap-2"><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Terminal"))}</div> <span class="text-[0.65rem] font-medium uppercase px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Experimental"))}</span></div> `);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Connection"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="px-1" type="button">`);
            Plus($$renderer4, {});
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1.5"><!--[-->`);
        const each_array_1 = ensure_array_like(terminalConnections);
        for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
          let connection = each_array_1[idx];
          $$renderer3.push(`<div class="flex w-full gap-2 items-center">`);
          Tooltip($$renderer3, {
            className: "w-full relative",
            content: "",
            placement: "top-start",
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="flex w-full"><div${attr_class(`flex-1 relative flex gap-1.5 items-center ${stringify(connection?.enabled === false ? "opacity-50" : "")}`)}>`);
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Terminal"),
                children: ($$renderer5) => {
                  Cloud($$renderer5, { className: "size-4", strokeWidth: "1.5" });
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----> <div class="outline-hidden w-full bg-transparent text-sm">${escape_html(connection.name || connection.url || store_get($$store_subs ??= {}, "$i18n", i18n).t("New Terminal"))}</div></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> <div class="flex gap-1 items-center">`);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Configure"),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition" type="button">`);
              Cog6($$renderer4, {});
              $$renderer4.push(`<!----></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          Tooltip($$renderer3, {
            content: connection?.enabled !== false ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
            children: ($$renderer4) => {
              Switch_1($$renderer4, { state: connection?.enabled !== false });
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div></div>`);
        }
        $$renderer3.push(`<!--]--></div> `);
        if (terminalConnections.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No terminal connections configured."))}</div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="mt-1.5"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connect to Open Terminal instances. All users will have access to file browsing and terminal tools through these servers."))}</div> <div class="text-xs text-gray-600 dark:text-gray-300 mt-1"><a class="underline" href="https://github.com/open-webui/open-terminal" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Learn more about Open Terminal"))} ↗</a></div></div></div></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveSettings });
  });
}
function DocumentChartBar($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"${attr_class(clsx(className))}><path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM9.75 17.25a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75Zm2.25-3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-5.25Z" clip-rule="evenodd"></path><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Settings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let selectedTab = "general";
    const scrollToTab = (tabId) => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    };
    let search = "";
    let filteredSettings = [];
    {
      const pathParts = store_get($$store_subs ??= {}, "$page", page).url.pathname.split("/");
      const tabFromPath = pathParts[pathParts.length - 1];
      selectedTab = [
        "general",
        "connections",
        "models",
        "evaluations",
        "integrations",
        "documents",
        "web",
        "code-execution",
        "interface",
        "audio",
        "images",
        "pipelines",
        "db"
      ].includes(tabFromPath) ? tabFromPath : "general";
    }
    if (selectedTab) {
      scrollToTab(selectedTab);
    }
    $$renderer2.push(`<div class="flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4"><div id="admin-settings-tabs-container" class="tabs mx-[16px] lg:mx-0 lg:px-[16px] flex flex-row overflow-x-auto gap-2.5 max-w-full lg:gap-1 lg:flex-col lg:flex-none lg:w-50 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"><div class="hidden md:flex w-full rounded-full px-2.5 gap-2 bg-gray-100/80 dark:bg-gray-850/80 backdrop-blur-2xl my-1 -mx-1 mt-1.5" id="settings-search"><div class="self-center rounded-l-xl bg-transparent">`);
    Search($$renderer2, { className: "size-3.5", strokeWidth: "1.5" });
    $$renderer2.push(`<!----></div> <label class="sr-only" for="search-input-settings-modal">${escape_html(
      // Adjust horizontal scroll position based on vertical scroll
      // Scroll to the selected tab on mount
      store_get($$store_subs ??= {}, "$i18n", i18n).t("Search")
    )}</label> <input class="w-full py-1 text-sm bg-transparent dark:text-gray-300 outline-hidden"${attr("value", search)} id="search-input-settings-modal"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}/></div>       <!--[-->`);
    const each_array = ensure_array_like(filteredSettings);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<a${attr("id", tab.id)}${attr("href", tab.route)} draggable="false"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 lg:flex-none flex text-right transition select-none ${stringify(selectedTab === tab.id ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2">`);
      if (tab.id === "general") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-1.081a.5.5 0 0 1 .67.033l.774.775a.5.5 0 0 1 .034.67l-1.08 1.32c.25.417.44.873.561 1.357l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l1.082 1.322a.5.5 0 0 1-.034.67l-.774.774a.5.5 0 0 1-.67.033l-1.322-1.08c-.416.25-.872.44-1.356.561l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562L4.108 13.37a.5.5 0 0 1-.67-.033l-.774-.775a.5.5 0 0 1-.034-.67l1.08-1.32a4.971 4.971 0 0 1-.561-1.357l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356L2.629 4.107a.5.5 0 0 1 .034-.67l.774-.774a.5.5 0 0 1 .67-.033L5.43 3.71a4.97 4.97 0 0 1 1.356-.561l.17-1.699ZM6 8c0 .538.212 1.026.558 1.385l.057.057a2 2 0 0 0 2.828-2.828l-.058-.056A2 2 0 0 0 6 8Z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "connections") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M1 9.5A3.5 3.5 0 0 0 4.5 13H12a3 3 0 0 0 .917-5.857 2.503 2.503 0 0 0-3.198-3.019 3.5 3.5 0 0 0-6.628 2.171A3.5 3.5 0 0 0 1 9.5Z"></path></svg>`);
      } else if (tab.id === "models") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37zM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 013 13.179z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "evaluations") {
        $$renderer2.push("<!--[3-->");
        DocumentChartBar($$renderer2, {});
      } else if (tab.id === "integrations") {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "documents") {
        $$renderer2.push("<!--[5-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z"></path><path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 0 0 1.06-1.06l-1.047-1.048A3.375 3.375 0 1 0 11.625 18Z" clip-rule="evenodd"></path><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z"></path></svg>`);
      } else if (tab.id === "web") {
        $$renderer2.push("<!--[6-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z"></path></svg>`);
      } else if (tab.id === "code-execution") {
        $$renderer2.push("<!--[7-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2.22 1.97a.75.75 0 0 0 0 1.06l.97.97-.97.97a.75.75 0 1 0 1.06 1.06l1.5-1.5a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 0 0-1.06 0ZM8.75 8.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "interface") {
        $$renderer2.push("<!--[8-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v5.5A2.25 2.25 0 0 1 11.75 12h-1.312c.1.128.21.248.328.36a.75.75 0 0 1 .234.545v.345a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.345a.75.75 0 0 1 .234-.545c.118-.111.228-.232.328-.36H4.25A2.25 2.25 0 0 1 2 9.75v-5.5Zm2.25-.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-7.5Z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "audio") {
        $$renderer2.push("<!--[9-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM12.95 3.05a.75.75 0 1 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 1 0 1.06 1.06 7 7 0 0 0 0-9.9Z"></path><path d="M10.828 5.172a.75.75 0 1 0-1.06 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 1 0 1.06 1.06 4 4 0 0 0 0-5.656Z"></path></svg>`);
      } else if (tab.id === "images") {
        $$renderer2.push("<!--[10-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0L9.354 9.646a.5.5 0 0 1-.708 0L6.354 7.354a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0-.146.353V12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.707ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd"></path></svg>`);
      } else if (tab.id === "pipelines") {
        $$renderer2.push("<!--[11-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z"></path><path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z"></path><path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z"></path></svg>`);
      } else if (tab.id === "db") {
        $$renderer2.push("<!--[12-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z"></path><path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z"></path><path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z"></path></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(tab.title))}</div></a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex-1 mt-3 lg:mt-1 px-[16px] lg:pr-[16px] lg:pl-0 overflow-y-scroll scrollbar-hidden">`);
    if (selectedTab === "general") {
      $$renderer2.push("<!--[0-->");
      General($$renderer2, {
        saveHandler: async () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
          await tick();
          await config.set(await getBackendConfig());
        }
      });
    } else if (selectedTab === "connections") {
      $$renderer2.push("<!--[1-->");
      Connections($$renderer2);
    } else if (selectedTab === "models") {
      $$renderer2.push("<!--[2-->");
      Models($$renderer2);
    } else if (selectedTab === "evaluations") {
      $$renderer2.push("<!--[3-->");
      Evaluations($$renderer2);
    } else if (selectedTab === "integrations") {
      $$renderer2.push("<!--[4-->");
      Integrations($$renderer2, {});
    } else if (selectedTab === "documents") {
      $$renderer2.push("<!--[5-->");
      Documents($$renderer2);
    } else if (selectedTab === "web") {
      $$renderer2.push("<!--[6-->");
      WebSearch($$renderer2, {
        saveHandler: async () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
          await tick();
          await config.set(await getBackendConfig());
        }
      });
    } else if (selectedTab === "code-execution") {
      $$renderer2.push("<!--[7-->");
      CodeExecution($$renderer2, {
        saveHandler: async () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
          await tick();
          await config.set(await getBackendConfig());
        }
      });
    } else if (selectedTab === "interface") {
      $$renderer2.push("<!--[8-->");
      Interface($$renderer2);
    } else if (selectedTab === "audio") {
      $$renderer2.push("<!--[9-->");
      Audio($$renderer2, {
        saveHandler: () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
        }
      });
    } else if (selectedTab === "images") {
      $$renderer2.push("<!--[10-->");
      Images($$renderer2);
    } else if (selectedTab === "db") {
      $$renderer2.push("<!--[11-->");
      Database($$renderer2, {
        saveHandler: () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
        }
      });
    } else if (selectedTab === "pipelines") {
      $$renderer2.push("<!--[12-->");
      Pipelines($$renderer2, {
        saveHandler: () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Settings as S
};
//# sourceMappingURL=Settings.js.map
