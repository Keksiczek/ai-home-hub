import { o as getContext, f as fallback, b as bind_props, k as escape_html, c as store_get, u as unsubscribe_stores, a as attr, d as attr_class, g as clsx } from "./root.js";
import { M as Modal, X as XMark } from "./Modal.js";
import { A as AccessControl } from "./AccessControl.js";
function AccessControlModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let accessGrants = fallback($$props["accessGrants"], () => [], true);
    let accessControl = fallback($$props["accessControl"], void 0);
    let accessRoles = fallback($$props["accessRoles"], () => ["read"], true);
    let share = fallback($$props["share"], true);
    let sharePublic = fallback($$props["sharePublic"], true);
    let shareUsers = fallback($$props["shareUsers"], true);
    let onChange = fallback($$props["onChange"], () => {
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-3 pb-1"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access Control"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="w-full px-5 pb-4 dark:text-white">`);
          AccessControl($$renderer4, {
            onChange,
            accessRoles,
            share,
            sharePublic,
            shareUsers,
            get accessGrants() {
              return accessGrants;
            },
            set accessGrants($$value) {
              accessGrants = $$value;
              $$settled = false;
            },
            get accessControl() {
              return accessControl;
            },
            set accessControl($$value) {
              accessControl = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div>`);
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      show,
      accessGrants,
      accessControl,
      accessRoles,
      share,
      sharePublic,
      shareUsers,
      onChange
    });
  });
}
function LockClosed($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  AccessControlModal as A,
  LockClosed as L
};
//# sourceMappingURL=LockClosed.js.map
