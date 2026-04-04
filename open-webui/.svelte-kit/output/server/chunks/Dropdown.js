import { f as fallback, j as slot, d as attr_class, g as clsx, b as bind_props } from "./root.js";
import { o as onDestroy, t as tick } from "./index-server.js";
function Dropdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let show = fallback($$props["show"], false);
    let side = fallback($$props["side"], "bottom");
    let align = fallback($$props["align"], "start");
    let closeOnOutsideClick = fallback($$props["closeOnOutsideClick"], true);
    let onOpenChange = fallback($$props["onOpenChange"], () => {
    });
    let contentClass = fallback($$props["contentClass"], "");
    let sideOffset = fallback($$props["sideOffset"], 4);
    function positionContent() {
      return;
    }
    function close() {
      show = false;
      onOpenChange(false);
    }
    onDestroy(() => {
    });
    if (show) {
      tick().then(() => {
        setTimeout(positionContent, 50);
      });
    }
    $$renderer2.push(`<span style="display: contents; cursor: pointer;"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></span> `);
    if (
      /** Close the dropdown programmatically */
      show
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(clsx(contentClass))}><!--[-->`);
      slot($$renderer2, $$props, "content", {}, null);
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      show,
      side,
      align,
      closeOnOutsideClick,
      onOpenChange,
      contentClass,
      sideOffset,
      close
    });
  });
}
export {
  Dropdown as D
};
//# sourceMappingURL=Dropdown.js.map
