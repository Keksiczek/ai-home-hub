import { c as store_get, u as unsubscribe_stores } from "../../../../../chunks/root.js";
import { p as page } from "../../../../../chunks/stores.js";
import { C as Chat } from "../../../../../chunks/Chat.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    Chat($$renderer2, {
      chatIdProp: store_get($$store_subs ??= {}, "$page", page).params.id
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
