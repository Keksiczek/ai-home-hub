import { m as attributes, b as bind_props, y as derived, i as spread_props, z as props_id, f as fallback, o as getContext, u as unsubscribe_stores, c as store_get, t as stringify } from "./root.js";
import { t as tick } from "./index-server.js";
import { h as settings } from "./index2.js";
import { T as Tooltip } from "./Tooltip.js";
import { s as styleToString, m as mergeProps, C as Context, a as attachRef, E as ENTER, S as SPACE, r as boolToEmptyStrOrUndef, t as getDataChecked, l as boolToStr, v as getAriaChecked, x as boolToTrueOrUndef, c as createBitsAttrs, d as createId, n as noop, e as boxWith } from "./floating-layer-anchor.js";
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  transform: "translateX(-100%)"
};
const srOnlyStylesString = styleToString(srOnlyStyles);
function Hidden_input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = void 0, $$slots, $$events, ...restProps } = $$props;
    const mergedProps = derived(() => mergeProps(restProps, {
      "aria-hidden": "true",
      tabindex: -1,
      style: srOnlyStylesString
    }));
    if (mergedProps().type === "checkbox") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<input${attributes({ ...mergedProps(), value }, void 0, void 0, void 0, 4)}/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<input${attributes({ value, ...mergedProps() }, void 0, void 0, void 0, 4)}/>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { value });
  });
}
const switchAttrs = createBitsAttrs({ component: "switch", parts: ["root", "thumb"] });
const SwitchRootContext = new Context("Switch.Root");
class SwitchRootState {
  static create(opts) {
    return SwitchRootContext.set(new SwitchRootState(opts));
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref);
    this.onkeydown = this.onkeydown.bind(this);
    this.onclick = this.onclick.bind(this);
  }
  #toggle() {
    this.opts.checked.current = !this.opts.checked.current;
  }
  onkeydown(e) {
    if (!(e.key === ENTER || e.key === SPACE) || this.opts.disabled.current) return;
    e.preventDefault();
    this.#toggle();
  }
  onclick(_) {
    if (this.opts.disabled.current) return;
    this.#toggle();
  }
  #sharedProps = derived(() => ({
    "data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
    "data-state": getDataChecked(this.opts.checked.current),
    "data-required": boolToEmptyStrOrUndef(this.opts.required.current)
  }));
  get sharedProps() {
    return this.#sharedProps();
  }
  set sharedProps($$value) {
    return this.#sharedProps($$value);
  }
  #snippetProps = derived(() => ({ checked: this.opts.checked.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    ...this.sharedProps,
    id: this.opts.id.current,
    role: "switch",
    disabled: boolToTrueOrUndef(this.opts.disabled.current),
    "aria-checked": getAriaChecked(this.opts.checked.current),
    "aria-required": boolToStr(this.opts.required.current),
    [switchAttrs.root]: "",
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SwitchInputState {
  static create() {
    return new SwitchInputState(SwitchRootContext.get());
  }
  root;
  #shouldRender = derived(() => this.root.opts.name.current !== void 0);
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  constructor(root) {
    this.root = root;
  }
  #props = derived(() => ({
    type: "checkbox",
    name: this.root.opts.name.current,
    value: this.root.opts.value.current,
    checked: this.root.opts.checked.current,
    disabled: this.root.opts.disabled.current,
    required: this.root.opts.required.current
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SwitchThumbState {
  static create(opts) {
    return new SwitchThumbState(opts, SwitchRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
  }
  #snippetProps = derived(() => ({ checked: this.root.opts.checked.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    ...this.root.sharedProps,
    id: this.opts.id.current,
    [switchAttrs.thumb]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Switch_input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const inputState = SwitchInputState.create();
    if (inputState.shouldRender) {
      $$renderer2.push("<!--[0-->");
      Hidden_input($$renderer2, spread_props([inputState.props]));
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Switch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      children,
      ref = null,
      id = createId(uid),
      disabled = false,
      required = false,
      checked = false,
      value = "on",
      name = void 0,
      type = "button",
      onCheckedChange = noop,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = SwitchRootState.create({
      checked: boxWith(() => checked, (v) => {
        checked = v;
        onCheckedChange?.(v);
      }),
      disabled: boxWith(() => disabled ?? false),
      required: boxWith(() => required),
      value: boxWith(() => value),
      name: boxWith(() => name),
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, rootState.props, { type }));
    if (child) {
      $$renderer2.push("<!--[0-->");
      child($$renderer2, { props: mergedProps(), ...rootState.snippetProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<button${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2, rootState.snippetProps);
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]--> `);
    Switch_input($$renderer2);
    $$renderer2.push(`<!---->`);
    bind_props($$props, { ref, checked });
  });
}
function Switch_thumb($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      children,
      ref = null,
      id = createId(uid),
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const thumbState = SwitchThumbState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, thumbState.props));
    if (child) {
      $$renderer2.push("<!--[0-->");
      child($$renderer2, { props: mergedProps(), ...thumbState.snippetProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span${attributes({ ...mergedProps() })}>`);
      children?.($$renderer2, thumbState.snippetProps);
      $$renderer2.push(`<!----></span>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Switch_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let state = fallback($$props["state"], true);
    let id = fallback($$props["id"], "");
    let ariaLabelledbyId = fallback($$props["ariaLabelledbyId"], "");
    let tooltip = fallback($$props["tooltip"], false);
    const i18n = getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Tooltip($$renderer3, {
        content: typeof tooltip === "string" ? tooltip : typeof tooltip === "boolean" && tooltip ? state ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled") : "",
        placement: "top",
        children: ($$renderer4) => {
          Switch($$renderer4, {
            id,
            "aria-labelledby": ariaLabelledbyId,
            class: `flex h-[1.125rem] min-h-[1.125rem] w-8 shrink-0 cursor-pointer items-center rounded-full px-1 mx-[1px] transition  ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "focus:outline focus:outline-2 focus:outline-gray-800 focus:dark:outline-gray-200" : "outline outline-1 outline-gray-100 dark:outline-gray-800")} ${stringify(state ? " bg-emerald-500 dark:bg-emerald-700" : "bg-gray-200 dark:bg-transparent")}`,
            onCheckedChange: async () => {
              await tick();
            },
            get checked() {
              return state;
            },
            set checked($$value) {
              state = $$value;
              $$settled = false;
            },
            children: ($$renderer5) => {
              Switch_thumb($$renderer5, {
                class: "pointer-events-none block size-3 shrink-0 rounded-full bg-white transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:shadow-mini "
              });
            },
            $$slots: { default: true }
          });
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
    bind_props($$props, { state, id, ariaLabelledbyId, tooltip });
  });
}
export {
  Switch_1 as S
};
//# sourceMappingURL=Switch.js.map
