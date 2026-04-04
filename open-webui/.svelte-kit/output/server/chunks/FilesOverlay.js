import { R as RETRIEVAL_API_BASE_URL } from "./constants.js";
import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, o as getContext, c as store_get, u as unsubscribe_stores, t as stringify, k as escape_html, j as slot } from "./root.js";
import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";
import { gfm } from "@joplin/turndown-plugin-gfm";
import { o as onDestroy, t as tick } from "./index-server.js";
import { DOMParser } from "prosemirror-model";
import { Plugin, PluginKey, Selection, TextSelection } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import { markInputRule, Extension } from "@tiptap/core";
import { l as listDragHandlePlugin } from "./listDragHandlePlugin.js";
import "@tiptap/starter-kit";
import "@tiptap/extension-table";
import "@tiptap/extension-list";
import "@tiptap/extensions";
import "@tiptap/extension-file-handler";
import "@tiptap/extension-typography";
import "@tiptap/extension-highlight";
import Code from "@tiptap/extension-code";
import "@tiptap/extension-code-block-lowlight";
import "@tiptap/extension-mention";
import { T as Tooltip } from "./Tooltip.js";
import { createLowlight } from "lowlight";
import hljs from "highlight.js";
const processYoutubeVideo = async (token, url) => {
  let error = null;
  const res = await fetch(`${RETRIEVAL_API_BASE_URL}/process/youtube`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      url
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
const processWeb = async (token, collection_name, url, process = true) => {
  let error = null;
  const searchParams = new URLSearchParams();
  if (!process) {
    searchParams.append("process", "false");
  }
  const res = await fetch(`${RETRIEVAL_API_BASE_URL}/process/web?${searchParams.toString()}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      url,
      collection_name
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
function Bold($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function CodeBracket($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H1($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H2($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H3($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M20.905 14.626a4.52 4.52 0 0 1 .738 3.603c-.154.695-.794 1.143-1.504 1.208a15.194 15.194 0 0 1-3.639-.104m4.405-4.707a4.52 4.52 0 0 0 .738-3.603c-.154-.696-.794-1.144-1.504-1.209a15.19 15.19 0 0 0-3.639.104m4.405 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Italic($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ListBullet($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function NumberedList($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Strikethrough($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Underline($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function CheckBox($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke-width="1.5"></path><path d="M7 12.5L10 15.5L17 8.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ArrowLeftTag($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M16.75 12H6.75M6.75 12L9.5 14.75M6.75 12L9.5 9.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 15V9C2 6.79086 3.79086 5 6 5H18C20.2091 5 22 6.79086 22 9V15C22 17.2091 20.2091 19 18 19H6C3.79086 19 2 17.2091 2 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ArrowRightTag($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M6.75 12H16.75M16.75 12L14 14.75M16.75 12L14 9.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 15V9C2 6.79086 3.79086 5 6 5H18C20.2091 5 22 6.79086 22 9V15C22 17.2091 20.2091 19 18 19H6C3.79086 19 2 17.2091 2 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function FormattingButtons($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let editor = fallback($$props["editor"], null);
    $$renderer2.push(`<div class="flex gap-0.5 p-0.5 rounded-xl shadow-lg bg-white text-gray-800 dark:text-white dark:bg-gray-850 min-w-fit border border-gray-100 dark:border-gray-800">`);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H1"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 1 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H1($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H2"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 2 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H2($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H3"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 3 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H3($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (editor?.isActive("bulletList") || editor?.isActive("orderedList") || editor?.isActive("taskList")) {
      $$renderer2.push("<!--[0-->");
      Tooltip($$renderer2, {
        placement: "top",
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Lift List"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all" type="button">`);
          ArrowLeftTag($$renderer3, {});
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        placement: "top",
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sink List"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all" type="button">`);
          ArrowRightTag($$renderer3, {});
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Bullet List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("bulletList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        ListBullet($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Ordered List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("orderedList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        NumberedList($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Task List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("taskList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        CheckBox($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Bold"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("bold") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Bold($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Italic"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("italic") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Italic($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Underline"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("underline") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Underline($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Strikethrough"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("strike") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Strikethrough($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Code Block"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("codeBlock") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        CodeBracket($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editor });
  });
}
function RichTextInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    marked.use({
      breaks: true,
      gfm: true,
      renderer: {
        list(body, ordered, start) {
          const isTaskList = body.includes("data-checked=");
          if (isTaskList) {
            return `<ul data-type="taskList">${body}</ul>`;
          }
          const type = ordered ? "ol" : "ul";
          const startatt = ordered && start !== 1 ? ` start="${start}"` : "";
          return `<${type}${startatt}>${body}</${type}>`;
        },
        listitem(text, task, checked) {
          if (task) {
            const checkedAttr = checked ? "true" : "false";
            return `<li data-type="taskItem" data-checked="${checkedAttr}">${text}</li>`;
          }
          return `<li>${text}</li>`;
        }
      }
    });
    const turndownService = new TurndownService({ codeBlockStyle: "fenced", headingStyle: "atx" });
    turndownService.escape = (string) => string;
    turndownService.use(gfm);
    turndownService.addRule("tableHeaders", {
      filter: "th",
      replacement(content, node) {
        return content;
      }
    });
    turndownService.addRule("tables", {
      filter: "table",
      replacement(content, node) {
        const rows = Array.from(node.querySelectorAll("tr"));
        if (rows.length === 0) return content;
        let markdown = "\n";
        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const cellContents = cells.map((cell) => {
            let cellContent = turndownService.turndown(cell.innerHTML).trim();
            cellContent = cellContent.replace(/^\n+|\n+$/g, "");
            return cellContent;
          });
          markdown += "| " + cellContents.join(" | ") + " |\n";
          if (rowIndex === 0) {
            const separator = cells.map(() => "---").join(" | ");
            markdown += "| " + separator + " |\n";
          }
        });
        return markdown + "\n";
      }
    });
    turndownService.addRule("taskListItems", {
      filter: (node) => node.nodeName === "LI" && (node.getAttribute("data-checked") === "true" || node.getAttribute("data-checked") === "false"),
      replacement(content, node) {
        const checked = node.getAttribute("data-checked") === "true";
        content = content.replace(/^\s+/, "");
        return `- [${checked ? "x" : " "}] ${content}
`;
      }
    });
    turndownService.addRule("mentions", {
      filter: (node) => node.nodeName === "SPAN" && node.getAttribute("data-type") === "mention",
      replacement: (_content, node) => {
        const id2 = node.getAttribute("data-id") || "";
        const ch = node.getAttribute("data-mention-suggestion-char") || "@";
        return `<${ch}${id2}>`;
      }
    });
    const i18n = getContext("i18n");
    const backtickInputRegex = /(?<=\s|^)`([^`]+)`(?!`)$/;
    Code.extend({
      addInputRules() {
        return [markInputRule({ find: backtickInputRegex, type: this.type })];
      }
    });
    let oncompositionstart = fallback($$props["oncompositionstart"], (e) => {
    });
    let oncompositionend = fallback($$props["oncompositionend"], (e) => {
    });
    let onChange = fallback($$props["onChange"], (e) => {
    });
    createLowlight(hljs.listLanguages().reduce(
      (obj, lang) => {
        obj[lang] = () => hljs.getLanguage(lang);
        return obj;
      },
      {}
    ));
    let editor = fallback($$props["editor"], null);
    let socket = fallback($$props["socket"], null);
    let user = fallback($$props["user"], null);
    let files = fallback($$props["files"], () => [], true);
    let documentId = fallback($$props["documentId"], "");
    let className = fallback($$props["className"], "input-prose min-h-fit h-full");
    let placeholder = fallback($$props["placeholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Type here..."), true);
    let _placeholder = placeholder;
    const setPlaceholder = () => {
      _placeholder = placeholder;
      if (editor) {
        editor?.view.dispatch(editor.state.tr);
      }
    };
    let richText = fallback($$props["richText"], true);
    let dragHandle = fallback($$props["dragHandle"], false);
    let link = fallback($$props["link"], false);
    let image = fallback($$props["image"], false);
    let fileHandler = fallback($$props["fileHandler"], false);
    let suggestions = fallback($$props["suggestions"], null);
    let onFileDrop = fallback($$props["onFileDrop"], (currentEditor, files2, pos) => {
      files2.forEach((file) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor.chain().insertContentAt(pos, { type: "image", attrs: { src: fileReader.result } }).focus().run();
        };
      });
    });
    let onFilePaste = fallback($$props["onFilePaste"], (currentEditor, files2, htmlContent) => {
      files2.forEach((file) => {
        if (htmlContent) {
          /* @__PURE__ */ console.log(htmlContent);
          return false;
        }
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, { type: "image", attrs: { src: fileReader.result } }).focus().run();
        };
      });
    });
    let onSelectionUpdate = fallback($$props["onSelectionUpdate"], (e) => {
    });
    let id = fallback($$props["id"], "");
    let value = fallback($$props["value"], "");
    let html = fallback($$props["html"], "");
    let json = fallback($$props["json"], false);
    let raw = fallback($$props["raw"], false);
    let editable = fallback($$props["editable"], true);
    let collaboration = fallback($$props["collaboration"], false);
    let showFormattingToolbar = fallback($$props["showFormattingToolbar"], true);
    let preserveBreaks = fallback($$props["preserveBreaks"], false);
    let generateAutoCompletion = fallback($$props["generateAutoCompletion"], async () => null);
    let autocomplete = fallback($$props["autocomplete"], false);
    let messageInput = fallback($$props["messageInput"], false);
    let shiftEnter = fallback($$props["shiftEnter"], false);
    let largeTextAsFile = fallback($$props["largeTextAsFile"], false);
    let insertPromptAsRichText = fallback($$props["insertPromptAsRichText"], false);
    let floatingMenuPlacement = fallback($$props["floatingMenuPlacement"], "bottom-start");
    const getWordAtDocPos = () => {
      if (!editor) return "";
      const { state } = editor.view;
      const pos = state.selection.from;
      const doc = state.doc;
      const resolvedPos = doc.resolve(pos);
      const textBlock = resolvedPos.parent;
      resolvedPos.start();
      const text = textBlock.textContent;
      const offset = resolvedPos.parentOffset;
      let wordStart = offset, wordEnd = offset;
      while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;
      while (wordEnd < text.length && !/\s/.test(text[wordEnd])) wordEnd++;
      const word = text.slice(wordStart, wordEnd);
      return word;
    };
    function getWordBoundsAtPos(doc, pos) {
      const resolvedPos = doc.resolve(pos);
      const textBlock = resolvedPos.parent;
      const paraStart = resolvedPos.start();
      const text = textBlock.textContent;
      const offset = resolvedPos.parentOffset;
      let wordStart = offset, wordEnd = offset;
      while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;
      while (wordEnd < text.length && !/\s/.test(text[wordEnd])) wordEnd++;
      return { start: paraStart + wordStart, end: paraStart + wordEnd };
    }
    const replaceCommandWithText = async (text) => {
      const { state, dispatch } = editor.view;
      const { selection } = state;
      const pos = selection.from;
      const { start, end } = getWordBoundsAtPos(state.doc, pos);
      let tr = state.tr;
      if (insertPromptAsRichText) {
        const htmlContent = DOMPurify.sanitize(marked.parse(text, { breaks: true, gfm: true }).trim());
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        const fragment = DOMParser.fromSchema(state.schema).parse(tempDiv);
        const content = fragment.content;
        let nodesToInsert = [];
        content.forEach((node) => {
          if (node.type.name === "paragraph") {
            nodesToInsert.push(...node.content.content);
          } else {
            nodesToInsert.push(node);
          }
        });
        tr = tr.replaceWith(start, end, nodesToInsert);
        const newPos = start + nodesToInsert.reduce((sum, node) => sum + node.nodeSize, 0);
        tr = tr.setSelection(Selection.near(tr.doc.resolve(newPos)));
      } else {
        if (text.includes("\n")) {
          const lines = text.split("\n");
          const nodes = lines.map(
            (line, index) => index === 0 ? state.schema.text(line ? line : []) : (
              // First line is plain text
              state.schema.nodes.paragraph.create({}, line ? state.schema.text(line) : void 0)
            )
            // Subsequent lines are paragraphs
          );
          tr = tr.replaceWith(start, end, nodes);
          let newSelectionPos;
          let lastPos = start;
          for (let i = 0; i < nodes.length; i++) {
            lastPos += nodes[i].nodeSize;
          }
          newSelectionPos = lastPos;
          tr = tr.setSelection(TextSelection.near(tr.doc.resolve(newSelectionPos)));
        } else {
          tr = tr.replaceWith(
            start,
            end,
            // replace this range
            text !== "" ? state.schema.text(text) : []
          );
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(start + text.length + 1)));
        }
      }
      dispatch(tr);
      await tick();
    };
    const setText = (text) => {
      if (!editor || !editor.view) return;
      text = text.replaceAll("\n\n", "\n");
      if (text === "") {
        editor.commands.clearContent();
      } else {
        const lines = text.split("\n");
        const htmlContent = lines.map((line) => {
          if (!line) return "<p></p>";
          const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const withMentions = escaped.replace(/&lt;([@#$])([\w.\-:/]+)(?:\|([^&]*?))?&gt;/g, (_, ch, id2, label) => {
            const display = label?.length ? label : id2;
            return `<span class="mention" data-type="mention" data-id="${id2}" data-label="${display}" data-mention-suggestion-char="${ch}">${ch}${display}</span>`;
          });
          return `<p>${withMentions}</p>`;
        }).join("");
        editor.commands.setContent(htmlContent);
      }
      selectNextTemplate(editor.view.state, editor.view.dispatch);
      focus();
    };
    const insertContent = (content) => {
      if (!editor || !editor.view) return;
      const { state, view } = editor;
      const { schema, tr } = state;
      const htmlContent = marked.parse(content);
      editor.commands.insertContent(htmlContent);
      focus();
    };
    const textToNodes = (state, text) => {
      if (!text.includes("\n")) return state.schema.text(text);
      const nodes = [];
      text.split("\n").forEach((line, i) => {
        if (i > 0) nodes.push(state.schema.nodes.hardBreak.create());
        if (line) nodes.push(state.schema.text(line));
      });
      return nodes;
    };
    const replaceVariables = (variables) => {
      if (!editor || !editor.view) return;
      const { state, view } = editor;
      const { doc } = state;
      let tr = state.tr;
      const replacements = [];
      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const text = node.text;
          const replacedText = text.replace(/{{\s*([^|}]+)(?:\|[^}]*)?\s*}}/g, (match, varName) => {
            const trimmedVarName = varName.trim();
            return variables.hasOwnProperty(trimmedVarName) ? String(variables[trimmedVarName]) : match;
          });
          if (replacedText !== text) {
            replacements.push({ from: pos, to: pos + text.length, text: replacedText });
          }
        }
      });
      replacements.reverse().forEach(({ from, to, text }) => {
        tr = tr.replaceWith(from, to, text !== "" ? textToNodes(state, text) : []);
      });
      if (replacements.length > 0) {
        view.dispatch(tr);
      }
    };
    const focus = () => {
      if (editor && editor.view) {
        if (editor.isDestroyed) {
          return;
        }
        try {
          editor.view.focus();
          editor.view.dispatch(editor.view.state.tr.scrollIntoView());
        } catch (e) {
          console.warn("Error focusing editor", e);
        }
      }
    };
    function findNextTemplate(doc, from = 0) {
      const patterns = [{ start: "{{", end: "}}" }];
      let result = null;
      doc.nodesBetween(from, doc.content.size, (node, pos) => {
        if (result) return false;
        if (node.isText) {
          const text = node.text;
          let index = Math.max(0, from - pos);
          while (index < text.length) {
            for (const pattern of patterns) {
              if (text.startsWith(pattern.start, index)) {
                const endIndex = text.indexOf(pattern.end, index + pattern.start.length);
                if (endIndex !== -1) {
                  result = { from: pos + index, to: pos + endIndex + pattern.end.length };
                  return false;
                }
              }
            }
            index++;
          }
        }
      });
      return result;
    }
    function selectNextTemplate(state, dispatch) {
      const { doc, selection } = state;
      const from = selection.to;
      let template = findNextTemplate(doc, from);
      if (!template) {
        template = findNextTemplate(doc, 0);
      }
      if (template) {
        if (dispatch) {
          const tr = state.tr.setSelection(TextSelection.create(doc, template.from, template.to));
          dispatch(tr);
          dispatch(
            tr.scrollIntoView().setMeta("preventScroll", true)
            // Prevent default scrolling behavior
          );
        }
        return true;
      }
      return false;
    }
    const setContent = (content) => {
      editor.commands.setContent(content);
    };
    const selectTemplate = () => {
      if (value !== "") {
        setTimeout(
          () => {
            const templateFound = selectNextTemplate(editor.view.state, editor.view.dispatch);
            if (!templateFound) {
              editor.commands.focus("end");
            }
          },
          0
        );
      }
    };
    Extension.create({
      name: "selectionDecoration",
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: new PluginKey("selection"),
            props: {
              decorations: (state) => {
                const { selection } = state;
                const { focused } = this.editor;
                if (focused || selection.empty) {
                  return null;
                }
                return DecorationSet.create(state.doc, [
                  Decoration.inline(selection.from, selection.to, { class: "editor-selection" })
                ]);
              }
            }
          })
        ];
      }
    });
    Extension.create({
      name: "listItemDragHandle",
      addProseMirrorPlugins() {
        return [
          listDragHandlePlugin({
            itemTypeNames: ["listItem", "taskItem"],
            getEditor: () => this.editor
          })
        ];
      }
    });
    onDestroy(() => {
      if (editor) {
        editor.destroy();
      }
    });
    const onValueChange = () => {
      if (!editor) return;
      const jsonValue = editor.getJSON();
      const htmlValue = editor.getHTML();
      let mdValue = turndownService.turndown((preserveBreaks ? htmlValue.replace(/<p><\/p>/g, "<br/>") : htmlValue).replace(/ {2,}/g, (m) => m.replace(/ /g, " "))).replace(/\u00a0/g, " ");
      if (value === "") {
        editor.commands.clearContent();
        selectTemplate();
        return;
      }
      if (json) {
        if (JSON.stringify(value) !== JSON.stringify(jsonValue)) {
          editor.commands.setContent(value);
          selectTemplate();
        }
      } else {
        if (raw) {
          if (value !== htmlValue) {
            editor.commands.setContent(value);
            selectTemplate();
          }
        } else {
          if (value !== mdValue) {
            editor.commands.setContent(preserveBreaks ? value : marked.parse(value.replaceAll(`
<br/>`, `<br/>`), { breaks: false }));
            selectTemplate();
          }
        }
      }
    };
    if (placeholder !== _placeholder) {
      setPlaceholder();
    }
    if (editor) {
      editor.setOptions({ editable });
    }
    if (value === null && html !== null && editor) {
      editor.commands.setContent(html);
    }
    if (value !== null && editor && !collaboration) {
      onValueChange();
    }
    if (
      // Clear content if value is empty
      richText && showFormattingToolbar
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div id="bubble-menu" class="p-0" style="visibility: hidden; opacity: 0; position: absolute; z-index: 9999;">`);
      FormattingButtons($$renderer2, { editor });
      $$renderer2.push(`<!----></div> <div id="floating-menu" class="p-0" style="visibility: hidden; opacity: 0; position: absolute; z-index: 9999;">`);
      FormattingButtons($$renderer2, { editor });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div dir="auto"${attr_class(`relative w-full min-w-full ${stringify(className)} ${stringify(!editable ? "cursor-not-allowed" : "")}`)}></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      oncompositionstart,
      oncompositionend,
      onChange,
      editor,
      socket,
      user,
      files,
      documentId,
      className,
      placeholder,
      richText,
      dragHandle,
      link,
      image,
      fileHandler,
      suggestions,
      onFileDrop,
      onFilePaste,
      onSelectionUpdate,
      id,
      value,
      html,
      json,
      raw,
      editable,
      collaboration,
      showFormattingToolbar,
      preserveBreaks,
      generateAutoCompletion,
      autocomplete,
      messageInput,
      shiftEnter,
      largeTextAsFile,
      insertPromptAsRichText,
      floatingMenuPlacement,
      getWordAtDocPos,
      replaceCommandWithText,
      setText,
      insertContent,
      replaceVariables,
      focus,
      setContent
    });
  });
}
function AddFilesPlaceholder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let title = fallback($$props["title"], "");
    let content = fallback($$props["content"], "");
    const i18n = getContext("i18n");
    $$renderer2.push(`<div class="px-3"><div class="text-center dark:text-white text-2xl font-medium z-50" role="heading" aria-level="2">`);
    if (title) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(title)}`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Files"))}`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    slot($$renderer2, $$props, "default", {}, () => {
      $$renderer2.push(`<div class="px-2 mt-2 text-center text-gray-700 dark:text-gray-200 w-full">`);
      if (content) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Drop any files here to upload"))}`);
      }
      $$renderer2.push(`<!--]--></div>`);
    });
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { title, content });
  });
}
function FilesOverlay($$renderer, $$props) {
  let show = fallback($$props["show"], false);
  if (show) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<div class="absolute inset-0 w-full h-full flex z-[9999] touch-none pointer-events-none" id="dropzone" role="region" aria-label="Drag and Drop Container"><div class="absolute w-full h-full backdrop-blur-sm bg-gray-100/50 dark:bg-gray-900/80 flex justify-center"><div class="m-auto flex flex-col justify-center"><div class="max-w-md">`);
    AddFilesPlaceholder($$renderer, {});
    $$renderer.push(`<!----></div></div></div></div>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { show });
}
export {
  FilesOverlay as F,
  RichTextInput as R,
  processWeb as a,
  processYoutubeVideo as p
};
//# sourceMappingURL=FilesOverlay.js.map
