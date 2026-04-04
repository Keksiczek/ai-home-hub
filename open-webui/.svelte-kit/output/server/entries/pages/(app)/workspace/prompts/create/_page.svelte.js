import { f as fallback, o as getContext, u as unsubscribe_stores, b as bind_props, c as store_get, k as escape_html, a as attr, d as attr_class, e as ensure_array_like, t as stringify } from "../../../../../../chunks/root.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { g as goto } from "../../../../../../chunks/client.js";
import { a as WEBUI_API_BASE_URL } from "../../../../../../chunks/constants.js";
import { T as Textarea, a as Tags } from "../../../../../../chunks/Textarea.js";
import { T as Tooltip } from "../../../../../../chunks/Tooltip.js";
import { A as AccessControlModal, L as LockClosed } from "../../../../../../chunks/LockClosed.js";
import { C as Clipboard } from "../../../../../../chunks/Clipboard.js";
import { u as user } from "../../../../../../chunks/index2.js";
import { x as formatDate } from "../../../../../../chunks/index3.js";
import { M as Modal, X as XMark } from "../../../../../../chunks/Modal.js";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import "dompurify";
import "marked";
/* empty css                                                                   */
import { B as Badge } from "../../../../../../chunks/Badge.js";
const createNewPrompt = async (token, prompt) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/prompts/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...prompt,
      command: prompt.command.startsWith("/") ? prompt.command.slice(1) : prompt.command
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
const updatePromptAccessGrants = async (token, promptId, accessGrants) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/access/update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ access_grants: accessGrants })
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
function PromptEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(localizedFormat);
    let onSubmit = $$props["onSubmit"];
    let edit = fallback($$props["edit"], false);
    let prompt = fallback($$props["prompt"], null);
    let clone = fallback($$props["clone"], false);
    let disabled = fallback($$props["disabled"], false);
    const i18n = getContext("i18n");
    let loading = false;
    let showEditModal = false;
    let name = "";
    let command = "";
    let content = "";
    let tags = [];
    let commitMessage = "";
    let isProduction = true;
    let accessGrants = [];
    let showAccessControlModal = false;
    let history = [];
    let selectedHistoryEntry = null;
    let suggestionTags = [];
    const renderDate = (timestamp) => {
      const dateVal = timestamp * 1e3;
      return store_get($$store_subs ??= {}, "$i18n", i18n).t(formatDate(dateVal), {
        LOCALIZED_TIME: dayjs(dateVal).format("LT"),
        LOCALIZED_DATE: dayjs(dateVal).format("L")
      });
    };
    if (!edit && true) {
      command = "";
    }
    function historySection($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col h-full"><div class="flex items-center justify-between mb-2 shrink-0"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("History"))}</div></div> `);
      if (history.length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="space-y-0 flex-1 overflow-y-auto"><!--[-->`);
        const each_array = ensure_array_like(history);
        for (let index = 0, $$length = each_array.length; index < $$length; index++) {
          let entry = each_array[index];
          $$renderer3.push(`<div class="flex"><button${attr_class(`flex-1 text-left px-3.5 py-2 mb-1 rounded-2xl transition group ${stringify(selectedHistoryEntry?.id === entry.id ? "bg-gray-100/50 dark:bg-gray-850/50" : "hover:bg-gray-100/50 dark:hover:bg-gray-850/50")}`)}><div class="flex items-center gap-2 mb-1"><div class="text-xs text-gray-900 dark:text-white truncate">${escape_html(entry.commit_message || store_get($$store_subs ??= {}, "$i18n", i18n).t("Update"))}</div> `);
          if (entry.id === prompt?.version_id) {
            $$renderer3.push("<!--[0-->");
            Badge($$renderer3, {
              type: "success",
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Live")
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">`);
          if (entry.user) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<img${attr("src", `/api/v1/users/${entry.user.id}/profile/image`)}${attr("alt", entry.user.name)} class="size-3 rounded-full mr-0.5"/> <span class="truncate">${escape_html(entry.user.name)}</span> <span>•</span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <span class="shrink-0">${escape_html(renderDate(entry.created_at))}</span></div></button></div>`);
        }
        $$renderer3.push(`<!--]--> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="text-xs text-gray-400 text-center py-6 italic">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No history available"))}</div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AccessControlModal($$renderer3, {
        accessRoles: ["read", "write"],
        share: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.prompts || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        sharePublic: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.public_prompts || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        shareUsers: (store_get($$store_subs ??= {}, "$user", user)?.permissions?.access_grants?.allow_users ?? true) || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        onChange: async () => {
          if (edit && prompt?.id) {
            try {
              await updatePromptAccessGrants(localStorage.token, prompt.id, accessGrants);
              toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Saved"));
            } catch (error) {
              toast.error(`${error}`);
            }
          }
        },
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
      Modal($$renderer3, {
        size: "lg",
        get show() {
          return showEditModal;
        },
        set show($$value) {
          showEditModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="px-5 pt-4 pb-5"><div class="flex justify-between items-center mb-2"><div class="text-lg font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Prompt"))}</div> <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <form><div class="my-2"><div class="flex w-full justify-between"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Content"))}</div></div> <div class="mt-1">`);
          Textarea($$renderer4, {
            className: "text-sm w-full bg-transparent outline-hidden overflow-y-hidden resize-none",
            placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write a summary in 50 words that summarizes {{topic}}."),
            "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Content"),
            rows: 6,
            required: true,
            get value() {
              return content;
            },
            set value($$value) {
              content = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div> <div class="my-2"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Commit Message"))} (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("optional"))})</div> <div class="mt-1"><input class="text-sm w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Describe what changed..."))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Commit Message"))}${attr("value", commitMessage)}/></div></div> <div class="mt-4 flex items-center justify-between"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox"${attr("checked", isProduction, true)} class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"/> <span class="text-sm text-gray-700 dark:text-gray-300">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Set as Production"))}</span></label> <div><button${attr_class(`text-sm px-4 py-2 transition rounded-full ${stringify("bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black")} flex justify-center`)} type="submit"${attr("disabled", loading, true)}><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</div> `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></div></form></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if (edit) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex flex-col w-full h-full max-h-[100dvh]"><div class="flex items-start justify-between gap-4 shrink-0"><div class="min-w-0 flex-1"><input class="text-2xl w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Name"))}${attr("value", name)}${attr("disabled", disabled, true)}/> <div class="flex items-center gap-0.5 text-sm text-gray-500 w-full flex-1"><span>/</span> <input class="bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("command"))}${attr("value", command)}${attr("disabled", disabled, true)}/></div></div> <div><div class="flex items-center gap-2 shrink-0 justify-end">`);
        if (!disabled) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<button class="px-4 py-1 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition shadow-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}</button> <button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2.5 py-1 rounded-full flex gap-1.5 items-center text-sm border border-gray-100 dark:border-gray-800">`);
          LockClosed($$renderer3, { strokeWidth: "2.5", className: "size-3.5" });
          $$renderer3.push(`<!----> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</button>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Read Only"))}</span>`);
        }
        $$renderer3.push(`<!--]--></div> <div class="mt-1.5">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Click to copy ID"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="text-xs text-gray-500 font-mono px-2 py-1 rounded-lg cursor-pointer hover:underline transition">${escape_html(prompt.id)}</button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div></div> <div class="mb-2 flex justify-between items-center gap-2"><div class="flex-1 min-w-0">`);
        Tags($$renderer3, { tags, disabled, suggestionTags });
        $$renderer3.push(`<!----></div></div> <div class="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden pb-6"><div class="hidden md:flex md:flex-col w-72 shrink-0 overflow-hidden"><div class="flex-1 overflow-y-auto">`);
        historySection($$renderer3);
        $$renderer3.push(`<!----></div></div> <div class="flex-1 flex flex-col min-h-0 overflow-hidden"><div class="flex items-center justify-between mb-1 shrink-0"><div class="flex items-center gap-2"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Content"))}</div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="relative flex-1 min-h-0"><div class="absolute top-2 right-2 z-10"><button class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy content"))}>`);
        {
          $$renderer3.push("<!--[-1-->");
          Clipboard($$renderer3, { className: "size-4 text-gray-500" });
        }
        $$renderer3.push(`<!--]--></button></div> <div class="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100/50 dark:border-gray-850/50 h-full overflow-y-auto"><pre class="text-xs whitespace-pre-wrap font-mono pr-8">${escape_html(content)}</pre></div></div></div></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="w-full max-h-full flex justify-center"><form class="flex flex-col w-full mb-10"><div class="mb-2">`);
        Tooltip($$renderer3, {
          content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Only alphanumeric characters and hyphens are allowed")} - ${store_get($$store_subs ??= {}, "$i18n", i18n).t('Activate this command by typing "/{{COMMAND}}" to chat input.', { COMMAND: command })}`,
          placement: "bottom-start",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex flex-col w-full"><div class="flex items-center"><input class="text-2xl w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}${attr("value", name)} required=""/> <div class="self-center shrink-0"><button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2 py-1 rounded-full flex gap-1 items-center" type="button">`);
            LockClosed($$renderer4, { strokeWidth: "2.5", className: "size-3.5" });
            $$renderer4.push(`<!----> <div class="text-sm font-medium shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</div></button></div></div> <div class="flex gap-0.5 items-center text-xs text-gray-500"><div>/</div> <input class="w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Command"))}${attr("value", command)} required=""/></div> <div class="mt-1">`);
            Tags($$renderer4, { tags, suggestionTags });
            $$renderer4.push(`<!----></div></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="my-2"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Content"))}</div> <div class="mt-1">`);
        Textarea($$renderer3, {
          className: "text-sm w-full bg-transparent outline-hidden overflow-y-hidden resize-none",
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write a summary in 50 words that summarizes {{topic}}."),
          rows: 6,
          required: true,
          get value() {
            return content;
          },
          set value($$value) {
            content = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> <div class="text-xs text-gray-400 dark:text-gray-500">ⓘ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Use"))} <span class="font-medium text-gray-600 dark:text-gray-300">{{${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("variable"))}}}</span> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("for placeholders"))}</div></div></div> <div class="my-4 flex justify-end pb-20"><button class="text-sm w-full lg:w-fit px-4 py-2 transition rounded-xl bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black flex w-full justify-center" type="submit"${attr("disabled", loading, true)}><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save & Create"))}</div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></button></div></form></div>`);
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
    bind_props($$props, { onSubmit, edit, prompt, clone, disabled });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let prompt = null;
    let clone = false;
    const onSubmit = async (_prompt) => {
      const res = await createNewPrompt(localStorage.token, _prompt).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt created successfully"));
        await goto();
      }
    };
    $$renderer2.push(`<!---->`);
    {
      PromptEditor($$renderer2, { prompt, onSubmit, clone });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
