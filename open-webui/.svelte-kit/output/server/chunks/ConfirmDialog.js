import { o as getContext, f as fallback, d as attr_class, g as clsx, a as attr, k as escape_html, c as store_get, u as unsubscribe_stores, b as bind_props, j as slot } from "./root.js";
import DOMPurify from "dompurify";
import { o as onDestroy, t as tick } from "./index-server.js";
import { marked } from "marked";
import { h as settings } from "./index2.js";
/* empty css                                            */
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function SensitiveInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "password-input");
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let type = fallback($$props["type"], "text");
    let required = fallback($$props["required"], true);
    let readOnly = fallback($$props["readOnly"], false);
    let outerClassName = fallback($$props["outerClassName"], "flex flex-1 bg-transparent");
    let inputClassName = fallback($$props["inputClassName"], "w-full text-sm py-0.5 bg-transparent");
    let showButtonClassName = fallback($$props["showButtonClassName"], "pl-1.5  transition bg-transparent");
    let screenReader = fallback($$props["screenReader"], true);
    let autocomplete = fallback($$props["autocomplete"], "off");
    let show = false;
    $$renderer2.push(`<div${attr_class(clsx(outerClassName))}>`);
    if (screenReader) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<label class="sr-only"${attr("for", id)}>${escape_html(placeholder || store_get($$store_subs ??= {}, "$i18n", i18n).t("Password"))}</label>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <input${attr("id", id)}${attr_class(`${inputClassName} ${"password"} ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : " outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-600"}`)}${attr("placeholder", placeholder)}${attr("type", type === "password" && !show ? "password" : "text")}${attr("value", value)}${attr("required", required && !readOnly, true)}${attr("disabled", readOnly, true)}${attr("autocomplete", autocomplete)}/> <button${attr_class(clsx(showButtonClassName))} type="button"${attr("aria-pressed", show)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Make password visible in the user interface"))}>`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      value,
      placeholder,
      type,
      required,
      readOnly,
      outerClassName,
      inputClassName,
      showButtonClassName,
      screenReader,
      autocomplete
    });
  });
}
function ConfirmDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let title = fallback($$props["title"], "");
    let message = fallback($$props["message"], "");
    let cancelLabel = fallback($$props["cancelLabel"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"), true);
    let confirmLabel = fallback($$props["confirmLabel"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Confirm"), true);
    let onConfirm = fallback($$props["onConfirm"], () => {
    });
    let input = fallback($$props["input"], false);
    let inputPlaceholder = fallback($$props["inputPlaceholder"], "");
    let inputValue = fallback($$props["inputValue"], "");
    let inputType = fallback($$props["inputType"], "");
    let _inputValue = inputValue;
    let show = fallback($$props["show"], false);
    const init = () => {
      _inputValue = inputValue;
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        /* @__PURE__ */ console.log("Escape");
        show = false;
      }
      if (event.key === "Enter") {
        /* @__PURE__ */ console.log("Enter");
        event.preventDefault();
        event.stopPropagation();
        confirmHandler();
      }
    };
    const confirmHandler = async () => {
      show = false;
      await tick();
      await onConfirm();
    };
    onDestroy(() => {
      show = false;
      window.removeEventListener("keydown", handleKeyDown);
    });
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (show) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="fixed top-0 right-0 left-0 bottom-0 bg-black/60 w-full h-screen max-h-[100dvh] flex justify-center z-99999999 overflow-hidden overscroll-contain"><div class="m-auto max-w-full w-[32rem] mx-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm rounded-4xl max-h-[100dvh] shadow-3xl border border-white dark:border-gray-900"><div class="px-[1.75rem] py-6 flex flex-col"><div class="text-lg font-medium dark:text-gray-200 mb-2.5">`);
        if (title !== "") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`${escape_html(title)}`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Confirm your action"))}`);
        }
        $$renderer3.push(`<!--]--></div> <!--[-->`);
        slot($$renderer3, $$props, "default", {}, () => {
          $$renderer3.push(`<div class="text-sm text-gray-500 flex-1">`);
          if (message !== "") {
            $$renderer3.push("<!--[0-->");
            const html$1 = DOMPurify.sanitize(marked.parse(message));
            $$renderer3.push(`${html(html$1)}`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("This action cannot be undone. Do you wish to continue?"))}`);
          }
          $$renderer3.push(`<!--]--> `);
          if (input) {
            $$renderer3.push("<!--[0-->");
            if (inputType === "password") {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="w-full mt-2 rounded-lg px-4 py-2 text-sm dark:text-gray-300 dark:bg-gray-900">`);
              SensitiveInput($$renderer3, {
                id: "event-confirm-input",
                placeholder: inputPlaceholder ? inputPlaceholder : store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter your message"),
                required: true,
                get value() {
                  return _inputValue;
                },
                set value($$value) {
                  _inputValue = $$value;
                  $$settled = false;
                }
              });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<textarea${attr("placeholder", inputPlaceholder ? inputPlaceholder : store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter your message"))} class="w-full mt-2 rounded-lg px-4 py-2 text-sm dark:text-gray-300 dark:bg-gray-900 outline-hidden resize-none" rows="3" required="">`);
              const $$body = escape_html(_inputValue);
              if ($$body) {
                $$renderer3.push(`${$$body}`);
              }
              $$renderer3.push(`</textarea>`);
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        });
        $$renderer3.push(`<!--]--> <div class="mt-6 flex justify-between gap-1.5"><button class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white font-medium w-full py-2 rounded-3xl transition" type="button">${escape_html(cancelLabel)}</button> <button class="text-sm bg-gray-900 hover:bg-gray-850 text-gray-100 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-800 font-medium w-full py-2 rounded-3xl transition" type="button">${escape_html(confirmLabel)}</button></div></div></div></div>`);
      } else {
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      title,
      message,
      cancelLabel,
      confirmLabel,
      onConfirm,
      input,
      inputPlaceholder,
      inputValue,
      inputType,
      show
    });
  });
}
export {
  ConfirmDialog as C,
  SensitiveInput as S,
  html as h
};
//# sourceMappingURL=ConfirmDialog.js.map
