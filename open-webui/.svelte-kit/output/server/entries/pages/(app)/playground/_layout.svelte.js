import { o as getContext, q as head, d as attr_class, t as stringify, c as store_get, k as escape_html, j as slot, u as unsubscribe_stores } from "../../../../chunks/root.js";
import { W as WEBUI_NAME, j as showSidebar, i as mobile } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
import { T as Tooltip } from "../../../../chunks/Tooltip.js";
import { S as Sidebar } from "../../../../chunks/Sidebar.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    head("40p4n8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Playground"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
      });
    });
    $$renderer2.push(`<div${attr_class(` flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "md:max-w-[calc(100%-var(--sidebar-width))]" : "")} max-w-full`)}><nav class="px-2.5 pt-1.5 backdrop-blur-xl w-full drag-region select-none"><div class="flex items-center">`);
    if (store_get($$store_subs ??= {}, "$mobile", mobile)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "md:hidden" : "")} flex flex-none items-center self-end`)}>`);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"),
        interactive: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<button id="sidebar-toggle-button" class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition cursor-"><div class="self-center p-1.5">`);
          Sidebar($$renderer3, {});
          $$renderer3.push(`<!----></div></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex w-full"><div class="flex gap-1 scrollbar-none overflow-x-auto w-fit text-center text-sm font-medium rounded-full bg-transparent pt-1"><a draggable="false"${attr_class(`min-w-fit p-1.5 ${stringify(["/playground", "/playground/"].includes(store_get($$store_subs ??= {}, "$page", page).url.pathname) ? "" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition select-none`)} href="/playground">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat"))}</a> <a draggable="false"${attr_class(`min-w-fit p-1.5 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/playground/completions") ? "" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition select-none`)} href="/playground/completions">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Completions"))}</a> <a draggable="false"${attr_class(`min-w-fit p-1.5 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/playground/images") ? "" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition select-none`)} href="/playground/images">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Images"))}</a></div></div></div></nav> <div class="flex-1 max-h-full overflow-y-auto"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
