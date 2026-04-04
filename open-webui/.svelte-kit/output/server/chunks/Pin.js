import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props } from "./root.js";
function PinSlash($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" width="24" height="24"><path d="M9.5 14.5L3 21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.67602 7.8896L6.69713 7.78823L5.00007 9.48528L14.1925 18.6777L15.8895 16.9806L15.7879 16M11.4847 7L15.1568 2.67141L21.0065 8.5211L16.6991 12.175" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 3L21 21" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Pin($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" width="24" height="24"><path d="M9.5 14.5L3 21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.00007 9.48528L14.1925 18.6777L15.8895 16.9806L15.4974 13.1944L21.0065 8.5211L15.1568 2.67141L10.4834 8.18034L6.69713 7.78823L5.00007 9.48528Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  PinSlash as P,
  Pin as a
};
//# sourceMappingURL=Pin.js.map
