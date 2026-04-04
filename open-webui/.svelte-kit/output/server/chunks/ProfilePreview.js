import { o as getContext, f as fallback, b as bind_props, j as slot } from "./root.js";
import "./index2.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import "dompurify";
import { c as Link_preview, d as Link_preview_trigger, U as UserStatusLinkPreview } from "./Badge.js";
function ProfilePreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let user = fallback($$props["user"], null);
    let align = fallback($$props["align"], "center");
    let side = fallback($$props["side"], "right");
    let sideOffset = fallback($$props["sideOffset"], 8);
    let openPreview = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Link_preview($$renderer3, {
        openDelay: 0,
        closeDelay: 200,
        get open() {
          return openPreview;
        },
        set open($$value) {
          openPreview = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Link_preview_trigger($$renderer4, {
            class: "flex items-center",
            children: ($$renderer5) => {
              $$renderer5.push(`<button type="button" class="cursor-pointer no-underline! font-normal!"><!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]--></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          UserStatusLinkPreview($$renderer4, { id: user?.id, side, align, sideOffset });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { user, align, side, sideOffset });
  });
}
export {
  ProfilePreview as P
};
//# sourceMappingURL=ProfilePreview.js.map
