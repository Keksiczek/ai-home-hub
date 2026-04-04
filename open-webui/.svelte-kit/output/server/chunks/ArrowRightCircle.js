import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props } from "./root.js";
function ArrowRightCircle($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  ArrowRightCircle as A
};
//# sourceMappingURL=ArrowRightCircle.js.map
