import "clsx";
import { o as getContext } from "./root.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import "./index2.js";
import "dayjs";
/* empty css                                    */
import "dayjs/plugin/calendar.js";
import "dompurify";
import "./index3.js";
function Analytics($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  Analytics as A
};
//# sourceMappingURL=Analytics.js.map
