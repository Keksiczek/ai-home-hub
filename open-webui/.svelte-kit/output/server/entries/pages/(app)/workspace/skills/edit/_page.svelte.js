import { o as getContext, c as store_get, u as unsubscribe_stores } from "../../../../../../chunks/root.js";
import "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import "../../../../../../chunks/index2.js";
import { p as page } from "../../../../../../chunks/stores.js";
import "dompurify";
/* empty css                                                           */
import "../../../../../../chunks/index3.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("id");
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
