import { o as getContext, f as fallback, k as escape_html, b as bind_props, e as ensure_array_like, a as attr, d as attr_class, t as stringify, c as store_get, u as unsubscribe_stores, g as clsx } from "./root.js";
import { c as createEventDispatcher } from "./index-server.js";
import { X as XMark } from "./Modal.js";
function TagItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let tag = $$props["tag"];
    let disabled = fallback($$props["disabled"], false);
    let onDelete = fallback($$props["onDelete"], () => {
    });
    if (tag) {
      $$renderer2.push("<!--[0-->");
      if (disabled) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium"><span class="line-clamp-1">${escape_html(tag.name)}</span></span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<button type="button" class="flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-gray-100/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><span class="line-clamp-1">${escape_html(tag.name)}</span> `);
        XMark($$renderer2, { className: "size-3", strokeWidth: "2.5" });
        $$renderer2.push(`<!----></button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { tag, disabled, onDelete });
  });
}
function TagList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    const dispatch = createEventDispatcher();
    let tags = fallback($$props["tags"], () => [], true);
    let disabled = fallback($$props["disabled"], false);
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(tags);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tag = each_array[$$index];
      TagItem($$renderer2, {
        tag,
        disabled,
        onDelete: () => {
          dispatch("delete", tag.name);
        }
      });
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { tags, disabled });
  });
}
function Tags($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let tags = fallback($$props["tags"], () => [], true);
    let suggestionTags = fallback($$props["suggestionTags"], () => [], true);
    let disabled = fallback($$props["disabled"], false);
    let inputValue = "";
    $$renderer2.push(`<div class="flex flex-wrap items-center gap-1 w-full">`);
    TagList($$renderer2, { tags, disabled });
    $$renderer2.push(`<!----> `);
    if (!disabled) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<input${attr("value", inputValue)}${attr_class(`flex-1 min-w-24 ${stringify(tags.length > 0 ? "px-0.5" : "")} text-xs bg-transparent outline-hidden placeholder:text-gray-400 dark:placeholder:text-gray-500`)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add a tag..."))}/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { tags, suggestionTags, disabled });
  });
}
function Textarea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let rows = fallback($$props["rows"], 1);
    let minSize = fallback($$props["minSize"], null);
    let maxSize = fallback($$props["maxSize"], null);
    let required = fallback($$props["required"], false);
    let readonly = fallback($$props["readonly"], false);
    let className = fallback($$props["className"], "w-full rounded-lg px-3.5 py-2 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden  h-full");
    let ariaLabel = fallback($$props["ariaLabel"], null);
    let onInput = fallback($$props["onInput"], () => {
    });
    let onBlur = fallback($$props["onBlur"], () => {
    });
    $$renderer2.push(`<textarea${attr("placeholder", placeholder)}${attr("aria-label", ariaLabel || placeholder)}${attr_class(clsx(className))} style="field-sizing: content;"${attr("rows", rows)}${attr("required", required, true)}${attr("readonly", readonly, true)}>`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea>`);
    bind_props($$props, {
      value,
      placeholder,
      rows,
      minSize,
      maxSize,
      required,
      readonly,
      className,
      ariaLabel,
      onInput,
      onBlur
    });
  });
}
export {
  Textarea as T,
  Tags as a
};
//# sourceMappingURL=Textarea.js.map
