import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, o as getContext, k as escape_html, c as store_get, t as stringify, u as unsubscribe_stores, j as slot, e as ensure_array_like } from "./root.js";
import { c as config, u as user } from "./index2.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { k as getChatById } from "./index5.js";
import "./index3.js";
import { M as Modal, X as XMark } from "./Modal.js";
import { L as Link } from "./Link.js";
import { D as Dropdown } from "./Dropdown.js";
import { G as GarbageBin } from "./GarbageBin.js";
import { P as Pencil } from "./Pencil.js";
import { T as Tooltip } from "./Tooltip.js";
import { D as Download } from "./Download.js";
import { F as Folder, a as FileItem } from "./FileItem.js";
import { t as tick } from "./index-server.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { T as Textarea } from "./Textarea.js";
import "dayjs";
import "dompurify";
import { a as WEBUI_API_BASE_URL } from "./constants.js";
const createNewFolder = async (token, folderForm) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(folderForm)
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
const getFolders = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/`, {
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
const getFolderById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/${id}`, {
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
const updateFolderById = async (token, id, folderForm) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/${id}/update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(folderForm)
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
function Share($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path d="M20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 15V3M12 3L8.5 6.5M12 3L15.5 6.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ShareChatModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let chatId = $$props["chatId"];
    let chat = null;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    const isDifferentChat = (_chat) => {
      if (!chat) {
        return true;
      }
      if (!_chat) {
        return false;
      }
      return chat.id !== _chat.id || chat.share_id !== _chat.share_id;
    };
    if (show) {
      (async () => {
        if (chatId) {
          const _chat = await getChatById(localStorage.token, chatId);
          if (isDifferentChat(_chat)) {
            chat = _chat;
          }
        } else {
          chat = null;
          /* @__PURE__ */ console.log(chat);
        }
      })();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "md",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-0.5"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share Chat"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> `);
          if (chat) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="px-5 pt-4 pb-5 w-full flex flex-col justify-center"><div class="text-sm dark:text-gray-300 mb-1">`);
            if (chat.share_id) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<a${attr("href", `/s/${stringify(chat.share_id)}`)} target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("You have shared this chat"))} <span class="underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("before"))}</span>.</a> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Click here to"))} <button class="underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("delete this link"))}</button> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("and create a new shared link."))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Messages you send after creating your link won't be shared. Users with the URL will be able to view the shared chat."))}`);
            }
            $$renderer4.push(`<!--]--></div> <div class="flex justify-end"><div class="flex flex-col items-end space-x-1 mt-3"><div class="flex gap-1">`);
            if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_community_sharing) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<button class="self-center flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:text-white dark:hover:bg-gray-800 transition rounded-full" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share to Open WebUI Community"))}</button>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <button class="self-center flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="button" id="copy-and-share-chat-button">`);
            Link($$renderer4, {});
            $$renderer4.push(`<!----> `);
            if (chat.share_id) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Update and Copy Link"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Link"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div>`);
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
    bind_props($$props, { chatId, show });
  });
}
function FolderMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let align = fallback($$props["align"], "start");
    let onEdit = fallback($$props["onEdit"], () => {
    });
    let onExport = fallback($$props["onExport"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onCreateSub = fallback($$props["onCreateSub"], () => {
    });
    let show = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        align,
        onOpenChange: (state) => {
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
              $$renderer5.push(`<button><!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]--></button>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="min-w-[170px] rounded-2xl px-1 py-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg"><button class="flex gap-2 items-center px-3 py-1.5 text-sm select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            Folder($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Folder"))}</div></button> <hr class="border-gray-50/30 dark:border-gray-800/30 my-1"/> <button class="flex gap-2 items-center px-3 py-1.5 text-sm select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            Pencil($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}</div></button> <button class="flex gap-2 items-center px-3 py-1.5 text-sm select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            Download($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</div></button> <button class="flex gap-2 items-center px-3 py-1.5 text-sm select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            GarbageBin($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</div></button></div></div>`);
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
    bind_props($$props, { align, onEdit, onExport, onDelete, onCreateSub });
  });
}
function Knowledge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedItems = fallback($$props["selectedItems"], () => [], true);
    const i18n = getContext("i18n");
    if (selectedItems === null) {
      selectedItems = [];
    }
    $$renderer2.push(`<input type="file" hidden="" multiple=""/> <div><!--[-->`);
    slot($$renderer2, $$props, "label", {}, () => {
      $$renderer2.push(`<div class="mb-2"><div class="flex w-full justify-between mb-1"><div class="self-center text-xs font-medium text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))}</div></div></div>`);
    });
    $$renderer2.push(`<!--]--> <div class="flex flex-col mb-1">`);
    if (selectedItems?.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex flex-wrap items-center gap-2 mb-2.5"><!--[-->`);
      const each_array = ensure_array_like(selectedItems);
      for (let fileIdx = 0, $$length = each_array.length; fileIdx < $$length; fileIdx++) {
        let file = each_array[fileIdx];
        FileItem($$renderer2, {
          file,
          small: true,
          item: file,
          name: file.name,
          modal: true,
          edit: true,
          loading: file.status === "uploading",
          type: file?.legacy ? `Legacy${file.type ? ` ${file.type}` : ""}` : file?.type ?? "collection",
          dismissible: true
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="text-xs dark:text-gray-700">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('To attach knowledge base here, add them to the "Knowledge" workspace first.'))}</div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { selectedItems });
  });
}
function FolderModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let onSubmit = fallback($$props["onSubmit"], (e) => {
    });
    let folderId = fallback($$props["folderId"], null);
    let parentId = fallback($$props["parentId"], null);
    let edit = fallback($$props["edit"], false);
    let folder = null;
    let name = "";
    let meta = { background_image_url: null };
    let data = { system_prompt: "", files: [] };
    let loading = false;
    const init = async () => {
      if (folderId) {
        folder = await getFolderById(localStorage.token, folderId).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        name = folder.name;
        meta = folder.meta || { background_image_url: null };
        data = folder.data || { system_prompt: "", files: [] };
      }
      focusInput();
    };
    const focusInput = async () => {
      await tick();
      const input = document.getElementById("folder-name");
      if (input) {
        input.focus();
        input.select();
      }
    };
    if (show) {
      init();
    }
    if (!show && !edit) {
      name = "";
      meta = { background_image_url: null };
      data = { system_prompt: "", files: [] };
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "md",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-1"><div class="text-lg font-medium self-center">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Folder"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Folder"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="flex flex-col w-full mt-1"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder Name"))}</div> <div class="flex-1"><input id="folder-name" class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter folder name"))} autocomplete="off"/></div></div> <input id="folder-background-image-input" type="file" hidden="" accept="image/*"/> <div class="flex justify-between w-full mt-1 items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder Background Image"))}</div> <div><button aria-labelledby="chat-background-label background-image-url-state" class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="ml-2 self-center" id="background-image-url-state">${escape_html((meta?.background_image_url ?? null) === null ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Upload") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset"))}</span></button></div></div> <hr class="border-gray-50 dark:border-gray-850/30 my-2.5 w-full"/> `);
          if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.system_prompt ?? true)) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="my-1"><div class="mb-2 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("System Prompt"))}</div> <div>`);
            Textarea($$renderer4, {
              className: " text-sm w-full bg-transparent outline-hidden ",
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write your model system prompt content here\ne.g.) You are Mario from Super Mario Bros, acting as an assistant."),
              maxSize: 200,
              get value() {
                return data.system_prompt;
              },
              set value($$value) {
                data.system_prompt = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="my-2">`);
          Knowledge($$renderer4, {
            get selectedItems() {
              return data.files;
            },
            set selectedItems($$value) {
              data.files = $$value;
              $$settled = false;
            },
            $$slots: {
              label: ($$renderer5) => {
                $$renderer5.push(`<div slot="label"><div class="flex w-full justify-between"><div class="mb-2 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))}</div></div></div>`);
              }
            }
          });
          $$renderer4.push(`<!----></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
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
    bind_props($$props, { show, onSubmit, folderId, parentId, edit });
  });
}
export {
  FolderModal as F,
  Share as S,
  ShareChatModal as a,
  FolderMenu as b,
  createNewFolder as c,
  getFolders as d,
  getFolderById as g,
  updateFolderById as u
};
//# sourceMappingURL=FolderModal.js.map
