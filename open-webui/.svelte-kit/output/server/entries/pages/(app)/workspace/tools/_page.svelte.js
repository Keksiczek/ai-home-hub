import "clsx";
import { o as getContext, q as head, k as escape_html, c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import { o as onDestroy } from "../../../../../chunks/index-server.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import fileSaver from "file-saver";
import { W as WEBUI_NAME } from "../../../../../chunks/index2.js";
import { g as goto } from "../../../../../chunks/client.js";
import { l as loadToolByUrl } from "../../../../../chunks/index10.js";
import "../../../../../chunks/index3.js";
import "dompurify";
import "marked";
/* empty css                                                                */
/* empty css                                                        */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
/* empty css                                                              */
import { I as ImportModal } from "../../../../../chunks/ImportModal.js";
function Tools($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let searchDebounceTimer;
    let showImportModal = false;
    onDestroy(() => {
      clearTimeout(searchDebounceTimer);
    });
    {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(
        () => {
        },
        300
      );
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("kq2jg5", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tools"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
        });
      });
      ImportModal($$renderer3, {
        onImport: (tool) => {
          sessionStorage.tool = JSON.stringify({ ...tool });
          goto();
        },
        loadUrlHandler: async (url) => {
          return await loadToolByUrl(localStorage.token, url);
        },
        successMessage: store_get($$store_subs ??= {}, "$i18n", i18n).t("Tool imported successfully"),
        get show() {
          return showImportModal;
        },
        set show($$value) {
          showImportModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
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
  Tools($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
