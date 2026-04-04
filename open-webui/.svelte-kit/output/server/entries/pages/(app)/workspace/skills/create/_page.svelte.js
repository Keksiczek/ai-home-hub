import { f as fallback, o as getContext, u as unsubscribe_stores, b as bind_props, c as store_get, k as escape_html, a as attr } from "../../../../../../chunks/root.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { g as goto } from "../../../../../../chunks/client.js";
import { u as user, V as skills } from "../../../../../../chunks/index2.js";
import { a as WEBUI_API_BASE_URL } from "../../../../../../chunks/constants.js";
import { T as Tooltip } from "../../../../../../chunks/Tooltip.js";
import { A as AccessControlModal, L as LockClosed } from "../../../../../../chunks/LockClosed.js";
import { C as ChevronLeft } from "../../../../../../chunks/ChevronLeft.js";
import "../../../../../../chunks/index3.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
const createNewSkill = async (token, skill) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/skills/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...skill
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getSkills = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/skills/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const updateSkillAccessGrants = async (token, id, accessGrants) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/skills/id/${id}/access/update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      access_grants: accessGrants
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function SkillEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let onSubmit = $$props["onSubmit"];
    let edit = fallback($$props["edit"], false);
    let skill = fallback($$props["skill"], null);
    let clone = fallback($$props["clone"], false);
    let disabled = fallback($$props["disabled"], false);
    const i18n = getContext("i18n");
    let loading = false;
    let name = "";
    let id = "";
    let description = "";
    let content = "";
    let accessGrants = [];
    let showAccessControlModal = false;
    let isFrontmatterDetected = false;
    if (!edit && !content) {
      isFrontmatterDetected = false;
    }
    if (!edit && true && !isFrontmatterDetected) {
      id = "";
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AccessControlModal($$renderer3, {
        accessRoles: ["read", "write"],
        share: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.skills || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        sharePublic: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.public_skills || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        shareUsers: (store_get($$store_subs ??= {}, "$user", user)?.permissions?.access_grants?.allow_users ?? true) || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        onChange: async () => {
          if (edit && skill?.id) {
            try {
              await updateSkillAccessGrants(localStorage.token, skill.id, accessGrants);
              toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Saved"));
            } catch (error) {
              toast.error(`${error}`);
            }
          }
        },
        get show() {
          return showAccessControlModal;
        },
        set show($$value) {
          showAccessControlModal = $$value;
          $$settled = false;
        },
        get accessGrants() {
          return accessGrants;
        },
        set accessGrants($$value) {
          accessGrants = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex flex-col justify-between w-full overflow-y-auto h-full"><div class="mx-auto w-full md:px-0 h-full"><form class="flex flex-col max-h-[100dvh] h-full"><div class="flex flex-col flex-1 overflow-auto h-0 rounded-lg"><div class="w-full mb-2 flex flex-col gap-0.5"><div class="flex w-full items-center"><div class="shrink-0 mr-2">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"),
        children: ($$renderer4) => {
          $$renderer4.push(`<button class="w-full text-left text-sm py-1.5 px-1 rounded-lg dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-gray-850"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"))} type="button">`);
          ChevronLeft($$renderer4, { strokeWidth: "2.5" });
          $$renderer4.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="flex-1">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g. Code Review Guidelines"),
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<input class="w-full text-2xl bg-transparent outline-hidden" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill Name"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill Name"))}${attr("value", name)} required=""${attr("disabled", disabled, true)}/>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="self-center shrink-0">`);
      if (!disabled) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2 py-1 rounded-full flex gap-1 items-center" type="button">`);
        LockClosed($$renderer3, { strokeWidth: "2.5", className: "size-3.5" });
        $$renderer3.push(`<!----> <div class="text-sm font-medium shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</div></button>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Read Only"))}</span>`);
      }
      $$renderer3.push(`<!--]--></div></div> <div class="flex gap-2 px-1 items-center">`);
      if (edit) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="text-sm text-gray-500 shrink-0">${escape_html(id)}</div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        Tooltip($$renderer3, {
          className: "w-full",
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g. code-review-guidelines"),
          placement: "top-start",
          children: ($$renderer4) => {
            $$renderer4.push(`<input class="w-full text-sm disabled:text-gray-500 bg-transparent outline-hidden" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill ID"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill ID"))}${attr("value", id)} required=""${attr("disabled", edit, true)}/>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer3.push(`<!--]--> `);
      Tooltip($$renderer3, {
        className: "w-full self-center items-center flex",
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g. Step-by-step instructions for code reviews"),
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<input class="w-full text-sm bg-transparent outline-hidden" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill Description"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill Description"))}${attr("value", description)}${attr("disabled", disabled, true)}/>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> <div class="mb-2 flex-1 overflow-auto h-0 rounded-lg"><div class="h-full flex flex-col"><div class="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100/50 dark:border-gray-850/50 flex-1 min-h-0 overflow-hidden flex flex-col">`);
      if (disabled) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="px-4 py-3 overflow-y-auto flex-1"><pre class="text-xs whitespace-pre-wrap font-mono">${escape_html(content)}</pre></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<textarea class="w-full flex-1 text-xs bg-transparent outline-hidden resize-none font-mono px-4 py-3"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter skill instructions in markdown..."))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill Instructions"))} required="">`);
        const $$body = escape_html(content);
        if ($$body) {
          $$renderer3.push(`${$$body}`);
        }
        $$renderer3.push(`</textarea>`);
      }
      $$renderer3.push(`<!--]--></div></div></div> <div class="pb-3 flex justify-end">`);
      if (!disabled) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap" type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(edit ? "Save" : "Save & Create"))} `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></button>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></div></form></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, edit, skill, clone, disabled });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let skill = null;
    let clone = false;
    const onSubmit = async (_skill) => {
      const res = await createNewSkill(localStorage.token, _skill).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Skill created successfully"));
        await skills.set(await getSkills(localStorage.token));
        await goto();
      }
    };
    $$renderer2.push(`<!---->`);
    {
      SkillEditor($$renderer2, { skill, onSubmit, clone });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
