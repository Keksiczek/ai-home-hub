import { c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { c as config } from "../../../../../chunks/index2.js";
import { A as Analytics } from "../../../../../chunks/Analytics.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_admin_analytics ?? true) {
      $$renderer2.push("<!--[0-->");
      Analytics($$renderer2);
    } else {
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
