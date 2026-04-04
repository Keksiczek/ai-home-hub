import { o as getContext, f as fallback, k as escape_html, c as store_get, a as attr, t as stringify, e as ensure_array_like, d as attr_class, u as unsubscribe_stores, b as bind_props, j as slot, g as clsx, h as attr_style } from "./root.js";
import { v4 } from "uuid";
import { g as tags, c as config, h as settings, J as showControls, L as showEmbeds, G as embed, S as artifactCode, K as showArtifacts, i as mobile, a as chatId, m as models, u as user, C as temporaryChatEnabled, W as WEBUI_NAME, d as currentChatPage, e as chats } from "./index2.js";
import { o as onDestroy, t as tick, c as createEventDispatcher } from "./index-server.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { o as updateChatById, c as getChatList } from "./index5.js";
import { c as createMessagesList, s as sanitizeResponseContent, x as formatDate } from "./index3.js";
import dayjs from "dayjs";
/* empty css                                       */
import "panzoom";
import "file-saver";
import "dompurify";
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
import { marked } from "marked";
/* empty css                                            */
/* empty css                                    */
/* empty css                */
import "./codemirror.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
/* empty css                                            */
import "i18next";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import { a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL, b as WEBUI_VERSION } from "./constants.js";
import { C as ChatBubble, S as Skeleton, b as ProfileImage, N as Name, a as FileItem, L as Loader } from "./FileItem.js";
import { b as Info, M as Markdown, C as CodeBlock, L as LightBulb, I as Image, F as FullHeightIframe, S as Sparkles, B as Bolt } from "./Markdown.js";
import { T as Tooltip } from "./Tooltip.js";
import { a as Tags, T as Textarea } from "./Textarea.js";
import { X as XMark, M as Modal } from "./Modal.js";
import { C as ChevronRight } from "./CheckCircle.js";
import { C as ConfirmDialog, h as html } from "./ConfirmDialog.js";
import { S as Spinner } from "./Spinner.js";
import { B as Badge } from "./Badge.js";
import { S as Search, C as Check } from "./Check.js";
import { E as EllipsisHorizontal } from "./EllipsisHorizontal.js";
import { D as Dropdown } from "./Dropdown.js";
import { C as ChevronDown } from "./ChevronDown.js";
import { a as Collapsible, C as ChevronUp } from "./Collapsible.js";
import Fuse from "fuse.js";
import { E as EyeSlash } from "./EyeSlash.js";
function RateComment($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let message = $$props["message"];
    let show = fallback($$props["show"], false);
    let LIKE_REASONS = [
      "accurate_information",
      "followed_instructions_perfectly",
      "showcased_creativity",
      "positive_attitude",
      "attention_to_detail",
      "thorough_explanation",
      "other"
    ];
    let DISLIKE_REASONS = [
      "dont_like_the_style",
      "too_verbose",
      "not_helpful",
      "not_factually_correct",
      "didnt_fully_follow_instructions",
      "refused_when_it_shouldnt_have",
      "being_lazy",
      "other"
    ];
    let tags$1 = [];
    let reasons = [];
    let selectedReason = null;
    let comment = "";
    let detailedRating = null;
    const init = () => {
      if (!selectedReason) {
        selectedReason = message?.annotation?.reason ?? "";
      }
      if (!comment) {
        comment = message?.annotation?.comment ?? "";
      }
      tags$1 = (message?.annotation?.tags ?? []).map((tag) => ({ name: tag }));
      if (!detailedRating) {
        detailedRating = message?.annotation?.details?.rating ?? null;
      }
    };
    if (message?.annotation?.rating === 1) {
      reasons = LIKE_REASONS;
    } else if (message?.annotation?.rating === -1) {
      reasons = DISLIKE_REASONS;
    }
    if (message) {
      init();
    }
    if (
      // if (!selectedReason) {
      // 	toast.error($i18n.t('Please select a reason'));
      // 	return;
      // }
      message?.arena
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="text-xs font-medium pt-1.5 -mb-0.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('This response was generated by "{{model}}"', {
        model: message.selectedModelId
      }))}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="my-2.5 rounded-xl px-4 py-3 border border-gray-100/30 dark:border-gray-850/30"${attr("id", `message-feedback-${stringify(message.id)}`)}><div class="flex justify-between items-center"><div class="text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("How would you rate this response?"))}</div> <button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close feedback"))}>`);
    XMark($$renderer2, { className: "size-4" });
    $$renderer2.push(`<!----></button></div> <div class="w-full flex justify-center"><div class="relative w-fit overflow-x-auto scrollbar-none"><div class="mt-1.5 w-fit flex gap-1 pb-2"><!--[-->`);
    const each_array = ensure_array_like(Array.from({ length: 10 }).map((_, i) => i + 1));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let rating = each_array[$$index];
      $$renderer2.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Rate {{rating}} out of 10", { rating }))}${attr_class(`size-7 text-sm border border-gray-100/30 dark:border-gray-850/30 hover:bg-gray-50 dark:hover:bg-gray-850 ${stringify(detailedRating === rating ? "bg-gray-100 dark:bg-gray-800" : "")} transition rounded-full disabled:cursor-not-allowed disabled:text-gray-500 disabled:bg-white dark:disabled:bg-gray-900`)}${attr("disabled", message?.annotation?.rating === -1 ? rating > 5 : rating < 6, true)}>${escape_html(rating)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="sticky top-0 bottom-0 left-0 right-0 flex justify-between text-xs"><div>1 - ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Awful"))}</div> <div>10 - ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Amazing"))}</div></div></div></div> <div>`);
    if (reasons.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="text-sm mt-1.5 font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Why?"))}</div> <div class="flex flex-wrap gap-1.5 text-sm mt-1.5"><!--[-->`);
      const each_array_1 = ensure_array_like(reasons);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let reason = each_array_1[$$index_1];
        $$renderer2.push(`<button${attr_class(`px-3 py-0.5 border border-gray-100/30 dark:border-gray-850/30 hover:bg-gray-50 dark:hover:bg-gray-850 ${stringify(selectedReason === reason ? "bg-gray-100 dark:bg-gray-800" : "")} transition rounded-xl`)}>`);
        if (reason === "accurate_information") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Accurate information"))}`);
        } else if (reason === "followed_instructions_perfectly") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Followed instructions perfectly"))}`);
        } else if (reason === "showcased_creativity") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Showcased creativity"))}`);
        } else if (reason === "positive_attitude") {
          $$renderer2.push("<!--[3-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Positive attitude"))}`);
        } else if (reason === "attention_to_detail") {
          $$renderer2.push("<!--[4-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Attention to detail"))}`);
        } else if (reason === "thorough_explanation") {
          $$renderer2.push("<!--[5-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thorough explanation"))}`);
        } else if (reason === "dont_like_the_style") {
          $$renderer2.push("<!--[6-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Don't like the style"))}`);
        } else if (reason === "too_verbose") {
          $$renderer2.push("<!--[7-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Too verbose"))}`);
        } else if (reason === "not_helpful") {
          $$renderer2.push("<!--[8-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Not helpful"))}`);
        } else if (reason === "not_factually_correct") {
          $$renderer2.push("<!--[9-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Not factually correct"))}`);
        } else if (reason === "didnt_fully_follow_instructions") {
          $$renderer2.push("<!--[10-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Didn't fully follow instructions"))}`);
        } else if (reason === "refused_when_it_shouldnt_have") {
          $$renderer2.push("<!--[11-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Refused when it shouldn't have"))}`);
        } else if (reason === "being_lazy") {
          $$renderer2.push("<!--[12-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Being lazy"))}`);
        } else if (reason === "other") {
          $$renderer2.push("<!--[13-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Other"))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(reason)}`);
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-2"><textarea class="w-full text-sm px-1 py-2 bg-transparent outline-hidden resize-none rounded-xl"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Feel free to add specific details"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Additional feedback comments"))} rows="3">`);
    const $$body = escape_html(comment);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div> <div class="mt-2 gap-1.5 flex justify-between"><div class="flex items-end group">`);
    Tags($$renderer2, {
      tags: tags$1,
      suggestionTags: store_get($$store_subs ??= {}, "$_tags", tags) ?? []
    });
    $$renderer2.push(`<!----></div> <button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div> `);
    if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_community_sharing && message?.model) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mt-3 pt-3 border-t border-gray-100/30 dark:border-gray-850/30"><a${attr("href", `https://openwebui.com/models?q=${encodeURIComponent(message.model)}`)} target="_blank" class="flex cursor-pointer items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-850 w-full px-3 py-2 rounded-xl transition"><div class="self-center"><div class="text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Leave a public review for {{modelName}}", { modelName: message.model }))}</div> <div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Help the community discover great models"))}</div></div> `);
      ChevronRight($$renderer2, { className: "size-4" });
      $$renderer2.push(`<!----></a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { message, show });
  });
}
function WebSearchResults($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let status = fallback($$props["status"], () => ({ urls: [], query: "" }), true);
    let state = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Collapsible($$renderer3, {
        grow: true,
        className: "w-full",
        buttonClassName: "w-full",
        get open() {
          return state;
        },
        set open($$value) {
          state = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex items-center gap-2 text-gray-500 transition"><!--[-->`);
          slot($$renderer4, $$props, "default", {}, null);
          $$renderer4.push(`<!--]--> `);
          if (state) {
            $$renderer4.push("<!--[0-->");
            ChevronUp($$renderer4, { strokeWidth: "2.5", className: "size-3.5 " });
          } else {
            $$renderer4.push("<!--[-1-->");
            ChevronDown($$renderer4, { strokeWidth: "2.5", className: "size-3.5 " });
          }
          $$renderer4.push(`<!--]--></div>`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div class="text-sm border border-gray-50 dark:border-gray-850/30 rounded-xl my-1.5 p-2 w-full" slot="content">`);
            if (status?.query) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<a${attr("href", `https://www.google.com/search?q=${stringify(status.query)}`)} target="_blank" class="flex w-full items-center p-1 px-3 group/item justify-between text-gray-800 dark:text-gray-300 font-normal! no-underline!"><div class="flex gap-2 items-center">`);
              Search($$renderer4, {});
              $$renderer4.push(`<!----> <div class="line-clamp-1">${escape_html(status.query)}</div></div> <div class="ml-1 text-white dark:text-gray-900 group-hover/item:text-gray-600 dark:group-hover/item:text-white transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"></path></svg></div></a>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (status?.items) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<!--[-->`);
              const each_array = ensure_array_like(status.items);
              for (let itemIdx = 0, $$length = each_array.length; itemIdx < $$length; itemIdx++) {
                let item = each_array[itemIdx];
                $$renderer4.push(`<a${attr("href", item.link)} target="_blank" class="flex w-full items-center p-1 px-3 group/item justify-between text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg font-normal! no-underline! mb-1"><div class="flex justify-center items-center gap-3"><div class="w-fit"><img${attr("src", `https://www.google.com/s2/favicons?sz=32&domain=${stringify(item.link)}`)}${attr("alt", `${stringify(item?.title ?? item.link)} favicon`)} class="size-3.5"/></div> <div class="w-full text-sm line-clamp-1">${escape_html(item?.title ?? item.link)}</div></div> <div class="ml-1 text-white dark:text-gray-900 group-hover/item:text-gray-600 dark:group-hover/item:text-white transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"></path></svg></div></a>`);
              }
              $$renderer4.push(`<!--]-->`);
            } else if (status?.urls) {
              $$renderer4.push("<!--[1-->");
              $$renderer4.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(status.urls);
              for (let urlIdx = 0, $$length = each_array_1.length; urlIdx < $$length; urlIdx++) {
                let url = each_array_1[urlIdx];
                $$renderer4.push(`<a${attr("href", url)} target="_blank" class="flex w-full items-center p-1 px-3 group/item justify-between text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-lg no-underline mb-1"><div class="flex justify-center items-center gap-3"><div class="w-fit"><img${attr("src", `https://www.google.com/s2/favicons?sz=32&domain=${stringify(url)}`)}${attr("alt", `${stringify(url)} favicon`)} class="size-3.5"/></div> <div class="w-full text-sm line-clamp-1">${escape_html(url)}</div></div> <div class="ml-1 text-white dark:text-gray-900 group-hover/item:text-gray-600 dark:group-hover/item:text-white transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"></path></svg></div></a>`);
              }
              $$renderer4.push(`<!--]-->`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
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
    bind_props($$props, { status });
  });
}
function Error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let content = fallback($$props["content"], "");
    $$renderer2.push(`<div class="flex my-2 gap-2.5 border px-4 py-3 border-red-600/10 bg-red-600/10 rounded-lg"><div class="self-start mt-0.5">`);
    Info($$renderer2, { className: "size-5 text-red-700 dark:text-red-400" });
    $$renderer2.push(`<!----></div> <div class="self-center text-sm">`);
    if (typeof content === "string") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(content)}`);
    } else if (typeof content === "object" && content !== null) {
      $$renderer2.push("<!--[1-->");
      if (content?.error && content?.error?.message) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content.error.message)}`);
      } else if (content?.detail) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`${escape_html(content.detail)}`);
      } else if (content?.message) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`${escape_html(content.message)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`${escape_html(JSON.stringify(content))}`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(JSON.stringify(content))}`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { content });
  });
}
function CitationModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    const CONTENT_PREVIEW_LIMIT = 1e4;
    let expandedDocs = /* @__PURE__ */ new Set();
    let show = fallback($$props["show"], false);
    let citation = $$props["citation"];
    let showPercentage = fallback($$props["showPercentage"], false);
    let showRelevance = fallback($$props["showRelevance"], true);
    let mergedDocuments = [];
    function calculatePercentage(distance) {
      if (typeof distance !== "number") return null;
      if (distance < 0) return 0;
      if (distance > 1) return 100;
      return Math.round(distance * 1e4) / 100;
    }
    function getRelevanceColor(percentage) {
      if (percentage >= 80) return "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200";
      if (percentage >= 60) return "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200";
      if (percentage >= 40) return "bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200";
      return "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200";
    }
    const decodeString = (str) => {
      try {
        return decodeURIComponent(str);
      } catch {
        return str;
      }
    };
    const getTextFragmentUrl = (doc) => {
      const { metadata, source, document: content } = doc ?? {};
      const { file_id, page } = metadata ?? {};
      const sourceUrl = source?.url;
      const baseUrl = file_id ? `${WEBUI_API_BASE_URL}/files/${file_id}/content${page !== void 0 ? `#page=${page + 1}` : ""}` : sourceUrl?.includes("http") ? sourceUrl : null;
      if (!baseUrl || !content) return baseUrl;
      const words = content.trim().replace(/\s+/g, " ").split(" ").filter((w) => w.length > 0 && !/https?:\/\/|[\u{1F300}-\u{1F9FF}]/u.test(w));
      if (words.length === 0) return baseUrl;
      const clean = (w) => w.replace(/[^\w]/g, "");
      const first = clean(words[0]);
      const last = clean(words.at(-1));
      const fragment = words.length === 1 ? first : `${first},${last}`;
      return fragment ? `${baseUrl}#:~:text=${fragment}` : baseUrl;
    };
    if (citation) {
      expandedDocs = /* @__PURE__ */ new Set();
      mergedDocuments = citation.document?.map((c, i) => {
        return {
          source: citation.source,
          document: c,
          metadata: citation.metadata?.[i],
          distance: citation.distances?.[i]
        };
      });
      if (mergedDocuments.every((doc) => doc.distance !== void 0)) {
        mergedDocuments = mergedDocuments.sort((a, b) => (b.distance ?? Infinity) - (a.distance ?? Infinity));
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "lg",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-4.5 pt-3 pb-2"><div class="text-lg font-medium self-center flex items-center">`);
          if (citation?.source?.name) {
            $$renderer4.push("<!--[0-->");
            const document2 = mergedDocuments?.[0];
            if (document2?.metadata?.file_id || document2.source?.url?.includes("http")) {
              $$renderer4.push("<!--[0-->");
              Tooltip($$renderer4, {
                className: "w-fit",
                content: document2.source?.url?.includes("http") ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Open link") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open file"),
                placement: "top-start",
                tippyOptions: { duration: [500, 0] },
                children: ($$renderer5) => {
                  $$renderer5.push(`<a class="hover:text-gray-500 dark:hover:text-gray-100 underline grow line-clamp-1"${attr("href", document2?.metadata?.file_id ? `${WEBUI_API_BASE_URL}/files/${document2?.metadata?.file_id}/content${document2?.metadata?.page !== void 0 ? `#page=${document2.metadata.page + 1}` : ""}` : document2.source?.url?.includes("http") ? document2.source.url : `#`)} target="_blank">${escape_html(decodeString(citation?.source?.name))}</a>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(decodeString(citation?.source?.name))}`);
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Citation"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close citation modal"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-5 md:space-x-4"><div class="flex flex-col w-full dark:text-gray-200 overflow-y-scroll max-h-[22rem] scrollbar-thin gap-1"><!--[-->`);
          const each_array = ensure_array_like(mergedDocuments);
          for (let documentIdx = 0, $$length = each_array.length; documentIdx < $$length; documentIdx++) {
            let document2 = each_array[documentIdx];
            $$renderer4.push(`<div class="flex flex-col w-full gap-2">`);
            if (document2.metadata?.parameters) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div><div class="text-sm font-medium dark:text-gray-300 mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Parameters"))}</div> `);
              Textarea($$renderer4, {
                readonly: true,
                value: JSON.stringify(document2.metadata.parameters, null, 2)
              });
              $$renderer4.push(`<!----></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <div><div class="text-sm font-medium dark:text-gray-300 flex items-center gap-2 w-fit mb-1">`);
            if (document2.source?.url?.includes("http")) {
              $$renderer4.push("<!--[0-->");
              const snippetUrl = getTextFragmentUrl(document2);
              if (snippetUrl) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<a${attr("href", snippetUrl)} target="_blank" class="underline hover:text-gray-500 dark:hover:text-gray-100">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Content"))}</a>`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Content"))}`);
              }
              $$renderer4.push(`<!--]-->`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Content"))}`);
            }
            $$renderer4.push(`<!--]--> `);
            if (showRelevance && document2.distance !== void 0) {
              $$renderer4.push("<!--[0-->");
              Tooltip($$renderer4, {
                className: "w-fit",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Relevance"),
                placement: "top-start",
                tippyOptions: { duration: [500, 0] },
                children: ($$renderer5) => {
                  $$renderer5.push(`<div class="text-sm my-1 dark:text-gray-400 flex items-center gap-2 w-fit">`);
                  if (showPercentage) {
                    $$renderer5.push("<!--[0-->");
                    const percentage = calculatePercentage(document2.distance);
                    if (typeof percentage === "number") {
                      $$renderer5.push("<!--[0-->");
                      $$renderer5.push(`<span${attr_class(`px-1 rounded-sm font-medium ${getRelevanceColor(percentage)}`)}>${escape_html(percentage.toFixed(2))}%</span>`);
                    } else {
                      $$renderer5.push("<!--[-1-->");
                    }
                    $$renderer5.push(`<!--]-->`);
                  } else if (typeof document2?.distance === "number") {
                    $$renderer5.push("<!--[1-->");
                    $$renderer5.push(`<span class="text-gray-500 dark:text-gray-500">(${escape_html((document2?.distance ?? 0).toFixed(4))})</span>`);
                  } else {
                    $$renderer5.push("<!--[-1-->");
                  }
                  $$renderer5.push(`<!--]--></div>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (Number.isInteger(document2?.metadata?.page)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="text-sm text-gray-500 dark:text-gray-400">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("page"))}
										${escape_html(document2.metadata.page + 1)})</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div> `);
            if (document2.metadata?.html) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<iframe class="w-full border-0 h-auto rounded-none"${attr("sandbox", `allow-scripts allow-forms${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowSameOrigin ?? false ? " allow-same-origin" : "")}`)}${attr("srcdoc", document2.document)}${attr("title", store_get($$store_subs ??= {}, "$i18n", i18n).t("Content"))}></iframe>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              const rawContent = document2.document.trim().replace(/\n\n+/g, "\n\n");
              const isTruncated = (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) && rawContent.length > CONTENT_PREVIEW_LIMIT && !expandedDocs.has(documentIdx);
              if (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="text-sm prose dark:prose-invert max-w-full">`);
                Markdown($$renderer4, {
                  content: isTruncated ? rawContent.slice(0, CONTENT_PREVIEW_LIMIT) : rawContent,
                  id: `citation-${stringify(documentIdx)}`
                });
                $$renderer4.push(`<!----></div> `);
                if (isTruncated) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button class="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Show all ({{COUNT}} characters)", { COUNT: rawContent.length.toLocaleString() }))}</button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]-->`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<pre class="text-sm dark:text-gray-400 whitespace-pre-line">${escape_html(rawContent)}</pre>`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
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
    bind_props($$props, { show, citation, showPercentage, showRelevance });
  });
}
function Citations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "");
    let chatId2 = fallback($$props["chatId"], "");
    let sources = fallback($$props["sources"], () => [], true);
    let readOnly = fallback($$props["readOnly"], false);
    let citations = [];
    let showPercentage = false;
    let showRelevance = true;
    let showCitations = false;
    let showCitationModal = false;
    let selectedCitation = null;
    const showSourceModal = (sourceId) => {
      let index;
      if (typeof sourceId === "string") {
        const output = sourceId.split("#");
        index = parseInt(output[0]) - 1;
        if (output.length > 1) {
          output[1];
        }
      } else {
        index = sourceId - 1;
      }
      if (citations[index]) {
        /* @__PURE__ */ console.log("Showing citation modal for:", citations[index]);
        if (citations[index]?.source?.embed_url) {
          const embedUrl = citations[index].source.embed_url;
          if (embedUrl) {
            if (readOnly) {
              window.open(embedUrl, "_blank");
              return;
            } else {
              showControls.set(true);
              showEmbeds.set(true);
              embed.set({
                url: embedUrl,
                title: citations[index]?.source?.name || "Embedded Content",
                source: citations[index],
                chatId: chatId2,
                messageId: id,
                sourceId
              });
            }
          } else {
            selectedCitation = citations[index];
            showCitationModal = true;
          }
        } else {
          selectedCitation = citations[index];
          showCitationModal = true;
        }
      }
    };
    function calculateShowRelevance(sources2) {
      const distances = sources2.flatMap((citation) => citation.distances ?? []);
      const inRange = distances.filter((d) => d !== void 0 && d >= -1 && d <= 1).length;
      const outOfRange = distances.filter((d) => d !== void 0 && (d < -1 || d > 1)).length;
      if (distances.length === 0) {
        return false;
      }
      if (inRange === distances.length - 1 && outOfRange === 1 || outOfRange === distances.length - 1 && inRange === 1) {
        return false;
      }
      return true;
    }
    function shouldShowPercentage(sources2) {
      const distances = sources2.flatMap((citation) => citation.distances ?? []);
      return distances.every((d) => d !== void 0 && d >= -1 && d <= 1);
    }
    {
      citations = sources.reduce(
        (acc, source) => {
          if (Object.keys(source).length === 0) {
            return acc;
          }
          source?.document?.forEach((document2, index) => {
            const metadata = source?.metadata?.[index];
            const distance = source?.distances?.[index];
            const id2 = metadata?.source ?? source?.source?.id ?? "N/A";
            let _source = source?.source;
            if (metadata?.name) {
              _source = { ..._source, name: metadata.name };
            }
            if (id2.startsWith("http://") || id2.startsWith("https://")) {
              _source = { ..._source, name: id2, url: id2 };
            }
            const existingSource = acc.find((item) => item.id === id2);
            if (existingSource) {
              existingSource.document.push(document2);
              existingSource.metadata.push(metadata);
              if (distance !== void 0) existingSource.distances.push(distance);
            } else {
              acc.push({
                id: id2,
                source: _source,
                document: [document2],
                metadata: metadata ? [metadata] : [],
                distances: distance !== void 0 ? [distance] : []
              });
            }
          });
          return acc;
        },
        []
      );
      /* @__PURE__ */ console.log("citations", citations);
      showRelevance = calculateShowRelevance(citations);
      showPercentage = shouldShowPercentage(citations);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      CitationModal($$renderer3, {
        citation: selectedCitation,
        showPercentage,
        showRelevance,
        get show() {
          return showCitationModal;
        },
        set show($$value) {
          showCitationModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (citations.length > 0) {
        $$renderer3.push("<!--[0-->");
        const urlCitations = citations.filter((c) => c?.source?.name?.startsWith("http"));
        $$renderer3.push(`<div class="py-1 -mx-0.5 w-full flex gap-1 items-center flex-wrap"><button class="text-xs font-medium text-gray-600 dark:text-gray-300 px-3.5 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1 border border-gray-50 dark:border-gray-850/30"${attr("aria-label", citations.length === 1 ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Toggle 1 source") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Toggle {{COUNT}} sources", { COUNT: citations.length }))}${attr("aria-expanded", showCitations)}>`);
        if (urlCitations.length > 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex -space-x-1 items-center"><!--[-->`);
          const each_array = ensure_array_like(urlCitations.slice(0, 3));
          for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
            let citation = each_array[idx];
            $$renderer3.push(`<img${attr("src", `https://www.google.com/s2/favicons?sz=32&domain=${stringify(citation.source.name)}`)} alt="favicon" class="size-4 rounded-full shrink-0 border border-white dark:border-gray-850 bg-white dark:bg-gray-900"/>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div>`);
        if (citations.length === 1) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("1 Source"))}`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}} Sources", { COUNT: citations.length }))}`);
        }
        $$renderer3.push(`<!--]--></div></button></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { id, chatId: chatId2, sources, readOnly, showSourceModal });
  });
}
function CodeExecutionModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let codeExecution = fallback($$props["codeExecution"], null);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "lg",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center flex flex-col gap-0.5 capitalize">`);
          if (codeExecution?.result) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div>`);
            if (codeExecution.result?.error) {
              $$renderer4.push("<!--[0-->");
              Badge($$renderer4, { type: "error", content: "error" });
            } else if (codeExecution.result?.output) {
              $$renderer4.push("<!--[1-->");
              Badge($$renderer4, { type: "success", content: "success" });
            } else {
              $$renderer4.push("<!--[-1-->");
              Badge($$renderer4, { type: "warning", content: "incomplete" });
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 items-center">`);
          if (!codeExecution?.result) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div>`);
            Spinner($$renderer4, { className: "size-4" });
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div>`);
          if (codeExecution?.name) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Code execution"))}: ${escape_html(codeExecution?.name)}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Code execution"))}`);
          }
          $$renderer4.push(`<!--]--></div></div></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-5"><div class="flex flex-col w-full dark:text-gray-200 overflow-y-scroll max-h-[22rem] scrollbar-hidden"><div class="flex flex-col w-full">`);
          CodeBlock($$renderer4, {
            id: `code-exec-${stringify(codeExecution?.id)}-code`,
            lang: codeExecution?.language ?? "",
            code: codeExecution?.code ?? "",
            className: "",
            editorClassName: codeExecution?.result && (codeExecution?.result?.error || codeExecution?.result?.output) ? "rounded-b-none" : "",
            run: false
          });
          $$renderer4.push(`<!----></div> `);
          if (codeExecution?.result && (codeExecution?.result?.error || codeExecution?.result?.output)) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="dark:bg-[#202123] dark:text-white px-4 py-4 rounded-b-lg flex flex-col gap-3">`);
            if (codeExecution?.result?.error) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div><div class="text-gray-500 text-xs mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ERROR"))}</div> <div class="text-sm">${escape_html(codeExecution?.result?.error)}</div></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (codeExecution?.result?.output) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div><div class="text-gray-500 text-xs mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OUTPUT"))}</div> <div class="text-sm">${escape_html(codeExecution?.result?.output)}</div></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (codeExecution?.result?.files && codeExecution?.result?.files.length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col w-full"><hr class="border-gray-100/30 dark:border-gray-850/30 my-2"/> <div class="text-sm font-medium dark:text-gray-300">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Files"))}</div> <ul class="mt-1 list-disc pl-4 text-xs"><!--[-->`);
            const each_array = ensure_array_like(codeExecution?.result?.files);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let file = each_array[$$index];
              $$renderer4.push(`<li><a${attr("href", file.url)} target="_blank">${escape_html(file.name)}</a></li>`);
            }
            $$renderer4.push(`<!--]--></ul></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
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
    bind_props($$props, { show, codeExecution });
  });
}
function CodeExecutions($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let codeExecutions = fallback($$props["codeExecutions"], () => [], true);
    let selectedCodeExecution = null;
    let showCodeExecutionModal = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      CodeExecutionModal($$renderer3, {
        codeExecution: selectedCodeExecution,
        get show() {
          return showCodeExecutionModal;
        },
        set show($$value) {
          showCodeExecutionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (codeExecutions.length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="mt-1 mb-2 w-full flex gap-1 items-center flex-wrap svelte-tclqny"><!--[-->`);
        const each_array = ensure_array_like(codeExecutions);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let execution = each_array[$$index];
          $$renderer3.push(`<div class="flex gap-1 text-xs font-semibold svelte-tclqny"><button class="flex dark:text-gray-300 py-1 px-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-xl max-w-96 svelte-tclqny"><div class="bg-white dark:bg-gray-700 rounded-full size-4 flex items-center justify-center svelte-tclqny">`);
          if (execution?.result) {
            $$renderer3.push("<!--[0-->");
            if (execution.result?.error) {
              $$renderer3.push("<!--[0-->");
              XMark($$renderer3, {});
            } else if (execution.result?.output) {
              $$renderer3.push("<!--[1-->");
              Check($$renderer3, { strokeWidth: "3", className: "size-3" });
            } else {
              $$renderer3.push("<!--[-1-->");
              EllipsisHorizontal($$renderer3, {});
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
            Spinner($$renderer3, { className: "size-4" });
          }
          $$renderer3.push(`<!--]--></div> <div${attr_class(`flex-1 mx-2 line-clamp-1 code-execution-name ${stringify(execution?.result ? "" : "pulse")}`, "svelte-tclqny")}>${escape_html(execution.name)}</div></button></div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
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
    bind_props($$props, { codeExecutions });
  });
}
function FloatingButtons($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "");
    let messageId = fallback($$props["messageId"], "");
    let model = fallback($$props["model"], null);
    let messages = fallback($$props["messages"], () => [], true);
    let actions = fallback($$props["actions"], () => [], true);
    let onAdd = fallback($$props["onAdd"], (e) => {
    });
    let floatingInput = false;
    let floatingInputValue = "";
    let content = "";
    let responseContent = null;
    let responseDone = false;
    const DEFAULT_ACTIONS = [
      {
        id: "ask",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Ask"),
        icon: ChatBubble,
        input: true,
        prompt: `{{SELECTED_CONTENT}}


{{INPUT_CONTENT}}`
      },
      {
        id: "explain",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Explain"),
        icon: LightBulb,
        prompt: `{{SELECTED_CONTENT}}


${store_get($$store_subs ??= {}, "$i18n", i18n).t("Explain")}`
      }
    ];
    const closeHandler = () => {
      responseContent = null;
      responseDone = false;
      floatingInput = false;
      floatingInputValue = "";
    };
    onDestroy(() => {
    });
    if (actions.length === 0) {
      actions = DEFAULT_ACTIONS;
    }
    $$renderer2.push(`<div${attr(
      "id",
      // Scroll to bottom only if the scroll is at the bottom give 50px buffer
      // Handle: {{variableId|tool:id="toolId"}} pattern
      // This regex captures variableId and toolId from {{variableId|tool:id="toolId"}}
      // Replace with just variableId
      // legacy {{TOOL:toolId}} pattern (for backward compatibility)
      // Remove all TOOL placeholders from the prompt
      // params: {
      // 	function_calling: 'native'
      // }
      // Enable streaming
      // Read data chunks from the response stream
      // Decode the received chunk
      // Process lines within the chunk
      // Parse the JSON chunk
      // Append the `content` field from the "choices" object
      // Process the stream in the background
      `floating-buttons-${id}`
    )} class="absolute rounded-lg mt-1 text-xs z-9999" style="display: none">`);
    if (responseContent === null) {
      $$renderer2.push("<!--[0-->");
      if (!floatingInput) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex flex-row shrink-0 p-0.5 bg-white dark:bg-gray-850 dark:text-gray-100 text-medium rounded-xl shadow-xl border border-gray-100 dark:border-gray-800"><!--[-->`);
        const each_array = ensure_array_like(actions);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let action = each_array[$$index];
          $$renderer2.push(`<button${attr("aria-label", action.label)} class="px-1.5 py-[1px] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-1 min-w-fit transition">`);
          if (action.icon) {
            $$renderer2.push("<!--[0-->");
            if (action.icon) {
              $$renderer2.push("<!--[-->");
              action.icon($$renderer2, { className: "size-3 shrink-0" });
              $$renderer2.push("<!--]-->");
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push("<!--]-->");
            }
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> <div class="shrink-0">${escape_html(action.label)}</div></button>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="py-1 flex dark:text-gray-100 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 w-72 rounded-full shadow-xl"><input type="text" id="floating-message-input" class="ml-5 bg-transparent outline-hidden w-full flex-1 text-sm"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Ask a question"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Ask a question"))}${attr("value", floatingInputValue)}/> <div class="ml-1 mr-1"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Submit question"))}${attr_class(`${stringify(floatingInputValue !== "" ? "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 " : "text-white bg-gray-200 dark:text-gray-900 dark:bg-gray-700 disabled")} transition rounded-full p-1.5 m-0.5 self-center`)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clip-rule="evenodd"></path></svg></button></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="bg-white dark:bg-gray-850 dark:text-gray-100 rounded-3xl shadow-xl w-80 max-w-full border border-gray-100 dark:border-gray-800"><div class="bg-white dark:bg-gray-850 dark:text-gray-100 text-medium rounded-3xl px-3.5 pt-3 w-full"><div class="font-medium">`);
      Markdown($$renderer2, { id: `${id}-float-prompt`, content });
      $$renderer2.push(`<!----></div></div> <div class="bg-white dark:bg-gray-850 dark:text-gray-100 text-medium rounded-4xl w-full"><div class="max-h-80 overflow-y-auto w-full markdown-prose-xs px-3.5 py-3" id="response-container">`);
      if (!responseContent || responseContent?.trim() === "") {
        $$renderer2.push("<!--[0-->");
        Skeleton($$renderer2, { size: "sm" });
      } else {
        $$renderer2.push("<!--[-1-->");
        Markdown($$renderer2, { id: `${id}-float-response`, content: responseContent });
      }
      $$renderer2.push(`<!--]--> `);
      if (responseDone) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}</button></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { id, messageId, model, messages, actions, onAdd, closeHandler });
  });
}
function ContentRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    let id = $$props["id"];
    let content = $$props["content"];
    let history = $$props["history"];
    let messageId = $$props["messageId"];
    let selectedModels = fallback($$props["selectedModels"], () => [], true);
    let done = fallback($$props["done"], true);
    let model = fallback($$props["model"], null);
    let sources = fallback($$props["sources"], null);
    let save = fallback($$props["save"], false);
    let preview = fallback($$props["preview"], false);
    let floatingButtons = fallback($$props["floatingButtons"], true);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let onSave = fallback($$props["onSave"], (e) => {
    });
    let onSourceClick = fallback($$props["onSourceClick"], (e) => {
    });
    let onTaskClick = fallback($$props["onTaskClick"], (e) => {
    });
    let onAddMessages = fallback($$props["onAddMessages"], (e) => {
    });
    let sourceIds = [];
    const getSourceIds = (sources2) => {
      const result = [];
      for (const source of sources2 ?? []) {
        for (let index = 0; index < (source.document ?? []).length; index++) {
          if (model?.info?.meta?.capabilities?.citations == false) {
            result.push("N/A");
            continue;
          }
          const metadata = source.metadata?.[index];
          const id2 = metadata?.source ?? "N/A";
          if (metadata?.name) {
            result.push(metadata.name);
          } else if (id2.startsWith("http://") || id2.startsWith("https://")) {
            result.push(id2);
          } else {
            result.push(source?.source?.name ?? id2);
          }
        }
      }
      sourceIds = [...new Set(result)];
    };
    const updateButtonPosition = (event) => {
      const buttonsContainerElement = document.getElementById(`floating-buttons-${id}`);
      if (!buttonsContainerElement?.contains(event.target)) {
        closeFloatingButtons();
        return;
      }
      setTimeout(
        async () => {
          await tick();
          return;
        },
        0
      );
    };
    const closeFloatingButtons = () => {
      const buttonsContainerElement = document.getElementById(`floating-buttons-${id}`);
      if (buttonsContainerElement) {
        buttonsContainerElement.style.display = "none";
      }
    };
    const keydownHandler = (e) => {
      if (e.key === "Escape") {
        closeFloatingButtons();
      }
    };
    onDestroy(() => {
      if (floatingButtons) {
        document.removeEventListener("mouseup", updateButtonPosition);
        document.removeEventListener("keydown", keydownHandler);
      }
    });
    getSourceIds(sources);
    $$renderer2.push(`<div>`);
    Markdown($$renderer2, {
      id,
      content,
      model,
      save,
      preview,
      done,
      editCodeBlock,
      topPadding,
      sourceIds,
      onSourceClick,
      onTaskClick,
      onSave,
      onUpdate: async (token) => {
        const { lang, text: code } = token;
        if ((store_get($$store_subs ??= {}, "$settings", settings)?.detectArtifacts ?? true) && (["html", "svg"].includes(lang) || lang === "xml" && code.includes("svg")) && !store_get($$store_subs ??= {}, "$mobile", mobile) && store_get($$store_subs ??= {}, "$chatId", chatId)) {
          await tick();
          showArtifacts.set(true);
          showControls.set(true);
        }
      },
      onPreview: async (value) => {
        /* @__PURE__ */ console.log("Preview", value);
        await artifactCode.set(value);
        await showControls.set(true);
        await showArtifacts.set(true);
        await showEmbeds.set(false);
      }
    });
    $$renderer2.push(`<!----></div> `);
    if (floatingButtons) {
      $$renderer2.push("<!--[0-->");
      FloatingButtons($$renderer2, {
        id,
        messageId,
        actions: store_get($$store_subs ??= {}, "$settings", settings)?.floatingActionButtons ?? [],
        model: (selectedModels ?? []).includes(model?.id) ? model?.id : (selectedModels ?? []).length > 0 ? selectedModels.at(0) : model?.id ?? null,
        messages: createMessagesList(history, messageId),
        onAdd: ({ modelId, parentId, messages }) => {
          /* @__PURE__ */ console.log(modelId, parentId, messages);
          onAddMessages({ modelId, parentId, messages });
          closeFloatingButtons();
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      content,
      history,
      messageId,
      selectedModels,
      done,
      model,
      sources,
      save,
      preview,
      floatingButtons,
      editCodeBlock,
      topPadding,
      onSave,
      onSourceClick,
      onTaskClick,
      onAddMessages
    });
  });
}
function FollowUps($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let followUps = fallback($$props["followUps"], () => [], true);
    let onClick = fallback($$props["onClick"], () => {
    });
    $$renderer2.push(`<div class="mt-4"><div class="text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Follow up"))}</div> <div class="flex flex-col text-left gap-1 mt-1.5"><!--[-->`);
    const each_array = ensure_array_like(followUps);
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let followUp = each_array[idx];
      Tooltip($$renderer2, {
        content: followUp,
        placement: "top-start",
        className: "line-clamp-1",
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="py-1.5 bg-transparent text-left text-sm flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition cursor-pointer w-full"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Follow up: {{question}}", { question: followUp }))}><div class="line-clamp-1">${escape_html(followUp)}</div></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      if (idx < followUps.length - 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<hr class="border-gray-50 dark:border-gray-850/30"/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { followUps, onClick });
  });
}
function LineSpace($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M11 6H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 12H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 18H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 19V5M5 19L3 16.5M5 19L7 16.5M5 5L3 7M5 5L7 7" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function LineSpaceSmaller($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M11 6H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 12H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 18H21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 19V5M5 10L3 8M5 10L7 8M5 14L3 16M5 14L7 16" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function RegenerateMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onRegenerate = fallback($$props["onRegenerate"], (prompt = null) => {
    });
    let onClose = fallback($$props["onClose"], () => {
    });
    let show = false;
    let inputValue = "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        onOpenChange: (state) => {
          if (state === false) {
            onClose();
          }
        },
        align: "start",
        sideOffset: -2,
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          slot($$renderer4, $$props, "default", {}, null);
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="max-w-[200px] rounded-2xl px-1 py-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg transition"><div class="py-1.5 px-2.5 flex dark:text-gray-100"><input type="text" id="floating-message-input" class="bg-transparent outline-hidden w-full flex-1 text-sm"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Suggest a change"))}${attr("value", inputValue)} autocomplete="off"/> <div class="ml-2 self-center flex items-center"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Submit suggestion"))}${attr_class(`${stringify("text-white bg-gray-200 dark:text-gray-900 dark:bg-gray-700 disabled")} transition rounded-full p-1 self-center`)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clip-rule="evenodd"></path></svg></button></div></div> <hr class="border-gray-50/30 dark:border-gray-800/30 my-1 mx-2"/> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Try Again"))}</div></button> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            LineSpace($$renderer4, { strokeWidth: "2" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Details"))}</div></button> <button class="select-none flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            LineSpaceSmaller($$renderer4, { strokeWidth: "2" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("More Concise"))}</div></button></div></div>`);
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
    bind_props($$props, { onRegenerate, onClose });
  });
}
function StatusItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let status = fallback($$props["status"], null);
    let done = fallback($$props["done"], false);
    if (!status?.hidden) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="status-description flex items-center gap-2 py-0.5 w-full text-left">`);
      if (status?.action === "web_search" && (status?.urls || status?.items)) {
        $$renderer2.push("<!--[0-->");
        WebSearchResults($$renderer2, {
          status,
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-base line-clamp-1 text-wrap`)}>`);
            if (status?.description?.includes("{{count}}")) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(status?.description, { count: (status?.urls || status?.items).length }))}`);
            } else if (status?.description === "No search query generated") {
              $$renderer3.push("<!--[1-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No search query generated"))}`);
            } else if (status?.description === "Generating search query") {
              $$renderer3.push("<!--[2-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Generating search query"))}`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`${escape_html(status?.description)}`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          },
          $$slots: { default: true }
        });
      } else if (status?.action === "knowledge_search") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 text-base line-clamp-1 text-wrap`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Searching Knowledge for "{{searchQuery}}"`, { searchQuery: status.query }))}</div></div>`);
      } else if (status?.action === "web_search_queries_generated" && status?.queries) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 text-base line-clamp-1 text-wrap`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Searching`))}</div> <div class="flex gap-1 flex-wrap mt-2"><!--[-->`);
        const each_array = ensure_array_like(status.queries);
        for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
          let query = each_array[idx];
          $$renderer2.push(`<div class="bg-gray-50 dark:bg-gray-850 flex rounded-lg py-1 px-2 items-center gap-1 text-xs"><div>`);
          Search($$renderer2, { className: "size-3" });
          $$renderer2.push(`<!----></div> <span class="line-clamp-1">${escape_html(query)}</span></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else if (status?.action === "queries_generated" && status?.queries) {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 text-base line-clamp-1 text-wrap`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Querying`))}</div> <div class="flex gap-1 flex-wrap mt-2"><!--[-->`);
        const each_array_1 = ensure_array_like(status.queries);
        for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
          let query = each_array_1[idx];
          $$renderer2.push(`<div class="bg-gray-50 dark:bg-gray-850 flex rounded-lg py-1 px-2 items-center gap-1 text-xs"><div>`);
          Search($$renderer2, { className: "size-3" });
          $$renderer2.push(`<!----></div> <span class="line-clamp-1">${escape_html(query)}</span></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else if (status?.action === "sources_retrieved" && status?.count !== void 0) {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 text-base line-clamp-1 text-wrap`)}>`);
        if (status.count === 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No sources found"))}`);
        } else if (status.count === 1) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Retrieved 1 source"))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Retrieved {{count}} sources", { count: status.count }))}`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify((done || status?.done) === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 text-base line-clamp-1 text-wrap`)}>`);
        if (status?.description?.includes("{{searchQuery}}")) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(status?.description, { searchQuery: status?.query }))}`);
        } else if (status?.description === "No search query generated") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No search query generated"))}`);
        } else if (status?.description === "Generating search query") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Generating search query"))}`);
        } else if (status?.description === "Searching the web") {
          $$renderer2.push("<!--[3-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Searching the web"))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(status?.description)}`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { status, done });
  });
}
function StatusHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let statusHistory = fallback($$props["statusHistory"], () => [], true);
    let expand = fallback($$props["expand"], false);
    let showHistory = true;
    let history = [];
    let status = null;
    if (expand) {
      showHistory = true;
    } else {
      showHistory = false;
    }
    if (statusHistory.length !== history.length || JSON.stringify(statusHistory) !== JSON.stringify(history)) {
      history = statusHistory;
    }
    if (history && history.length > 0) {
      status = history.at(-1);
    }
    if (history && history.length > 0) {
      $$renderer2.push("<!--[0-->");
      if (status?.hidden !== true) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="text-sm flex flex-col w-full"><button class="w-full"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Toggle status history"))}${attr("aria-expanded", showHistory)}><div class="flex items-start gap-2">`);
        StatusItem($$renderer2, { status });
        $$renderer2.push(`<!----></div></button> `);
        if (showHistory) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="flex flex-row">`);
          if (history.length > 1) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="w-full"><!--[-->`);
            const each_array = ensure_array_like(history);
            for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
              let status2 = each_array[idx];
              $$renderer2.push(`<div class="flex items-stretch gap-2 mb-1"><div><div class="pt-3 px-1 mb-1.5"><span class="relative flex size-1.5 rounded-full justify-center items-center"><span class="relative inline-flex size-1.5 rounded-full bg-gray-500 dark:bg-gray-400"></span></span></div> `);
              if (idx !== history.length - 1) {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<div class="w-[0.5px] ml-[6.5px] h-[calc(100%-14px)] bg-gray-300 dark:bg-gray-700"></div>`);
              } else {
                $$renderer2.push("<!--[-1-->");
              }
              $$renderer2.push(`<!--]--></div> `);
              StatusItem($$renderer2, { status: status2, done: true });
              $$renderer2.push(`<!----></div>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { statusHistory, expand });
  });
}
function ResponseMessage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let statusEntries, hasVisibleStatus;
    const i18n = getContext("i18n");
    const dispatch = createEventDispatcher();
    let chatId2 = fallback($$props["chatId"], "");
    let history = $$props["history"];
    let messageId = $$props["messageId"];
    let selectedModels = fallback($$props["selectedModels"], () => [], true);
    let message = structuredClone(history.messages[messageId]);
    let siblings = $$props["siblings"];
    let setInputText = fallback($$props["setInputText"], () => {
    });
    let gotoMessage = fallback($$props["gotoMessage"], () => {
    });
    let showPreviousMessage = $$props["showPreviousMessage"];
    let showNextMessage = $$props["showNextMessage"];
    let updateChat = $$props["updateChat"];
    let editMessage = $$props["editMessage"];
    let saveMessage = $$props["saveMessage"];
    let rateMessage = $$props["rateMessage"];
    let actionMessage = $$props["actionMessage"];
    let deleteMessage = $$props["deleteMessage"];
    let submitMessage = $$props["submitMessage"];
    let continueResponse = $$props["continueResponse"];
    let regenerateResponse = $$props["regenerateResponse"];
    let addMessages = $$props["addMessages"];
    let isLastMessage = fallback($$props["isLastMessage"], true);
    let readOnly = fallback($$props["readOnly"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let showDeleteConfirm = false;
    let model = null;
    let showRateComment = false;
    let feedbackLoading = false;
    onDestroy(() => {
    });
    if (history.messages) {
      const source = history.messages[messageId];
      if (source) {
        if (message.content !== source.content || message.done !== source.done) {
          message = structuredClone(source);
        } else if (JSON.stringify(message) !== JSON.stringify(source)) {
          message = structuredClone(source);
        }
      }
    }
    model = store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === message.model);
    statusEntries = message?.statusHistory ?? [...message?.status ? [message?.status] : []];
    hasVisibleStatus = (model?.info?.meta?.capabilities?.status_updates ?? true) && statusEntries.length > 0 && !(statusEntries.at(-1)?.hidden ?? false);
    {
      (async () => {
        await tick();
      })();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete message?"),
        get show() {
          return showDeleteConfirm;
        },
        set show($$value) {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <!---->`);
      {
        $$renderer3.push(`<div${attr_class(` flex w-full message-${stringify(message.id)}`, "svelte-1qscqw6")}${attr("id", `message-${stringify(message.id)}`)}${attr("dir", store_get($$store_subs ??= {}, "$settings", settings).chatDirection)} style="scroll-margin-top: 3rem;"><div${attr_class(`shrink-0 ltr:mr-3 rtl:ml-3 hidden @lg:flex mt-1 `, "svelte-1qscqw6")}>`);
        ProfileImage($$renderer3, {
          src: `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model?.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`,
          className: "size-8 assistant-message-profile-image"
        });
        $$renderer3.push(`<!----></div> <div class="flex-auto w-0 pl-1 relative">`);
        Name($$renderer3, {
          children: ($$renderer4) => {
            Tooltip($$renderer4, {
              content: model?.name ?? message.model,
              placement: "top-start",
              children: ($$renderer5) => {
                $$renderer5.push(`<span id="response-message-model-name" class="line-clamp-1 text-black dark:text-white">${escape_html(model?.name ?? message.model)}</span>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            if (message.timestamp) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div${attr_class(`self-center text-xs font-medium first-letter:capitalize ml-0.5 translate-y-[1px] ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:text-gray-100 text-gray-900" : "invisible group-hover:visible transition text-gray-400")}`)}>`);
              Tooltip($$renderer4, {
                content: dayjs(message.timestamp * 1e3).format("LLLL"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<span class="line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(formatDate(message.timestamp * 1e3), {
                    LOCALIZED_TIME: dayjs(message.timestamp * 1e3).format("LT"),
                    LOCALIZED_DATE: dayjs(message.timestamp * 1e3).format("L")
                  }))}</span>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> <div><div${attr_class(`chat-${stringify(message.role)} w-full min-w-full markdown-prose`, "svelte-1qscqw6")}><div>`);
        if (model?.info?.meta?.capabilities?.status_updates ?? true) {
          $$renderer3.push("<!--[0-->");
          StatusHistory($$renderer3, { statusHistory: message?.statusHistory });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message?.files && message.files?.filter((f) => f.type === "image").length > 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="my-1 w-full flex overflow-x-auto gap-2 flex-wrap"${attr("dir", store_get($$store_subs ??= {}, "$settings", settings)?.chatDirection ?? "auto")}><!--[-->`);
          const each_array = ensure_array_like(message.files);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let file = each_array[$$index];
            $$renderer3.push(`<div>`);
            if (file.type === "image" || (file?.content_type ?? "").startsWith("image/")) {
              $$renderer3.push("<!--[0-->");
              Image($$renderer3, { src: file.url, alt: message.content });
            } else {
              $$renderer3.push("<!--[-1-->");
              FileItem($$renderer3, {
                item: file,
                url: file.url,
                name: file.name,
                type: file.type,
                size: file?.size,
                small: true
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message?.embeds && message.embeds.length > 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="my-1 w-full flex overflow-x-auto gap-2 flex-wrap"${attr("id", `${message.id}-embeds-container`)}><!--[-->`);
          const each_array_1 = ensure_array_like(message.embeds);
          for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
            let embed2 = each_array_1[idx];
            $$renderer3.push(`<div class="my-2 w-full"${attr("id", `${message.id}-embeds-${idx}`)}>`);
            FullHeightIframe($$renderer3, {
              src: embed2,
              allowScripts: true,
              allowForms: true,
              allowSameOrigin: store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowSameOrigin ?? false,
              allowPopups: true
            });
            $$renderer3.push(`<!----></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div${attr_class(`w-full flex flex-col relative ${stringify("")}`)} id="response-content-container">`);
        if (message.content === "" && !message.done && !message.error && !hasVisibleStatus) {
          $$renderer3.push("<!--[0-->");
          Skeleton($$renderer3, {});
        } else if (message.content && message.error !== true) {
          $$renderer3.push("<!--[1-->");
          ContentRenderer($$renderer3, {
            id: `${chatId2}-${message.id}`,
            messageId: message.id,
            history,
            selectedModels,
            content: message.content,
            sources: message.sources,
            floatingButtons: message?.done && !readOnly && (store_get($$store_subs ??= {}, "$settings", settings)?.showFloatingActionButtons ?? true),
            save: !readOnly,
            preview: !readOnly,
            editCodeBlock,
            topPadding,
            done: store_get($$store_subs ??= {}, "$settings", settings)?.chatFadeStreamingText ?? true ? message?.done ?? false : true,
            model,
            onTaskClick: async (e) => {
              /* @__PURE__ */ console.log(e);
            },
            onSourceClick: async (id) => {
              /* @__PURE__ */ console.log(id);
            },
            onAddMessages: ({ modelId, parentId, messages }) => {
              addMessages({ modelId, parentId, messages });
            },
            onSave: ({ raw, oldContent, newContent }) => {
              history.messages[message.id].content = history.messages[message.id].content.replace(raw, raw.replace(oldContent, newContent));
              updateChat();
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message?.error) {
          $$renderer3.push("<!--[0-->");
          Error($$renderer3, { content: message?.error?.content ?? message.content });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if ((message?.sources || message?.citations) && (model?.info?.meta?.capabilities?.citations ?? true)) {
          $$renderer3.push("<!--[0-->");
          Citations($$renderer3, {
            id: message?.id,
            chatId: chatId2,
            sources: message?.sources ?? message?.citations,
            readOnly
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message.code_executions) {
          $$renderer3.push("<!--[0-->");
          CodeExecutions($$renderer3, { codeExecutions: message.code_executions });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div></div> `);
        {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex justify-start overflow-x-auto buttons text-gray-600 dark:text-gray-500 mt-0.5 svelte-1qscqw6">`);
          if (message.done || siblings.length > 1) {
            $$renderer3.push("<!--[0-->");
            if (siblings.length > 1) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="flex self-center min-w-fit" dir="ltr"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Previous message"))} class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> `);
              {
                $$renderer3.push("<!--[-1-->");
                $$renderer3.push(`<div class="text-sm tracking-widest font-semibold self-center dark:text-gray-100 min-w-fit">${escape_html(siblings.indexOf(message.id) + 1)}/${escape_html(siblings.length)}</div>`);
              }
              $$renderer3.push(`<!--]--> <button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Next message"))}><svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (message.done) {
              $$renderer3.push("<!--[0-->");
              if (!readOnly) {
                $$renderer3.push("<!--[0-->");
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "user" ? store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.edit ?? true : true) {
                  $$renderer3.push("<!--[0-->");
                  Tooltip($$renderer3, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"),
                    placement: "bottom",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" aria-hidden="true" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]-->`);
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]--> `);
              Tooltip($$renderer3, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"),
                placement: "bottom",
                children: ($$renderer4) => {
                  $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"))}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition copy-response-button`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"></path></svg></button>`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!----> `);
              if (!readOnly && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.tts ?? true))) {
                $$renderer3.push("<!--[0-->");
                Tooltip($$renderer3, {
                  content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Read Aloud"),
                  placement: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Read Aloud"))}${attr("id", `speak-button-${stringify(message.id)}`)}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}>`);
                    {
                      $$renderer4.push("<!--[-1-->");
                      $$renderer4.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"></path></svg>`);
                    }
                    $$renderer4.push(`<!--]--></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (message.usage) {
                $$renderer3.push("<!--[0-->");
                Tooltip($$renderer3, {
                  content: message.usage ? `<pre>${sanitizeResponseContent(JSON.stringify(message.usage, null, 2).replace(/"([^(")"]+)":/g, "$1:").slice(1, -1).split("\n").map((line) => line.slice(2)).map((line) => line.endsWith(",") ? line.slice(0, -1) : line).join("\n"))}</pre>` : "",
                  placement: "bottom",
                  children: ($$renderer4) => {
                    $$renderer4.push(`<button aria-hidden="true"${attr_class(` ${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition whitespace-pre-wrap`)}${attr("id", `info-${stringify(message.id)}`)}><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"></path></svg></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]--> `);
              if (!readOnly) {
                $$renderer3.push("<!--[0-->");
                if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && (store_get($$store_subs ??= {}, "$config", config)?.features.enable_message_rating ?? true) && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.rate_response ?? true))) {
                  $$renderer3.push("<!--[0-->");
                  Tooltip($$renderer3, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Good Response"),
                    placement: "bottom",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Good Response"))}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg ${stringify((message?.annotation?.rating ?? "").toString() === "1" ? "bg-gray-100 dark:bg-gray-800" : "")} dark:hover:text-white hover:text-black transition disabled:cursor-progress disabled:hover:bg-transparent`)}${attr("disabled", feedbackLoading, true)}><svg aria-hidden="true" stroke="currentColor" fill="none" stroke-width="2.3" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer3.push(`<!----> `);
                  Tooltip($$renderer3, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Bad Response"),
                    placement: "bottom",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Bad Response"))}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg ${stringify((message?.annotation?.rating ?? "").toString() === "-1" ? "bg-gray-100 dark:bg-gray-800" : "")} dark:hover:text-white hover:text-black transition disabled:cursor-progress disabled:hover:bg-transparent`)}${attr("disabled", feedbackLoading, true)}><svg aria-hidden="true" stroke="currentColor" fill="none" stroke-width="2.3" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer3.push(`<!---->`);
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (isLastMessage && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.continue_response ?? true))) {
                  $$renderer3.push("<!--[0-->");
                  Tooltip($$renderer3, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Continue Response"),
                    placement: "bottom",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Continue Response"))} type="button" id="continue-response-button"${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.regenerate_response ?? true)) {
                  $$renderer3.push("<!--[0-->");
                  if (store_get($$store_subs ??= {}, "$settings", settings)?.regenerateMenu ?? true) {
                    $$renderer3.push("<!--[0-->");
                    $$renderer3.push(`<button type="button" class="hidden regenerate-response-button"></button> `);
                    RegenerateMenu($$renderer3, {
                      onRegenerate: (prompt = null) => {
                        showRateComment = false;
                        regenerateResponse(message, prompt);
                        (model?.actions ?? []).forEach((action) => {
                          dispatch("action", {
                            id: action.id,
                            event: { id: "regenerate-response", data: { messageId: message.id } }
                          });
                        });
                      },
                      children: ($$renderer4) => {
                        Tooltip($$renderer4, {
                          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Regenerate"),
                          placement: "bottom",
                          children: ($$renderer5) => {
                            $$renderer5.push(`<div${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Regenerate"))}${attr_class(`${stringify(isLastMessage ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" aria-hidden="true" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg></div>`);
                          },
                          $$slots: { default: true }
                        });
                      },
                      $$slots: { default: true }
                    });
                    $$renderer3.push(`<!---->`);
                  } else {
                    $$renderer3.push("<!--[-1-->");
                    Tooltip($$renderer3, {
                      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Regenerate"),
                      placement: "bottom",
                      children: ($$renderer4) => {
                        $$renderer4.push(`<button type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Regenerate"))}${attr_class(`${stringify(isLastMessage ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition regenerate-response-button`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" aria-hidden="true" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg></button>`);
                      },
                      $$slots: { default: true }
                    });
                  }
                  $$renderer3.push(`<!--]-->`);
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]--> `);
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.delete_message ?? true)) {
                  $$renderer3.push("<!--[0-->");
                  if (siblings.length > 1) {
                    $$renderer3.push("<!--[0-->");
                    Tooltip($$renderer3, {
                      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
                      placement: "bottom",
                      children: ($$renderer4) => {
                        $$renderer4.push(`<button type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))} id="delete-response-button"${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg></button>`);
                      },
                      $$slots: { default: true }
                    });
                  } else {
                    $$renderer3.push("<!--[-1-->");
                  }
                  $$renderer3.push(`<!--]-->`);
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]--> <!--[-->`);
                const each_array_2 = ensure_array_like(model?.actions ?? []);
                for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
                  let action = each_array_2[$$index_2];
                  Tooltip($$renderer3, {
                    content: action.name,
                    placement: "bottom",
                    children: ($$renderer4) => {
                      $$renderer4.push(`<button type="button"${attr("aria-label", action.name)}${attr_class(`${stringify(isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false) ? "visible" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}>`);
                      if (action?.icon) {
                        $$renderer4.push("<!--[0-->");
                        $$renderer4.push(`<div class="size-4"><img${attr("src", action.icon)}${attr_class(`w-4 h-4 ${stringify(action.icon.includes("data:image/svg") ? "dark:invert-[80%]" : "")}`)} style="fill: currentColor;"${attr("alt", action.name)}/></div>`);
                      } else {
                        $$renderer4.push("<!--[-1-->");
                        Sparkles($$renderer4, { strokeWidth: "2.1", className: "size-4" });
                      }
                      $$renderer4.push(`<!--]--></button>`);
                    },
                    $$slots: { default: true }
                  });
                }
                $$renderer3.push(`<!--]-->`);
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]-->`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> `);
          if (message.done && showRateComment) {
            $$renderer3.push("<!--[0-->");
            RateComment($$renderer3, {
              get message() {
                return message;
              },
              set message($$value) {
                message = $$value;
                $$settled = false;
              },
              get show() {
                return showRateComment;
              },
              set show($$value) {
                showRateComment = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          if ((isLastMessage || (store_get($$store_subs ??= {}, "$settings", settings)?.keepFollowUpPrompts ?? false)) && message.done && !readOnly && (message?.followUps ?? []).length > 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="mt-2.5">`);
            FollowUps($$renderer3, {
              followUps: message?.followUps,
              onClick: (prompt) => {
                if (store_get($$store_subs ??= {}, "$settings", settings)?.insertFollowUpPrompt ?? false) {
                  setInputText(prompt);
                } else {
                  submitMessage(message?.id, prompt);
                }
              }
            });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div></div></div>`);
      }
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      chatId: chatId2,
      history,
      messageId,
      selectedModels,
      siblings,
      setInputText,
      gotoMessage,
      showPreviousMessage,
      showNextMessage,
      updateChat,
      editMessage,
      saveMessage,
      rateMessage,
      actionMessage,
      deleteMessage,
      submitMessage,
      continueResponse,
      regenerateResponse,
      addMessages,
      isLastMessage,
      readOnly,
      editCodeBlock,
      topPadding
    });
  });
}
function MultiResponseMessages($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    dayjs.extend(localizedFormat);
    let chatId2 = $$props["chatId"];
    let history = $$props["history"];
    let messageId = $$props["messageId"];
    let selectedModels = fallback($$props["selectedModels"], () => [], true);
    let isLastMessage = $$props["isLastMessage"];
    let readOnly = fallback($$props["readOnly"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let setInputText = fallback($$props["setInputText"], () => {
    });
    let updateChat = $$props["updateChat"];
    let editMessage = $$props["editMessage"];
    let saveMessage = $$props["saveMessage"];
    let rateMessage = $$props["rateMessage"];
    let actionMessage = $$props["actionMessage"];
    let submitMessage = $$props["submitMessage"];
    let deleteMessage = $$props["deleteMessage"];
    let continueResponse = $$props["continueResponse"];
    let regenerateResponse = $$props["regenerateResponse"];
    let mergeResponses = $$props["mergeResponses"];
    let addMessages = $$props["addMessages"];
    let triggerScroll = $$props["triggerScroll"];
    let topPadding = fallback($$props["topPadding"], false);
    let message = structuredClone(history.messages[messageId]);
    if (history.messages) {
      const source = history.messages[messageId];
      if (source) {
        if (message.content !== source.content || message.done !== source.done) {
          message = structuredClone(source);
        } else if (JSON.stringify(message) !== JSON.stringify(source)) {
          message = structuredClone(source);
        }
      }
    }
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      chatId: chatId2,
      history,
      messageId,
      selectedModels,
      isLastMessage,
      readOnly,
      editCodeBlock,
      setInputText,
      updateChat,
      editMessage,
      saveMessage,
      rateMessage,
      actionMessage,
      submitMessage,
      deleteMessage,
      continueResponse,
      regenerateResponse,
      mergeResponses,
      addMessages,
      triggerScroll,
      topPadding
    });
  });
}
function UserMessage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(localizedFormat);
    let user$1 = $$props["user"];
    let chatId2 = $$props["chatId"];
    let history = $$props["history"];
    let messageId = $$props["messageId"];
    let siblings = $$props["siblings"];
    let gotoMessage = $$props["gotoMessage"];
    let showPreviousMessage = $$props["showPreviousMessage"];
    let showNextMessage = $$props["showNextMessage"];
    let editMessage = $$props["editMessage"];
    let deleteMessage = $$props["deleteMessage"];
    let isFirstMessage = $$props["isFirstMessage"];
    let readOnly = $$props["readOnly"];
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let showDeleteConfirm = false;
    let message = structuredClone(history.messages[messageId]);
    if (history.messages) {
      const source = history.messages[messageId];
      if (source) {
        if (message.content !== source.content) {
          message = structuredClone(source);
        } else if (JSON.stringify(message) !== JSON.stringify(source)) {
          message = structuredClone(source);
        }
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete message?"),
        get show() {
          return showDeleteConfirm;
        },
        set show($$value) {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex w-full user-message group"${attr("dir", store_get($$store_subs ??= {}, "$settings", settings).chatDirection)}${attr("id", `message-${stringify(message.id)}`)} style="scroll-margin-top: 3rem;">`);
      if (!(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div${attr_class(`shrink-0 ltr:mr-3 rtl:ml-3 mt-1`)}>`);
        ProfileImage($$renderer3, {
          src: user$1?.id ? `${WEBUI_API_BASE_URL}/users/${user$1.id}/profile/image` : `${WEBUI_BASE_URL}/static/favicon.png`,
          className: "size-8 user-message-profile-image"
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="flex-auto w-0 max-w-full pl-1">`);
      if (!(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div>`);
        Name($$renderer3, {
          children: ($$renderer4) => {
            if (message.user) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("You"))} <span class="text-gray-500 text-sm font-medium">${escape_html(message?.user ?? "")}</span>`);
            } else if (store_get($$store_subs ??= {}, "$settings", settings).showUsername || store_get($$store_subs ??= {}, "$_user", user)?.name !== user$1?.name) {
              $$renderer4.push("<!--[1-->");
              $$renderer4.push(`${escape_html(user$1?.name ?? store_get($$store_subs ??= {}, "$i18n", i18n).t("You"))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("You"))}`);
            }
            $$renderer4.push(`<!--]--> `);
            if (message.timestamp) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div${attr_class(`self-center text-xs font-medium first-letter:capitalize ml-0.5 translate-y-[1px] ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:text-gray-900 text-gray-100" : "invisible group-hover:visible transition")}`)}>`);
              Tooltip($$renderer4, {
                content: dayjs(message.timestamp * 1e3).format("LLLL"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<span class="line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(formatDate(message.timestamp * 1e3), {
                    LOCALIZED_TIME: dayjs(message.timestamp * 1e3).format("LT"),
                    LOCALIZED_DATE: dayjs(message.timestamp * 1e3).format("L")
                  }))}</span>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      } else if (message.timestamp) {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="flex justify-end pr-2 text-xs"><div${attr_class(`text-[0.65rem] font-medium first-letter:capitalize mb-0.5 ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:text-gray-100 text-gray-900" : "invisible group-hover:visible transition text-gray-400")}`)}>`);
        Tooltip($$renderer3, {
          content: dayjs(message.timestamp * 1e3).format("LLLL"),
          children: ($$renderer4) => {
            $$renderer4.push(`<span class="line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(formatDate(message.timestamp * 1e3), {
              LOCALIZED_TIME: dayjs(message.timestamp * 1e3).format("LT"),
              LOCALIZED_DATE: dayjs(message.timestamp * 1e3).format("L")
            }))}</span>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div${attr_class(`chat-${stringify(message.role)} w-full min-w-full markdown-prose`)}>`);
      {
        $$renderer3.push("<!--[0-->");
        if (message.files) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="mb-1 w-full flex flex-col justify-end overflow-x-auto gap-1 flex-wrap"${attr("dir", store_get($$store_subs ??= {}, "$settings", settings)?.chatDirection ?? "auto")}><!--[-->`);
          const each_array = ensure_array_like(message.files);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let file = each_array[$$index];
            const fileUrl = file.url?.startsWith("data") || file.url?.startsWith("http") ? file.url : `${WEBUI_API_BASE_URL}/files/${file.url}${file?.content_type ? "/content" : ""}`;
            $$renderer3.push(`<div${attr_class(clsx(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true ? "self-end" : ""))}>`);
            if (file.type === "image" || (file?.content_type ?? "").startsWith("image/")) {
              $$renderer3.push("<!--[0-->");
              Image($$renderer3, { src: fileUrl, imageClassName: " max-h-96 rounded-lg" });
            } else {
              $$renderer3.push("<!--[-1-->");
              FileItem($$renderer3, {
                item: file,
                url: file.url,
                name: file.name,
                type: file.type,
                size: file?.size,
                small: true
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--> `);
      if (message.content !== "") {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="w-full"><div${attr_class(`flex ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true ? "justify-end pb-1" : "w-full")}`)}><div${attr_class(`rounded-3xl ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true ? `max-w-[90%] px-4 py-1.5  bg-gray-50 dark:bg-gray-850 ${message.files ? "rounded-tr-lg" : ""}` : " w-full")}`)}>`);
        if (message.content) {
          $$renderer3.push("<!--[0-->");
          Markdown($$renderer3, {
            id: `${chatId2}-${message.id}`,
            content: message.content,
            editCodeBlock,
            topPadding
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div${attr_class(` flex ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true ? "justify-end" : "")} text-gray-600 dark:text-gray-500`)}>`);
        if (!(store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true)) {
          $$renderer3.push("<!--[0-->");
          if (siblings.length > 1) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="flex self-center" dir="ltr"><button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> `);
            {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<div class="text-sm tracking-widest font-semibold self-center dark:text-gray-100 min-w-fit">${escape_html(siblings.indexOf(message.id) + 1)}/${escape_html(siblings.length)}</div>`);
            }
            $$renderer3.push(`<!--]--> <button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (!readOnly) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"),
            placement: "bottom",
            children: ($$renderer4) => {
              $$renderer4.push(`<button${attr_class(`${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition edit-user-message-button`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message?.content) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"),
            placement: "bottom",
            children: ($$renderer4) => {
              $$renderer4.push(`<button${attr_class(`${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "invisible group-hover:visible")} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.3" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$_user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$_user", user)?.permissions?.chat?.delete_message ?? false)) {
          $$renderer3.push("<!--[0-->");
          if (!readOnly && (!isFirstMessage || siblings.length > 1)) {
            $$renderer3.push("<!--[0-->");
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
              placement: "bottom",
              children: ($$renderer4) => {
                $$renderer4.push(`<button${attr_class(`${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "invisible group-hover:visible")} p-1 rounded-sm dark:hover:text-white hover:text-black transition`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg></button>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$settings", settings)?.chatBubble ?? true) {
          $$renderer3.push("<!--[0-->");
          if (siblings.length > 1) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="flex self-center" dir="ltr"><button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> `);
            {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<div class="text-sm tracking-widest font-semibold self-center dark:text-gray-100 min-w-fit">${escape_html(siblings.indexOf(message.id) + 1)}/${escape_html(siblings.length)}</div>`);
            }
            $$renderer3.push(`<!--]--> <button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      user: user$1,
      chatId: chatId2,
      history,
      messageId,
      siblings,
      gotoMessage,
      showPreviousMessage,
      showNextMessage,
      editMessage,
      deleteMessage,
      isFirstMessage,
      readOnly,
      editCodeBlock,
      topPadding
    });
  });
}
function Message($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    let chatId2 = $$props["chatId"];
    let selectedModels = fallback($$props["selectedModels"], () => [], true);
    let idx = fallback($$props["idx"], 0);
    let history = $$props["history"];
    let messageId = $$props["messageId"];
    let user2 = $$props["user"];
    let setInputText = fallback($$props["setInputText"], () => {
    });
    let gotoMessage = $$props["gotoMessage"];
    let showPreviousMessage = $$props["showPreviousMessage"];
    let showNextMessage = $$props["showNextMessage"];
    let updateChat = $$props["updateChat"];
    let editMessage = $$props["editMessage"];
    let saveMessage = $$props["saveMessage"];
    let deleteMessage = $$props["deleteMessage"];
    let rateMessage = $$props["rateMessage"];
    let actionMessage = $$props["actionMessage"];
    let submitMessage = $$props["submitMessage"];
    let regenerateResponse = $$props["regenerateResponse"];
    let continueResponse = $$props["continueResponse"];
    let mergeResponses = $$props["mergeResponses"];
    let addMessages = $$props["addMessages"];
    let triggerScroll = $$props["triggerScroll"];
    let readOnly = fallback($$props["readOnly"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div role="listitem"${attr_class(`flex flex-col justify-between px-5 mb-3 w-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.widescreenMode ?? null ? "max-w-full" : "max-w-5xl")} mx-auto rounded-lg group`)}>`);
      if (history.messages[messageId]) {
        $$renderer3.push("<!--[0-->");
        if (history.messages[messageId].role === "user") {
          $$renderer3.push("<!--[0-->");
          UserMessage($$renderer3, {
            user: user2,
            chatId: chatId2,
            history,
            messageId,
            isFirstMessage: idx === 0,
            siblings: history.messages[messageId].parentId !== null ? history.messages[history.messages[messageId].parentId]?.childrenIds ?? [] : Object.values(history.messages).filter((message) => message.parentId === null).map((message) => message.id) ?? [],
            gotoMessage,
            showPreviousMessage,
            showNextMessage,
            editMessage,
            deleteMessage,
            readOnly,
            editCodeBlock,
            topPadding
          });
        } else if ((history.messages[history.messages[messageId].parentId]?.models?.length ?? 1) === 1) {
          $$renderer3.push("<!--[1-->");
          ResponseMessage($$renderer3, {
            chatId: chatId2,
            history,
            messageId,
            selectedModels,
            isLastMessage: messageId === history.currentId,
            siblings: history.messages[history.messages[messageId].parentId]?.childrenIds ?? [],
            setInputText,
            gotoMessage,
            showPreviousMessage,
            showNextMessage,
            updateChat,
            editMessage,
            saveMessage,
            rateMessage,
            actionMessage,
            submitMessage,
            deleteMessage,
            continueResponse,
            regenerateResponse,
            addMessages,
            readOnly,
            editCodeBlock,
            topPadding
          });
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<!---->`);
          {
            MultiResponseMessages($$renderer3, {
              chatId: chatId2,
              messageId,
              selectedModels,
              isLastMessage: messageId === history?.currentId,
              setInputText,
              updateChat,
              editMessage,
              saveMessage,
              rateMessage,
              actionMessage,
              submitMessage,
              deleteMessage,
              continueResponse,
              regenerateResponse,
              mergeResponses,
              triggerScroll,
              addMessages,
              readOnly,
              editCodeBlock,
              topPadding,
              get history() {
                return history;
              },
              set history($$value) {
                history = $$value;
                $$settled = false;
              }
            });
          }
          $$renderer3.push(`<!---->`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      chatId: chatId2,
      selectedModels,
      idx,
      history,
      messageId,
      user: user2,
      setInputText,
      gotoMessage,
      showPreviousMessage,
      showNextMessage,
      updateChat,
      editMessage,
      saveMessage,
      deleteMessage,
      rateMessage,
      actionMessage,
      submitMessage,
      regenerateResponse,
      continueResponse,
      mergeResponses,
      addMessages,
      triggerScroll,
      readOnly,
      editCodeBlock,
      topPadding
    });
  });
}
function Suggestions($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let suggestionPrompts = fallback($$props["suggestionPrompts"], () => [], true);
    let className = fallback($$props["className"], "");
    let inputValue = fallback($$props["inputValue"], "");
    let onSelect = fallback($$props["onSelect"], (e) => {
    });
    let sortedPrompts = [];
    const fuseOptions = { keys: ["content", "title"], threshold: 0.5 };
    let fuse;
    let filteredPrompts = [];
    function arraysEqual(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if ((a[i].id ?? a[i].content) !== (b[i].id ?? b[i].content)) {
          return false;
        }
      }
      return true;
    }
    const getFilteredPrompts = (inputValue2) => {
      if (inputValue2.length > 500) {
        filteredPrompts = [];
      } else {
        const newFilteredPrompts = inputValue2.trim() && fuse ? fuse.search(inputValue2.trim()).map((result) => result.item) : sortedPrompts;
        if (!arraysEqual(filteredPrompts, newFilteredPrompts)) {
          filteredPrompts = newFilteredPrompts;
        }
      }
    };
    if (suggestionPrompts) {
      sortedPrompts = [...suggestionPrompts ?? []].sort(() => Math.random() - 0.5);
      getFilteredPrompts(inputValue);
    }
    fuse = new Fuse(sortedPrompts, fuseOptions);
    getFilteredPrompts(inputValue);
    $$renderer2.push(`<div class="mb-1 flex gap-1 text-xs font-medium items-center text-gray-600 dark:text-gray-400 svelte-6tnq1o">`);
    if (filteredPrompts.length > 0) {
      $$renderer2.push("<!--[0-->");
      Bolt($$renderer2, {});
      $$renderer2.push(`<!----> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Suggested"))}`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div${attr_class(`flex w-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.landingPageMode === "chat" ? " -mt-1" : "text-center items-center justify-center")} self-start text-gray-600 dark:text-gray-400`, "svelte-6tnq1o")}>${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))} ‧ v${escape_html(WEBUI_VERSION)}</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="h-40 w-full svelte-6tnq1o">`);
    if (filteredPrompts.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div role="list"${attr_class(`max-h-40 overflow-auto scrollbar-none items-start ${stringify(className)}`, "svelte-6tnq1o")}><!--[-->`);
      const each_array = ensure_array_like(filteredPrompts);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let prompt = each_array[idx];
        $$renderer2.push(`<button role="listitem" class="waterfall flex flex-col flex-1 shrink-0 w-full justify-between px-3 py-2 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition group svelte-6tnq1o"${attr_style(`animation-delay: ${stringify(idx * 60)}ms`)}><div class="flex flex-col text-left svelte-6tnq1o">`);
        if (prompt.title && prompt.title[0] !== "") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1 svelte-6tnq1o">${escape_html(prompt.title[0])}</div> <div class="text-xs text-gray-600 dark:text-gray-400 font-normal line-clamp-1 svelte-6tnq1o">${escape_html(prompt.title[1])}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1 svelte-6tnq1o">${escape_html(prompt.content)}</div> <div class="text-xs text-gray-600 dark:text-gray-400 font-normal line-clamp-1 svelte-6tnq1o">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt"))}</div>`);
        }
        $$renderer2.push(`<!--]--></div></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { suggestionPrompts, className, inputValue, onSelect });
  });
}
function ChatPlaceholder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let modelIds = fallback($$props["modelIds"], () => [], true);
    let models$1 = fallback($$props["models"], () => [], true);
    let atSelectedModel = $$props["atSelectedModel"];
    let onSelect = fallback($$props["onSelect"], (e) => {
    });
    let selectedModelIdx = 0;
    models$1 = modelIds.map((id) => store_get($$store_subs ??= {}, "$_models", models).find((m) => m.id === id));
    if (modelIds.length > 0) {
      selectedModelIdx = models$1.length - 1;
    }
    $$renderer2.push(`<!---->`);
    {
      $$renderer2.push(`<div class="m-auto w-full max-w-6xl px-8 lg:px-20"><div class="flex justify-start"><div class="flex -space-x-4 mb-0.5"><!--[-->`);
      const each_array = ensure_array_like(models$1);
      for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
        let model = each_array[modelIdx];
        $$renderer2.push(`<button>`);
        Tooltip($$renderer2, {
          content: marked.parse(sanitizeResponseContent(models$1[selectedModelIdx]?.info?.meta?.description ?? "").replaceAll("\n", "<br>")),
          placement: "right",
          children: ($$renderer3) => {
            $$renderer3.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model?.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`)} class="size-[2.7rem] rounded-full border-[1px] border-gray-100 dark:border-none" alt="logo" draggable="false"/>`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></button>`);
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        $$renderer2.push("<!--[0-->");
        Tooltip($$renderer2, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This chat won't appear in history and your messages will not be saved."),
          className: "w-full flex justify-start mb-0.5",
          placement: "top",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-center gap-2 text-gray-500 text-lg mt-2 w-fit">`);
            EyeSlash($$renderer3, { strokeWidth: "2.5", className: "size-5" });
            $$renderer3.push(`<!---->${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Temporary Chat"))}</div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mt-2 mb-4 text-3xl text-gray-800 dark:text-gray-100 text-left flex items-center gap-4 font-primary"><div><div class="capitalize line-clamp-1">`);
      if (models$1[selectedModelIdx]?.name) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(models$1[selectedModelIdx]?.name)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hello, {{name}}", { name: store_get($$store_subs ??= {}, "$user", user)?.name }))}`);
      }
      $$renderer2.push(`<!--]--></div> <div>`);
      if (models$1[selectedModelIdx]?.info?.meta?.description ?? null) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mt-0.5 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-3 markdown">${html(marked.parse(sanitizeResponseContent(models$1[selectedModelIdx]?.info?.meta?.description).replaceAll("\n", "<br>")))}</div> `);
        if (models$1[selectedModelIdx]?.info?.meta?.user) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="mt-0.5 text-sm font-normal text-gray-400 dark:text-gray-500">By `);
          if (models$1[selectedModelIdx]?.info?.meta?.user.community) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<a${attr("href", `https://openwebui.com/m/${stringify(models$1[selectedModelIdx]?.info?.meta?.user.username)}`)}>${escape_html(models$1[selectedModelIdx]?.info?.meta?.user.name ? models$1[selectedModelIdx]?.info?.meta?.user.name : `@${models$1[selectedModelIdx]?.info?.meta?.user.username}`)}</a>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`${escape_html(models$1[selectedModelIdx]?.info?.meta?.user.name)}`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="text-gray-400 dark:text-gray-500 line-clamp-1 font-p">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("How can I help you today?"))}</div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div> <div class="w-full font-primary">`);
      Suggestions($$renderer2, {
        className: "grid grid-cols-2",
        suggestionPrompts: atSelectedModel?.info?.meta?.suggestion_prompts ?? models$1[selectedModelIdx]?.info?.meta?.suggestion_prompts ?? store_get($$store_subs ??= {}, "$config", config)?.default_prompt_suggestions ?? [],
        onSelect
      });
      $$renderer2.push(`<!----></div></div>`);
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { modelIds, models: models$1, atSelectedModel, onSelect });
  });
}
function Messages($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let className = fallback($$props["className"], "h-full flex pt-8");
    let chatId2 = fallback($$props["chatId"], "");
    let user$1 = fallback($$props["user"], () => store_get($$store_subs ??= {}, "$_user", user), true);
    let prompt = $$props["prompt"];
    let history = fallback($$props["history"], () => ({}), true);
    let selectedModels = $$props["selectedModels"];
    let atSelectedModel = $$props["atSelectedModel"];
    let messages = [];
    let setInputText = fallback($$props["setInputText"], () => {
    });
    let sendMessage = $$props["sendMessage"];
    let continueResponse = $$props["continueResponse"];
    let regenerateResponse = $$props["regenerateResponse"];
    let mergeResponses = $$props["mergeResponses"];
    let chatActionHandler = $$props["chatActionHandler"];
    let showMessage = fallback($$props["showMessage"], () => {
    });
    let submitMessage = fallback($$props["submitMessage"], () => {
    });
    let addMessages = fallback($$props["addMessages"], () => {
    });
    let readOnly = fallback($$props["readOnly"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let bottomPadding = fallback($$props["bottomPadding"], false);
    let autoScroll = $$props["autoScroll"];
    let onSelect = fallback($$props["onSelect"], (e) => {
    });
    let messagesCount = fallback($$props["messagesCount"], 20);
    let pendingRebuild = null;
    let lastCurrentId = null;
    const buildMessages = () => {
      let _messages = [];
      let message = history.messages[history.currentId];
      const visitedMessageIds = /* @__PURE__ */ new Set();
      while (message && (messagesCount !== null ? _messages.length <= messagesCount : true)) {
        if (visitedMessageIds.has(message.id)) {
          console.warn("Circular dependency detected in message history", message.id);
          break;
        }
        visitedMessageIds.add(message.id);
        _messages.push(message);
        message = message.parentId !== null ? history.messages[message.parentId] : null;
      }
      messages = _messages.reverse();
    };
    const handleHistoryChange = (currentId, _messages) => {
      if (!currentId) {
        messages = [];
        return;
      }
      const currentIdChanged = currentId !== lastCurrentId;
      lastCurrentId = currentId;
      if (currentIdChanged) {
        cancelAnimationFrame(pendingRebuild);
        pendingRebuild = null;
        buildMessages();
      } else if (_messages) {
        if (!pendingRebuild) {
          pendingRebuild = requestAnimationFrame(() => {
            pendingRebuild = null;
            buildMessages();
          });
        }
      }
    };
    const scrollToBottom = () => {
      const element = document.getElementById("messages-container");
      element.scrollTop = element.scrollHeight;
    };
    const updateChat = async () => {
      if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        history = history;
        await tick();
        await updateChatById(localStorage.token, chatId2, { history, messages });
        currentChatPage.set(1);
        await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
      }
    };
    const gotoMessage = async (message, idx) => {
      let siblings;
      if (message.parentId !== null) {
        siblings = history.messages[message.parentId].childrenIds;
      } else {
        siblings = Object.values(history.messages).filter((msg) => msg.parentId === null).map((msg) => msg.id);
      }
      idx = Math.max(0, Math.min(idx, siblings.length - 1));
      let messageId = siblings[idx];
      if (message.id !== messageId) {
        let messageChildrenIds = history.messages[messageId].childrenIds;
        while (messageChildrenIds.length !== 0) {
          messageId = messageChildrenIds.at(-1);
          messageChildrenIds = history.messages[messageId].childrenIds;
        }
        history.currentId = messageId;
      }
      await tick();
      if (store_get($$store_subs ??= {}, "$settings", settings)?.scrollOnBranchChange ?? true) {
        const element = document.getElementById("messages-container");
        autoScroll = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        setTimeout(
          () => {
            scrollToBottom();
          },
          100
        );
      }
    };
    const showPreviousMessage = async (message) => {
      if (message.parentId !== null) {
        let messageId = history.messages[message.parentId].childrenIds[Math.max(history.messages[message.parentId].childrenIds.indexOf(message.id) - 1, 0)];
        if (message.id !== messageId) {
          let messageChildrenIds = history.messages[messageId].childrenIds;
          while (messageChildrenIds.length !== 0) {
            messageId = messageChildrenIds.at(-1);
            messageChildrenIds = history.messages[messageId].childrenIds;
          }
          history.currentId = messageId;
        }
      } else {
        let childrenIds = Object.values(history.messages).filter((message2) => message2.parentId === null).map((message2) => message2.id);
        let messageId = childrenIds[Math.max(childrenIds.indexOf(message.id) - 1, 0)];
        if (message.id !== messageId) {
          let messageChildrenIds = history.messages[messageId].childrenIds;
          while (messageChildrenIds.length !== 0) {
            messageId = messageChildrenIds.at(-1);
            messageChildrenIds = history.messages[messageId].childrenIds;
          }
          history.currentId = messageId;
        }
      }
      await tick();
      if (store_get($$store_subs ??= {}, "$settings", settings)?.scrollOnBranchChange ?? true) {
        const element = document.getElementById("messages-container");
        autoScroll = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        setTimeout(
          () => {
            scrollToBottom();
          },
          100
        );
      }
    };
    const showNextMessage = async (message) => {
      if (message.parentId !== null) {
        let messageId = history.messages[message.parentId].childrenIds[Math.min(history.messages[message.parentId].childrenIds.indexOf(message.id) + 1, history.messages[message.parentId].childrenIds.length - 1)];
        if (message.id !== messageId) {
          let messageChildrenIds = history.messages[messageId].childrenIds;
          while (messageChildrenIds.length !== 0) {
            messageId = messageChildrenIds.at(-1);
            messageChildrenIds = history.messages[messageId].childrenIds;
          }
          history.currentId = messageId;
        }
      } else {
        let childrenIds = Object.values(history.messages).filter((message2) => message2.parentId === null).map((message2) => message2.id);
        let messageId = childrenIds[Math.min(childrenIds.indexOf(message.id) + 1, childrenIds.length - 1)];
        if (message.id !== messageId) {
          let messageChildrenIds = history.messages[messageId].childrenIds;
          while (messageChildrenIds.length !== 0) {
            messageId = messageChildrenIds.at(-1);
            messageChildrenIds = history.messages[messageId].childrenIds;
          }
          history.currentId = messageId;
        }
      }
      await tick();
      if (store_get($$store_subs ??= {}, "$settings", settings)?.scrollOnBranchChange ?? true) {
        const element = document.getElementById("messages-container");
        autoScroll = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        setTimeout(
          () => {
            scrollToBottom();
          },
          100
        );
      }
    };
    const rateMessage = async (messageId, rating) => {
      history.messages[messageId].annotation = { ...history.messages[messageId].annotation, rating };
      await updateChat();
    };
    const editMessage = async (messageId, { content, files }, submit = true) => {
      if ((selectedModels ?? []).filter((id) => id).length === 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model not selected"));
        return;
      }
      if (history.messages[messageId].role === "user") {
        if (submit) {
          let userPrompt = content;
          let userMessageId = v4();
          let userMessage = {
            id: userMessageId,
            parentId: history.messages[messageId].parentId,
            childrenIds: [],
            role: "user",
            content: userPrompt,
            ...files && { files },
            models: selectedModels,
            timestamp: Math.floor(Date.now() / 1e3)
            // Unix epoch
          };
          let messageParentId = history.messages[messageId].parentId;
          if (messageParentId !== null) {
            history.messages[messageParentId].childrenIds = [
              ...history.messages[messageParentId].childrenIds,
              userMessageId
            ];
          }
          history.messages[userMessageId] = userMessage;
          history.currentId = userMessageId;
          await tick();
          await sendMessage(history, userMessageId);
        } else {
          history.messages[messageId].content = content;
          history.messages[messageId].files = files;
          await updateChat();
        }
      } else {
        if (submit) {
          const responseMessageId = v4();
          const message = history.messages[messageId];
          const parentId = message.parentId;
          const responseMessage = {
            ...message,
            id: responseMessageId,
            parentId,
            childrenIds: [],
            files: void 0,
            content,
            timestamp: Math.floor(Date.now() / 1e3)
            // Unix epoch
          };
          history.messages[responseMessageId] = responseMessage;
          history.currentId = responseMessageId;
          if (parentId !== null) {
            history.messages[parentId].childrenIds = [...history.messages[parentId].childrenIds, responseMessageId];
          }
          await updateChat();
        } else {
          history.messages[messageId].originalContent = history.messages[messageId].content;
          history.messages[messageId].content = content;
          await updateChat();
        }
      }
    };
    const actionMessage = async (actionId, message, event = null) => {
      await chatActionHandler(chatId2, actionId, message.model, message.id, event);
    };
    const saveMessage = async (messageId, message) => {
      if (!history.messages?.[messageId]) {
        return;
      }
      history.messages[messageId] = message;
      await updateChat();
    };
    const deleteMessage = async (messageId) => {
      const messageToDelete = history.messages[messageId];
      const parentMessageId = messageToDelete.parentId;
      const childMessageIds = messageToDelete.childrenIds ?? [];
      const grandchildrenIds = childMessageIds.flatMap((childId) => history.messages[childId]?.childrenIds ?? []);
      if (parentMessageId && history.messages[parentMessageId]) {
        history.messages[parentMessageId].childrenIds = [
          ...history.messages[parentMessageId].childrenIds.filter((id) => id !== messageId),
          ...grandchildrenIds
        ];
      }
      grandchildrenIds.forEach((grandchildId) => {
        if (history.messages[grandchildId]) {
          history.messages[grandchildId].parentId = parentMessageId;
        }
      });
      [messageId, ...childMessageIds].forEach((id) => {
        delete history.messages[id];
      });
      showMessage({ id: parentMessageId }, false);
    };
    onDestroy(() => {
      cancelAnimationFrame(pendingRebuild);
    });
    const triggerScroll = () => {
      if (autoScroll) {
        const element = document.getElementById("messages-container");
        autoScroll = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        setTimeout(
          () => {
            scrollToBottom();
          },
          100
        );
      }
    };
    handleHistoryChange(history.currentId, history.messages);
    if (autoScroll && bottomPadding) {
      (async () => {
        await tick();
        scrollToBottom();
      })();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div${attr_class(clsx(className))}>`);
      if (Object.keys(history?.messages ?? {}).length == 0) {
        $$renderer3.push("<!--[0-->");
        ChatPlaceholder($$renderer3, { modelIds: selectedModels, atSelectedModel, onSelect });
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="w-full pt-2"><!---->`);
        {
          $$renderer3.push(`<section class="w-full" aria-labelledby="chat-conversation"><h2 class="sr-only" id="chat-conversation">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat Conversation"))}</h2> `);
          if (messages.at(0)?.parentId !== null) {
            $$renderer3.push("<!--[0-->");
            Loader($$renderer3, {
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
                Spinner($$renderer4, { className: " size-4" });
                $$renderer4.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Loading..."))}</div></div>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <ul role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false"><!--[-->`);
          const each_array = ensure_array_like(messages);
          for (let messageIdx = 0, $$length = each_array.length; messageIdx < $$length; messageIdx++) {
            let message = each_array[messageIdx];
            Message($$renderer3, {
              chatId: chatId2,
              selectedModels,
              messageId: message.id,
              idx: messageIdx,
              user: user$1,
              setInputText,
              gotoMessage,
              showPreviousMessage,
              showNextMessage,
              updateChat,
              editMessage,
              deleteMessage,
              rateMessage,
              actionMessage,
              saveMessage,
              submitMessage,
              regenerateResponse,
              continueResponse,
              mergeResponses,
              addMessages,
              triggerScroll,
              readOnly,
              editCodeBlock,
              topPadding,
              get history() {
                return history;
              },
              set history($$value) {
                history = $$value;
                $$settled = false;
              }
            });
          }
          $$renderer3.push(`<!--]--></ul></section> <div class="pb-18"></div> `);
          if (bottomPadding) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="pb-6"></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      className,
      chatId: chatId2,
      user: user$1,
      prompt,
      history,
      selectedModels,
      atSelectedModel,
      setInputText,
      sendMessage,
      continueResponse,
      regenerateResponse,
      mergeResponses,
      chatActionHandler,
      showMessage,
      submitMessage,
      addMessages,
      readOnly,
      editCodeBlock,
      topPadding,
      bottomPadding,
      autoScroll,
      onSelect,
      messagesCount
    });
  });
}
export {
  Messages as M,
  Suggestions as S
};
//# sourceMappingURL=Messages.js.map
