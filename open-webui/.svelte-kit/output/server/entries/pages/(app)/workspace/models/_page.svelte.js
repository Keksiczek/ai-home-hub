import { o as getContext, q as head, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import { W as WEBUI_NAME, m as models } from "../../../../../chunks/index2.js";
import "../../../../../chunks/index3.js";
import "marked";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "sortablejs";
import fileSaver from "file-saver";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "dompurify";
/* empty css                                                                */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
function Models($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("91cwg4", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
        });
      });
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="w-full h-full flex justify-center items-center">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
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
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    if (store_get($$store_subs ??= {}, "$models", models) !== null) {
      $$renderer2.push("<!--[0-->");
      Models($$renderer2);
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
