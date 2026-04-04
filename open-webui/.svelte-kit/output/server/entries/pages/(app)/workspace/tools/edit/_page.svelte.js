import "clsx";
import { o as getContext } from "../../../../../../chunks/root.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import { S as Spinner } from "../../../../../../chunks/Spinner.js";
import "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "../../../../../../chunks/index2.js";
import "../../../../../../chunks/index3.js";
import "../../../../../../chunks/codemirror.js";
import "dompurify";
import "marked";
/* empty css                                                                   */
/* empty css                                                           */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-full"><div class="pb-16">`);
      Spinner($$renderer2, { className: "size-5" });
      $$renderer2.push(`<!----></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
