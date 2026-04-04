import "clsx";
import { o as getContext, q as head, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { o as onDestroy } from "../../../../../chunks/index-server.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { W as WEBUI_NAME } from "../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/index3.js";
import "dompurify";
import "marked";
/* empty css                                                                */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
function Knowledge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    const i18n = getContext("i18n");
    let searchDebounceTimer;
    onDestroy(() => {
      clearTimeout(searchDebounceTimer);
    });
    const init = async () => {
      return;
    };
    {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(
        () => {
          init();
        },
        300
      );
    }
    {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("ovc1wm", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
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
function _page($$renderer) {
  Knowledge($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
