import { o as getContext, c as store_get, u as unsubscribe_stores } from "./root.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { p as page } from "./stores.js";
import "./index2.js";
/* empty css                                    */
import "dompurify";
import "./Toaster.svelte_svelte_type_style_lang.js";
import "file-saver";
import "dayjs";
import "dayjs/plugin/relativeTime.js";
function Evaluations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    let selectedTab;
    const scrollToTab = (tabId) => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    };
    {
      const pathParts = store_get($$store_subs ??= {}, "$page", page).url.pathname.split("/");
      const tabFromPath = pathParts[pathParts.length - 1];
      selectedTab = ["leaderboard", "feedback"].includes(tabFromPath) ? tabFromPath : "leaderboard";
    }
    if (selectedTab) {
      scrollToTab(selectedTab);
    }
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Evaluations as E
};
//# sourceMappingURL=Evaluations.js.map
