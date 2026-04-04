import { f as fallback, j as slot, b as bind_props } from "./root.js";
function DropdownSub($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let contentClass = fallback($$props["contentClass"], "select-none rounded-2xl p-1 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg border border-gray-100 dark:border-gray-800");
    let maxWidth = fallback($$props["maxWidth"], 200);
    let sideOffset = fallback($$props["sideOffset"], 8);
    $$renderer2.push(`<div class="w-full"><!--[-->`);
    slot($$renderer2, $$props, "trigger", {}, null);
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { contentClass, maxWidth, sideOffset });
  });
}
export {
  DropdownSub as D
};
//# sourceMappingURL=DropdownSub.js.map
