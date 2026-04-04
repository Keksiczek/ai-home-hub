import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props } from "./root.js";
function ChevronDown($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  ChevronDown as C
};
//# sourceMappingURL=ChevronDown.js.map
