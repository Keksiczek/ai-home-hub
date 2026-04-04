import { k as escape_html, c as store_get, u as unsubscribe_stores } from "../../chunks/root.js";
import { p as page } from "../../chunks/stores.js";
function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="bg-white dark:bg-gray-800 min-h-screen"><div class="flex h-full"><div class="m-auto my-10 dark:text-gray-300 text-3xl font-medium">${escape_html(store_get($$store_subs ??= {}, "$page", page).status)}: ${escape_html(store_get($$store_subs ??= {}, "$page", page).error?.message)}</div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _error as default
};
//# sourceMappingURL=_error.svelte.js.map
