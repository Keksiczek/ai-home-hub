import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props } from "./root.js";
function Download($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M6 20L18 20" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 4V16M12 16L15.5 12.5M12 16L8.5 12.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  Download as D
};
//# sourceMappingURL=Download.js.map
