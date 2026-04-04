import { f as fallback, a as attr, d as attr_class, g as clsx, j as slot, b as bind_props, t as stringify } from "./root.js";
import { o as onDestroy } from "./index-server.js";
/* empty css                                    */
function XMark($$renderer, $$props) {
  let className = fallback($$props["className"], "size-3.5");
  let strokeWidth = fallback($$props["strokeWidth"], "2");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"${attr("stroke-width", strokeWidth)}${attr_class(clsx(className))}><!--[-->`);
  slot($$renderer, $$props, "default", {}, null);
  $$renderer.push(`<!--]--><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let show = fallback($$props["show"], true);
    let size = fallback($$props["size"], "md");
    let containerClassName = fallback($$props["containerClassName"], "p-3");
    let className = fallback($$props["className"], "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-4xl");
    const sizeToWidth = (size2) => {
      if (size2 === "full") {
        return "w-full";
      }
      if (size2 === "xs") {
        return "w-[16rem]";
      } else if (size2 === "sm") {
        return "w-[30rem]";
      } else if (size2 === "md") {
        return "w-[42rem]";
      } else if (size2 === "lg") {
        return "w-[56rem]";
      } else if (size2 === "xl") {
        return "w-[70rem]";
      } else if (size2 === "2xl") {
        return "w-[84rem]";
      } else if (size2 === "3xl") {
        return "w-[100rem]";
      } else {
        return "w-[56rem]";
      }
    };
    onDestroy(() => {
      show = false;
    });
    if (show) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div aria-modal="true" role="dialog"${attr_class(`modal fixed top-0 right-0 left-0 bottom-0 bg-black/30 dark:bg-black/60 w-full h-screen max-h-[100dvh] ${stringify(containerClassName)} flex justify-center z-9999 overflow-y-auto overscroll-contain`, "svelte-1vr5p4p")} style="scrollbar-gutter: stable;"><div${attr_class(`m-auto max-w-full ${stringify(sizeToWidth(size))} ${stringify(size !== "full" ? "mx-2" : "")} shadow-3xl min-h-fit scrollbar-hidden ${stringify(className)} border border-white dark:border-gray-850`, "svelte-1vr5p4p")}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { show, size, containerClassName, className });
  });
}
export {
  Modal as M,
  XMark as X
};
//# sourceMappingURL=Modal.js.map
