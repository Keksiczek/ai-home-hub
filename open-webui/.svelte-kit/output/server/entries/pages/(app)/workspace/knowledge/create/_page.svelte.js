import "clsx";
import { o as getContext, u as unsubscribe_stores, k as escape_html, c as store_get, a as attr, d as attr_class, t as stringify } from "../../../../../../chunks/root.js";
import "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import { u as user } from "../../../../../../chunks/index2.js";
import { A as AccessControl } from "../../../../../../chunks/AccessControl.js";
function CreateKnowledgeBase($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let loading = false;
    let name = "";
    let description = "";
    let accessGrants = [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="w-full max-h-full"><button class="flex space-x-1"><div class="self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"></path></svg></div> <div class="self-center font-medium text-sm">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"))}</div></button> <form class="flex flex-col max-w-lg mx-auto mt-10 mb-10"><div class="w-full flex flex-col justify-center"><div class="text-2xl font-medium font-primary mb-2.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create a knowledge base"))}</div> <div class="w-full flex flex-col gap-2.5"><div class="w-full"><div class="text-sm mb-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("What are you working on?"))}</div> <div class="w-full mt-1"><input class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Name your knowledge base"))} required=""/></div></div> <div><div class="text-sm mb-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("What are you trying to achieve?"))}</div> <div class="w-full mt-1"><textarea class="w-full resize-none rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden" rows="4"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Describe your knowledge base and objectives"))} required="">`);
      const $$body = escape_html(description);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></div></div></div></div> <div class="mt-2">`);
      AccessControl($$renderer3, {
        accessRoles: ["read", "write"],
        share: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.knowledge || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        sharePublic: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.public_knowledge || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        shareUsers: (store_get($$store_subs ??= {}, "$user", user)?.permissions?.access_grants?.allow_users ?? true) || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        get accessGrants() {
          return accessGrants;
        },
        set accessGrants($$value) {
          accessGrants = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="flex justify-end mt-2"><div><button${attr_class(` text-sm px-4 py-2 transition rounded-lg ${stringify(" bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800")} flex`)} type="submit"${attr("disabled", loading, true)}><div class="self-center font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Knowledge"))}</div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></button></div></div></form></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  CreateKnowledgeBase($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
