import { b as bind_props, z as props_id, i as spread_props, y as derived, m as attributes, f as fallback, a as attr, d as attr_class, g as clsx, o as getContext, c as store_get, k as escape_html, j as slot, u as unsubscribe_stores, t as stringify, e as ensure_array_like, h as attr_style } from "./root.js";
import { marked } from "marked";
import Fuse from "fuse.js";
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
import relativeTime from "dayjs/plugin/relativeTime.js";
import { S as Spinner } from "./Spinner.js";
import { t as tick } from "./index-server.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { O as OLLAMA_API_BASE_URL, a as WEBUI_API_BASE_URL } from "./constants.js";
import { u as user, h as settings, c as config, i as mobile, U as MODEL_DOWNLOAD_POOL, m as models } from "./index2.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { s as sanitizeResponseContent, a as copyToClipboard } from "./index3.js";
import { g as getModels } from "./index6.js";
import { C as ChevronDown } from "./ChevronDown.js";
import { C as Check, S as Search } from "./Check.js";
import { T as Tooltip } from "./Tooltip.js";
import { D as Dropdown } from "./Dropdown.js";
import { P as PinSlash, a as Pin } from "./Pin.js";
import { L as Link } from "./Link.js";
import { P as Pencil } from "./Pencil.js";
import { E as EllipsisHorizontal } from "./EllipsisHorizontal.js";
import { M as MenuRootState, c as MenuMenuState, d as MenuContentState, P as Popper_layer_force_mount, a as Popper_layer, D as DropdownMenuTriggerState, b as Portal } from "./popper-layer-force-mount.js";
import { n as noop, e as boxWith, F as Floating_layer, d as createId, m as mergeProps, q as getFloatingContentCSSVars, p as Floating_layer_anchor } from "./floating-layer-anchor.js";
function Menu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      dir = "ltr",
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      _internal_variant: variant = "dropdown-menu",
      children
    } = $$props;
    const root = MenuRootState.create({
      variant: boxWith(() => variant),
      dir: boxWith(() => dir),
      onClose: () => {
        open = false;
        onOpenChange(false);
      }
    });
    MenuMenuState.create(
      {
        open: boxWith(() => open, (v) => {
          open = v;
          onOpenChange(v);
        }),
        onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
      },
      root
    );
    Floating_layer($$renderer2, {
      children: ($$renderer3) => {
        children?.($$renderer3);
        $$renderer3.push(`<!---->`);
      }
    });
    bind_props($$props, { open });
  });
}
function Dropdown_menu_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      child,
      children,
      ref = null,
      loop = true,
      onInteractOutside = noop,
      onEscapeKeydown = noop,
      onCloseAutoFocus = noop,
      forceMount = false,
      trapFocus = false,
      style,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const contentState = MenuContentState.create({
      id: boxWith(() => id),
      loop: boxWith(() => loop),
      ref: boxWith(() => ref, (v) => ref = v),
      onCloseAutoFocus: boxWith(() => onCloseAutoFocus)
    });
    const mergedProps = derived(() => mergeProps(restProps, contentState.props));
    function handleInteractOutside(e) {
      contentState.handleInteractOutside(e);
      if (e.defaultPrevented) return;
      onInteractOutside(e);
      if (e.defaultPrevented) return;
      if (e.target && e.target instanceof Element) {
        const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;
        if (e.target.closest(subContentSelector)) return;
      }
      contentState.parentMenu.onClose();
    }
    function handleEscapeKeydown(e) {
      onEscapeKeydown(e);
      if (e.defaultPrevented) return;
      contentState.parentMenu.onClose();
    }
    if (forceMount) {
      $$renderer2.push("<!--[0-->");
      {
        let popper = function($$renderer3, { props, wrapperProps }) {
          const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
          if (child) {
            $$renderer3.push("<!--[0-->");
            child($$renderer3, {
              props: finalProps,
              wrapperProps,
              ...contentState.snippetProps
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        };
        Popper_layer_force_mount($$renderer2, spread_props([
          mergedProps(),
          contentState.popperProps,
          {
            ref: contentState.opts.ref,
            enabled: contentState.parentMenu.opts.open.current,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            trapFocus,
            loop,
            forceMount: true,
            id,
            shouldRender: contentState.shouldRender,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else if (!forceMount) {
      $$renderer2.push("<!--[1-->");
      {
        let popper = function($$renderer3, { props, wrapperProps }) {
          const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
          if (child) {
            $$renderer3.push("<!--[0-->");
            child($$renderer3, {
              props: finalProps,
              wrapperProps,
              ...contentState.snippetProps
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        };
        Popper_layer($$renderer2, spread_props([
          mergedProps(),
          contentState.popperProps,
          {
            ref: contentState.opts.ref,
            open: contentState.parentMenu.opts.open.current,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            trapFocus,
            loop,
            forceMount: false,
            id,
            shouldRender: contentState.shouldRender,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Menu_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      id = createId(uid),
      ref = null,
      child,
      children,
      disabled = false,
      type = "button",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const triggerState = DropdownMenuTriggerState.create({
      id: boxWith(() => id),
      disabled: boxWith(() => disabled ?? false),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
    Floating_layer_anchor($$renderer2, {
      id,
      ref: triggerState.opts.ref,
      children: ($$renderer3) => {
        if (child) {
          $$renderer3.push("<!--[0-->");
          child($$renderer3, { props: mergedProps() });
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<button${attributes({ ...mergedProps() })}>`);
          children?.($$renderer3);
          $$renderer3.push(`<!----></button>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    bind_props($$props, { ref });
  });
}
function GlobeAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
const getOllamaVersion = async (token, urlIdx) => {
  let error = null;
  const res = await fetch(`${OLLAMA_API_BASE_URL}/api/version${""}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...token && { authorization: `Bearer ${token}` }
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    if ("detail" in err) {
      error = err.detail;
    } else {
      error = "Server connection failed";
    }
    return null;
  });
  if (error) {
    throw error;
  }
  return res?.version ?? false;
};
const unloadModel = async (token, tagName) => {
  let error = null;
  const res = await fetch(`${OLLAMA_API_BASE_URL}/api/unload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model: tagName
    })
  }).catch((err) => {
    error = err;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function ArrowUpTray($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ModelItemMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let model = $$props["model"];
    let pinModelHandler = fallback($$props["pinModelHandler"], () => {
    });
    let copyLinkHandler = fallback($$props["copyLinkHandler"], () => {
    });
    let onClose = fallback($$props["onClose"], () => {
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        align: "end",
        sideOffset: -2,
        onOpenChange: (state) => {
          if (state === false) {
            onClose();
          }
        },
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("More"),
            className: store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "group-hover/item:opacity-100 opacity-0",
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="min-w-[210px] text-sm rounded-2xl p-1 z-[9999999] bg-white dark:bg-gray-850 dark:text-white shadow-lg border border-gray-100 dark:border-gray-800">`);
            if (model?.preset || model?.info?.base_model_id ? model?.info?.user_id === store_get($$store_subs ??= {}, "$user", user)?.id : store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2">`);
              Pencil($$renderer4, { className: "size-4" });
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}</div></button> <hr class="border-gray-50 dark:border-gray-800/30 my-1"/>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <button type="button"${attr("aria-pressed", (store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(model?.id))} class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2">`);
            if ((store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(model?.id)) {
              $$renderer4.push("<!--[0-->");
              PinSlash($$renderer4, {});
            } else {
              $$renderer4.push("<!--[-1-->");
              Pin($$renderer4, {});
            }
            $$renderer4.push(`<!--]--> <div class="flex items-center">`);
            if ((store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(model?.id)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hide from Sidebar"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Keep in Sidebar"))}`);
            }
            $$renderer4.push(`<!--]--></div></button> <button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2">`);
            Link($$renderer4, {});
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Link"))}</div></button> `);
            if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_community_sharing) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<hr class="border-gray-50 dark:border-gray-800/30 my-1"/> <button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2">`);
              GlobeAlt($$renderer4, { className: "size-4" });
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Community Reviews"))}</div></button>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div></div>`);
          }
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, model, pinModelHandler, copyLinkHandler, onClose });
  });
}
function Tag($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.8");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M4 12 L8 7 H21 V17 H8 L4 12 Z" stroke="currentColor" fill="none"></path><circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="currentColor"></circle></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ModelItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let selectedModelIdx = fallback($$props["selectedModelIdx"], () => -1, true);
    let item = fallback($$props["item"], () => ({}), true);
    let index = fallback($$props["index"], () => -1, true);
    let value = fallback($$props["value"], "");
    let unloadModelHandler = fallback($$props["unloadModelHandler"], () => {
    });
    let pinModelHandler = fallback($$props["pinModelHandler"], () => {
    });
    let onClick = fallback($$props["onClick"], () => {
    });
    const copyLinkHandler = async (model) => {
      const baseUrl = window.location.origin;
      const res = await copyToClipboard(`${baseUrl}/?model=${encodeURIComponent(model.id)}`);
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copied link to clipboard"));
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to copy link"));
      }
    };
    let showMenu = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<button role="option"${attr("aria-selected", value === item.value)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Select {{modelName}} model", { modelName: item.label }))}${attr_class(`flex group/item w-full text-left font-medium line-clamp-1 select-none items-center rounded-button py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-hidden transition-all duration-75 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer data-highlighted:bg-muted ${stringify(index === selectedModelIdx ? "bg-gray-100 dark:bg-gray-800 group-hover:bg-transparent" : "")}`)}${attr("data-arrow-selected", index === selectedModelIdx)}${attr("data-value", item.value)}><div class="flex flex-col flex-1 gap-1.5"><div class="flex items-center gap-2"><div class="flex items-center min-w-fit">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$user", user)?.role === "admin" ? item?.value ?? "" : "",
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${item.model.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`)}${attr("alt", store_get($$store_subs ??= {}, "$i18n", i18n).t("{{modelName}} profile image", { modelName: item.label }))} class="rounded-full size-5 flex items-center" loading="lazy"/>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="flex items-center">`);
      Tooltip($$renderer3, {
        content: `${item.label} (${item.value})`,
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="line-clamp-1">${escape_html(item.label)}</div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="shrink-0 flex items-center gap-2">`);
      if (item.model.owned_by === "ollama") {
        $$renderer3.push("<!--[0-->");
        if ((item.model.ollama?.details?.parameter_size ?? "") !== "") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex items-center translate-y-[0.5px]">`);
          Tooltip($$renderer3, {
            content: `${item.model.ollama?.details?.quantization_level ? item.model.ollama?.details?.quantization_level + " " : ""}${item.model.ollama?.size ? `(${(item.model.ollama?.size / 1024 ** 3).toFixed(1)}GB)` : ""}`,
            className: "self-end",
            children: ($$renderer4) => {
              $$renderer4.push(`<span class="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1">${escape_html(item.model.ollama?.details?.parameter_size ?? "")}</span>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (item.model.ollama?.expires_at && new Date(item.model.ollama?.expires_at * 1e3) > /* @__PURE__ */ new Date()) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex items-center translate-y-[0.5px] px-0.5">`);
          Tooltip($$renderer3, {
            content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Unloads {{FROM_NOW}}", {
              FROM_NOW: dayjs(item.model.ollama?.expires_at * 1e3).fromNow()
            })}`,
            className: "self-end",
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="flex items-center"><span class="relative flex size-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex rounded-full size-2 bg-green-500"></span></span></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if ((item?.model?.tags ?? []).length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<!---->`);
        {
          Tooltip($$renderer3, {
            elementId: `tags-${stringify(item.model.id)}`,
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="translate-y-[1px]">`);
              Tag($$renderer4, {});
              $$renderer4.push(`<!----></div>`);
            },
            $$slots: {
              default: true,
              tooltip: ($$renderer4) => {
                $$renderer4.push(`<div slot="tooltip"${attr("id", `tags-${stringify(item.model.id)}`)}><!--[-->`);
                const each_array = ensure_array_like(item.model?.tags.sort((a, b) => a.name.localeCompare(b.name)));
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let tag = each_array[$$index];
                  Tooltip($$renderer4, {
                    content: tag.name,
                    className: "flex-shrink-0",
                    children: ($$renderer5) => {
                      $$renderer5.push(`<div class="text-xs font-medium rounded-sm uppercase text-white">${escape_html(tag.name)}</div>`);
                    },
                    $$slots: { default: true }
                  });
                }
                $$renderer4.push(`<!--]--></div>`);
              }
            }
          });
        }
        $$renderer3.push(`<!---->`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (item.model?.direct) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Direct")}`,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="translate-y-[1px]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3"><path fill-rule="evenodd" d="M2 2.75A.75.75 0 0 1 2.75 2C8.963 2 14 7.037 14 13.25a.75.75 0 0 1-1.5 0c0-5.385-4.365-9.75-9.75-9.75A.75.75 0 0 1 2 2.75Zm0 4.5a.75.75 0 0 1 .75-.75 6.75 6.75 0 0 1 6.75 6.75.75.75 0 0 1-1.5 0C8 10.35 5.65 8 2.75 8A.75.75 0 0 1 2 7.25ZM3.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" clip-rule="evenodd"></path></svg></div>`);
          },
          $$slots: { default: true }
        });
      } else if (item.model.connection_type === "external") {
        $$renderer3.push("<!--[1-->");
        Tooltip($$renderer3, {
          content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("External")}`,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="translate-y-[1px]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3"><path fill-rule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clip-rule="evenodd"></path></svg></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (item.model?.info?.meta?.description) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: `${marked.parse(sanitizeResponseContent(item.model?.info?.meta?.description).replaceAll("\n", "<br>"))}`,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="translate-y-[1px]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></svg></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></div></div> <div class="ml-auto pl-2 pr-1 flex items-center gap-1.5 shrink-0">`);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" && item.model.owned_by === "ollama" && item.model.ollama?.expires_at && new Date(item.model.ollama?.expires_at * 1e3) > /* @__PURE__ */ new Date()) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Eject")}`,
          className: "flex-shrink-0 group-hover/item:opacity-100 opacity-0 ",
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="flex"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Eject model"))}>`);
            ArrowUpTray($$renderer4, { className: "size-3" });
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      ModelItemMenu($$renderer3, {
        model: item.model,
        pinModelHandler,
        copyLinkHandler: () => {
          copyLinkHandler(item.model);
        },
        get show() {
          return showMenu;
        },
        set show($$value) {
          showMenu = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<button${attr("aria-label", `${store_get($$store_subs ??= {}, "$i18n", i18n).t("More Options")}`)} class="flex">`);
          EllipsisHorizontal($$renderer4, {});
          $$renderer4.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if (value === item.value) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div>`);
        Check($$renderer3, { className: "size-3" });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></button>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      selectedModelIdx,
      item,
      index,
      value,
      unloadModelHandler,
      pinModelHandler,
      onClick
    });
  });
}
function Selector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filteredItems, visibleStart, visibleEnd;
    dayjs.extend(relativeTime);
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "");
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"), true);
    let searchEnabled = fallback($$props["searchEnabled"], true);
    let searchPlaceholder = fallback($$props["searchPlaceholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Search a model"), true);
    let items = fallback($$props["items"], () => [], true);
    let className = fallback($$props["className"], "w-[32rem]");
    let triggerClassName = fallback($$props["triggerClassName"], "text-lg");
    let pinModelHandler = fallback($$props["pinModelHandler"], () => {
    });
    let show = false;
    let tags = [];
    let selectedModel = "";
    let searchValue = "";
    let selectedTag = "";
    let selectedConnectionType = "";
    let ollamaVersion = null;
    let selectedModelIdx = 0;
    const fuse = new Fuse(
      items.map((item) => {
        const _item = {
          ...item,
          modelName: item.model?.name,
          tags: (item.model?.tags ?? []).map((tag) => tag.name).join(" "),
          desc: item.model?.info?.meta?.description
        };
        return _item;
      }),
      { keys: ["value", "tags", "modelName"], threshold: 0.4 }
    );
    const updateFuse = () => {
      if (fuse) {
        fuse.setCollection(items.map((item) => {
          const _item = {
            ...item,
            modelName: item.model?.name,
            tags: (item.model?.tags ?? []).map((tag) => tag.name).join(" "),
            desc: item.model?.info?.meta?.description
          };
          return _item;
        }));
      }
    };
    const resetView = async () => {
      await tick();
      const selectedInFiltered = filteredItems.findIndex((item2) => item2.value === value);
      if (selectedInFiltered >= 0) {
        selectedModelIdx = selectedInFiltered;
      } else {
        selectedModelIdx = 0;
      }
      const targetScrollTop = Math.max(0, selectedModelIdx * ITEM_HEIGHT - 128 + ITEM_HEIGHT / 2);
      listScrollTop = targetScrollTop;
      await tick();
      await tick();
      const item = document.querySelector(`[data-arrow-selected="true"]`);
      item?.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    };
    const setOllamaVersion = async () => {
      ollamaVersion = await getOllamaVersion(localStorage.token).catch((error) => false);
    };
    const unloadModelHandler = async (model) => {
      const res = await unloadModel(localStorage.token, model).catch((error) => {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Error unloading model: {{error}}", { error }));
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model unloaded successfully"));
        models.set(await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null)));
      }
    };
    const ITEM_HEIGHT = 42;
    const OVERSCAN = 10;
    let listScrollTop = 0;
    selectedModel = items.find((item) => item.value === value) ?? "";
    if (items) {
      updateFuse();
    }
    filteredItems = (searchValue ? fuse.search(searchValue).map((e) => {
      return e.item;
    }).filter((item) => {
      {
        return true;
      }
    }).filter((item) => {
      {
        return true;
      }
    }) : items.filter((item) => {
      {
        return true;
      }
    }).filter((item) => {
      {
        return true;
      }
    })).filter((item) => !(item.model?.info?.meta?.hidden ?? false));
    {
      resetView();
    }
    if (show) {
      setOllamaVersion();
    }
    visibleStart = Math.max(0, Math.floor(listScrollTop / ITEM_HEIGHT) - OVERSCAN);
    visibleEnd = Math.min(filteredItems.length, Math.ceil((listScrollTop + 256) / ITEM_HEIGHT) + OVERSCAN);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Menu($$renderer3, {
        onOpenChange: async () => {
          searchValue = "";
          listScrollTop = 0;
          window.setTimeout(() => document.getElementById("model-search-input")?.focus(), 0);
          resetView();
        },
        onOpenChangeComplete: (open) => {
          if (!open) {
            document.getElementById(`model-selector-${id}-button`)?.blur();
          }
        },
        get open() {
          return show;
        },
        set open($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Menu_trigger($$renderer4, {
            class: `relative w-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "outline-hidden focus:outline-hidden")}`,
            "aria-label": selectedModel ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Selected model: {{modelName}}", { modelName: selectedModel.label }) : placeholder,
            id: `model-selector-${stringify(id)}-button`,
            children: ($$renderer5) => {
              $$renderer5.push(`<div${attr_class(`flex w-full text-left px-0.5 bg-transparent truncate ${stringify(triggerClassName)} justify-between ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:placeholder-gray-100 placeholder-gray-800" : "placeholder-gray-400")}`)}>`);
              if (selectedModel) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.push(`${escape_html(selectedModel.label)}`);
              } else {
                $$renderer5.push("<!--[-1-->");
                $$renderer5.push(`${escape_html(placeholder)}`);
              }
              $$renderer5.push(`<!--]--> `);
              ChevronDown($$renderer5, { className: " self-center ml-2 size-3", strokeWidth: "2.5" });
              $$renderer5.push(`<!----></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Portal($$renderer4, {
            children: ($$renderer5) => {
              {
                let child = function($$renderer6, { wrapperProps, props, open }) {
                  if (open) {
                    $$renderer6.push("<!--[0-->");
                    $$renderer6.push(`<div${attributes({ ...wrapperProps })}><div${attributes({
                      ...props,
                      class: `${stringify(props.class)} z-40 ${stringify(store_get($$store_subs ??= {}, "$mobile", mobile) ? `w-full` : `${className}`)} max-w-[calc(100vw-1rem)] justify-start rounded-2xl bg-white dark:bg-gray-850 dark:text-white shadow-lg outline-hidden`
                    })}><!--[-->`);
                    slot($$renderer6, $$props, "default", {}, () => {
                      if (searchEnabled) {
                        $$renderer6.push("<!--[0-->");
                        $$renderer6.push(`<div class="flex items-center gap-2.5 px-4.5 pt-3.5 mb-1.5">`);
                        Search($$renderer6, { className: "size-4", strokeWidth: "2.5" });
                        $$renderer6.push(`<!----> <input id="model-search-input"${attr("value", searchValue)} class="w-full text-sm bg-transparent outline-hidden"${attr("placeholder", searchPlaceholder)} autocomplete="off"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search In Models"))}/></div>`);
                      } else {
                        $$renderer6.push("<!--[-1-->");
                      }
                      $$renderer6.push(`<!--]--> <div class="px-2">`);
                      if (tags && items.filter((item) => !(item.model?.info?.meta?.hidden ?? false)).length > 0) {
                        $$renderer6.push("<!--[0-->");
                        $$renderer6.push(`<div class="flex w-full bg-white dark:bg-gray-850 overflow-x-auto scrollbar-none font-[450] mb-0.5"><div class="flex gap-1 w-fit text-center text-sm rounded-full bg-transparent px-1.5 whitespace-nowrap">`);
                        if (items.find((item) => item.model?.connection_type === "local") || items.find((item) => item.model?.connection_type === "external") || items.find((item) => item.model?.direct) || tags.length > 0) {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<button${attr_class(`min-w-fit outline-none px-1.5 py-0.5 ${stringify(
                            ""
                          )} transition capitalize`)}${attr("aria-pressed", selectedConnectionType === "")}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("All"))}</button>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                        }
                        $$renderer6.push(`<!--]--> `);
                        if (items.find((item) => item.model?.connection_type === "local")) {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<button${attr_class(`min-w-fit outline-none px-1.5 py-0.5 ${stringify("text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition capitalize`)}${attr("aria-pressed", selectedConnectionType === "local")}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Local"))}</button>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                        }
                        $$renderer6.push(`<!--]--> `);
                        if (items.find((item) => item.model?.connection_type === "external")) {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<button${attr_class(`min-w-fit outline-none px-1.5 py-0.5 ${stringify("text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition capitalize`)}${attr("aria-pressed", selectedConnectionType === "external")}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("External"))}</button>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                        }
                        $$renderer6.push(`<!--]--> `);
                        if (items.find((item) => item.model?.direct)) {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<button${attr_class(`min-w-fit outline-none px-1.5 py-0.5 ${stringify("text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition capitalize`)}${attr("aria-pressed", selectedConnectionType === "direct")}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Direct"))}</button>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                        }
                        $$renderer6.push(`<!--]--> <!--[-->`);
                        const each_array = ensure_array_like(tags);
                        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                          let tag = each_array[$$index];
                          Tooltip($$renderer6, {
                            content: tag,
                            children: ($$renderer7) => {
                              $$renderer7.push(`<button${attr_class(`min-w-fit outline-none px-1.5 py-0.5 ${stringify(selectedTag === tag ? "" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition capitalize`)}${attr("aria-pressed", selectedTag === tag)}>${escape_html(tag.length > 16 ? `${tag.slice(0, 16)}...` : tag)}</button>`);
                            },
                            $$slots: { default: true }
                          });
                        }
                        $$renderer6.push(`<!--]--></div></div>`);
                      } else {
                        $$renderer6.push("<!--[-1-->");
                      }
                      $$renderer6.push(`<!--]--></div> <div class="px-2.5 group relative">`);
                      if (filteredItems.length === 0) {
                        $$renderer6.push("<!--[0-->");
                        if (items.length === 0 && store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<div class="flex flex-col items-start justify-center py-6 px-4 text-start"><div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models available"))}</div> <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connect to an AI provider to start chatting"))}</div> <a href="/admin/settings/connections" class="px-4 py-1.5 rounded-xl text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Connections"))}</a></div>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                          $$renderer6.push(`<div><div class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-100">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No results found"))}</div></div>`);
                        }
                        $$renderer6.push(`<!--]-->`);
                      } else {
                        $$renderer6.push("<!--[-1-->");
                        $$renderer6.push(`<div class="max-h-64 overflow-y-auto" role="listbox"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Available models"))}><div${attr_style(`height: ${stringify(visibleStart * ITEM_HEIGHT)}px;`)}></div> <!--[-->`);
                        const each_array_1 = ensure_array_like(filteredItems.slice(visibleStart, visibleEnd));
                        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
                          let item = each_array_1[i];
                          const index = visibleStart + i;
                          ModelItem($$renderer6, {
                            selectedModelIdx,
                            item,
                            index,
                            value,
                            pinModelHandler,
                            unloadModelHandler,
                            onClick: () => {
                              value = item.value;
                              selectedModelIdx = index;
                              show = false;
                            }
                          });
                        }
                        $$renderer6.push(`<!--]--> <div${attr_style(`height: ${stringify((filteredItems.length - visibleEnd) * ITEM_HEIGHT)}px;`)}></div></div>`);
                      }
                      $$renderer6.push(`<!--]--> `);
                      if (!(searchValue.trim() in store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)) && searchValue && ollamaVersion && store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
                        $$renderer6.push("<!--[0-->");
                        Tooltip($$renderer6, {
                          content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Pull "{{searchValue}}" from Ollama.com`, { searchValue }),
                          placement: "top-start",
                          children: ($$renderer7) => {
                            $$renderer7.push(`<button class="flex w-full font-medium line-clamp-1 select-none items-center rounded-button py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-hidden transition-all duration-75 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer data-highlighted:bg-muted"><div class="truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Pull "{{searchValue}}" from Ollama.com`, { searchValue }))}</div></button>`);
                          },
                          $$slots: { default: true }
                        });
                      } else {
                        $$renderer6.push("<!--[-1-->");
                      }
                      $$renderer6.push(`<!--]--> <!--[-->`);
                      const each_array_2 = ensure_array_like(Object.keys(store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)));
                      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                        let model = each_array_2[$$index_2];
                        $$renderer6.push(`<div class="flex w-full justify-between font-medium select-none rounded-button py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-hidden transition-all duration-75 rounded-xl cursor-pointer data-highlighted:bg-muted"><div class="flex"><div class="mr-2.5 translate-y-0.5">`);
                        Spinner($$renderer6, {});
                        $$renderer6.push(`<!----></div> <div class="flex flex-col self-start"><div class="flex gap-1"><div class="line-clamp-1">Downloading "${escape_html(model)}"</div> <div class="shrink-0">${escape_html("pullProgress" in store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)[model] ? `(${store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)[model].pullProgress}%)` : "")}</div></div> `);
                        if ("digest" in store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)[model] && store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)[model].digest) {
                          $$renderer6.push("<!--[0-->");
                          $$renderer6.push(`<div class="-mt-1 h-fit text-[0.7rem] dark:text-gray-500 line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$MODEL_DOWNLOAD_POOL", MODEL_DOWNLOAD_POOL)[model].digest)}</div>`);
                        } else {
                          $$renderer6.push("<!--[-1-->");
                        }
                        $$renderer6.push(`<!--]--></div></div> <div class="mr-2 ml-1 translate-y-0.5">`);
                        Tooltip($$renderer6, {
                          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"),
                          children: ($$renderer7) => {
                            $$renderer7.push(`<button class="text-gray-800 dark:text-gray-100"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel download of {{model}}", { model }))}><svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"></path></svg></button>`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer6.push(`<!----></div></div>`);
                      }
                      $$renderer6.push(`<!--]--></div> <div class="pb-2.5"></div> <div class="hidden w-[42rem]"></div> <div class="hidden w-[32rem]"></div>`);
                    });
                    $$renderer6.push(`<!--]--></div></div>`);
                  } else {
                    $$renderer6.push("<!--[-1-->");
                  }
                  $$renderer6.push(`<!--]-->`);
                };
                Dropdown_menu_content($$renderer5, {
                  forceMount: true,
                  trapFocus: false,
                  preventScroll: false,
                  side: "bottom",
                  align: store_get($$store_subs ??= {}, "$mobile", mobile) ? "center" : "start",
                  sideOffset: 2,
                  alignOffset: -1,
                  child,
                  $$slots: { child: true }
                });
              }
            }
          });
          $$renderer4.push(`<!---->`);
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
      id,
      value,
      placeholder,
      searchEnabled,
      searchPlaceholder,
      items,
      className,
      triggerClassName,
      pinModelHandler
    });
  });
}
export {
  Selector as S
};
//# sourceMappingURL=Selector.js.map
