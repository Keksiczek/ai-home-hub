import "clsx";
import { o as getContext, e as ensure_array_like, a as attr, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/index2.js";
function Images($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let prompt = "";
    let sourceImages = [];
    let generatedImages = [];
    $$renderer2.push(`<div class="flex flex-col justify-between w-full overflow-y-auto h-full"><div class="mx-auto w-full md:px-0 h-full"><div class="flex flex-col h-full px-4"><div class="pt-0.5 pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0" id="images-container"><div class="h-full w-full flex flex-col"><div class="flex-1 p-1">`);
    if (generatedImages.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"><!--[-->`);
      const each_array = ensure_array_like(generatedImages);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let image = each_array[index];
        $$renderer2.push(`<button class="relative group cursor-pointer"><img${attr("src", image.url)} alt="" class="w-full aspect-square object-cover rounded-lg border border-gray-100/30 dark:border-gray-850/30"/> <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Generated images will appear here"))}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="pb-3"><div class="border border-gray-100/30 dark:border-gray-850/30 w-full px-3 py-2.5 rounded-xl">`);
    if (sourceImages.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex flex-wrap gap-2 mb-2"><!--[-->`);
      const each_array_1 = ensure_array_like(sourceImages);
      for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
        let image = each_array_1[index];
        $$renderer2.push(`<div class="relative group"><div class="relative flex items-center"><img${attr("src", image)} alt="" class="size-10 rounded-xl object-cover"/></div> <div class="absolute -top-1 -right-1"><button class="bg-white text-black border border-white rounded-full group-hover:visible invisible transition" type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="py-0.5"><textarea class="w-full h-full bg-transparent resize-none outline-hidden text-sm"${attr("placeholder", sourceImages.length > 0 ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Describe the edit...") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Describe the image..."))} rows="2">`);
    const $$body = escape_html(prompt);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="flex justify-between items-center gap-2 mt-2"><div class="shrink-0"><input type="file" accept="image/*" multiple="" class="hidden"/> <button type="button" class="px-3.5 py-1.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-900 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Image"))}</button></div> <div class="flex gap-2 shrink-0">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button${attr("disabled", prompt.trim() === "", true)} class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run"))}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  Images($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
