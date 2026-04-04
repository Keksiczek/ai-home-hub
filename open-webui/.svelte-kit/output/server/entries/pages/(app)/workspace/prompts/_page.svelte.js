import "clsx";
import { o as getContext, q as head, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import { o as onDestroy } from "../../../../../chunks/index-server.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import fileSaver from "file-saver";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { W as WEBUI_NAME } from "../../../../../chunks/index2.js";
import "../../../../../chunks/index3.js";
import "dompurify";
import "marked";
/* empty css                                                                */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
function Prompts($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let searchDebounceTimer;
    let viewOption = "";
    let selectedTag = "";
    let page = 1;
    const getPromptList = async () => {
      return;
    };
    onDestroy(() => {
      clearTimeout(searchDebounceTimer);
    });
    {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(
        () => {
          page = 1;
          getPromptList();
        },
        300
      );
    }
    if (page && selectedTag !== void 0 && viewOption !== void 0) {
      getPromptList();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("1jqd4z5", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompts"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
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
  Prompts($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
