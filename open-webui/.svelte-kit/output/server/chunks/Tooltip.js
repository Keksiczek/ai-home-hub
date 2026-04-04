import { f as fallback, G as element, j as slot, b as bind_props, d as attr_class, g as clsx } from "./root.js";
import "dompurify";
import { o as onDestroy } from "./index-server.js";
function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let elementId = fallback($$props["elementId"], "");
    let as = fallback($$props["as"], "div");
    let className = fallback($$props["className"], "flex");
    let placement = fallback($$props["placement"], "top");
    let content = fallback($$props["content"], () => `I'm a tooltip!`, true);
    let touch = fallback($$props["touch"], true);
    let theme = fallback($$props["theme"], "");
    let offset = fallback($$props["offset"], () => [0, 4], true);
    let allowHTML = fallback($$props["allowHTML"], true);
    let tippyOptions = fallback($$props["tippyOptions"], () => ({}), true);
    let interactive = fallback($$props["interactive"], false);
    let onClick = fallback($$props["onClick"], () => {
    });
    onDestroy(() => {
    });
    element(
      $$renderer2,
      as,
      () => {
        $$renderer2.push(`${attr_class(clsx(className))}`);
      },
      () => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <!--[-->`);
    slot($$renderer2, $$props, "tooltip", {}, null);
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      elementId,
      as,
      className,
      placement,
      content,
      touch,
      theme,
      offset,
      allowHTML,
      tippyOptions,
      interactive,
      onClick
    });
  });
}
export {
  Tooltip as T
};
//# sourceMappingURL=Tooltip.js.map
