import { o as getContext, q as head, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../chunks/root.js";
import { W as WEBUI_NAME } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    head("1v8al8m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
      });
    });
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
