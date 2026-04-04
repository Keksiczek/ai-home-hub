import "clsx";
import { o as getContext, k as escape_html, c as store_get, a as attr, t as stringify, u as unsubscribe_stores, b as bind_props, f as fallback, e as ensure_array_like, d as attr_class } from "../../../../chunks/root.js";
import fileSaver from "file-saver";
import { t as tick } from "../../../../chunks/index-server.js";
import "../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { h as settings, m as models } from "../../../../chunks/index2.js";
import "../../../../chunks/index3.js";
import { a as Collapsible, C as ChevronUp } from "../../../../chunks/Collapsible.js";
import { D as Dropdown } from "../../../../chunks/Dropdown.js";
import { D as DropdownSub } from "../../../../chunks/DropdownSub.js";
import { P as Pencil } from "../../../../chunks/Pencil.js";
import { D as Download } from "../../../../chunks/Download.js";
import { E as EllipsisHorizontal } from "../../../../chunks/EllipsisHorizontal.js";
function Message($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let message = $$props["message"];
    let idx = $$props["idx"];
    let onDelete = $$props["onDelete"];
    $$renderer2.push(`<div class="flex gap-2 group"><div class="flex items-start pt-1"><div class="px-2 py-1 text-sm font-semibold uppercase min-w-[6rem] text-left rounded-lg transition">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(message.role))}</div></div> <div class="flex-1"><textarea${attr("id", `${stringify(message.role)}-${stringify(idx)}-textarea`)} class="w-full bg-transparent outline-hidden rounded-lg p-2 text-sm resize-none overflow-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t(`Enter {{role}} message here`, {
      role: message.role === "user" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("a user") : store_get($$store_subs ??= {}, "$i18n", i18n).t("an assistant")
    }))} rows="1">`);
    const $$body = escape_html(
      // e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
      message.content
    );
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="pt-1"><button class="group-hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg></button></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { message, idx, onDelete });
  });
}
function Messages($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let messages = fallback($$props["messages"], () => [], true);
    $$renderer2.push(`<div class="py-3 space-y-3"><!--[-->`);
    const each_array = ensure_array_like(messages);
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let message = each_array[idx];
      Message($$renderer2, {
        message,
        idx,
        onDelete: () => {
          messages = messages.filter((message2, messageIdx) => messageIdx !== idx);
        }
      });
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { messages });
  });
}
function Chat($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let selectedModelId = "";
    let showSystem = false;
    let system = "";
    let role = "user";
    let message = "";
    let messages = [];
    const resizeSystemTextarea = async () => {
      await tick();
    };
    if (showSystem) {
      resizeSystemTextarea();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col justify-between w-full overflow-y-auto h-full"><div class="mx-auto w-full md:px-0 h-full relative"><div class="flex flex-col h-full px-3.5"><div class="flex w-full items-center gap-1.5">`);
      Collapsible($$renderer3, {
        className: "w-full flex-1",
        buttonClassName: "w-full rounded-lg text-sm border border-gray-100/30 dark:border-gray-850/30 w-full py-1 px-1.5",
        grow: true,
        get open() {
          return showSystem;
        },
        set open($$value) {
          showSystem = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex gap-2 justify-between items-center"><div class="shrink-0 font-medium ml-1.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("System Instructions"))}</div> `);
          if (!showSystem && system.trim()) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex-1 text-gray-500 line-clamp-1">${escape_html(system)}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="shrink-0"><button class="p-1.5 bg-transparent hover:bg-white/5 transition rounded-lg">`);
          if (showSystem) {
            $$renderer4.push("<!--[0-->");
            ChevronUp($$renderer4, { className: "size-3.5" });
          } else {
            $$renderer4.push("<!--[-1-->");
            Pencil($$renderer4, { className: "size-3.5" });
          }
          $$renderer4.push(`<!--]--></button></div></div>`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="pt-1 px-1.5"><textarea class="w-full h-full bg-transparent resize-none outline-hidden text-sm"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("You're a helpful assistant."))} rows="4">`);
            const $$body = escape_html(system);
            if ($$body) {
              $$renderer4.push(`${$$body}`);
            }
            $$renderer4.push(`</textarea></div></div>`);
          }
        }
      });
      $$renderer3.push(`<!----> `);
      Dropdown($$renderer3, {
        children: ($$renderer4) => {
          $$renderer4.push(`<button class="p-1.5 text-sm font-medium bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition rounded-lg"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("More options"))}>`);
          EllipsisHorizontal($$renderer4, { className: "size-4" });
          $$renderer4.push(`<!----></button>`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="min-w-[200px] rounded-2xl px-1 py-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg">`);
            DropdownSub($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"${attr("disabled", messages.length === 0, true)}><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export chat (.json)"))}</div></button> <button class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"${attr("disabled", messages.length === 0, true)}><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Plain text (.txt)"))}</div></button>`);
              },
              $$slots: {
                default: true,
                trigger: ($$renderer5) => {
                  $$renderer5.push(`<button slot="trigger" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full">`);
                  Download($$renderer5, { strokeWidth: "1.5" });
                  $$renderer5.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}</div></button>`);
                }
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          }
        }
      });
      $$renderer3.push(`<!----></div> <div class="pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0" id="messages-container"><div class="h-full w-full flex flex-col"><div class="flex-1 p-1">`);
      Messages($$renderer3, {
        get messages() {
          return messages;
        },
        set messages($$value) {
          messages = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div> <div class="pb-3"><div class="border border-gray-100/30 dark:border-gray-850/30 w-full px-3 py-2.5 rounded-xl"><div class="py-0.5"><textarea class="w-full h-full bg-transparent resize-none outline-hidden text-sm"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t(`Enter {{role}} message here`, {
        role: store_get($$store_subs ??= {}, "$i18n", i18n).t("a user")
      }))} rows="2">`);
      const $$body_1 = escape_html(message);
      if ($$body_1) {
        $$renderer3.push(`${$$body_1}`);
      }
      $$renderer3.push(`</textarea></div> <div class="flex justify-between flex-col sm:flex-row items-start sm:items-center gap-2 mt-2"><div class="shrink-0"><button type="button"${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-900 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition rounded-lg shrink-0 ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "outline-hidden")}`)}${attr("aria-pressed", role === "assistant")}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Switch to Assistant role"))}>`);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("User"))}`);
      }
      $$renderer3.push(`<!--]--></button></div> <div class="flex items-center justify-between gap-2 w-full sm:w-auto"><div class="flex-1">`);
      $$renderer3.select(
        {
          class: "bg-transparent border border-gray-100/30 dark:border-gray-850/30 rounded-lg py-1 px-2 -mx-0.5 text-sm outline-hidden w-full",
          value: selectedModelId
        },
        ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$models", models));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let model = each_array[$$index];
            $$renderer4.option({ value: model.id, class: "bg-gray-50 dark:bg-gray-700" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(model.name)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div> <div class="flex gap-2 shrink-0">`);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<button${attr("disabled", message === "", true)} class="px-3.5 py-1.5 text-sm font-medium disabled:bg-gray-50 dark:disabled:hover:bg-gray-850 disabled:cursor-not-allowed bg-gray-50 hover:bg-gray-100 text-gray-900 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}</button> <button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run"))}</button>`);
      }
      $$renderer3.push(`<!--]--></div></div></div></div></div></div></div></div>`);
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
function _page($$renderer) {
  Chat($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
