import { o as getContext, f as fallback, b as bind_props, k as escape_html, c as store_get, a as attr, d as attr_class, u as unsubscribe_stores, t as stringify } from "./root.js";
import "./Toaster.svelte_svelte_type_style_lang.js";
import { M as Modal, X as XMark } from "./Modal.js";
import "./index3.js";
function ImportModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let onImport = fallback($$props["onImport"], (e) => {
    });
    let onClose = fallback($$props["onClose"], () => {
    });
    let loadUrlHandler = fallback($$props["loadUrlHandler"], () => {
    });
    let successMessage = fallback($$props["successMessage"], "");
    let loading = false;
    let url = "";
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-3 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1"><div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden" type="url"${attr("value", url)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter the URL to import"))} required=""/></div></div></div> <div class="flex justify-end pt-3 text-sm font-medium"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))} `);
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
    bind_props($$props, { show, onImport, onClose, loadUrlHandler, successMessage });
  });
}
export {
  ImportModal as I
};
//# sourceMappingURL=ImportModal.js.map
