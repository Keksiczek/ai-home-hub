import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, o as getContext, c as store_get, t as stringify, k as escape_html, j as slot, u as unsubscribe_stores } from "./root.js";
import { v4 } from "uuid";
import dayjs from "dayjs";
import "dayjs/locale/af.js";
import "dayjs/locale/am.js";
import "dayjs/locale/ar.js";
import "dayjs/locale/az.js";
import "dayjs/locale/be.js";
import "dayjs/locale/bg.js";
import "dayjs/locale/bi.js";
import "dayjs/locale/bm.js";
import "dayjs/locale/bn.js";
import "dayjs/locale/bo.js";
import "dayjs/locale/br.js";
import "dayjs/locale/bs.js";
import "dayjs/locale/ca.js";
import "dayjs/locale/cs.js";
import "dayjs/locale/cv.js";
import "dayjs/locale/cy.js";
import "dayjs/locale/da.js";
import "dayjs/locale/de.js";
import "dayjs/locale/dv.js";
import "dayjs/locale/el.js";
import "dayjs/locale/en.js";
import "dayjs/locale/eo.js";
import "dayjs/locale/es.js";
import "dayjs/locale/eu.js";
import "dayjs/locale/fa.js";
import "dayjs/locale/fi.js";
import "dayjs/locale/fo.js";
import "dayjs/locale/fr.js";
import "dayjs/locale/fy.js";
import "dayjs/locale/ga.js";
import "dayjs/locale/gd.js";
import "dayjs/locale/gl.js";
import "dayjs/locale/gu.js";
import "dayjs/locale/he.js";
import "dayjs/locale/hi.js";
import "dayjs/locale/hr.js";
import "dayjs/locale/ht.js";
import "dayjs/locale/hu.js";
import "dayjs/locale/id.js";
import "dayjs/locale/is.js";
import "dayjs/locale/it.js";
import "dayjs/locale/ja.js";
import "dayjs/locale/jv.js";
import "dayjs/locale/ka.js";
import "dayjs/locale/kk.js";
import "dayjs/locale/km.js";
import "dayjs/locale/kn.js";
import "dayjs/locale/ko.js";
import "dayjs/locale/ku.js";
import "dayjs/locale/ky.js";
import "dayjs/locale/lb.js";
import "dayjs/locale/lo.js";
import "dayjs/locale/lt.js";
import "dayjs/locale/lv.js";
import "dayjs/locale/me.js";
import "dayjs/locale/mi.js";
import "dayjs/locale/mk.js";
import "dayjs/locale/ml.js";
import "dayjs/locale/mn.js";
import "dayjs/locale/mr.js";
import "dayjs/locale/ms.js";
import "dayjs/locale/mt.js";
import "dayjs/locale/my.js";
import "dayjs/locale/nb.js";
import "dayjs/locale/ne.js";
import "dayjs/locale/nl.js";
import "dayjs/locale/nn.js";
import "dayjs/locale/pl.js";
import "dayjs/locale/pt.js";
import "dayjs/locale/ro.js";
import "dayjs/locale/ru.js";
import "dayjs/locale/rw.js";
import "dayjs/locale/sd.js";
import "dayjs/locale/se.js";
import "dayjs/locale/si.js";
import "dayjs/locale/sk.js";
import "dayjs/locale/sl.js";
import "dayjs/locale/sq.js";
import "dayjs/locale/sr.js";
import "dayjs/locale/ss.js";
import "dayjs/locale/sv.js";
import "dayjs/locale/sw.js";
import "dayjs/locale/ta.js";
import "dayjs/locale/te.js";
import "dayjs/locale/tet.js";
import "dayjs/locale/tg.js";
import "dayjs/locale/th.js";
import "dayjs/locale/tk.js";
import "dayjs/locale/tlh.js";
import "dayjs/locale/tr.js";
import "dayjs/locale/tzl.js";
import "dayjs/locale/tzm.js";
import "dayjs/locale/uk.js";
import "dayjs/locale/ur.js";
import "dayjs/locale/uz.js";
import "dayjs/locale/vi.js";
import "dayjs/locale/yo.js";
import "dayjs/locale/zh.js";
import "dayjs/locale/zh-tw.js";
import "dayjs/locale/et.js";
import "dayjs/locale/en-gb.js";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { C as ChevronDown } from "./ChevronDown.js";
import { S as Spinner } from "./Spinner.js";
function ChevronUp($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Collapsible($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(duration);
    dayjs.extend(relativeTime);
    async function loadLocale(locales) {
      if (!locales || !Array.isArray(locales)) {
        return;
      }
      for (const locale of locales) {
        try {
          dayjs.locale(locale);
          break;
        } catch (error) {
          /* @__PURE__ */ console.error(`Could not load locale '${locale}':`, error);
        }
      }
    }
    let open = fallback($$props["open"], false);
    let className = fallback($$props["className"], "");
    let buttonClassName = fallback($$props["buttonClassName"], "w-fit text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition");
    let id = fallback($$props["id"], "");
    let title = fallback($$props["title"], null);
    let attributes = fallback($$props["attributes"], null);
    let chevron = fallback($$props["chevron"], false);
    let grow = fallback($$props["grow"], false);
    let disabled = fallback($$props["disabled"], false);
    let messageDone = fallback($$props["messageDone"], false);
    let hide = fallback($$props["hide"], false);
    let onChange = fallback($$props["onChange"], () => {
    });
    v4();
    loadLocale(store_get($$store_subs ??= {}, "$i18n", i18n).languages);
    onChange(open);
    $$renderer2.push(`<div${attr("id", id)}${attr_class(clsx(className))}>`);
    if (title !== null) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`${stringify(buttonClassName)} ${stringify(disabled ? "" : "cursor-pointer")}`)}><div${attr_class(` w-full flex items-center justify-between gap-2 ${stringify(attributes?.done && attributes?.done !== "true" && !messageDone ? "shimmer" : "")} `)}>`);
      if (attributes?.done && attributes?.done !== "true" && !messageDone) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div>`);
        Spinner($$renderer2, { className: "size-4" });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div>`);
      if (attributes?.type === "reasoning") {
        $$renderer2.push("<!--[0-->");
        if ((attributes?.done === "true" || messageDone) && attributes?.duration) {
          $$renderer2.push("<!--[0-->");
          if (attributes.duration < 1) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for less than a second"))}`);
          } else if (attributes.duration < 60) {
            $$renderer2.push("<!--[1-->");
            $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for {{DURATION}} seconds", { DURATION: attributes.duration }))}`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for {{DURATION}}", {
              DURATION: dayjs.duration(attributes.duration, "seconds").humanize()
            }))}`);
          }
          $$renderer2.push(`<!--]-->`);
        } else if (attributes?.done === "true" || messageDone) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought"))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thinking..."))}`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (attributes?.type === "code_interpreter") {
        $$renderer2.push("<!--[1-->");
        if (attributes?.done === "true" || messageDone) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Analyzed"))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Analyzing..."))}`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`${escape_html(title)}`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (!disabled) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex self-center translate-y-[1px]">`);
        if (open) {
          $$renderer2.push("<!--[0-->");
          ChevronUp($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        } else {
          $$renderer2.push("<!--[-1-->");
          ChevronDown($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div${attr_class(`${stringify(buttonClassName)} cursor-pointer`)}><div><div class="flex items-start justify-between"><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--> `);
      if (chevron) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex self-start translate-y-1">`);
        if (open) {
          $$renderer2.push("<!--[0-->");
          ChevronUp($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        } else {
          $$renderer2.push("<!--[-1-->");
          ChevronDown($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (grow) {
        $$renderer2.push("<!--[0-->");
        if (open && !hide) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div><!--[-->`);
          slot($$renderer2, $$props, "content", {}, null);
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (!grow) {
      $$renderer2.push("<!--[0-->");
      if (open && !hide) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div><!--[-->`);
        slot($$renderer2, $$props, "content", {}, null);
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      open,
      className,
      buttonClassName,
      id,
      title,
      attributes,
      chevron,
      grow,
      disabled,
      messageDone,
      hide,
      onChange
    });
  });
}
export {
  ChevronUp as C,
  Collapsible as a
};
//# sourceMappingURL=Collapsible.js.map
