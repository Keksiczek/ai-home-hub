import { j as slot, f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, t as stringify, o as getContext, k as escape_html, c as store_get, e as ensure_array_like, u as unsubscribe_stores } from "./root.js";
import { o as onDestroy, t as tick } from "./index-server.js";
import { W as WEBUI_BASE_URL, a as WEBUI_API_BASE_URL } from "./constants.js";
/* empty css                                       */
import { p as formatFileSize, y as getLineCount } from "./index3.js";
import { h as settings } from "./index2.js";
import DOMPurify from "dompurify";
import { g as getKnowledgeById, a as getFileById, b as getFileContentById } from "./index11.js";
import { M as Markdown, C as CodeBlock, R as Reset } from "./Markdown.js";
import { M as Modal, X as XMark } from "./Modal.js";
import { S as Switch_1 } from "./Switch.js";
import { T as Tooltip } from "./Tooltip.js";
import dayjs from "dayjs";
import { S as Spinner } from "./Spinner.js";
import "panzoom";
/* empty css                                            */
import { h as html } from "./ConfirmDialog.js";
function Loader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => {
    });
    $$renderer2.push(`<div><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Folder($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Name($$renderer, $$props) {
  $$renderer.push(`<div class="self-center font-semibold line-clamp-1 flex gap-1 items-center"><!--[-->`);
  slot($$renderer, $$props, "default", {}, null);
  $$renderer.push(`<!--]--></div>`);
}
function ProfileImage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["className"], "size-8");
    let src = fallback($$props["src"], () => `${WEBUI_BASE_URL}/static/favicon.png`, true);
    $$renderer2.push(`<img aria-hidden="true"${attr("src", src === "" ? `${WEBUI_BASE_URL}/static/favicon.png` : src.startsWith(WEBUI_BASE_URL) || src.startsWith("https://www.gravatar.com/avatar/") || src.startsWith("data:") || src.startsWith("/") ? src : `${WEBUI_BASE_URL}/user.png`)}${attr_class(` ${stringify(className)} object-cover rounded-full`)} alt="profile" draggable="false"/>`);
    bind_props($$props, { className, src });
  });
}
function Skeleton($$renderer, $$props) {
  let size = fallback($$props["size"], "md");
  $$renderer.push(`<span${attr_class(
    `relative flex ${stringify(size === "md" ? "size-3 my-2" : size === "xs" ? "size-1.5 my-1" : "size-2 my-1")} mx-1`,
    "svelte-pwh38d"
  )}><span class="absolute inline-flex h-full w-full animate-pulse rounded-full bg-gray-700 dark:bg-gray-200 opacity-75 svelte-pwh38d"></span> <span${attr_class(`relative inline-flex ${stringify(size === "md" ? "size-3" : size === "xs" ? "size-1.5" : "size-2")} rounded-full bg-black dark:bg-white animate-size`, "svelte-pwh38d")}></span></span>`);
  bind_props($$props, { size });
}
function ChatBubble($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function PDFViewer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let url = fallback($$props["url"], null);
    let data = fallback($$props["data"], null);
    let className = fallback($$props["className"], "w-full h-[70vh]");
    const resetView = () => {
    };
    onDestroy(() => {
    });
    $$renderer2.push(`<div${attr_class(`relative ${stringify(className)}`)}>`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center">`);
      Spinner($$renderer2, { className: "size-5" });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="overflow-y-auto h-full"><div class="w-full"></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { url, data, className, resetView });
  });
}
function FileItemModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isMarkdown, isCode;
    const i18n = getContext("i18n");
    const CONTENT_PREVIEW_LIMIT = 1e4;
    let expandedContent = false;
    let item = $$props["item"];
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let enableFullContent = false;
    let loading = false;
    let isPDF = false;
    let isAudio = false;
    let isImage = false;
    let isExcel = false;
    let isDocx = false;
    let isPptx = false;
    let selectedTab = "";
    let excelWorkbook = null;
    let excelSheetNames = [];
    let selectedSheet = "";
    let excelHtml = "";
    let excelError = "";
    let rowCount = 0;
    let docxHtml = "";
    let docxError = "";
    let pptxSlides = [];
    let pptxCurrentSlide = 0;
    let pptxError = "";
    const loadExcelContent = async () => {
      try {
        excelError = "";
        const [arrayBuffer, { read }] = await Promise.all([getFileContentById(item.id), import("xlsx")]);
        excelWorkbook = read(arrayBuffer, { type: "array" });
        excelSheetNames = excelWorkbook.SheetNames;
        if (excelSheetNames.length > 0) {
          selectedSheet = excelSheetNames[0];
          await renderExcelSheet();
        }
      } catch (error) {
        /* @__PURE__ */ console.error("Error loading Excel/CSV file:", error);
        excelError = store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to load Excel/CSV file. Please try downloading it instead.");
      }
    };
    const renderExcelSheet = async () => {
      if (!excelWorkbook || !selectedSheet) return;
      const { excelToTable } = await import("./excelToTable.js");
      const worksheet = excelWorkbook.Sheets[selectedSheet];
      const result = await excelToTable(worksheet);
      excelHtml = result.html;
      rowCount = result.rowCount;
    };
    const loadDocxContent = async () => {
      try {
        docxError = "";
        const [arrayBuffer, mammoth] = await Promise.all([getFileContentById(item.id), import("mammoth")]);
        const result = await mammoth.convertToHtml({ arrayBuffer });
        docxHtml = DOMPurify.sanitize(result.value);
      } catch (error) {
        /* @__PURE__ */ console.error("Error loading DOCX file:", error);
        docxError = store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to load DOCX file. Please try downloading it instead.");
      }
    };
    const loadPptxContent = async () => {
      try {
        pptxError = "";
        const [arrayBuffer, { pptxToImages }] = await Promise.all([getFileContentById(item.id), import("./pptxToHtml.js")]);
        const result = await pptxToImages(arrayBuffer);
        pptxSlides = result.images;
        pptxCurrentSlide = 0;
      } catch (error) {
        /* @__PURE__ */ console.error("Error loading PPTX file:", error);
        pptxError = store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to load PPTX file. Please try downloading it instead.");
      }
    };
    const loadContent = async () => {
      selectedTab = "";
      expandedContent = false;
      if (item?.type === "collection") {
        loading = true;
        const knowledge = await getKnowledgeById(localStorage.token, item.id).catch((e) => {
          /* @__PURE__ */ console.error("Error fetching knowledge base:", e);
          return null;
        });
        if (knowledge) {
          item.files = knowledge.files || [];
        }
        loading = false;
      } else if (item?.type === "file") {
        loading = true;
        const file = await getFileById(localStorage.token, item.id).catch((e) => {
          /* @__PURE__ */ console.error("Error fetching file:", e);
          return null;
        });
        if (file) {
          item.file = file || {};
        }
        if (isExcel) {
          await loadExcelContent();
        }
        if (isDocx) {
          await loadDocxContent();
        }
        if (isPptx) {
          await loadPptxContent();
        }
        loading = false;
      }
      await tick();
    };
    isPDF = item?.meta?.content_type === "application/pdf" || item?.name && item?.name.toLowerCase().endsWith(".pdf");
    isMarkdown = item?.meta?.content_type === "text/markdown" || item?.name && item?.name.toLowerCase().endsWith(".md");
    isCode = item?.name && (item.name.toLowerCase().endsWith(".py") || item.name.toLowerCase().endsWith(".js") || item.name.toLowerCase().endsWith(".ts") || item.name.toLowerCase().endsWith(".java") || item.name.toLowerCase().endsWith(".html") || item.name.toLowerCase().endsWith(".css") || item.name.toLowerCase().endsWith(".json") || item.name.toLowerCase().endsWith(".cpp") || item.name.toLowerCase().endsWith(".c") || item.name.toLowerCase().endsWith(".h") || item.name.toLowerCase().endsWith(".sh") || item.name.toLowerCase().endsWith(".bash") || item.name.toLowerCase().endsWith(".yaml") || item.name.toLowerCase().endsWith(".yml") || item.name.toLowerCase().endsWith(".xml") || item.name.toLowerCase().endsWith(".sql") || item.name.toLowerCase().endsWith(".go") || item.name.toLowerCase().endsWith(".rs") || item.name.toLowerCase().endsWith(".php") || item.name.toLowerCase().endsWith(".rb"));
    isAudio = (item?.meta?.content_type ?? "").startsWith("audio/") || item?.name && item?.name.toLowerCase().endsWith(".mp3") || item?.name && item?.name.toLowerCase().endsWith(".wav") || item?.name && item?.name.toLowerCase().endsWith(".ogg") || item?.name && item?.name.toLowerCase().endsWith(".m4a") || item?.name && item?.name.toLowerCase().endsWith(".webm");
    isImage = (item?.meta?.content_type ?? "").startsWith("image/") || item?.name && (item.name.toLowerCase().endsWith(".png") || item.name.toLowerCase().endsWith(".jpg") || item.name.toLowerCase().endsWith(".jpeg") || item.name.toLowerCase().endsWith(".gif") || item.name.toLowerCase().endsWith(".webp") || item.name.toLowerCase().endsWith(".svg") || item.name.toLowerCase().endsWith(".bmp") || item.name.toLowerCase().endsWith(".ico"));
    isExcel = item?.meta?.content_type === "application/vnd.ms-excel" || item?.meta?.content_type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || item?.meta?.content_type === "text/csv" || item?.meta?.content_type === "application/csv" || item?.name && (item.name.toLowerCase().endsWith(".xls") || item.name.toLowerCase().endsWith(".xlsx") || item.name.toLowerCase().endsWith(".csv"));
    isDocx = item?.meta?.content_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || item?.name && item.name.toLowerCase().endsWith(".docx");
    isPptx = item?.meta?.content_type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || item?.name && item.name.toLowerCase().endsWith(".pptx");
    if (selectedSheet && excelWorkbook) {
      renderExcelSheet();
    }
    if (show) {
      loadContent();
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
          $$renderer4.push(`<div class="font-primary px-4.5 py-3.5 w-full flex flex-col justify-center dark:text-gray-400"><div class="pb-2"><div class="flex items-start justify-between"><div><div class="font-medium text-lg dark:text-gray-100"><a href="#" class="hover:underline line-clamp-1">${escape_html(item?.name ?? "File")}</a></div></div> <div><button>`);
          XMark($$renderer4, {});
          $$renderer4.push(`<!----></button></div></div> <div><div class="flex flex-col items-center md:flex-row gap-1 justify-between w-full"><div class="flex flex-wrap text-xs gap-1 text-gray-500">`);
          if (item?.type === "collection") {
            $$renderer4.push("<!--[0-->");
            if (item?.type) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="capitalize shrink-0">${escape_html(item.type)}</div> •`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (item?.description) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="line-clamp-1">${escape_html(item.description)}</div> •`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (item?.created_at) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="capitalize shrink-0">${escape_html(dayjs(item.created_at * 1e3).format("LL"))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (item.size) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="capitalize shrink-0">${escape_html(formatFileSize(item.size))}</div> •`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (item?.file?.data?.content) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="capitalize shrink-0">`);
            if (isExcel && rowCount > 0 && selectedTab === "preview") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}} Rows", { COUNT: rowCount }))}`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}} extracted lines", { COUNT: getLineCount(item?.file?.data?.content ?? "") }))}`);
            }
            $$renderer4.push(`<!--]--></div> <div class="flex items-center gap-1 shrink-0">• ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Formatting may be inconsistent from source."))}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (item?.knowledge) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="capitalize shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge Base"))}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> `);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="self-end">`);
            Tooltip($$renderer4, {
              content: enableFullContent ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Inject the entire content as context for comprehensive processing, this is recommended for complex queries.") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Default to segmented retrieval for focused and relevant content extraction, this is recommended for most cases."),
              children: ($$renderer5) => {
                $$renderer5.push(`<div class="flex items-center gap-1.5 text-xs">`);
                if (enableFullContent) {
                  $$renderer5.push("<!--[0-->");
                  $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Using Entire Document"))}`);
                } else {
                  $$renderer5.push("<!--[-1-->");
                  $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Using Focused Retrieval"))}`);
                }
                $$renderer5.push(`<!--]--> `);
                Switch_1($$renderer5, {
                  get state() {
                    return enableFullContent;
                  },
                  set state($$value) {
                    enableFullContent = $$value;
                    $$settled = false;
                  }
                });
                $$renderer5.push(`<!----></div>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div></div> <div class="max-h-[75vh] overflow-auto">`);
          if (!loading) {
            $$renderer4.push("<!--[0-->");
            if (item?.type === "collection") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div><!--[-->`);
              const each_array = ensure_array_like(item?.files);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let file = each_array[$$index];
                $$renderer4.push(`<div class="flex items-center gap-2 mb-2"><div class="flex-shrink-0 text-xs">${escape_html(file?.meta?.name)}</div></div>`);
              }
              $$renderer4.push(`<!--]--></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (isAudio || isPDF || isExcel || isCode || isMarkdown || isDocx || isPptx) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex mb-2.5 scrollbar-none overflow-x-auto w-full border-b border-gray-50 dark:border-gray-850/30 text-center text-sm font-medium bg-transparent dark:text-gray-200"><button${attr_class(`min-w-fit py-1.5 px-4 border-b ${stringify(selectedTab === "" ? " " : " border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition`)} type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Content"))}</button> <button${attr_class(`min-w-fit py-1.5 px-4 border-b ${stringify(selectedTab === "preview" ? " " : " border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition`)} type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Preview"))}</button></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (isImage) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="relative w-full max-h-[70vh] overflow-hidden"><div class="absolute top-2 right-2 z-10">`);
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<button class="p-1.5 rounded-lg bg-white/80 dark:bg-gray-850/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400">`);
                  Reset($$renderer5, { className: "size-4" });
                  $$renderer5.push(`<!----></button>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----></div> <div><img${attr("src", `${WEBUI_API_BASE_URL}/files/${item.id}/content`)}${attr("alt", item?.name ?? "Image")} class="w-full object-contain rounded-lg" loading="lazy" draggable="false"/></div></div>`);
            } else if (selectedTab === "") {
              $$renderer4.push("<!--[1-->");
              if (item?.file?.data) {
                $$renderer4.push("<!--[0-->");
                const rawContent = (item?.file?.data?.content ?? "").trim() || "No content";
                const isTruncated = (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) && rawContent.length > CONTENT_PREVIEW_LIMIT && !expandedContent;
                if (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div class="max-h-96 overflow-scroll scrollbar-hidden text-sm prose dark:prose-invert max-w-full">`);
                  Markdown($$renderer4, {
                    content: isTruncated ? rawContent.slice(0, CONTENT_PREVIEW_LIMIT) : rawContent,
                    id: "file-preview"
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
                  $$renderer4.push(`<div class="max-h-96 overflow-scroll scrollbar-hidden text-xs whitespace-pre-wrap">${escape_html(rawContent)}</div>`);
                }
                $$renderer4.push(`<!--]-->`);
              } else if (item?.content) {
                $$renderer4.push("<!--[1-->");
                const rawContent = (item?.content ?? "").trim() || "No content";
                const isTruncated = (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) && rawContent.length > CONTENT_PREVIEW_LIMIT && !expandedContent;
                if (store_get($$store_subs ??= {}, "$settings", settings)?.renderMarkdownInPreviews ?? true) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div class="max-h-96 overflow-scroll scrollbar-hidden text-sm prose dark:prose-invert max-w-full">`);
                  Markdown($$renderer4, {
                    content: isTruncated ? rawContent.slice(0, CONTENT_PREVIEW_LIMIT) : rawContent,
                    id: "file-preview-content"
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
                  $$renderer4.push(`<div class="max-h-96 overflow-scroll scrollbar-hidden text-xs whitespace-pre-wrap">${escape_html(rawContent)}</div>`);
                }
                $$renderer4.push(`<!--]-->`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]-->`);
            } else if (selectedTab === "preview") {
              $$renderer4.push("<!--[2-->");
              if (isAudio) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<audio${attr("src", `${WEBUI_API_BASE_URL}/files/${item.id}/content`)} class="w-full border-0 rounded-lg mb-2" controls="" playsinline=""></audio>`);
              } else if (isPDF) {
                $$renderer4.push("<!--[1-->");
                PDFViewer($$renderer4, {
                  url: `${WEBUI_API_BASE_URL}/files/${item.id}/content`,
                  className: "w-full h-[70vh] border-0 rounded-lg"
                });
              } else if (isExcel) {
                $$renderer4.push("<!--[2-->");
                if (excelError) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div class="text-red-500 text-sm p-4">${escape_html(excelError)}</div>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                  if (excelSheetNames.length > 1) {
                    $$renderer4.push("<!--[0-->");
                    $$renderer4.push(`<div class="flex mb-2.5 scrollbar-none overflow-x-auto w-full border-b border-gray-50 dark:border-gray-850/30 text-center text-sm font-medium bg-transparent dark:text-gray-200"><!--[-->`);
                    const each_array_1 = ensure_array_like(excelSheetNames);
                    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                      let sheetName = each_array_1[$$index_1];
                      $$renderer4.push(`<button${attr_class(`min-w-fit py-1.5 px-4 border-b ${stringify(selectedSheet === sheetName ? " " : " border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition`)} type="button">${escape_html(sheetName)}</button>`);
                    }
                    $$renderer4.push(`<!--]--></div>`);
                  } else {
                    $$renderer4.push("<!--[-1-->");
                  }
                  $$renderer4.push(`<!--]--> `);
                  if (excelHtml) {
                    $$renderer4.push("<!--[0-->");
                    $$renderer4.push(`<div class="office-preview overflow-auto max-h-[60vh]">${html(excelHtml)}</div>`);
                  } else {
                    $$renderer4.push("<!--[-1-->");
                    $$renderer4.push(`<div class="text-gray-500 text-sm p-4">No content available</div>`);
                  }
                  $$renderer4.push(`<!--]-->`);
                }
                $$renderer4.push(`<!--]-->`);
              } else if (isCode) {
                $$renderer4.push("<!--[3-->");
                $$renderer4.push(`<div class="max-h-[60vh] overflow-scroll scrollbar-hidden text-sm relative">`);
                CodeBlock($$renderer4, {
                  code: item.file.data.content,
                  lang: item.name.split(".").pop(),
                  token: null,
                  edit: false,
                  run: false,
                  save: false
                });
                $$renderer4.push(`<!----></div>`);
              } else if (isMarkdown) {
                $$renderer4.push("<!--[4-->");
                $$renderer4.push(`<div class="max-h-[60vh] overflow-scroll scrollbar-hidden text-sm prose dark:prose-invert max-w-full">`);
                Markdown($$renderer4, { content: item.file.data.content, id: "markdown-viewer" });
                $$renderer4.push(`<!----></div>`);
              } else if (isDocx) {
                $$renderer4.push("<!--[5-->");
                if (docxError) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div class="text-red-500 text-sm p-4">${escape_html(docxError)}</div>`);
                } else if (docxHtml) {
                  $$renderer4.push("<!--[1-->");
                  $$renderer4.push(`<div class="office-preview max-h-[60vh] overflow-auto p-4 prose dark:prose-invert max-w-full text-sm">${html(docxHtml)}</div>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                  $$renderer4.push(`<div class="text-gray-500 text-sm p-4">No content available</div>`);
                }
                $$renderer4.push(`<!--]-->`);
              } else if (isPptx) {
                $$renderer4.push("<!--[6-->");
                if (pptxError) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div class="text-red-500 text-sm p-4">${escape_html(pptxError)}</div>`);
                } else if (pptxSlides.length > 0) {
                  $$renderer4.push("<!--[1-->");
                  $$renderer4.push(`<div class="max-h-[60vh] overflow-auto"><div class="flex justify-center p-4"><img${attr("src", pptxSlides[pptxCurrentSlide])}${attr("alt", `Slide ${stringify(pptxCurrentSlide + 1)}`)} class="max-w-full max-h-[50vh] object-contain rounded-md shadow-lg" draggable="false"/></div> `);
                  if (pptxSlides.length > 1) {
                    $$renderer4.push("<!--[0-->");
                    $$renderer4.push(`<div class="flex items-center justify-center gap-3 pb-3 text-sm text-gray-500"><button class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", pptxCurrentSlide === 0, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button> <span>${escape_html(pptxCurrentSlide + 1)} / ${escape_html(pptxSlides.length)}</span> <button class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", pptxCurrentSlide === pptxSlides.length - 1, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button></div>`);
                  } else {
                    $$renderer4.push("<!--[-1-->");
                  }
                  $$renderer4.push(`<!--]--></div>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                  $$renderer4.push(`<div class="text-gray-500 text-sm p-4">No content available</div>`);
                }
                $$renderer4.push(`<!--]-->`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<div class="max-h-96 overflow-scroll scrollbar-hidden text-xs whitespace-pre-wrap">${escape_html((item?.file?.data?.content ?? "").trim() || "No content")}</div>`);
              }
              $$renderer4.push(`<!--]-->`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="flex items-center justify-center py-6">`);
            Spinner($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div></div>`);
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
    bind_props($$props, { item, show, edit });
  });
}
function DocumentPage($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M4 21.4V2.6C4 2.26863 4.26863 2 4.6 2H16.2515C16.4106 2 16.5632 2.06321 16.6757 2.17574L19.8243 5.32426C19.9368 5.43679 20 5.5894 20 5.74853V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10L16 10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 18L16 18" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 14L12 14" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Database($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M5 12V18C5 18 5 21 12 21C19 21 19 18 19 18V12"></path><path d="M5 6V12C5 12 5 15 12 15C19 15 19 12 19 12V6"></path><path d="M12 3C19 3 19 6 19 6C19 6 19 9 12 9C5 9 5 6 5 6C5 6 5 3 12 3Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function PageEdit($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H16M8 6H12M8 14H11" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17.9541 16.9394L18.9541 15.9394C19.392 15.5015 20.102 15.5015 20.5399 15.9394V15.9394C20.9778 16.3773 20.9778 17.0873 20.5399 17.5252L19.5399 18.5252M17.9541 16.9394L14.963 19.9305C14.8131 20.0804 14.7147 20.2741 14.6821 20.4835L14.4394 22.0399L15.9957 21.7973C16.2052 21.7646 16.3988 21.6662 16.5487 21.5163L19.5399 18.5252M17.9541 16.9394L19.5399 18.5252" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function FileItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let className = fallback($$props["className"], "w-60");
    let colorClassName = fallback($$props["colorClassName"], "bg-white dark:bg-gray-850 border border-gray-50/30 dark:border-gray-800/30");
    let url = fallback($$props["url"], null);
    let dismissible = fallback($$props["dismissible"], false);
    let modal = fallback($$props["modal"], false);
    let loading = fallback($$props["loading"], false);
    let item = fallback($$props["item"], null);
    let edit = fallback($$props["edit"], false);
    let small = fallback($$props["small"], false);
    let name = $$props["name"];
    let type = $$props["type"];
    let size = $$props["size"];
    let showModal = false;
    const decodeString = (str) => {
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (item) {
        $$renderer3.push("<!--[0-->");
        FileItemModal($$renderer3, {
          edit,
          get show() {
            return showModal;
          },
          set show($$value) {
            showModal = $$value;
            $$settled = false;
          },
          get item() {
            return item;
          },
          set item($$value) {
            item = $$value;
            $$settled = false;
          }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <button${attr_class(`relative group p-1.5 ${stringify(className)} flex items-center gap-1 ${stringify(colorClassName)} ${stringify(small ? "rounded-xl p-2" : "rounded-2xl")} text-left`)} type="button">`);
      if (!small) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="size-10 shrink-0 flex justify-center items-center bg-black/20 dark:bg-white/10 text-white rounded-xl">`);
        if (!loading) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-4.5"><path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd"></path><path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"></path></svg>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          Spinner($$renderer3, {});
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="pl-1.5">`);
        if (!loading) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            content: type === "collection" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Collection") : type === "note" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Note") : type === "chat" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat") : type === "file" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("File") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Document"),
            placement: "top",
            children: ($$renderer4) => {
              if (type === "collection") {
                $$renderer4.push("<!--[0-->");
                Database($$renderer4, {});
              } else if (type === "note") {
                $$renderer4.push("<!--[1-->");
                PageEdit($$renderer4, {});
              } else if (type === "chat") {
                $$renderer4.push("<!--[2-->");
                ChatBubble($$renderer4, {});
              } else if (type === "folder") {
                $$renderer4.push("<!--[3-->");
                Folder($$renderer4, {});
              } else {
                $$renderer4.push("<!--[-1-->");
                DocumentPage($$renderer4, {});
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
          Spinner($$renderer3, {});
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--> `);
      if (!small) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex flex-col justify-center -space-y-0.5 px-2.5 w-full"><div class="dark:text-gray-100 text-sm font-medium line-clamp-1 mb-1">${escape_html(decodeString(name))}</div> <div${attr_class(` flex justify-between text-xs line-clamp-1 ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500")}`)}>`);
        if (type === "file") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("File"))}`);
        } else if (type === "note") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Note"))}`);
        } else if (type === "doc") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Document"))}`);
        } else if (type === "collection") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Collection"))}`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="capitalize line-clamp-1">${escape_html(type)}</span>`);
        }
        $$renderer3.push(`<!--]--> `);
        if (size) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<span class="capitalize">${escape_html(formatFileSize(size))}</span>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        Tooltip($$renderer3, {
          content: decodeString(name),
          className: "flex flex-col w-full",
          placement: "top-start",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex flex-col justify-center -space-y-0.5 px-1 w-full"><div class="dark:text-gray-100 text-sm flex justify-between items-center"><div class="font-medium line-clamp-1 flex-1 pr-1">${escape_html(decodeString(name))}</div> `);
            if (size) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="text-gray-500 text-xs capitalize shrink-0">${escape_html(formatFileSize(size))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<div class="text-gray-500 text-xs capitalize shrink-0">${escape_html(type)}</div>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer3.push(`<!--]--> `);
      if (dismissible) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="absolute -top-1 -right-1"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove File"))}${attr_class(` bg-white text-black border border-gray-50 rounded-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "outline-hidden focus:outline-hidden group-hover:visible invisible transition")}`)} type="button">`);
        XMark($$renderer3, { className: "size-4" });
        $$renderer3.push(`<!----></button></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></button>`);
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
      colorClassName,
      url,
      dismissible,
      modal,
      loading,
      item,
      edit,
      small,
      name,
      type,
      size
    });
  });
}
export {
  ChatBubble as C,
  Folder as F,
  Loader as L,
  Name as N,
  PDFViewer as P,
  Skeleton as S,
  FileItem as a,
  ProfileImage as b
};
//# sourceMappingURL=FileItem.js.map
