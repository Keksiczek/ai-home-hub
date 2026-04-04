import { o as getContext, f as fallback, b as bind_props, c as store_get, u as unsubscribe_stores } from "../../../../../../chunks/root.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { g as goto } from "../../../../../../chunks/client.js";
import { m as models, c as config, h as settings } from "../../../../../../chunks/index2.js";
import { W as WEBUI_BASE_URL } from "../../../../../../chunks/constants.js";
import { c as createNewModel } from "../../../../../../chunks/index8.js";
import { g as getModels } from "../../../../../../chunks/index6.js";
import "dompurify";
import "dayjs";
import "../../../../../../chunks/index3.js";
/* empty css                                       */
import "../../../../../../chunks/codemirror.js";
import "file-saver";
import "panzoom";
import "marked";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
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
import "dayjs/plugin/duration.js";
import "dayjs/plugin/relativeTime.js";
/* empty css                                                           */
/* empty css                                                                   */
function ModelEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let onSubmit = $$props["onSubmit"];
    let onBack = fallback($$props["onBack"], null);
    let model = fallback($$props["model"], null);
    let edit = fallback($$props["edit"], false);
    let preset = fallback($$props["preset"], true);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { onSubmit, onBack, model, edit, preset });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    const onSubmit = async (modelInfo) => {
      if (store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === modelInfo.id)) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Error: A model with the ID '{{modelId}}' already exists. Please select a different ID to proceed.", { modelId: modelInfo.id }));
        return;
      }
      if (modelInfo.id === "") {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Error: Model ID cannot be empty. Please enter a valid ID to proceed."));
        return;
      }
      if (modelInfo) {
        const res = await createNewModel(localStorage.token, {
          ...modelInfo,
          meta: {
            ...modelInfo.meta,
            profile_image_url: modelInfo.meta.profile_image_url ?? `${WEBUI_BASE_URL}/static/favicon.png`,
            suggestion_prompts: modelInfo.meta.suggestion_prompts ? modelInfo.meta.suggestion_prompts.filter((prompt) => prompt.content !== "") : null
          },
          params: { ...modelInfo.params }
        }).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        if (res) {
          await models.set(await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null)));
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model created successfully!"));
          await goto();
        }
      }
    };
    let model = null;
    $$renderer2.push(`<!---->`);
    {
      ModelEditor($$renderer2, { model, onSubmit });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
