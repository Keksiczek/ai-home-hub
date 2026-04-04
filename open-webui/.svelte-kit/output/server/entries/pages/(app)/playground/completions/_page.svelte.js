import "clsx";
import { o as getContext, c as store_get, a as attr, k as escape_html, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { m as models } from "../../../../../chunks/index2.js";
import "../../../../../chunks/index3.js";
import { S as Selector } from "../../../../../chunks/Selector.js";
function Completions($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let text = "";
    let selectedModelId = "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col justify-between w-full overflow-y-auto h-full"><div class="mx-auto w-full md:px-0 h-full"><div class="flex flex-col h-full px-4"><div class="flex flex-col justify-between mb-1 gap-1"><div class="flex flex-col gap-1 w-full"><div class="flex w-full"><div class="overflow-hidden w-full"><div class="max-w-full">`);
      Selector($$renderer3, {
        placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"),
        items: store_get($$store_subs ??= {}, "$models", models).map((model) => ({ value: model.id, label: model.name, model })),
        get value() {
          return selectedModelId;
        },
        set value($$value) {
          selectedModelId = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div></div></div> <div class="pt-0.5 pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0" id="messages-container"><div class="h-full w-full flex flex-col"><div class="flex-1"><textarea id="text-completion-textarea" class="w-full h-full p-3 bg-transparent border border-gray-100/30 dark:border-gray-850/30 outline-hidden resize-none rounded-lg text-sm"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("You're a helpful assistant."))}>`);
      const $$body = escape_html(text);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></div></div></div> <div class="pb-3 flex justify-end"><div class="flex gap-2 shrink-0">`);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run"))}</button>`);
      }
      $$renderer3.push(`<!--]--></div></div></div></div></div>`);
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
  Completions($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
