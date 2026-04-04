import { n as noop, f as fallback, b as bind_props, a as attr, e as ensure_array_like, s as sanitize_props, c as store_get, d as attr_class, g as clsx, h as attr_style, i as spread_props, j as slot, k as escape_html, u as unsubscribe_stores, l as rest_props, m as attributes, o as getContext, p as setContext, q as head, t as stringify } from "../../chunks/root.js";
import "socket.io-client";
import { w as writable } from "../../chunks/index.js";
import { o as onDestroy } from "../../chunks/index-server.js";
import { c as cn, t as toastState, u as useEffect } from "../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { W as WEBUI_NAME, c as config, t as theme } from "../../chunks/index2.js";
import { W as WEBUI_BASE_URL } from "../../chunks/constants.js";
import "../../chunks/index3.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { s as stores } from "../../chunks/client.js";
import { i as i18n } from "../../chunks/index4.js";
import "dompurify";
import "marked";
/* empty css                                                  */
import { e as exportSingleChatStats } from "../../chunks/index5.js";
import { M as Modal, X as XMark } from "../../chunks/Modal.js";
import { T as Tooltip } from "../../chunks/Tooltip.js";
import "dayjs";
const now = () => Date.now();
const raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (_) => noop()
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function loop(callback) {
  let task;
  if (raf.tasks.size === 0) ;
  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      raf.tasks.delete(task);
    }
  };
}
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function tick_spring(ctx, last_value, current_value, target_value) {
  if (typeof current_value === "number" || is_date(current_value)) {
    const delta = target_value - current_value;
    const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
    const spring2 = ctx.opts.stiffness * delta;
    const damper = ctx.opts.damping * velocity;
    const acceleration = (spring2 - damper) * ctx.inv_mass;
    const d = (velocity + acceleration) * ctx.dt;
    if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
      return target_value;
    } else {
      ctx.settled = false;
      return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
    }
  } else if (Array.isArray(current_value)) {
    return current_value.map(
      (_, i) => (
        // @ts-ignore
        tick_spring(ctx, last_value[i], current_value[i], target_value[i])
      )
    );
  } else if (typeof current_value === "object") {
    const next_value = {};
    for (const k in current_value) {
      next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
    }
    return next_value;
  } else {
    throw new Error(`Cannot spring ${typeof current_value} values`);
  }
}
function spring(value, opts = {}) {
  const store = writable(value);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
  let last_time;
  let task;
  let current_token;
  let last_value = (
    /** @type {T} */
    value
  );
  let target_value = (
    /** @type {T | undefined} */
    value
  );
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;
  function set(new_value, opts2 = {}) {
    target_value = new_value;
    const token = current_token = {};
    if (value == null || opts2.hard || spring2.stiffness >= 1 && spring2.damping >= 1) {
      cancel_task = true;
      last_time = raf.now();
      last_value = new_value;
      store.set(value = target_value);
      return Promise.resolve();
    } else if (opts2.soft) {
      const rate = opts2.soft === true ? 0.5 : +opts2.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0;
    }
    if (!task) {
      last_time = raf.now();
      cancel_task = false;
      task = loop((now2) => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }
        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
        const elapsed = Math.min(now2 - last_time, 1e3 / 30);
        const ctx = {
          inv_mass,
          opts: spring2,
          settled: true,
          dt: elapsed * 60 / 1e3
        };
        const next_value = tick_spring(ctx, last_value, value, target_value);
        last_time = now2;
        last_value = /** @type {T} */
        value;
        store.set(value = /** @type {T} */
        next_value);
        if (ctx.settled) {
          task = null;
        }
        return !ctx.settled;
      });
    }
    return new Promise((fulfil) => {
      task.promise.then(() => {
        if (token === current_token) fulfil();
      });
    });
  }
  const spring2 = {
    set,
    update: (fn, opts2) => set(fn(
      /** @type {T} */
      target_value,
      /** @type {T} */
      value
    ), opts2),
    subscribe: store.subscribe,
    stiffness,
    damping,
    precision
  };
  return spring2;
}
function Icon($$renderer, $$props) {
  let type = fallback($$props["type"], "success");
  if (type === "success") {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>`);
  } else if (type === "error") {
    $$renderer.push("<!--[1-->");
    $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`);
  } else if (type === "info") {
    $$renderer.push("<!--[2-->");
    $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>`);
  } else if (type === "warning") {
    $$renderer.push("<!--[3-->");
    $$renderer.push(`<svg viewBox="0 0 64 64" fill="currentColor" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M32.427,7.987c2.183,0.124 4,1.165 5.096,3.281l17.936,36.208c1.739,3.66 -0.954,8.585 -5.373,8.656l-36.119,0c-4.022,-0.064 -7.322,-4.631 -5.352,-8.696l18.271,-36.207c0.342,-0.65 0.498,-0.838 0.793,-1.179c1.186,-1.375 2.483,-2.111 4.748,-2.063Zm-0.295,3.997c-0.687,0.034 -1.316,0.419 -1.659,1.017c-6.312,11.979 -12.397,24.081 -18.301,36.267c-0.546,1.225 0.391,2.797 1.762,2.863c12.06,0.195 24.125,0.195 36.185,0c1.325,-0.064 2.321,-1.584 1.769,-2.85c-5.793,-12.184 -11.765,-24.286 -17.966,-36.267c-0.366,-0.651 -0.903,-1.042 -1.79,-1.03Z"></path><path d="M33.631,40.581l-3.348,0l-0.368,-16.449l4.1,0l-0.384,16.449Zm-3.828,5.03c0,-0.609 0.197,-1.113 0.592,-1.514c0.396,-0.4 0.935,-0.601 1.618,-0.601c0.684,0 1.223,0.201 1.618,0.601c0.395,0.401 0.593,0.905 0.593,1.514c0,0.587 -0.193,1.078 -0.577,1.473c-0.385,0.395 -0.929,0.593 -1.634,0.593c-0.705,0 -1.249,-0.198 -1.634,-0.593c-0.384,-0.395 -0.576,-0.886 -0.576,-1.473Z"></path></svg>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { type });
}
function Loader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let visible = $$props["visible"];
    const bars = Array(12).fill(0);
    $$renderer2.push(`<div class="sonner-loading-wrapper"${attr("data-visible", visible)}><div class="sonner-spinner"><!--[-->`);
    const each_array = ensure_array_like(bars);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      $$renderer2.push(`<div class="sonner-loading-bar"></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { visible });
  });
}
function Toast($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isFront, isVisible, toastType, toastClass, toastDescriptionClass, heightIndex, coords, toastsHeightBefore, disabled, isPromiseLoadingOrInfiniteDuration;
    const TOAST_LIFETIME = 4e3;
    const GAP = 14;
    const TIME_BEFORE_UNMOUNT = 200;
    const defaultClasses = {
      toast: "",
      title: "",
      description: "",
      loader: "",
      closeButton: "",
      cancelButton: "",
      actionButton: "",
      action: "",
      warning: "",
      error: "",
      success: "",
      default: "",
      info: "",
      loading: ""
    };
    const { toasts, heights, removeHeight, remove } = toastState;
    let toast = $$props["toast"];
    let index = $$props["index"];
    let expanded = $$props["expanded"];
    let invert = $$props["invert"];
    let position = $$props["position"];
    let visibleToasts = $$props["visibleToasts"];
    let expandByDefault = $$props["expandByDefault"];
    let closeButton = $$props["closeButton"];
    let interacting = $$props["interacting"];
    let cancelButtonStyle = fallback($$props["cancelButtonStyle"], "");
    let actionButtonStyle = fallback($$props["actionButtonStyle"], "");
    let duration = fallback($$props["duration"], 4e3);
    let descriptionClass = fallback($$props["descriptionClass"], "");
    let classes = fallback($$props["classes"], () => ({}), true);
    let unstyled = fallback($$props["unstyled"], false);
    let mounted = false;
    let removed = false;
    let swiping = false;
    let swipeOut = false;
    let offsetBeforeRemove = 0;
    let initialHeight = 0;
    let offset = 0;
    let closeTimerStartTimeRef = 0;
    let lastCloseTimerStartTimeRef = 0;
    async function updateHeights() {
      {
        return;
      }
    }
    function deleteToast() {
      removed = true;
      offsetBeforeRemove = offset;
      removeHeight(toast.id);
      setTimeout(
        () => {
          remove(toast.id);
        },
        TIME_BEFORE_UNMOUNT
      );
    }
    let timeoutId;
    let remainingTime = toast.duration || duration || TOAST_LIFETIME;
    function pauseTimer() {
      if (lastCloseTimerStartTimeRef < closeTimerStartTimeRef) {
        const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef;
        remainingTime = remainingTime - elapsedTime;
      }
      lastCloseTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
    }
    function startTimer() {
      closeTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
      timeoutId = setTimeout(
        () => {
          toast.onAutoClose?.(toast);
          deleteToast();
        },
        remainingTime
      );
    }
    let effect;
    classes = { ...defaultClasses, ...classes };
    isFront = index === 0;
    isVisible = index + 1 <= visibleToasts;
    toast.title;
    toast.description;
    toastType = toast.type;
    toastClass = toast.class || "";
    toastDescriptionClass = toast.descriptionClass || "";
    heightIndex = store_get($$store_subs ??= {}, "$heights", heights).findIndex((height) => height.toastId === toast.id) || 0;
    coords = position.split("-");
    toastsHeightBefore = store_get($$store_subs ??= {}, "$heights", heights).reduce(
      (prev, curr, reducerIndex) => {
        if (reducerIndex >= heightIndex) return prev;
        return prev + curr.height;
      },
      0
    );
    invert = toast.invert || invert;
    disabled = toastType === "loading";
    offset = Math.round(heightIndex * GAP + toastsHeightBefore);
    updateHeights();
    if (toast.updated) {
      clearTimeout(timeoutId);
      remainingTime = toast.duration || duration || TOAST_LIFETIME;
      startTimer();
    }
    isPromiseLoadingOrInfiniteDuration = toast.promise && toastType === "loading" || toast.duration === Number.POSITIVE_INFINITY;
    effect = useEffect(() => {
      if (!isPromiseLoadingOrInfiniteDuration) {
        if (expanded || interacting) {
          pauseTimer();
        } else {
          startTimer();
        }
      }
      return () => clearTimeout(timeoutId);
    });
    store_get($$store_subs ??= {}, "$effect", effect);
    if (toast.delete) {
      deleteToast();
    }
    $$renderer2.push(`<li${attr(
      "aria-live",
      // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
      // Remove only if treshold is met
      // User is swiping in wrong direction so we disable swipe gesture
      // for the current pointer down interaction
      toast.important ? "assertive" : "polite"
    )} aria-atomic="true" role="status"${attr("tabindex", 0)}${attr_class(clsx(cn($$sanitized_props.class, toastClass, classes?.toast, toast?.classes?.toast, classes?.[toastType], toast?.classes?.[toastType])))} data-sonner-toast=""${attr("data-styled", !(toast.component || toast?.unstyled || unstyled))}${attr("data-mounted", mounted)}${attr("data-promise", Boolean(toast.promise))}${attr("data-removed", removed)}${attr("data-visible", isVisible)}${attr("data-y-position", coords[0])}${attr("data-x-position", coords[1])}${attr("data-index", index)}${attr("data-front", isFront)}${attr("data-swiping", swiping)}${attr("data-type", toastType)}${attr("data-invert", invert)}${attr("data-swipe-out", swipeOut)}${attr("data-expanded", Boolean(expanded || expandByDefault && mounted))}${attr_style(`${$$sanitized_props.style} ${toast.style}`, {
      "--index": index,
      "--toasts-before": index,
      "--z-index": store_get($$store_subs ??= {}, "$toasts", toasts).length - index,
      "--offset": `${removed ? offsetBeforeRemove : offset}px`,
      "--initial-height": `${initialHeight}px`
    })}>`);
    if (closeButton && !toast.component) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button aria-label="Close toast"${attr("data-disabled", disabled)} data-close-button=""${attr_class(clsx(cn(classes?.closeButton, toast?.classes?.closeButton)))}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (toast.component) {
      $$renderer2.push("<!--[0-->");
      if (toast.component) {
        $$renderer2.push("<!--[-->");
        toast.component($$renderer2, spread_props([toast.componentProps]));
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
    } else {
      $$renderer2.push("<!--[-1-->");
      if (toastType !== "default" || toast.icon || toast.promise) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div data-icon="">`);
        if ((toast.promise || toastType === "loading") && !toast.icon) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "loading-icon", {}, null);
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (toast.icon) {
          $$renderer2.push("<!--[0-->");
          if (toast.icon) {
            $$renderer2.push("<!--[-->");
            toast.icon($$renderer2, {});
            $$renderer2.push("<!--]-->");
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push("<!--]-->");
          }
        } else if (toastType === "success") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "success-icon", {}, null);
          $$renderer2.push(`<!--]-->`);
        } else if (toastType === "error") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "error-icon", {}, null);
          $$renderer2.push(`<!--]-->`);
        } else if (toastType === "warning") {
          $$renderer2.push("<!--[3-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "warning-icon", {}, null);
          $$renderer2.push(`<!--]-->`);
        } else if (toastType === "info") {
          $$renderer2.push("<!--[4-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "info-icon", {}, null);
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div data-content="">`);
      if (toast.title) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div data-title=""${attr_class(clsx(cn(classes?.title, toast?.classes?.title)))}>`);
        if (typeof toast.title !== "string") {
          $$renderer2.push("<!--[0-->");
          if (toast.title) {
            $$renderer2.push("<!--[-->");
            toast.title($$renderer2, spread_props([toast.componentProps]));
            $$renderer2.push("<!--]-->");
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push("<!--]-->");
          }
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(toast.title)}`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (toast.description) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div data-description=""${attr_class(clsx(cn(descriptionClass, toastDescriptionClass, classes?.description, toast.classes?.description)))}>`);
        if (typeof toast.description !== "string") {
          $$renderer2.push("<!--[0-->");
          if (toast.description) {
            $$renderer2.push("<!--[-->");
            toast.description($$renderer2, spread_props([toast.componentProps]));
            $$renderer2.push("<!--]-->");
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push("<!--]-->");
          }
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(toast.description)}`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (toast.cancel) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button data-button="" data-cancel=""${attr_style(cancelButtonStyle)}${attr_class(clsx(cn(classes?.cancelButton, toast?.classes?.cancelButton)))}>${escape_html(toast.cancel.label)}</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (toast.action) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button data-button=""${attr_style(actionButtonStyle)}${attr_class(clsx(cn(classes?.actionButton, toast?.classes?.actionButton)))}>${escape_html(toast.action.label)}</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></li>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      toast,
      index,
      expanded,
      invert,
      position,
      visibleToasts,
      expandByDefault,
      closeButton,
      interacting,
      cancelButtonStyle,
      actionButtonStyle,
      duration,
      descriptionClass,
      classes,
      unstyled
    });
  });
}
function Toaster($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "invert",
    "theme",
    "position",
    "hotkey",
    "containerAriaLabel",
    "richColors",
    "expand",
    "duration",
    "visibleToasts",
    "closeButton",
    "toastOptions",
    "offset",
    "dir"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let possiblePositions, hotkeyLabel;
    const VISIBLE_TOASTS_AMOUNT = 3;
    const VIEWPORT_OFFSET = "32px";
    const TOAST_WIDTH = 356;
    const GAP = 14;
    const DARK = "dark";
    const LIGHT = "light";
    function getInitialTheme(t) {
      if (t !== "system") {
        return t;
      }
      if (typeof window !== "undefined") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return DARK;
        }
        return LIGHT;
      }
      return LIGHT;
    }
    function getDocumentDirection() {
      if (typeof window === "undefined") return "ltr";
      if (typeof document === "undefined") return "ltr";
      const dirAttribute = document.documentElement.getAttribute("dir");
      if (dirAttribute === "auto" || !dirAttribute) {
        return window.getComputedStyle(document.documentElement).direction;
      }
      return dirAttribute;
    }
    let invert = fallback($$props["invert"], false);
    let theme2 = fallback($$props["theme"], "light");
    let position = fallback($$props["position"], "bottom-right");
    let hotkey = fallback($$props["hotkey"], () => ["altKey", "KeyT"], true);
    let containerAriaLabel = fallback($$props["containerAriaLabel"], "Notifications");
    let richColors = fallback($$props["richColors"], false);
    let expand = fallback($$props["expand"], false);
    let duration = fallback($$props["duration"], 4e3);
    let visibleToasts = fallback($$props["visibleToasts"], VISIBLE_TOASTS_AMOUNT);
    let closeButton = fallback($$props["closeButton"], false);
    let toastOptions = fallback($$props["toastOptions"], () => ({}), true);
    let offset = fallback($$props["offset"], null);
    let dir = fallback($$props["dir"], getDocumentDirection, true);
    const { toasts, heights } = toastState;
    let expanded = false;
    let interacting = false;
    let actualTheme = getInitialTheme(theme2);
    onDestroy(() => {
    });
    possiblePositions = Array.from(new Set([
      position,
      ...store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.position).map((toast) => toast.position)
    ].filter(Boolean)));
    hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
    if (store_get($$store_subs ??= {}, "$toasts", toasts).length <= 1) {
      expanded = false;
    }
    {
      const toastsToDismiss = store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.dismiss && !toast.delete);
      if (toastsToDismiss.length > 0) {
        const updatedToasts = store_get($$store_subs ??= {}, "$toasts", toasts).map((toast) => {
          const matchingToast = toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id);
          if (matchingToast) {
            return { ...toast, delete: true };
          }
          return toast;
        });
        toasts.set(updatedToasts);
      }
    }
    {
      if (theme2 !== "system") {
        actualTheme = theme2;
      }
      if (typeof window !== "undefined") {
        if (theme2 === "system") {
          if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            actualTheme = DARK;
          } else {
            actualTheme = LIGHT;
          }
        }
        const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        const changeHandler = ({ matches }) => {
          actualTheme = matches ? DARK : LIGHT;
        };
        if ("addEventListener" in mediaQueryList) {
          mediaQueryList.addEventListener("change", changeHandler);
        } else {
          mediaQueryList.addListener(changeHandler);
        }
      }
    }
    if (store_get($$store_subs ??= {}, "$toasts", toasts).length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section${attr("aria-label", `${containerAriaLabel} ${hotkeyLabel}`)}${attr("tabindex", -1)} class="svelte-nbs0zk"><!--[-->`);
      const each_array = ensure_array_like(possiblePositions);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let position2 = each_array[index];
        $$renderer2.push(`<ol${attributes(
          {
            tabindex: -1,
            class: clsx($$sanitized_props.class),
            "data-sonner-toaster": true,
            "data-theme": actualTheme,
            "data-rich-colors": richColors,
            dir: dir === "auto" ? getDocumentDirection() : dir,
            "data-y-position": position2.split("-")[0],
            "data-x-position": position2.split("-")[1],
            style: $$sanitized_props.style,
            ...$$restProps
          },
          "svelte-nbs0zk",
          void 0,
          {
            "--front-toast-height": `${store_get($$store_subs ??= {}, "$heights", heights)[0]?.height}px`,
            "--offset": typeof offset === "number" ? `${offset}px` : offset || VIEWPORT_OFFSET,
            "--width": `${TOAST_WIDTH}px`,
            "--gap": `${GAP}px`
          }
        )}><!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => !toast.position && index === 0 || toast.position === position2));
        for (let index2 = 0, $$length2 = each_array_1.length; index2 < $$length2; index2++) {
          let toast = each_array_1[index2];
          Toast($$renderer2, {
            index: index2,
            toast,
            invert,
            visibleToasts,
            closeButton,
            interacting,
            position: position2,
            expandByDefault: expand,
            expanded,
            actionButtonStyle: toastOptions?.actionButtonStyle || "",
            cancelButtonStyle: toastOptions?.cancelButtonStyle || "",
            class: toastOptions?.class || "",
            descriptionClass: toastOptions?.descriptionClass || "",
            classes: toastOptions.classes || {},
            duration: toastOptions?.duration ?? duration,
            unstyled: toastOptions.unstyled || false,
            $$slots: {
              "loading-icon": ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                slot($$renderer3, $$props, "loading-icon", {}, () => {
                  Loader($$renderer3, { visible: toast.type === "loading" });
                });
                $$renderer3.push(`<!--]-->`);
              },
              "success-icon": ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                slot($$renderer3, $$props, "success-icon", {}, () => {
                  Icon($$renderer3, { type: "success" });
                });
                $$renderer3.push(`<!--]-->`);
              },
              "error-icon": ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                slot($$renderer3, $$props, "error-icon", {}, () => {
                  Icon($$renderer3, { type: "error" });
                });
                $$renderer3.push(`<!--]-->`);
              },
              "warning-icon": ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                slot($$renderer3, $$props, "warning-icon", {}, () => {
                  Icon($$renderer3, { type: "warning" });
                });
                $$renderer3.push(`<!--]-->`);
              },
              "info-icon": ($$renderer3) => {
                $$renderer3.push(`<!--[-->`);
                slot($$renderer3, $$props, "info-icon", {}, () => {
                  Icon($$renderer3, { type: "info" });
                });
                $$renderer3.push(`<!--]-->`);
              }
            }
          });
        }
        $$renderer2.push(`<!--]--></ol>`);
      }
      $$renderer2.push(`<!--]--></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      invert,
      theme: theme2,
      position,
      hotkey,
      containerAriaLabel,
      richColors,
      expand,
      duration,
      visibleToasts,
      closeButton,
      toastOptions,
      offset,
      dir
    });
  });
}
({
  check: stores.updated.check
});
function SyncStatsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n2 = getContext("i18n");
    let show = fallback($$props["show"], false);
    let eventData = fallback($$props["eventData"], null);
    const handleMessage = async (event) => {
      const chatId = event.data?.data?.id ?? event.data?.id;
      if (event.data?.type === "verify:chat" && chatId) {
        try {
          const res = await exportSingleChatStats(localStorage.token, chatId);
          if (res && window.opener) {
            window.opener.postMessage(
              {
                type: "verify:chat:response",
                data: res,
                chatId,
                requestId: event.data.requestId ?? null
              },
              "*"
            );
          }
        } catch (err) {
          /* @__PURE__ */ console.error("Failed to verify chat:", err);
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "verify:chat:error",
                error: err?.detail || err?.message || "Failed to verify chat",
                chatId,
                requestId: event.data.requestId ?? null
              },
              "*"
            );
          }
        }
      }
    };
    onDestroy(() => {
      window.removeEventListener("message", handleMessage);
    });
    let syncing = false;
    let syncMode = "incremental";
    if (show && window.opener) {
      window.opener.postMessage("loaded", "*");
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "md",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="w-full">`);
          {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="flex justify-between px-5 pt-4 pb-0.5"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Sync Usage Stats"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n2).t("Close modal"))}${attr("disabled", syncing, true)}>`);
            XMark($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></button></div> <div class="px-5 pt-2 pb-5"><div class="text-sm text-gray-500 dark:text-gray-400">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Do you want to sync your usage stats with Open WebUI Community?"))}</div> <div class="mt-2 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Participate in community leaderboards and evaluations! Syncing aggregated usage stats helps drive research and improvements to Open WebUI. Your privacy is paramount: no message content is ever shared."))}</div> <div class="mt-3 text-xs text-gray-500"><div class="font-medium text-gray-900 dark:text-gray-100 mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("What is shared:"))}</div> <ul class="list-disc list-inside space-y-0.5 ml-1 mb-2"><li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Open WebUI version"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Model names and usage frequency"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Message counts and response timestamps"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Content lengths (character counts only)"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("User ratings (thumbs up/down)"))}</li></ul> <div class="font-medium text-gray-900 dark:text-gray-100 mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("What is NOT shared:"))}</div> <ul class="list-disc list-inside space-y-0.5 ml-1"><li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Your message text or inputs"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Model responses or outputs"))}</li> <li>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Uploaded files or images"))}</li></ul></div> `);
            if (eventData?.lastSyncedChatUpdatedAt) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="mt-3">`);
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Syncs only chats with updates after your last sync timestamp. Disable to re-sync all chats."),
                placement: "top-start",
                children: ($$renderer5) => {
                  $$renderer5.push(`<label class="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox"${attr("checked", syncMode === "incremental", true)}${attr("disabled", syncing, true)} class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"/> <span class="text-gray-700 dark:text-gray-300">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Only sync new/updated chats"))}</span></label>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <div class="mt-5 flex justify-between items-center gap-2"><div class="text-xs text-gray-400 text-center mr-auto"><button class="hover:underline px-2" type="button"${attr("disabled", syncing, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Download as JSON"))}</button></div> <button class="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition disabled:cursor-not-allowed">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Cancel"))}</button> <button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors rounded-full"${attr("disabled", syncing, true)}>`);
            {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Sync"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div>`);
          }
          $$renderer4.push(`<!--]--></div>`);
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
    bind_props($$props, { show, eventData });
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    spring(0, { stiffness: 0.05 });
    setContext("i18n", i18n);
    const bc = new BroadcastChannel("active-tab-channel");
    let showSyncStatsModal = false;
    let syncStatsEventData = null;
    onDestroy(() => {
      bc.close();
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("12qhfyh", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}</title>`);
        });
        $$renderer4.push(`<link crossorigin="anonymous" rel="icon"${attr("href", `${stringify(WEBUI_BASE_URL)}/static/favicon.png`)}/> <meta name="apple-mobile-web-app-title"${attr("content", store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}/> <meta name="description"${attr("content", store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}/> <link rel="search" type="application/opensearchdescription+xml"${attr("title", store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))} href="/opensearch.xml" crossorigin="use-credentials"/>`);
      });
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_community_sharing) {
        $$renderer3.push("<!--[0-->");
        SyncStatsModal($$renderer3, {
          eventData: syncStatsEventData,
          get show() {
            return showSyncStatsModal;
          },
          set show($$value) {
            showSyncStatsModal = $$value;
            $$settled = false;
          }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      Toaster($$renderer3, {
        theme: store_get($$store_subs ??= {}, "$theme", theme).includes("dark") ? "dark" : store_get($$store_subs ??= {}, "$theme", theme) === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light",
        richColors: true,
        position: "top-right",
        closeButton: true
      });
      $$renderer3.push(`<!---->`);
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
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
