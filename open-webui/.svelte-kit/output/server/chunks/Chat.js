import { f as fallback, c as store_get, u as unsubscribe_stores, b as bind_props, a as attr, d as attr_class, g as clsx, o as getContext, k as escape_html, e as ensure_array_like, t as stringify, m as attributes, j as slot, h as attr_style, s as sanitize_props, l as rest_props, p as setContext, i as spread_props, v as store_set, w as sanitize_slots, x as hasContext, q as head } from "./root.js";
import { v4 } from "uuid";
import { o as onDestroy, t as tick } from "./index-server.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { D as Drawer, P as Pane_group, a as Pane$1 } from "./Drawer.js";
import { g as goto } from "./client.js";
import { p as page } from "./stores.js";
import { A as AUDIO_API_BASE_URL, a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL } from "./constants.js";
import { g as tags, z as tools, A as toolServers, h as settings, B as selectedTerminalId, m as models, c as config, u as user, C as temporaryChatEnabled, D as artifactContents, f as folders$1, a as chatId, i as mobile, j as showSidebar, E as banners, x as functions, F as showCallOverlay, T as TTSWorker, G as embed, y as terminalServers, H as pyodideWorker, t as theme, I as showFileNavPath, J as showControls, K as showArtifacts, L as showEmbeds, s as selectedFolder, e as chats, d as currentChatPage, M as chatTitle, N as chatRequestQueues, l as socket, W as WEBUI_NAME, p as pinnedChats } from "./index2.js";
import { b as getUserPosition, d as getAge, e as getFormattedDate, f as getFormattedTime, h as getCurrentDateTime, i as getUserTimezone, j as getWeekday, k as extractInputVariables, l as convertHeicToJpeg, m as compressImage, n as extractContentFromFile, o as blobToFile, p as formatFileSize, q as getTimeRange, s as sanitizeResponseContent, c as createMessagesList, r as getCodeBlockContents, t as convertMessagesToHistory, u as processDetails, v as getPromptVariables, w as isYoutubeUrl } from "./index3.js";
import { h as getChatListByFolderId, i as getChatsByFolderId, c as getChatList, k as getChatById, m as getTagsById, n as createNewChat, o as updateChatById, u as updateChatFolderIdById, d as getPinnedChatList, a as archiveChatById } from "./index5.js";
import { c as generateEmoji, d as getTaskIdsByChatId, e as generateOpenAIChatCompletion, s as stopTask, f as chatAction, h as generateMoACompletion } from "./index6.js";
import { R as RichTextInput, F as FilesOverlay, p as processYoutubeVideo, a as processWeb } from "./FilesOverlay.js";
import { u as updateUserSettings, b as getAndUpdateUserLocation } from "./Badge.js";
import { g as getUserValvesById, a as getUserValvesSpecById, b as getToolValvesById, c as getToolValvesSpecById, d as getTools } from "./index10.js";
import { u as uploadFile } from "./index11.js";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { g as getUserValvesById$1, a as getUserValvesSpecById$1, b as getFunctionValvesById, c as getFunctionValvesSpecById, d as getFunctions } from "./index7.js";
import { S as Share, a as ShareChatModal, F as FolderModal, b as FolderMenu, u as updateFolderById, g as getFolderById } from "./FolderModal.js";
import DOMPurify from "dompurify";
import { marked } from "marked";
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
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { g as getSessionUser, A as ArchiveBox, U as UserMenu, G as GarbageBin, a as EmojiPicker, E as Emoji } from "./GarbageBin.js";
/* empty css                                    */
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import "./listDragHandlePlugin.js";
import { M as Modal, X as XMark } from "./Modal.js";
import { a as Collapsible, C as ChevronUp } from "./Collapsible.js";
import "turndown";
import "@joplin/turndown-plugin-gfm";
import "@tiptap/starter-kit";
import "@tiptap/extension-table";
import "@tiptap/extension-list";
import "@tiptap/extensions";
import "@tiptap/extension-file-handler";
import "@tiptap/extension-typography";
import "@tiptap/extension-highlight";
import "@tiptap/extension-code";
import "@tiptap/extension-code-block-lowlight";
import "@tiptap/extension-mention";
/* empty css                */
import "./codemirror.js";
import fileSaver from "file-saver";
import "panzoom";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
/* empty css                                            */
import { S as Spinner } from "./Spinner.js";
import { S as Switch_1 } from "./Switch.js";
import { S as SensitiveInput, h as html, C as ConfirmDialog } from "./ConfirmDialog.js";
/* empty css                                          */
import { S as Suggestions, M as Messages } from "./Messages.js";
import { S as Selector } from "./Selector.js";
import { T as Tooltip } from "./Tooltip.js";
import { D as Dropdown } from "./Dropdown.js";
import { D as DropdownSub } from "./DropdownSub.js";
import { a as Tags, T as Textarea } from "./Textarea.js";
import { C as Clipboard } from "./Clipboard.js";
import { F as Folder, a as FileItem, P as PDFViewer, b as ProfileImage, L as Loader } from "./FileItem.js";
/* empty css                                       */
/* empty css                                            */
import { D as Download } from "./Download.js";
import "i18next";
import { B as Banner } from "./Banner.js";
import { S as Sidebar } from "./Sidebar.js";
import { E as EllipsisHorizontal } from "./EllipsisHorizontal.js";
import { P as Plus$1 } from "./Plus.js";
import { a as SVGPanZoom, F as FullHeightIframe } from "./Markdown.js";
import { a as getListeningPorts, b as getPortProxyUrl, c as getTerminalConfig, d as getCwd, l as listFiles, s as setCwd, u as uploadToTerminal, m as moveEntry, e as archiveFromTerminal, f as downloadFileBlob, r as readFile } from "./index9.js";
import { Compartment } from "@codemirror/state";
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { P as Pencil } from "./Pencil.js";
import "@xterm/xterm";
import "@xterm/addon-fit";
import "@xterm/addon-web-links";
import { g as get, w as writable, r as readable, d as derived } from "./index.js";
import cc from "classcat";
import { Position, ConnectionMode, areConnectionMapsEqual, handleConnectionChange, errorMessages, getBezierPath, getSmoothStepPath, getStraightPath, infiniteExtent, updateConnectionLookup, adoptUserNodes, fitViewport, getInternalNodesBounds, getViewportForBounds, devWarn, ConnectionLineType, SelectionMode, initialConnection, isEdgeVisible, getEdgePosition, getElevatedEdgeZIndex, getNodesInside, getElementsToRemove, panBy, updateNodeInternals, updateAbsolutePositions, addEdge, withResolvers, createMarkerIds, pointToRendererPoint, nodeHasDimensions, getMarkerId, MarkerType, isNumeric, isMacOs, getConnectionStatus, PanOnScrollMode, isNodeBase, getNodesBounds, rendererPointToPoint, isRectObject, getOverlappingArea, nodeToRect, evaluateAbsolutePosition } from "@xyflow/system";
import "clsx";
import { E as EyeSlash } from "./EyeSlash.js";
import { C as ChevronDown } from "./ChevronDown.js";
function WorkerWrapper(options) {
  return new Worker(
    "/_app/immutable/workers/pyodide.worker-ByPVa6_z.js",
    {
      type: "module",
      name: options?.name
    }
  );
}
function Tags_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let chatId2 = fallback($$props["chatId"], "");
    let disabled = fallback($$props["disabled"], false);
    let tags$1 = [];
    Tags($$renderer2, {
      tags: tags$1,
      disabled,
      suggestionTags: store_get($$store_subs ??= {}, "$_tags", tags) ?? []
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { chatId: chatId2, disabled });
  });
}
async function createOpenAITextStream(responseBody, splitLargeDeltas) {
  const eventStream = responseBody.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).getReader();
  let iterator = openAIStreamToIterator(eventStream);
  if (splitLargeDeltas) {
    iterator = streamLargeDeltasAsRandomChunks(iterator);
  }
  return iterator;
}
async function* openAIStreamToIterator(reader) {
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      yield { done: true, value: "" };
      break;
    }
    if (!value) {
      continue;
    }
    const data = value.data;
    if (data.startsWith("[DONE]")) {
      yield { done: true, value: "" };
      break;
    }
    try {
      const parsedData = JSON.parse(data);
      /* @__PURE__ */ console.log(parsedData);
      if (parsedData.error) {
        yield { done: true, value: "", error: parsedData.error };
        break;
      }
      if (parsedData.sources) {
        yield { done: false, value: "", sources: parsedData.sources };
        continue;
      }
      if (parsedData.selected_model_id) {
        yield { done: false, value: "", selectedModelId: parsedData.selected_model_id };
        continue;
      }
      if (parsedData.usage) {
        yield { done: false, value: "", usage: parsedData.usage };
        continue;
      }
      yield {
        done: false,
        value: parsedData.choices?.[0]?.delta?.content ?? ""
      };
    } catch (e) {
    }
  }
}
async function* streamLargeDeltasAsRandomChunks(iterator) {
  for await (const textStreamUpdate of iterator) {
    if (textStreamUpdate.done) {
      yield textStreamUpdate;
      return;
    }
    if (textStreamUpdate.error) {
      yield textStreamUpdate;
      continue;
    }
    if (textStreamUpdate.sources) {
      yield textStreamUpdate;
      continue;
    }
    if (textStreamUpdate.selectedModelId) {
      yield textStreamUpdate;
      continue;
    }
    if (textStreamUpdate.usage) {
      yield textStreamUpdate;
      continue;
    }
    let content = textStreamUpdate.value;
    if (content.length < 5) {
      yield { done: false, value: content };
      continue;
    }
    while (content != "") {
      const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, content.length);
      const chunk = content.slice(0, chunkSize);
      yield { done: false, value: chunk };
      if (document?.visibilityState !== "hidden") {
        await sleep(5);
      }
      content = content.slice(chunkSize);
    }
  }
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transcribeAudio = async (token2, file, language) => {
  const data = new FormData();
  data.append("file", file);
  if (language) {
    data.append("language", language);
  }
  let error = null;
  const res = await fetch(`${AUDIO_API_BASE_URL}/transcriptions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      authorization: `Bearer ${token2}`
    },
    body: data
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
const synthesizeOpenAISpeech = async (token2 = "", speaker = "alloy", text = "", model) => {
  let error = null;
  const res = await fetch(`${AUDIO_API_BASE_URL}/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token2}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: text,
      voice: speaker,
      ...model
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function Cube($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "2");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Document($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AdvancedParams($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onChange = fallback($$props["onChange"], () => {
    });
    let admin = fallback($$props["admin"], false);
    let custom = fallback($$props["custom"], false);
    const defaultParams = {
      // Advanced
      stream_response: null,
      // Set stream responses for this model individually
      stream_delta_chunk_size: null,
      // Set the chunk size for streaming responses
      function_calling: null,
      reasoning_tags: null,
      seed: null,
      stop: null,
      temperature: null,
      reasoning_effort: null,
      logit_bias: null,
      max_tokens: null,
      top_k: null,
      top_p: null,
      min_p: null,
      frequency_penalty: null,
      presence_penalty: null,
      mirostat: null,
      mirostat_eta: null,
      mirostat_tau: null,
      repeat_last_n: null,
      tfs_z: null,
      repeat_penalty: null,
      use_mmap: null,
      use_mlock: null,
      think: null,
      format: null,
      keep_alive: null,
      num_keep: null,
      num_ctx: null,
      num_batch: null,
      num_thread: null,
      num_gpu: null
    };
    let params = fallback($$props["params"], defaultParams);
    if (params) {
      onChange(params);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="space-y-1 text-xs pb-safe-bottom"><div>`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("When enabled, the model will respond to each chat message in real-time, generating a response as soon as the user sends a message. This mode is useful for live chat applications, but may impact performance on slower hardware."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Stream Chat Response"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
          if (params.stream_response === true) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("On"))}</span>`);
          } else if (params.stream_response === false) {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Off"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> `);
      if (admin) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div>`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("The stream delta chunk size for the model. Increasing the chunk size will make the model respond with larger pieces of text at once."),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Stream Delta Chunk Size"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
            if ((params?.stream_delta_chunk_size ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.stream_delta_chunk_size ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="1" max="128" step="1"${attr("value", params.stream_delta_chunk_size)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.stream_delta_chunk_size)} type="number" class="bg-transparent text-center w-14" min="1" step="any"/></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div>`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Default mode works with a wider range of models by calling tools once before execution. Native mode leverages the model's built-in tool-calling capabilities, but requires the model to inherently support this feature."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Function Calling"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
          if (params.function_calling === "native") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Native"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t('Enable, disable, or customize the reasoning tags used by the model. "Enabled" uses default tags, "Disabled" turns off reasoning tags, and "Custom" lets you specify your own start and end tags.'),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Reasoning Tags"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.reasoning_tags ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else if ((params?.reasoning_tags ?? null) === true) {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled"))}</span>`);
          } else if ((params?.reasoning_tags ?? null) === false) {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if (![true, false, null].includes(params?.reasoning_tags ?? null) && (params?.reasoning_tags ?? []).length === 2) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Start Tag"))}${attr("value", params.reasoning_tags[0])} autocomplete="off"/></div> <div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("End Tag"))}${attr("value", params.reasoning_tags[1])} autocomplete="off"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Seed"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.seed ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.seed ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="number"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Seed"))}${attr("value", params.seed)} autocomplete="off" min="0"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets the stop sequences to use. When this pattern is encountered, the LLM will stop generating text and return. Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Stop Sequence"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.stop ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.stop ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter stop sequence"))}${attr("value", params.stop)} autocomplete="off"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("The temperature of the model. Increasing the temperature will make the model answer more creatively."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Temperature"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.temperature ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.temperature ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="2" step="0.05"${attr("value", params.temperature)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.temperature)} type="number" class="bg-transparent text-center w-14" min="0" max="2" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Constrains effort on reasoning for reasoning models. Only applicable to reasoning models from specific providers that support reasoning effort."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Reasoning Effort"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.reasoning_effort ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.reasoning_effort ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter reasoning effort"))}${attr("value", params.reasoning_effort)} autocomplete="off"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Boosting or penalizing specific tokens for constrained responses. Bias values will be clamped between -100 and 100 (inclusive). (Default: none)"),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">logit_bias</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.logit_bias ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.logit_bias ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t('Enter comma-separated "token:bias_value" pairs (example: 5432:100, 413:-100)'))}${attr("value", params.logit_bias)} autocomplete="off"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This option sets the maximum number of tokens the model can generate in its response. Increasing this limit allows the model to provide longer answers, but it may also increase the likelihood of unhelpful or irrelevant content being generated."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">max_tokens</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.max_tokens ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.max_tokens ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-2" max="131072" step="1"${attr("value", params.max_tokens)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.max_tokens)} type="number" class="bg-transparent text-center w-14" min="-2" step="1"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">top_k</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.top_k ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.top_k ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="1000" step="0.5"${attr("value", params.top_k)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.top_k)} type="number" class="bg-transparent text-center w-14" min="0" max="100" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">top_p</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.top_p ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.top_p ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="1" step="0.05"${attr("value", params.top_p)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.top_p)} type="number" class="bg-transparent text-center w-14" min="0" max="1" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Alternative to the top_p, and aims to ensure a balance of quality and variety. The parameter p represents the minimum probability for a token to be considered, relative to the probability of the most likely token. For example, with p=0.05 and the most likely token having a probability of 0.9, logits with a value less than 0.045 are filtered out."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">min_p</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.min_p ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.min_p ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="1" step="0.05"${attr("value", params.min_p)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.min_p)} type="number" class="bg-transparent text-center w-14" min="0" max="1" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets a scaling bias against tokens to penalize repetitions, based on how many times they have appeared. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. At 0, it is disabled."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">frequency_penalty</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.frequency_penalty ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.frequency_penalty ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-2" max="2" step="0.05"${attr("value", params.frequency_penalty)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.frequency_penalty)} type="number" class="bg-transparent text-center w-14" min="-2" max="2" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets a flat bias against tokens that have appeared at least once. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. At 0, it is disabled."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">presence_penalty</div> <button class="p-1 px-3 text-xs flex rounded transition flex-shrink-0 outline-none" type="button">`);
          if ((params?.presence_penalty ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.presence_penalty ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-2" max="2" step="0.05"${attr("value", params.presence_penalty)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.presence_penalty)} type="number" class="bg-transparent text-center w-14" min="-2" max="2" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enable Mirostat sampling for controlling perplexity."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">mirostat</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.mirostat ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.mirostat ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="2" step="1"${attr("value", params.mirostat)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.mirostat)} type="number" class="bg-transparent text-center w-14" min="0" max="2" step="1"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">mirostat_eta</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.mirostat_eta ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.mirostat_eta ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="1" step="0.05"${attr("value", params.mirostat_eta)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.mirostat_eta)} type="number" class="bg-transparent text-center w-14" min="0" max="1" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">mirostat_tau</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.mirostat_tau ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.mirostat_tau ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="10" step="0.5"${attr("value", params.mirostat_tau)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.mirostat_tau)} type="number" class="bg-transparent text-center w-14" min="0" max="10" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets how far back for the model to look back to prevent repetition."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">repeat_last_n</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.repeat_last_n ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.repeat_last_n ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-1" max="128" step="1"${attr("value", params.repeat_last_n)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.repeat_last_n)} type="number" class="bg-transparent text-center w-14" min="-1" max="128" step="1"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">tfs_z</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.tfs_z ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.tfs_z ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="2" step="0.05"${attr("value", params.tfs_z)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.tfs_z)} type="number" class="bg-transparent text-center w-14" min="0" max="2" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Control the repetition of token sequences in the generated text. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 1.1) will be more lenient. At 1, it is disabled."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">repeat_penalty</div> <button class="p-1 px-3 text-xs flex rounded transition flex-shrink-0 outline-none" type="button">`);
          if ((params?.repeat_penalty ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.repeat_penalty ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-2" max="2" step="0.05"${attr("value", params.repeat_penalty)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.repeat_penalty)} type="number" class="bg-transparent text-center w-14" min="-2" max="2" step="any"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      if (admin) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="py-0.5 w-full justify-between">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enable Memory Mapping (mmap) to load model data. This option allows the system to use disk storage as an extension of RAM by treating disk files as if they were in RAM. This can improve model performance by allowing for faster data access. However, it may not work correctly with all systems and can consume a significant amount of disk space."),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">use_mmap</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
            if ((params?.use_mmap ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.use_mmap ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex justify-between items-center mt-1"><div class="text-xs text-gray-500">${escape_html(params.use_mmap ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"))}</div> <div class="pr-2">`);
          Switch_1($$renderer3, {
            get state() {
              return params.use_mmap;
            },
            set state($$value) {
              params.use_mmap = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enable Memory Locking (mlock) to prevent model data from being swapped out of RAM. This option locks the model's working set of pages into RAM, ensuring that they will not be swapped out to disk. This can help maintain performance by avoiding page faults and ensuring fast data access."),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">use_mlock</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
            if ((params?.use_mlock ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.use_mlock ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex justify-between items-center mt-1"><div class="text-xs text-gray-500">${escape_html(params.use_mlock ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"))}</div> <div class="pr-2">`);
          Switch_1($$renderer3, {
            get state() {
              return params.use_mlock;
            },
            set state($$value) {
              params.use_mlock = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This option enables or disables the use of the reasoning feature in Ollama, which allows the model to think before generating a response. When enabled, the model can take a moment to process the conversation context and generate a more thoughtful response."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">think (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
          if (params.think === true) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("On"))}</span>`);
          } else if (params.think === false) {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Off"))}</span>`);
          } else if (typeof params.think === "string") {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if (typeof params.think === "string") {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input class="text-sm w-full bg-transparent outline-hidden outline-none" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g. 'low', 'medium', 'high'"))}${attr("value", params.think)} autocomplete="off"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("The format to return a response in. Format can be json or a JSON schema."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">format (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
          if ((params?.format ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("JSON"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.format ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2">`);
        Textarea($$renderer3, {
          className: "w-full  text-sm bg-transparent outline-hidden",
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t('e.g. "json" or a JSON schema'),
          get value() {
            return params.format;
          },
          set value($$value) {
            params.format = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This option controls how many tokens are preserved when refreshing the context. For example, if set to 2, the last 2 tokens of the conversation context will be retained. Preserving context can help maintain the continuity of a conversation, but it may reduce the ability to respond to new topics."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">num_keep (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.num_keep ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.num_keep ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-1" max="10240000" step="1"${attr("value", params.num_keep)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.num_keep)} type="number" class="bg-transparent text-center w-14" min="-1" step="1"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sets the size of the context window used to generate the next token."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">num_ctx (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.num_ctx ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.num_ctx ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="-1" max="10240000" step="1"${attr("value", params.num_ctx)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.num_ctx)} type="number" class="bg-transparent text-center w-14" min="-1" step="1"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("The batch size determines how many text requests are processed together at once. A higher batch size can increase the performance and speed of the model, but it also requires more memory."),
        placement: "top-start",
        className: "inline-tooltip",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">num_batch (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
          if ((params?.num_batch ?? null) === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer4.push(`<!--]--></button></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if ((params?.num_batch ?? null) !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="256" max="8192" step="256"${attr("value", params.num_batch)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.num_batch)} type="number" class="bg-transparent text-center w-14" min="256" step="256"/></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      if (admin) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="py-0.5 w-full justify-between">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Set the number of worker threads used for computation. This option controls how many threads are used to process incoming requests concurrently. Increasing this value can improve performance under high concurrency workloads but may also consume more CPU resources."),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">num_thread (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
            if ((params?.num_thread ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.num_thread ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="1" max="256" step="1"${attr("value", params.num_thread)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.num_thread)} type="number" class="bg-transparent text-center w-14" min="1" max="256" step="1"/></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Set the number of layers, which will be off-loaded to GPU. Increasing this value can significantly improve performance for models that are optimized for GPU acceleration but may also consume more power and GPU resources."),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex w-full justify-between"><div class="self-center text-xs">num_gpu (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">`);
            if ((params?.num_gpu ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.num_gpu ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><div class="flex-1"><input id="steps-range" type="range" min="0" max="256" step="1"${attr("value", params.num_gpu)} class="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/></div> <div><input${attr("value", params.num_gpu)} type="number" class="bg-transparent text-center w-14" min="0" max="256" step="1"/></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="py-0.5 w-full justify-between">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This option controls how long the model will stay loaded into memory following the request (default: 5m)"),
          placement: "top-start",
          className: "inline-tooltip",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs">keep_alive (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ollama"))})</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
            if ((params?.keep_alive ?? null) === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
            }
            $$renderer4.push(`<!--]--></button></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if ((params?.keep_alive ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex mt-0.5 space-x-2"><input class="w-full text-sm bg-transparent outline-hidden" type="text"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g. '30s','10m'. Valid time units are 's', 'm', 'h'."))}${attr("value", params.keep_alive)}/></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        if (custom && admin) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex flex-col justify-center"><!--[-->`);
          const each_array = ensure_array_like(Object.keys(params?.custom_params ?? {}));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let key2 = each_array[$$index];
            $$renderer3.push(`<div class="py-0.5 w-full justify-between mb-1"><div class="flex w-full justify-between"><div class="self-center text-xs"><input type="text" class="text-xs w-full bg-transparent outline-none"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom Parameter Name"))}${attr("value", key2)}/></div> <button class="p-1 px-3 text-xs flex rounded-sm transition shrink-0 outline-hidden" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove"))}</button></div> <div class="flex mt-0.5 space-x-2"><div class="flex-1"><input${attr("value", params.custom_params[key2])} type="text" class="text-sm w-full bg-transparent outline-hidden outline-none"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom Parameter Value"))}/></div></div></div>`);
          }
          $$renderer3.push(`<!--]--> <button class="flex gap-2 items-center w-full text-center justify-center mt-1 mb-5" type="button"><div>`);
          Plus$1($$renderer3, {});
          $$renderer3.push(`<!----></div> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Custom Parameter"))}</div></button></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
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
    bind_props($$props, { onChange, admin, custom, params });
  });
}
function ToolServersModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let show = fallback($$props["show"], false);
    let selectedToolIds = fallback($$props["selectedToolIds"], () => [], true);
    let selectedTools = [];
    const i18n = getContext("i18n");
    selectedTools = (store_get($$store_subs ??= {}, "$tools", tools) ?? []).filter((tool) => selectedToolIds.includes(tool.id));
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-0.5"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Available Tools"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> `);
          if (selectedTools.length > 0) {
            $$renderer4.push("<!--[0-->");
            if (store_get($$store_subs ??= {}, "$toolServers", toolServers).length > 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex justify-between dark:text-gray-300 px-5 pb-1"><div class="text-base font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tools"))}</div></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <div class="px-5 pb-3 w-full flex flex-col justify-center"><div class="text-sm dark:text-gray-300 mb-1"><!--[-->`);
            const each_array = ensure_array_like(selectedTools);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let tool = each_array[$$index];
              Collapsible($$renderer4, {
                buttonClassName: "w-full mb-0.5",
                children: ($$renderer5) => {
                  $$renderer5.push(`<div class="truncate"><div class="text-sm font-medium dark:text-gray-100 text-gray-800 truncate">${escape_html(tool?.name)}</div> `);
                  if (tool?.meta?.description) {
                    $$renderer5.push("<!--[0-->");
                    $$renderer5.push(`<div class="text-xs text-gray-500">${escape_html(tool?.meta?.description)}</div>`);
                  } else {
                    $$renderer5.push("<!--[-1-->");
                  }
                  $$renderer5.push(`<!--]--></div>`);
                },
                $$slots: { default: true }
              });
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (store_get($$store_subs ??= {}, "$toolServers", toolServers).length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex justify-between dark:text-gray-300 px-5 pb-0.5"><div class="text-base font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tool Servers"))}</div></div> <div class="px-5 pb-5 w-full flex flex-col justify-center"><div class="text-xs text-gray-600 dark:text-gray-300 mb-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Open WebUI can use tools provided by any OpenAPI server."))} <br/><a class="underline" href="https://github.com/open-webui/openapi-servers" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Learn more about OpenAPI tool servers."))}</a></div> <div class="text-sm dark:text-gray-300 mb-1"><!--[-->`);
            const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$toolServers", toolServers));
            for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
              let toolServer = each_array_1[$$index_2];
              Collapsible($$renderer4, {
                buttonClassName: "w-full",
                chevron: true,
                children: ($$renderer5) => {
                  $$renderer5.push(`<div><div class="text-sm font-medium dark:text-gray-100 text-gray-800">${escape_html(toolServer?.openapi?.info?.title)} - v${escape_html(toolServer?.openapi?.info?.version)}</div> <div class="text-xs text-gray-500">${escape_html(toolServer?.openapi?.info?.description)}</div> <div class="text-xs text-gray-500">${escape_html(toolServer?.url)}</div></div>`);
                },
                $$slots: {
                  default: true,
                  content: ($$renderer5) => {
                    $$renderer5.push(`<div slot="content"><!--[-->`);
                    const each_array_2 = ensure_array_like(toolServer?.specs ?? []);
                    for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                      let tool_spec = each_array_2[$$index_1];
                      $$renderer5.push(`<div class="my-1"><div class="font-medium text-gray-800 dark:text-gray-100">${escape_html(tool_spec?.name)}</div> <div>${escape_html(tool_spec?.description)}</div></div>`);
                    }
                    $$renderer5.push(`<!--]--></div>`);
                  }
                }
              });
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
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
    bind_props($$props, { show, selectedToolIds });
  });
}
function MapSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let setViewLocation = fallback($$props["setViewLocation"], () => [51.505, -0.09], true);
    let points = fallback($$props["points"], () => [], true);
    let onClick = fallback($$props["onClick"], (e) => {
    });
    onDestroy(async () => {
    });
    $$renderer2.push(`<div class="z-10 w-full"><div class="h-96 z-10"></div></div>`);
    bind_props($$props, { setViewLocation, points, onClick });
  });
}
function InputVariablesModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let variables = fallback($$props["variables"], () => ({}), true);
    let onSave = fallback($$props["onSave"], (e) => {
    });
    let loading = true;
    let variableValues = {};
    const init = async () => {
      loading = true;
      const newValues = {};
      const keys = Object.keys(variables ?? {});
      for (const key2 of keys) {
        const variable = variables[key2];
        if (variable?.default !== void 0) {
          newValues[key2] = variable.default;
        } else {
          newValues[key2] = "";
        }
      }
      variableValues = newValues;
      loading = false;
      await tick();
      const firstInputElement = document.getElementById("input-variable-0");
      if (firstInputElement) {
        /* @__PURE__ */ console.log("Focusing first input element:", firstInputElement);
        firstInputElement.focus();
      }
    };
    if (show) {
      init();
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Input Variables"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1">`);
          if (!loading) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col gap-1"><!--[-->`);
            const each_array = ensure_array_like(Object.keys(variables));
            for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
              let variable = each_array[idx];
              const { type, ...variableAttributes } = variables[variable] ?? {};
              $$renderer4.push(`<div class="py-0.5 w-full justify-between"><div class="flex w-full justify-between mb-1.5"><div class="self-center text-xs font-medium">${escape_html(variable)} `);
              if (variables[variable]?.required ?? false) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<span class="text-gray-500">*${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("required"))}</span>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div></div> <div class="flex mt-0.5 mb-0.5 space-x-2"><div class="flex-1">`);
              if (variables[variable]?.type === "select") {
                $$renderer4.push("<!--[0-->");
                const options = variableAttributes?.options ?? [];
                const placeholder = variableAttributes?.placeholder ?? "";
                $$renderer4.select(
                  {
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    value: variableValues[variable],
                    id: `input-variable-${stringify(idx)}`
                  },
                  ($$renderer5) => {
                    if (placeholder) {
                      $$renderer5.push("<!--[0-->");
                      $$renderer5.option({ value: "", disabled: true, selected: true }, ($$renderer6) => {
                        $$renderer6.push(`${escape_html(placeholder)}`);
                      });
                    } else {
                      $$renderer5.push("<!--[-1-->");
                    }
                    $$renderer5.push(`<!--]--><!--[-->`);
                    const each_array_1 = ensure_array_like(options);
                    for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                      let option = each_array_1[$$index];
                      $$renderer5.option({ value: option, selected: option === variableValues[variable] }, ($$renderer6) => {
                        $$renderer6.push(`${escape_html(option)}`);
                      });
                    }
                    $$renderer5.push(`<!--]-->`);
                  }
                );
              } else if (variables[variable]?.type === "checkbox") {
                $$renderer4.push("<!--[1-->");
                $$renderer4.push(`<div class="flex items-center space-x-2"><div class="relative flex justify-center items-center gap-2"><input${attributes(
                  {
                    type: "checkbox",
                    checked: variableValues[variable],
                    class: "size-3.5 rounded cursor-pointer border border-gray-200 dark:border-gray-700",
                    id: `input-variable-${stringify(idx)}`,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/> <label${attr("for", `input-variable-${stringify(idx)}`)} class="text-sm">${escape_html(variables[variable]?.label ?? variable)}</label></div> <input type="text" class="flex-1 py-1 text-sm dark:text-gray-300 bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter value (true/false)"))}${attr("value", variableValues[variable])} autocomplete="off"${attr("required", variables[variable]?.required ?? false, true)}/></div>`);
              } else if (variables[variable]?.type === "color") {
                $$renderer4.push("<!--[2-->");
                $$renderer4.push(`<div class="flex items-center space-x-2"><div class="relative size-6"><input${attributes(
                  {
                    type: "color",
                    class: "size-6 rounded cursor-pointer border border-gray-200 dark:border-gray-700",
                    value: variableValues[variable],
                    id: `input-variable-${stringify(idx)}`,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/></div> <input type="text" class="flex-1 py-2 text-sm dark:text-gray-300 bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter hex color (e.g. #FF0000)"))}${attr("value", variableValues[variable])} autocomplete="off"${attr("required", variables[variable]?.required ?? false, true)}/></div>`);
              } else if (variables[variable]?.type === "date") {
                $$renderer4.push("<!--[3-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "date",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "datetime-local") {
                $$renderer4.push("<!--[4-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "datetime-local",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "email") {
                $$renderer4.push("<!--[5-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "email",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "month") {
                $$renderer4.push("<!--[6-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "month",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "number") {
                $$renderer4.push("<!--[7-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "number",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "range") {
                $$renderer4.push("<!--[8-->");
                $$renderer4.push(`<div class="flex items-center space-x-2"><div class="relative flex justify-center items-center gap-2 flex-1"><input${attributes(
                  {
                    type: "range",
                    value: variableValues[variable],
                    class: "w-full rounded-lg py-1 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    id: `input-variable-${stringify(idx)}`,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/></div> <input type="text" class="py-1 text-sm dark:text-gray-300 bg-transparent outline-hidden text-right"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter value"))}${attr("value", variableValues[variable])} autocomplete="off"${attr("required", variables[variable]?.required ?? false, true)}/></div>`);
              } else if (variables[variable]?.type === "tel") {
                $$renderer4.push("<!--[9-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "tel",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "text") {
                $$renderer4.push("<!--[10-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "text",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "time") {
                $$renderer4.push("<!--[11-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "time",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "url") {
                $$renderer4.push("<!--[12-->");
                $$renderer4.push(`<input${attributes(
                  {
                    type: "url",
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    placeholder: variables[variable]?.placeholder ?? "",
                    value: variableValues[variable],
                    autocomplete: "off",
                    id: `input-variable-${stringify(idx)}`,
                    required: variables[variable]?.required ?? false,
                    ...variableAttributes
                  },
                  void 0,
                  void 0,
                  void 0,
                  4
                )}/>`);
              } else if (variables[variable]?.type === "map") {
                $$renderer4.push("<!--[13-->");
                $$renderer4.push(`<div class="flex flex-col items-center gap-1">`);
                MapSelector($$renderer4, {
                  setViewLocation: (variableValues[variable] ?? "").includes(",") ?? false ? variableValues[variable].split(",") : null,
                  onClick: (value) => {
                    variableValues[variable] = value;
                  }
                });
                $$renderer4.push(`<!----> <input type="text" class="w-full py-1 text-left text-sm dark:text-gray-300 bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter coordinates (e.g. 51.505, -0.09)"))}${attr("value", variableValues[variable])} autocomplete="off"${attr("required", variables[variable]?.required ?? false, true)}/></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<textarea class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30"${attr("placeholder", variables[variable]?.placeholder ?? "")} autocomplete="off"${attr("id", `input-variable-${stringify(idx)}`)}${attr("required", variables[variable]?.required ?? false, true)}>`);
                const $$body = escape_html(variableValues[variable]);
                if ($$body) {
                  $$renderer4.push(`${$$body}`);
                }
                $$renderer4.push(`</textarea>`);
              }
              $$renderer4.push(`<!--]--></div></div></div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            Spinner($$renderer4, { className: "size-5" });
          }
          $$renderer4.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:hover:bg-gray-900 transition rounded-full" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"))}</button> <button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form></div></div></div>`);
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
    bind_props($$props, { show, variables, onSave });
  });
}
function Knobs($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg"${attr_class(clsx(className))} aria-hidden="true"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Valves($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let valvesSpec = fallback($$props["valvesSpec"], null);
    let valves = fallback($$props["valves"], () => ({}), true);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (valvesSpec && Object.keys(valvesSpec?.properties ?? {}).length) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(Object.keys(valvesSpec.properties));
        for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
          let property = each_array[idx];
          $$renderer3.push(`<div class="py-0.5 w-full justify-between"><div class="flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(valvesSpec.properties[property].title)} `);
          if ((valvesSpec?.required ?? []).includes(property)) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<span class="text-gray-500">*required</span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button">`);
          if ((valves[property] ?? null) === null) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<span class="ml-2 self-center">`);
            if ((valvesSpec?.required ?? []).includes(property)) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}`);
            }
            $$renderer3.push(`<!--]--></span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Custom"))}</span>`);
          }
          $$renderer3.push(`<!--]--></button></div> `);
          if ((valves[property] ?? null) !== null) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="flex mt-0.5 mb-0.5 space-x-2"><div class="flex-1">`);
            if (valvesSpec.properties[property]?.enum ?? null) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.select(
                {
                  class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                  value: valves[property]
                },
                ($$renderer4) => {
                  $$renderer4.push(`<!--[-->`);
                  const each_array_1 = ensure_array_like(valvesSpec.properties[property].enum);
                  for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                    let option = each_array_1[$$index];
                    $$renderer4.option({ value: option, selected: option === valves[property] }, ($$renderer5) => {
                      $$renderer5.push(`${escape_html(option)}`);
                    });
                  }
                  $$renderer4.push(`<!--]-->`);
                }
              );
            } else if ((valvesSpec.properties[property]?.type ?? null) === "boolean") {
              $$renderer3.push("<!--[1-->");
              $$renderer3.push(`<div class="flex justify-between items-center"><div class="text-xs text-gray-500">${escape_html(valves[property] ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"))}</div> <div class="pr-2">`);
              Switch_1($$renderer3, {
                get state() {
                  return valves[property];
                },
                set state($$value) {
                  valves[property] = $$value;
                  $$settled = false;
                }
              });
              $$renderer3.push(`<!----></div></div>`);
            } else if ((valvesSpec.properties[property]?.type ?? null) !== "string") {
              $$renderer3.push("<!--[2-->");
              $$renderer3.push(`<input class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30" type="text"${attr("placeholder", valvesSpec.properties[property].title)}${attr("value", valves[property])} autocomplete="off" required=""/>`);
            } else if (valvesSpec.properties[property]?.input ?? null) {
              $$renderer3.push("<!--[3-->");
              if (valvesSpec.properties[property]?.input?.type === "password") {
                $$renderer3.push("<!--[0-->");
                $$renderer3.push(`<div class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 border border-gray-100/30 dark:border-gray-850/30">`);
                SensitiveInput($$renderer3, {
                  id: `valve-${stringify(property)}`,
                  placeholder: valvesSpec.properties[property]?.description ?? "",
                  required: (valvesSpec?.required ?? []).includes(property),
                  get value() {
                    return valves[property];
                  },
                  set value($$value) {
                    valves[property] = $$value;
                    $$settled = false;
                  }
                });
                $$renderer3.push(`<!----></div>`);
              } else if (valvesSpec.properties[property]?.input?.type === "select" && valvesSpec.properties[property]?.input?.options) {
                $$renderer3.push("<!--[1-->");
                $$renderer3.select(
                  {
                    class: "w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30",
                    value: valves[property]
                  },
                  ($$renderer4) => {
                    $$renderer4.option({ value: "", disabled: true }, ($$renderer5) => {
                      $$renderer5.push(`${escape_html(valvesSpec.properties[property]?.description ?? store_get($$store_subs ??= {}, "$i18n", i18n).t("Select an option"))}`);
                    });
                    $$renderer4.push(`<!--[-->`);
                    const each_array_2 = ensure_array_like(valvesSpec.properties[property].input.options);
                    for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                      let option = each_array_2[$$index_1];
                      if (typeof option === "object" && option !== null) {
                        $$renderer4.push("<!--[0-->");
                        $$renderer4.option(
                          {
                            value: option.value,
                            selected: option.value === valves[property]
                          },
                          ($$renderer5) => {
                            $$renderer5.push(`${escape_html(option.label ?? option.value)}`);
                          }
                        );
                      } else {
                        $$renderer4.push("<!--[-1-->");
                        $$renderer4.option({ value: option, selected: option === valves[property] }, ($$renderer5) => {
                          $$renderer5.push(`${escape_html(option)}`);
                        });
                      }
                      $$renderer4.push(`<!--]-->`);
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                );
              } else if (valvesSpec.properties[property]?.input?.type === "color") {
                $$renderer3.push("<!--[2-->");
                $$renderer3.push(`<div class="flex items-center space-x-2"><div class="relative size-6"><input type="color" class="size-6 rounded cursor-pointer border border-gray-200 dark:border-gray-700"${attr("value", valves[property] ?? "#000000")}/></div> <input type="text" class="flex-1 rounded-lg py-2 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter hex color (e.g. #FF0000)"))}${attr("value", valves[property])} autocomplete="off" disabled=""/></div>`);
              } else if (valvesSpec.properties[property]?.input?.type === "map") {
                $$renderer3.push("<!--[3-->");
                $$renderer3.push(`<div class="flex flex-col items-center gap-1">`);
                MapSelector($$renderer3, {
                  setViewLocation: (valves[property] ?? "").includes(",") ?? false ? valves[property].split(",") : null,
                  onClick: (value) => {
                    valves[property] = value;
                  }
                });
                $$renderer3.push(`<!----> `);
                if (valves[property]) {
                  $$renderer3.push("<!--[0-->");
                  $$renderer3.push(`<input type="text" class="w-full rounded-lg py-1 text-left text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter coordinates (e.g. 51.505, -0.09)"))}${attr("value", valves[property])} autocomplete="off"/>`);
                } else {
                  $$renderer3.push("<!--[-1-->");
                }
                $$renderer3.push(`<!--]--></div>`);
              } else {
                $$renderer3.push("<!--[-1-->");
              }
              $$renderer3.push(`<!--]-->`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`<textarea class="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-hidden border border-gray-100/30 dark:border-gray-850/30"${attr("placeholder", valvesSpec.properties[property].title)} autocomplete="off" required="">`);
              const $$body = escape_html(valves[property]);
              if ($$body) {
                $$renderer3.push(`${$$body}`);
              }
              $$renderer3.push(`</textarea>`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          if ((valvesSpec.properties[property]?.description ?? null) !== null) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="text-xs text-gray-500">${escape_html(valvesSpec.properties[property].description)}</div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No valves"))}</div>`);
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
    bind_props($$props, { valvesSpec, valves });
  });
}
function ValvesModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let type = fallback($$props["type"], "tool");
    let id = fallback($$props["id"], null);
    let userValves = fallback($$props["userValves"], false);
    let saving = false;
    let loading = false;
    let valvesSpec = null;
    let valves = {};
    const initHandler = async () => {
      loading = true;
      valves = {};
      valvesSpec = null;
      try {
        if (userValves) {
          if (type === "tool") {
            valves = await getUserValvesById(localStorage.token, id);
            valvesSpec = await getUserValvesSpecById(localStorage.token, id);
          } else if (type === "function") {
            valves = await getUserValvesById$1(localStorage.token, id);
            valvesSpec = await getUserValvesSpecById$1(localStorage.token, id);
          }
        } else {
          if (type === "tool") {
            valves = await getToolValvesById(localStorage.token, id);
            valvesSpec = await getToolValvesSpecById(localStorage.token, id);
          } else if (type === "function") {
            valves = await getFunctionValvesById(localStorage.token, id);
            valvesSpec = await getFunctionValvesSpecById(localStorage.token, id);
          }
        }
        if (!valves) {
          valves = {};
        }
        if (valvesSpec) {
          for (const property in valvesSpec.properties) {
            if (valvesSpec.properties[property]?.type === "array") {
              if (valves[property] != null) {
                valves[property] = (Array.isArray(valves[property]) ? valves[property] : []).join(",");
              } else {
                valves[property] = null;
              }
            }
          }
        }
        loading = false;
      } catch (e) {
        toast.error(`Error fetching valves`);
        show = false;
      }
    };
    if (show) {
      initHandler();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Valves"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1">`);
          if (!loading) {
            $$renderer4.push("<!--[0-->");
            Valves($$renderer4, {
              valvesSpec,
              get valves() {
                return valves;
              },
              set valves($$value) {
                valves = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
            Spinner($$renderer4, { className: "size-5" });
          }
          $$renderer4.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", saving, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
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
    bind_props($$props, { show, type, id, userValves });
  });
}
function InputModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "input-modal");
    let show = fallback($$props["show"], false);
    let value = fallback($$props["value"], null);
    let inputContent = fallback($$props["inputContent"], null);
    let autocomplete = fallback($$props["autocomplete"], false);
    let generateAutoCompletion = fallback($$props["generateAutoCompletion"], null);
    let onChange = fallback($$props["onChange"], () => {
    });
    let onClose = fallback($$props["onClose"], () => {
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Drawer($$renderer3, {
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex h-full min-h-screen flex-col"><div class="sticky top-0 z-30 flex justify-between bg-white px-4.5 pt-3 pb-3 dark:bg-gray-900 dark:text-gray-100"><div class="font-primary self-center text-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Input"))}</div> <button class="self-center" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path></svg></button></div> <div class="flex w-full px-4 dark:text-gray-200 min-h-full flex-1"><div class="flex-1 w-full min-h-full">`);
          RichTextInput($$renderer4, {
            id,
            onChange: (content) => {
              value = content.md;
              inputContent = content;
              onChange(content);
            },
            json: true,
            value: inputContent?.json,
            html: inputContent?.html,
            richText: store_get($$store_subs ??= {}, "$settings", settings)?.richTextInput ?? true,
            messageInput: true,
            showFormattingToolbar: store_get($$store_subs ??= {}, "$settings", settings)?.showFormattingToolbar ?? false,
            floatingMenuPlacement: "top-start",
            insertPromptAsRichText: store_get($$store_subs ??= {}, "$settings", settings)?.insertPromptAsRichText ?? false,
            autocomplete,
            generateAutoCompletion
          });
          $$renderer4.push(`<!----></div></div></div>`);
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
      show,
      value,
      inputContent,
      autocomplete,
      generateAutoCompletion,
      onChange,
      onClose
    });
  });
}
function MessageInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(duration);
    dayjs.extend(relativeTime);
    const i18n = getContext("i18n");
    let onUpload = fallback($$props["onUpload"], (e) => {
    });
    let onChange = fallback($$props["onChange"], () => {
    });
    let createMessagePair = $$props["createMessagePair"];
    let stopResponse = $$props["stopResponse"];
    let autoScroll = fallback($$props["autoScroll"], false);
    let generating = fallback($$props["generating"], false);
    let uploadPending = fallback($$props["uploadPending"], false);
    let atSelectedModel = fallback($$props["atSelectedModel"], void 0);
    let selectedModels = $$props["selectedModels"];
    let history = $$props["history"];
    let taskIds = fallback($$props["taskIds"], null);
    let prompt = fallback($$props["prompt"], "");
    let files = fallback($$props["files"], () => [], true);
    let selectedToolIds = fallback($$props["selectedToolIds"], () => [], true);
    let selectedFilterIds = fallback($$props["selectedFilterIds"], () => [], true);
    let imageGenerationEnabled = fallback($$props["imageGenerationEnabled"], false);
    let webSearchEnabled = fallback($$props["webSearchEnabled"], false);
    let codeInterpreterEnabled = fallback($$props["codeInterpreterEnabled"], false);
    let pendingOAuthTools = fallback($$props["pendingOAuthTools"], () => [], true);
    let messageQueue = fallback($$props["messageQueue"], () => [], true);
    let onQueueSendNow = fallback($$props["onQueueSendNow"], () => {
    });
    let onQueueEdit = fallback($$props["onQueueEdit"], () => {
    });
    let onQueueDelete = fallback($$props["onQueueDelete"], () => {
    });
    let inputContent = null;
    let showInputVariablesModal = false;
    let inputVariablesModalCallback = (variableValues) => {
    };
    let inputVariables = {};
    let inputVariableValues = {};
    let showValvesModal = false;
    let selectedValvesType = "tool";
    const inputVariableHandler = async (text) => {
      inputVariables = extractInputVariables(text);
      if (Object.keys(inputVariables).length === 0) {
        return text;
      }
      showInputVariablesModal = true;
      return await new Promise((resolve) => {
        inputVariablesModalCallback = (variableValues) => {
          inputVariableValues = { ...inputVariableValues, ...variableValues };
          replaceVariables(inputVariableValues);
          showInputVariablesModal = false;
          resolve(text);
        };
      });
    };
    const textVariableHandler = async (text) => {
      if (text.includes("{{CLIPBOARD}}")) {
        const clipboardText = await navigator.clipboard.readText().catch((err) => {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to read clipboard contents"));
          return "{{CLIPBOARD}}";
        });
        const clipboardItems = await navigator.clipboard.read().catch((err) => {
          /* @__PURE__ */ console.error("Failed to read clipboard items:", err);
          return [];
        });
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              const file = new File([blob], `clipboard-image.${type.split("/")[1]}`, { type });
              inputFilesHandler([file]);
            }
          }
        }
        text = text.replaceAll("{{CLIPBOARD}}", clipboardText.replaceAll("\r\n", "\n"));
      }
      if (text.includes("{{USER_LOCATION}}")) {
        let location;
        try {
          location = await getUserPosition();
        } catch (error) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Location access not allowed"));
          location = "LOCATION_UNKNOWN";
        }
        text = text.replaceAll("{{USER_LOCATION}}", String(location));
      }
      const sessionUser = await getSessionUser(localStorage.token);
      if (text.includes("{{USER_NAME}}")) {
        const name = sessionUser?.name || "User";
        text = text.replaceAll("{{USER_NAME}}", name);
      }
      if (text.includes("{{USER_EMAIL}}")) {
        const email = sessionUser?.email || "";
        if (email) {
          text = text.replaceAll("{{USER_EMAIL}}", email);
        }
      }
      if (text.includes("{{USER_BIO}}")) {
        const bio = sessionUser?.bio || "";
        if (bio) {
          text = text.replaceAll("{{USER_BIO}}", bio);
        }
      }
      if (text.includes("{{USER_GENDER}}")) {
        const gender = sessionUser?.gender || "";
        if (gender) {
          text = text.replaceAll("{{USER_GENDER}}", gender);
        }
      }
      if (text.includes("{{USER_BIRTH_DATE}}")) {
        const birthDate = sessionUser?.date_of_birth || "";
        if (birthDate) {
          text = text.replaceAll("{{USER_BIRTH_DATE}}", birthDate);
        }
      }
      if (text.includes("{{USER_AGE}}")) {
        const birthDate = sessionUser?.date_of_birth || "";
        if (birthDate) {
          const age = getAge(birthDate);
          text = text.replaceAll("{{USER_AGE}}", age);
        }
      }
      if (text.includes("{{USER_LANGUAGE}}")) {
        const language = localStorage.getItem("locale") || "en-US";
        text = text.replaceAll("{{USER_LANGUAGE}}", language);
      }
      if (text.includes("{{CURRENT_DATE}}")) {
        const date = getFormattedDate();
        text = text.replaceAll("{{CURRENT_DATE}}", date);
      }
      if (text.includes("{{CURRENT_TIME}}")) {
        const time = getFormattedTime();
        text = text.replaceAll("{{CURRENT_TIME}}", time);
      }
      if (text.includes("{{CURRENT_DATETIME}}")) {
        const dateTime = getCurrentDateTime();
        text = text.replaceAll("{{CURRENT_DATETIME}}", dateTime);
      }
      if (text.includes("{{CURRENT_TIMEZONE}}")) {
        const timezone = getUserTimezone();
        text = text.replaceAll("{{CURRENT_TIMEZONE}}", timezone);
      }
      if (text.includes("{{CURRENT_WEEKDAY}}")) {
        const weekday = getWeekday();
        text = text.replaceAll("{{CURRENT_WEEKDAY}}", weekday);
      }
      return text;
    };
    const replaceVariables = (variables) => {
      /* @__PURE__ */ console.log("Replacing variables:", variables);
      const chatInput = document.getElementById("chat-input");
      if (chatInput) {
        chatInputElement.replaceVariables(variables);
        chatInputElement.focus();
      }
    };
    const setText = async (text, cb) => {
      const chatInput = document.getElementById("chat-input");
      if (chatInput) {
        if (text !== "") {
          text = await textVariableHandler(text || "");
        }
        if (text !== "") {
          text = await inputVariableHandler(text);
        }
        await tick();
        if (cb) await cb(text);
      }
    };
    let command = "";
    let showCommands = fallback($$props["showCommands"], false);
    let showTools = false;
    let chatInputElement;
    let showInputModal = false;
    let dragged = fallback($$props["dragged"], false);
    let placeholder = fallback($$props["placeholder"], "");
    let visionCapableModels = [];
    let fileUploadCapableModels = [];
    let webSearchCapableModels = [];
    let imageGenerationCapableModels = [];
    let codeInterpreterCapableModels = [];
    const uploadFileHandler = async (file, process = true, itemData = {}) => {
      if (store_get($$store_subs ??= {}, "$_user", user)?.role !== "admin" && !(store_get($$store_subs ??= {}, "$_user", user)?.permissions?.chat?.file_upload ?? true)) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("You do not have permission to upload files."));
        return null;
      }
      if (fileUploadCapableModels.length !== selectedModels.length) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model(s) do not support file upload"));
        return null;
      }
      const tempItemId = v4();
      const fileItem = {
        type: "file",
        file: "",
        id: null,
        url: "",
        name: file.name,
        collection_name: "",
        status: "uploading",
        size: file.size,
        error: "",
        itemId: tempItemId,
        ...itemData
      };
      if (fileItem.size == 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("You cannot upload an empty file."));
        return null;
      }
      files = [...files, fileItem];
      if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        try {
          let metadata = null;
          if ((file.type.startsWith("audio/") || file.type.startsWith("video/")) && store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language) {
            metadata = {
              language: store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language
            };
          }
          const uploadedFile = await uploadFile(localStorage.token, file, metadata, process);
          if (uploadedFile) {
            /* @__PURE__ */ console.log("File upload completed:", {
              id: uploadedFile.id,
              name: fileItem.name,
              collection: uploadedFile?.meta?.collection_name
            });
            if (uploadedFile.error) {
              console.warn("File upload warning:", uploadedFile.error);
              toast.warning(uploadedFile.error);
            }
            fileItem.status = "uploaded";
            fileItem.file = uploadedFile;
            fileItem.id = uploadedFile.id;
            fileItem.collection_name = uploadedFile?.meta?.collection_name || uploadedFile?.collection_name;
            fileItem.content_type = uploadedFile.meta?.content_type || uploadedFile.content_type;
            fileItem.url = `${uploadedFile.id}`;
            files = files;
          } else {
            files = files.filter((item) => item?.itemId !== tempItemId);
          }
        } catch (e) {
          toast.error(`${e}`);
          files = files.filter((item) => item?.itemId !== tempItemId);
        }
      } else {
        const content = await extractContentFromFile(file).catch((error) => {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to extract content from the file: {{error}}", { error }));
          return null;
        });
        if (content === null) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to extract content from the file."));
          files = files.filter((item) => item?.itemId !== tempItemId);
          return null;
        } else {
          /* @__PURE__ */ console.log("Extracted content from file:", { name: file.name, size: file.size, content });
          fileItem.status = "uploaded";
          fileItem.type = "text";
          fileItem.content = content;
          fileItem.id = v4();
          files = files;
        }
      }
    };
    const inputFilesHandler = async (inputFiles) => {
      /* @__PURE__ */ console.log("Input files handler called with:", inputFiles);
      if ((store_get($$store_subs ??= {}, "$config", config)?.file?.max_count ?? null) !== null && files.length + inputFiles.length > store_get($$store_subs ??= {}, "$config", config)?.file?.max_count) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`You can only chat with a maximum of {{maxCount}} file(s) at a time.`, {
          maxCount: store_get($$store_subs ??= {}, "$config", config)?.file?.max_count
        }));
        return;
      }
      inputFiles.forEach(async (file) => {
        /* @__PURE__ */ console.log("Processing file:", {
          name: file.name,
          type: file.type,
          size: file.size,
          extension: file.name.split(".").at(-1)
        });
        if ((store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? null) !== null && file.size > (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024) {
          /* @__PURE__ */ console.log("File exceeds max size limit:", {
            fileSize: file.size,
            maxSize: (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024
          });
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`File size should not exceed {{maxSize}} MB.`, {
            maxSize: store_get($$store_subs ??= {}, "$config", config)?.file?.max_size
          }));
          return;
        }
        if (file["type"].startsWith("image/")) {
          if (visionCapableModels.length === 0) {
            toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Selected model(s) do not support image inputs"));
            return;
          }
          const compressImageHandler = async (imageUrl, settings2 = {}, config2 = {}) => {
            const settingsCompression = settings2?.imageCompression ?? false;
            const configWidth = config2?.file?.image_compression?.width ?? null;
            const configHeight = config2?.file?.image_compression?.height ?? null;
            if (!settingsCompression && !configWidth && !configHeight) {
              return imageUrl;
            }
            let width = null;
            let height = null;
            if (settingsCompression) {
              width = settings2?.imageCompressionSize?.width ?? null;
              height = settings2?.imageCompressionSize?.height ?? null;
            }
            if (configWidth && (width === null || width > configWidth)) {
              width = configWidth;
            }
            if (configHeight && (height === null || height > configHeight)) {
              height = configHeight;
            }
            if (width || height) {
              return await compressImage(imageUrl, width, height);
            }
            return imageUrl;
          };
          let reader = new FileReader();
          reader.onload = async (event) => {
            let imageUrl = event.target.result;
            imageUrl = await compressImageHandler(imageUrl, store_get($$store_subs ??= {}, "$settings", settings), store_get($$store_subs ??= {}, "$config", config));
            if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
              files = [...files, { type: "image", url: imageUrl }];
            } else {
              const blob = await (await fetch(imageUrl)).blob();
              const compressedFile = new File([blob], file.name, { type: file.type });
              uploadFileHandler(compressedFile, false);
            }
          };
          reader.readAsDataURL(file["type"] === "image/heic" ? await convertHeicToJpeg(file) : file);
        } else {
          uploadFileHandler(file);
        }
      });
    };
    atSelectedModel !== void 0 ? [atSelectedModel.id] : selectedModels;
    if (store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId) && codeInterpreterEnabled) {
      codeInterpreterEnabled = false;
    }
    onChange({
      prompt,
      files: files.filter((file) => file.type !== "image").map((file) => {
        return { ...file, user: void 0, access_grants: void 0 };
      }),
      selectedToolIds,
      selectedFilterIds,
      imageGenerationEnabled,
      webSearchEnabled,
      codeInterpreterEnabled
    });
    showCommands = ["/", "#", "@", "$"].includes(command?.charAt(0)) || "\\#" === command?.slice(0, 2);
    visionCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.vision ?? true);
    fileUploadCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.file_upload ?? true);
    webSearchCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.web_search ?? true);
    imageGenerationCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.image_generation ?? true);
    codeInterpreterCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.code_interpreter ?? true);
    (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).map((id) => (store_get($$store_subs ??= {}, "$models", models).find((model) => model.id === id) || {})?.filters ?? []).reduce((acc, filters) => acc.filter((f1) => filters.some((f2) => f2.id === f1.id)));
    (store_get($$store_subs ??= {}, "$tools", tools) ?? []).length > 0 || (store_get($$store_subs ??= {}, "$toolServers", toolServers) ?? []).length > 0;
    (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).length === webSearchCapableModels.length && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_web_search && (store_get($$store_subs ??= {}, "$_user", user).role === "admin" || store_get($$store_subs ??= {}, "$_user", user)?.permissions?.features?.web_search);
    (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).length === imageGenerationCapableModels.length && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_image_generation && (store_get($$store_subs ??= {}, "$_user", user).role === "admin" || store_get($$store_subs ??= {}, "$_user", user)?.permissions?.features?.image_generation);
    !store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId) && (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).length === codeInterpreterCapableModels.length && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_code_interpreter && (store_get($$store_subs ??= {}, "$_user", user).role === "admin" || store_get($$store_subs ??= {}, "$_user", user)?.permissions?.features?.code_interpreter);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ToolServersModal($$renderer3, {
        selectedToolIds,
        get show() {
          return showTools;
        },
        set show($$value) {
          showTools = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      InputVariablesModal($$renderer3, {
        variables: inputVariables,
        onSave: inputVariablesModalCallback,
        get show() {
          return showInputVariablesModal;
        },
        set show($$value) {
          showInputVariablesModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ValvesModal($$renderer3, {
        userValves: true,
        type: selectedValvesType,
        id: null,
        get show() {
          return showValvesModal;
        },
        set show($$value) {
          showValvesModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      InputModal($$renderer3, {
        onChange: (content) => {
          /* @__PURE__ */ console.log(content);
        },
        onClose: async () => {
          await tick();
        },
        get show() {
          return showInputModal;
        },
        set show($$value) {
          showInputModal = $$value;
          $$settled = false;
        },
        get value() {
          return prompt;
        },
        set value($$value) {
          prompt = $$value;
          $$settled = false;
        },
        get inputContent() {
          return inputContent;
        },
        set inputContent($$value) {
          inputContent = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
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
    bind_props($$props, {
      onUpload,
      onChange,
      createMessagePair,
      stopResponse,
      autoScroll,
      generating,
      uploadPending,
      atSelectedModel,
      selectedModels,
      history,
      taskIds,
      prompt,
      files,
      selectedToolIds,
      selectedFilterIds,
      imageGenerationEnabled,
      webSearchEnabled,
      codeInterpreterEnabled,
      pendingOAuthTools,
      messageQueue,
      onQueueSendNow,
      onQueueEdit,
      onQueueDelete,
      showCommands,
      dragged,
      placeholder,
      setText
    });
  });
}
function ModelSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let selectedModels = fallback($$props["selectedModels"], () => [""], true);
    let disabled = fallback($$props["disabled"], false);
    let showSetDefault = fallback($$props["showSetDefault"], true);
    const pinModelHandler = async (modelId) => {
      let pinnedModels = store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? [];
      if (pinnedModels.includes(modelId)) {
        pinnedModels = pinnedModels.filter((id) => id !== modelId);
      } else {
        pinnedModels = [.../* @__PURE__ */ new Set([...pinnedModels, modelId])];
      }
      settings.set({
        ...store_get($$store_subs ??= {}, "$settings", settings),
        pinnedModels
      });
      await updateUserSettings(localStorage.token, { ui: store_get($$store_subs ??= {}, "$settings", settings) });
    };
    if (selectedModels.length > 0 && store_get($$store_subs ??= {}, "$models", models).length > 0) {
      const _selectedModels = selectedModels.map((model) => store_get($$store_subs ??= {}, "$models", models).map((m) => m.id).includes(model) ? model : "");
      if (JSON.stringify(_selectedModels) !== JSON.stringify(selectedModels)) {
        selectedModels = _selectedModels;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col w-full items-start"><!--[-->`);
      const each_array = ensure_array_like(selectedModels);
      for (let selectedModelIdx = 0, $$length = each_array.length; selectedModelIdx < $$length; selectedModelIdx++) {
        let selectedModel = each_array[selectedModelIdx];
        $$renderer3.push(`<div class="flex w-full max-w-fit"><div class="overflow-hidden w-full"><div${attr_class(`max-w-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "m-1" : "mr-1")}`)}>`);
        Selector($$renderer3, {
          id: `${selectedModelIdx}`,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"),
          items: store_get($$store_subs ??= {}, "$models", models).map((model) => ({ value: model.id, label: model.name, model })),
          pinModelHandler,
          get value() {
            return selectedModel;
          },
          set value($$value) {
            selectedModel = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div></div> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.multiple_models ?? true)) {
          $$renderer3.push("<!--[0-->");
          if (selectedModelIdx === 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">`);
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Model"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button${attr("disabled", disabled, true)} aria-label="Add Model"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path></svg></button>`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div class="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">`);
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove Model"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button${attr("disabled", disabled, true)} aria-label="Remove Model"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15"></path></svg></button>`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      if (showSetDefault) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="relative text-left mt-[1px] ml-1 text-[0.7rem] text-gray-600 dark:text-gray-400 font-primary"><button>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Set as default"))}</button></div>`);
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
    bind_props($$props, { selectedModels, disabled, showSetDefault });
  });
}
function Menu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let shareEnabled = fallback($$props["shareEnabled"], false);
    let shareHandler = $$props["shareHandler"];
    let moveChatHandler = $$props["moveChatHandler"];
    let archiveChatHandler = $$props["archiveChatHandler"];
    let chat = $$props["chat"];
    let onClose = fallback($$props["onClose"], () => {
    });
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Dropdown($$renderer2, {
      onOpenChange: (state) => {
        if (state === false) {
          onClose();
        }
      },
      align: "end",
      sideOffset: 8,
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        slot($$renderer3, $$props, "default", {}, null);
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: {
        default: true,
        content: ($$renderer3) => {
          $$renderer3.push(`<div slot="content"><div class="select-none min-w-[200px] max-w-[200px] rounded-2xl px-1 py-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg transition">`);
          if ((store_get($$store_subs ??= {}, "$artifactContents", artifactContents) ?? []).length > 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full" id="chat-artifacts-button">`);
            Cube($$renderer3, { className: " size-4", strokeWidth: "1.5" });
            $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Artifacts"))}</div></button> <hr class="border-gray-50/30 dark:border-gray-800/30 my-1"/>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user).permissions?.chat?.share ?? true))) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full" id="chat-share-button">`);
            Share($$renderer3, { strokeWidth: "1.5" });
            $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share"))}</div></button>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          DropdownSub($$renderer3, {
            children: ($$renderer4) => {
              if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user).permissions?.chat?.export ?? true)) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export chat (.json)"))}</div></button>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Plain text (.txt)"))}</div></button> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("PDF document (.pdf)"))}</div></button>`);
            },
            $$slots: {
              default: true,
              trigger: ($$renderer4) => {
                $$renderer4.push(`<button slot="trigger" draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full">`);
                Download($$renderer4, { strokeWidth: "1.5" });
                $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}</div></button>`);
              }
            }
          });
          $$renderer3.push(`<!----> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full" id="chat-copy-button">`);
          Clipboard($$renderer3, { className: " size-4", strokeWidth: "1.5" });
          $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"))}</div></button> `);
          if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && chat?.id) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<hr class="border-gray-50/30 dark:border-gray-800/30 my-1"/> `);
            if (store_get($$store_subs ??= {}, "$folders", folders$1).length > 0) {
              $$renderer3.push("<!--[0-->");
              DropdownSub($$renderer3, {
                maxWidth: 200,
                children: ($$renderer4) => {
                  $$renderer4.push(`<!--[-->`);
                  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$folders", folders$1).sort((a, b) => b.updated_at - a.updated_at));
                  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                    let folder = each_array[$$index];
                    if (folder?.id) {
                      $$renderer4.push("<!--[0-->");
                      $$renderer4.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl overflow-hidden w-full"><div class="shrink-0">`);
                      Folder($$renderer4, { strokeWidth: "1.5" });
                      $$renderer4.push(`<!----></div> <div class="truncate">${escape_html(folder.name ?? "Folder")}</div></button>`);
                    } else {
                      $$renderer4.push("<!--[-1-->");
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                  $$renderer4.push(`<!--]-->`);
                },
                $$slots: {
                  default: true,
                  trigger: ($$renderer4) => {
                    $$renderer4.push(`<button slot="trigger" draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full">`);
                    Folder($$renderer4, { strokeWidth: "1.5" });
                    $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Move"))}</div></button>`);
                  }
                }
              });
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full">`);
            ArchiveBox($$renderer3, { className: "size-4", strokeWidth: "1.5" });
            $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Archive"))}</div></button> <hr class="border-gray-50/30 dark:border-gray-800/30 my-1"/> <div class="flex p-1">`);
            Tags_1($$renderer3, { chatId: chat.id });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
      }
    });
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      shareEnabled,
      shareHandler,
      moveChatHandler,
      archiveChatHandler,
      chat,
      onClose
    });
  });
}
function ChatBubbleDotted($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.5 3.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ChatBubbleDottedChecked($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M8 12L11 15L16 10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.5 3.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ChatPlus($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M9 12H12M15 12H12M12 12V9M12 12V15" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ChatCheck($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M8 12L11 15L16 10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let initNewChat = $$props["initNewChat"];
    let shareEnabled = fallback($$props["shareEnabled"], false);
    let scrollTop = fallback($$props["scrollTop"], 0);
    let chat = $$props["chat"];
    let history = $$props["history"];
    let selectedModels = $$props["selectedModels"];
    let showModelSelector = fallback($$props["showModelSelector"], true);
    let onSaveTempChat = $$props["onSaveTempChat"];
    let archiveChatHandler = $$props["archiveChatHandler"];
    let moveChatHandler = $$props["moveChatHandler"];
    let closedBannerIds = [];
    let showShareChatModal = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ShareChatModal($$renderer3, {
        chatId: store_get($$store_subs ??= {}, "$chatId", chatId),
        get show() {
          return showShareChatModal;
        },
        set show($$value) {
          showShareChatModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <button id="new-chat-button" class="hidden" aria-label="New Chat"></button> <nav${attr_class(`sticky top-0 z-30 w-full ${stringify(chat?.id ? "pt-0.5 pb-1" : "pt-1 pb-1")} -mb-12 flex flex-col items-center drag-region`)}><div class="flex items-center w-full pl-1.5 pr-1"><div id="navbar-bg-gradient-to-b"${attr_class(`${stringify(chat?.id ? "visible" : "invisible")} bg-linear-to-b via-40% to-97% from-white/90 via-white/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/50 dark:to-transparent pointer-events-none absolute inset-0 -bottom-10 z-[-1]`)}></div> <div class="flex max-w-full w-full mx-auto px-1.5 md:px-2 pt-0.5 bg-transparent"><div class="flex items-center w-full max-w-full">`);
      if (store_get($$store_subs ??= {}, "$mobile", mobile) && !store_get($$store_subs ??= {}, "$showSidebar", showSidebar)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="-translate-x-0.5 mr-1 mt-1 self-start flex flex-none items-center text-gray-600 dark:text-gray-400">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"><div class="self-center p-1.5">`);
            Sidebar($$renderer4, {});
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div${attr_class(`flex-1 overflow-hidden max-w-full mt-0.5 py-0.5 ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "ml-1" : "")} `)}>`);
      if (showModelSelector) {
        $$renderer3.push("<!--[0-->");
        ModelSelector($$renderer3, {
          showSetDefault: !shareEnabled,
          get selectedModels() {
            return selectedModels;
          },
          set selectedModels($$value) {
            selectedModels = $$value;
            $$settled = false;
          }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">`);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "user" ? (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.temporary ?? true) && !(store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.temporary_enforced ?? false) : true) {
        $$renderer3.push("<!--[0-->");
        if (!chat?.id) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Temporary Chat`),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition" id="temporary-chat-button"><div class="m-auto self-center">`);
              if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
                $$renderer4.push("<!--[0-->");
                ChatBubbleDottedChecked($$renderer4, { className: " size-4.5", strokeWidth: "1.5" });
              } else {
                $$renderer4.push("<!--[-1-->");
                ChatBubbleDotted($$renderer4, { className: " size-4.5", strokeWidth: "1.5" });
              }
              $$renderer4.push(`<!--]--></div></button>`);
            },
            $$slots: { default: true }
          });
        } else if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
          $$renderer3.push("<!--[1-->");
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Save Chat`),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition" id="save-temporary-chat-button"><div class="m-auto self-center">`);
              ChatCheck($$renderer4, { className: " size-4.5", strokeWidth: "1.5" });
              $$renderer4.push(`<!----></div></button>`);
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
      if (store_get($$store_subs ??= {}, "$mobile", mobile) && !store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && chat && chat.id) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button${attr_class(` flex ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "md:hidden" : "")} cursor-pointer px-2 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition`)} aria-label="New Chat"><div class="m-auto self-center">`);
            ChatPlus($$renderer4, { className: " size-4.5", strokeWidth: "1.5" });
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (shareEnabled && chat && (chat.id || store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled))) {
        $$renderer3.push("<!--[0-->");
        Menu($$renderer3, {
          chat,
          shareEnabled,
          shareHandler: () => {
            showShareChatModal = !showShareChatModal;
          },
          archiveChatHandler: () => {
            archiveChatHandler(chat.id);
          },
          moveChatHandler,
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition" id="chat-context-menu-button"><div class="m-auto self-center">`);
            EllipsisHorizontal($$renderer4, { className: " size-5", strokeWidth: "1.5" });
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.controls ?? true)) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Controls"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition" aria-label="Controls"><div class="m-auto self-center">`);
            Knobs($$renderer4, { className: " size-5", strokeWidth: "1" });
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$user", user) !== void 0 && store_get($$store_subs ??= {}, "$user", user) !== null) {
        $$renderer3.push("<!--[0-->");
        UserMenu($$renderer3, {
          className: "w-[240px]",
          role: store_get($$store_subs ??= {}, "$user", user)?.role,
          help: true,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition"><div class="self-center"><span class="sr-only">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("User menu"))}</span> <img${attr("src", `${WEBUI_API_BASE_URL}/users/${store_get($$store_subs ??= {}, "$user", user)?.id}/profile/image`)} class="size-6 object-cover rounded-full" alt="" draggable="false"/></div></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></div></div></div> `);
      if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && (store_get($$store_subs ??= {}, "$chatId", chatId) ?? "").startsWith("local:")) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="w-full z-30 text-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Temporary Chat"))}</div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="absolute top-[100%] left-0 right-0 h-fit">`);
      if (!history.currentId && !store_get($$store_subs ??= {}, "$chatId", chatId) && (store_get($$store_subs ??= {}, "$banners", banners).length > 0 || (store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.type ?? null) === "trial" || (store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats ?? null) !== null && store_get($$store_subs ??= {}, "$config", config)?.user_count > store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="w-full z-30"><div class="flex flex-col gap-1 w-full">`);
        if ((store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.type ?? null) === "trial") {
          $$renderer3.push("<!--[0-->");
          Banner($$renderer3, {
            banner: {
              type: "info",
              title: "Trial License",
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("You are currently using a trial license. Please contact support to upgrade your license.")
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if ((store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats ?? null) !== null && store_get($$store_subs ??= {}, "$config", config)?.user_count > store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats) {
          $$renderer3.push("<!--[0-->");
          Banner($$renderer3, {
            banner: {
              type: "error",
              title: "License Error",
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Exceeded the number of seats in your license. Please contact support to increase the number of seats.")
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$banners", banners).filter((b) => ![
          ...JSON.parse(localStorage.getItem("dismissedBannerIds") ?? "[]"),
          ...closedBannerIds
        ].includes(b.id)));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let banner = each_array[$$index];
          Banner($$renderer3, { banner });
        }
        $$renderer3.push(`<!--]--></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></nav>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      initNewChat,
      shareEnabled,
      scrollTop,
      chat,
      history,
      selectedModels,
      showModelSelector,
      onSaveTempChat,
      archiveChatHandler,
      moveChatHandler
    });
  });
}
function Handle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isTarget, isConnectable, handleId, connectionInProcess, connectingFrom, connectingTo, isPossibleEndHandle, valid;
    let id = fallback($$props["id"], void 0);
    let type = fallback($$props["type"], "source");
    let position = fallback($$props["position"], () => Position.Top, true);
    let style = fallback($$props["style"], void 0);
    let isValidConnection = fallback($$props["isValidConnection"], void 0);
    let onconnect = fallback($$props["onconnect"], void 0);
    let ondisconnect = fallback($$props["ondisconnect"], void 0);
    let isConnectableProp = fallback($$props["isConnectable"], void 0);
    let className = fallback($$props["class"], void 0);
    const nodeId = getContext("svelteflow__node_id");
    const connectable = getContext("svelteflow__node_connectable");
    const store = useStore();
    const {
      connectionMode,
      domNode,
      nodeLookup,
      connectionRadius,
      viewport,
      isValidConnection: isValidConnectionStore,
      lib,
      addEdge: addEdge2,
      onedgecreate,
      panBy: panBy2,
      cancelConnection,
      updateConnection,
      autoPanOnConnect,
      edges,
      connectionLookup,
      onconnect: onConnectAction,
      onconnectstart: onConnectStartAction,
      onconnectend: onConnectEndAction,
      flowId,
      connection
    } = store;
    let prevConnections = null;
    let connections;
    isTarget = type === "target";
    isConnectable = isConnectableProp !== void 0 ? isConnectableProp : store_get($$store_subs ??= {}, "$connectable", connectable);
    handleId = id || null;
    if (onconnect || ondisconnect) {
      store_get($$store_subs ??= {}, "$edges", edges);
      connections = store_get($$store_subs ??= {}, "$connectionLookup", connectionLookup).get(`${nodeId}-${type}${id ? `-${id}` : ""}`);
    }
    {
      if (prevConnections && !areConnectionMapsEqual(connections, prevConnections)) {
        const _connections = connections ?? /* @__PURE__ */ new Map();
        handleConnectionChange(prevConnections, _connections, ondisconnect);
        handleConnectionChange(_connections, prevConnections, onconnect);
      }
      prevConnections = connections ?? /* @__PURE__ */ new Map();
    }
    connectionInProcess = !!store_get($$store_subs ??= {}, "$connection", connection).fromHandle;
    connectingFrom = store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.nodeId === nodeId && store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.type === type && store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.id === handleId;
    connectingTo = store_get($$store_subs ??= {}, "$connection", connection).toHandle?.nodeId === nodeId && store_get($$store_subs ??= {}, "$connection", connection).toHandle?.type === type && store_get($$store_subs ??= {}, "$connection", connection).toHandle?.id === handleId;
    isPossibleEndHandle = store_get($$store_subs ??= {}, "$connectionMode", connectionMode) === ConnectionMode.Strict ? store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.type !== type : nodeId !== store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.nodeId || handleId !== store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.id;
    valid = connectingTo && store_get($$store_subs ??= {}, "$connection", connection).isValid;
    $$renderer2.push(`<div${attr("data-handleid", handleId)}${attr("data-nodeid", nodeId)}${attr("data-handlepos", position)}${attr("data-id", `${stringify(store_get($$store_subs ??= {}, "$flowId", flowId))}-${stringify(nodeId)}-${stringify(id || null)}-${stringify(type)}`)}${attr_class(
      clsx(cc([
        "svelte-flow__handle",
        `svelte-flow__handle-${position}`,
        "nodrag",
        "nopan",
        position,
        className
      ])),
      void 0,
      {
        "valid": valid,
        "connectingto": connectingTo,
        "connectingfrom": connectingFrom,
        "source": !isTarget,
        "target": isTarget,
        "connectablestart": isConnectable,
        "connectableend": isConnectable,
        "connectable": isConnectable,
        "connectionindicator": isConnectable && (!connectionInProcess || isPossibleEndHandle)
      }
    )}${attr_style(style)} role="button" tabindex="-1"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      type,
      position,
      style,
      isValidConnection,
      onconnect,
      ondisconnect,
      isConnectable: isConnectableProp,
      class: className
    });
  });
}
function DefaultNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "targetPosition", "sourcePosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    Handle($$renderer2, { type: "target", position: targetPosition ?? Position.Top });
    $$renderer2.push(`<!----> ${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "source", position: sourcePosition ?? Position.Bottom });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, targetPosition, sourcePosition });
  });
}
function InputNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "sourcePosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    $$renderer2.push(`<!---->${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "source", position: sourcePosition ?? Position.Bottom });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, sourcePosition });
  });
}
function OutputNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "targetPosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    $$renderer2.push(`<!---->${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "target", position: targetPosition ?? Position.Top });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, targetPosition });
  });
}
function GroupNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, []);
}
function EdgeLabelRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { domNode } = useStore();
    $$renderer2.push(`<div><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
  });
}
function useHandleEdgeSelect() {
  const { edgeLookup, selectionRect, selectionRectMode, multiselectionKeyPressed, addSelectedEdges, unselectNodesAndEdges, elementsSelectable } = useStore();
  return (id) => {
    const edge = get(edgeLookup).get(id);
    if (!edge) {
      console.warn("012", errorMessages["error012"](id));
      return;
    }
    const selectable = edge.selectable || get(elementsSelectable) && typeof edge.selectable === "undefined";
    if (selectable) {
      selectionRect.set(null);
      selectionRectMode.set(null);
      if (!edge.selected) {
        addSelectedEdges([id]);
      } else if (edge.selected && get(multiselectionKeyPressed)) {
        unselectNodesAndEdges({ nodes: [], edges: [edge] });
      }
    }
  };
}
function EdgeLabel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let style = fallback($$props["style"], void 0);
    let x = fallback($$props["x"], void 0);
    let y = fallback($$props["y"], void 0);
    useHandleEdgeSelect();
    getContext("svelteflow__edge_id");
    EdgeLabelRenderer($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="svelte-flow__edge-label"${attr_style("pointer-events: all;" + style, {
          transform: `translate(-50%, -50%) translate(${stringify(x)}px,${stringify(y)}px)`
        })} role="button" tabindex="-1"><!--[-->`);
        slot($$renderer3, $$props, "default", {}, null);
        $$renderer3.push(`<!--]--></div>`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, { style, x, y });
  });
}
function BaseEdge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = fallback($$props["id"], void 0);
    let path = $$props["path"];
    let label = fallback($$props["label"], void 0);
    let labelX = fallback($$props["labelX"], void 0);
    let labelY = fallback($$props["labelY"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let style = fallback($$props["style"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], 20);
    let className = fallback($$props["class"], void 0);
    let interactionWidthValue = interactionWidth === void 0 ? 20 : interactionWidth;
    $$renderer2.push(`<path${attr("id", id)}${attr("d", path)}${attr_class(clsx(cc(["svelte-flow__edge-path", className])))}${attr("marker-start", markerStart)}${attr("marker-end", markerEnd)} fill="none"${attr_style(style)}></path>`);
    if (interactionWidthValue) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<path${attr("d", path)}${attr("stroke-opacity", 0)}${attr("stroke-width", interactionWidthValue)} fill="none" class="svelte-flow__edge-interaction"></path>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if (label) {
      $$renderer2.push("<!--[0-->");
      EdgeLabel($$renderer2, {
        x: labelX,
        y: labelY,
        style: labelStyle,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(label)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      id,
      path,
      label,
      labelX,
      labelY,
      labelStyle,
      markerStart,
      markerEnd,
      style,
      interactionWidth,
      class: className
    });
  });
}
function BezierEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function SmoothStepEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function StraightEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "targetX",
    "targetY"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      targetX,
      targetY
    });
  });
}
function StepEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 0
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function syncNodeStores(nodesStore, userNodesStore) {
  const nodesStoreSetter = nodesStore.set;
  const userNodesStoreSetter = userNodesStore.set;
  const currentNodesStore = get(nodesStore);
  const currentUserNodesStore = get(userNodesStore);
  const initWithUserNodes = currentNodesStore.length === 0 && currentUserNodesStore.length > 0;
  let val = initWithUserNodes ? currentUserNodesStore : currentNodesStore;
  nodesStore.set(val);
  const _set = (nds) => {
    const updatedNodes = nodesStoreSetter(nds);
    val = updatedNodes;
    userNodesStoreSetter(val);
    return updatedNodes;
  };
  nodesStore.set = userNodesStore.set = _set;
  nodesStore.update = userNodesStore.update = (fn) => _set(fn(val));
}
function syncEdgeStores(edgesStore, userEdgesStore) {
  const nodesStoreSetter = edgesStore.set;
  const userEdgesStoreSetter = userEdgesStore.set;
  let val = get(userEdgesStore);
  edgesStore.set(val);
  const _set = (eds) => {
    nodesStoreSetter(eds);
    userEdgesStoreSetter(eds);
    val = eds;
  };
  edgesStore.set = userEdgesStore.set = _set;
  edgesStore.update = userEdgesStore.update = (fn) => _set(fn(val));
}
const syncViewportStores = (panZoomStore, viewportStore, userViewportStore) => {
  if (!userViewportStore) {
    return;
  }
  const panZoom = get(panZoomStore);
  const viewportStoreSetter = viewportStore.set;
  const userViewportStoreSetter = userViewportStore.set;
  let val = userViewportStore ? get(userViewportStore) : { x: 0, y: 0, zoom: 1 };
  viewportStore.set(val);
  viewportStore.set = (vp) => {
    viewportStoreSetter(vp);
    userViewportStoreSetter(vp);
    val = vp;
    return vp;
  };
  userViewportStore.set = (vp) => {
    panZoom?.syncViewport(vp);
    viewportStoreSetter(vp);
    userViewportStoreSetter(vp);
    val = vp;
    return vp;
  };
  viewportStore.update = (fn) => {
    viewportStore.set(fn(val));
  };
  userViewportStore.update = (fn) => {
    userViewportStore.set(fn(val));
  };
};
const createNodesStore = (nodes, nodeLookup, parentLookup, nodeOrigin = [0, 0], nodeExtent = infiniteExtent, fitViewQueued, fitViewOptions, fitViewResolver, panZoom, width, height, minZoom, maxZoom) => {
  const { subscribe, set, update } = writable([]);
  let value = nodes;
  let defaults = {};
  let elevateNodesOnSelect = true;
  const _set = (nds) => {
    const nodesInitialized = adoptUserNodes(nds, nodeLookup, parentLookup, {
      elevateNodesOnSelect,
      nodeOrigin,
      nodeExtent,
      defaults,
      checkEquality: false
    });
    if (get(fitViewQueued) && nodesInitialized && get(panZoom)) {
      const fitViewPromise = fitViewport({
        nodes: nodeLookup,
        width: get(width),
        height: get(height),
        panZoom: get(panZoom),
        minZoom: get(minZoom),
        maxZoom: get(maxZoom)
      }, get(fitViewOptions));
      fitViewPromise.then((value2) => {
        get(fitViewResolver)?.resolve(value2);
        fitViewResolver.set(null);
      });
      fitViewQueued.set(false);
      fitViewOptions.set(void 0);
    }
    value = nds;
    set(value);
    return value;
  };
  const _update = (fn) => _set(fn(value));
  const setDefaultOptions = (options) => {
    defaults = options;
  };
  const setOptions = (options) => {
    elevateNodesOnSelect = options.elevateNodesOnSelect ?? elevateNodesOnSelect;
  };
  _set(value);
  return {
    subscribe,
    set: _set,
    update: _update,
    setDefaultOptions,
    setOptions
  };
};
const createEdgesStore = (edges, connectionLookup, edgeLookup, defaultOptions) => {
  const { subscribe, set, update } = writable([]);
  let value = edges;
  let defaults = {};
  const _set = (eds) => {
    const nextEdges = defaults ? eds.map((edge) => ({ ...defaults, ...edge })) : eds;
    updateConnectionLookup(connectionLookup, edgeLookup, nextEdges);
    value = nextEdges;
    set(value);
  };
  const _update = (fn) => _set(fn(value));
  const setDefaultOptions = (options) => {
    defaults = options;
  };
  _set(value);
  return {
    subscribe,
    set: _set,
    update: _update,
    setDefaultOptions
  };
};
const initialNodeTypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  group: GroupNode
};
const initialEdgeTypes = {
  straight: StraightEdgeInternal,
  smoothstep: SmoothStepEdgeInternal,
  default: BezierEdgeInternal,
  step: StepEdgeInternal
};
const getInitialStore = ({ nodes = [], edges = [], width, height, fitView, nodeOrigin, nodeExtent }) => {
  const nodeLookup = /* @__PURE__ */ new Map();
  const parentLookup = /* @__PURE__ */ new Map();
  const connectionLookup = /* @__PURE__ */ new Map();
  const edgeLookup = /* @__PURE__ */ new Map();
  const storeNodeOrigin = nodeOrigin ?? [0, 0];
  const storeNodeExtent = nodeExtent ?? infiniteExtent;
  adoptUserNodes(nodes, nodeLookup, parentLookup, {
    nodeExtent: storeNodeExtent,
    nodeOrigin: storeNodeOrigin,
    elevateNodesOnSelect: false,
    checkEquality: false
  });
  updateConnectionLookup(connectionLookup, edgeLookup, edges);
  let viewport = { x: 0, y: 0, zoom: 1 };
  if (fitView && width && height) {
    const bounds = getInternalNodesBounds(nodeLookup, {
      filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight))
    });
    viewport = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1);
  }
  const fitViewQueued = writable(false);
  const fitViewOptions = writable(void 0);
  const fitViewResolver = writable(null);
  const panZoom = writable(null);
  const widthStore = writable(500);
  const heightStore = writable(500);
  const minZoom = writable(0.5);
  const maxZoom = writable(2);
  return {
    flowId: writable(null),
    nodes: createNodesStore(nodes, nodeLookup, parentLookup, storeNodeOrigin, storeNodeExtent, fitViewQueued, fitViewOptions, fitViewResolver, panZoom, widthStore, heightStore, minZoom, maxZoom),
    nodeLookup: readable(nodeLookup),
    parentLookup: readable(parentLookup),
    edgeLookup: readable(edgeLookup),
    visibleNodes: readable([]),
    edges: createEdgesStore(edges, connectionLookup, edgeLookup),
    visibleEdges: readable([]),
    connectionLookup: readable(connectionLookup),
    width: widthStore,
    height: heightStore,
    minZoom,
    maxZoom,
    nodeOrigin: writable(storeNodeOrigin),
    nodeDragThreshold: writable(1),
    nodeExtent: writable(storeNodeExtent),
    translateExtent: writable(infiniteExtent),
    autoPanOnNodeDrag: writable(true),
    autoPanOnConnect: writable(true),
    fitViewQueued,
    fitViewOptions,
    fitViewResolver,
    panZoom,
    snapGrid: writable(null),
    dragging: writable(false),
    selectionRect: writable(null),
    selectionKeyPressed: writable(false),
    multiselectionKeyPressed: writable(false),
    deleteKeyPressed: writable(false),
    panActivationKeyPressed: writable(false),
    zoomActivationKeyPressed: writable(false),
    selectionRectMode: writable(null),
    selectionMode: writable(SelectionMode.Partial),
    nodeTypes: writable(initialNodeTypes),
    edgeTypes: writable(initialEdgeTypes),
    viewport: writable(viewport),
    connectionMode: writable(ConnectionMode.Strict),
    domNode: writable(null),
    connection: readable(initialConnection),
    connectionLineType: writable(ConnectionLineType.Bezier),
    connectionRadius: writable(20),
    isValidConnection: writable(() => true),
    nodesDraggable: writable(true),
    nodesConnectable: writable(true),
    elementsSelectable: writable(true),
    selectNodesOnDrag: writable(true),
    markers: readable([]),
    defaultMarkerColor: writable("#b1b1b7"),
    lib: readable("svelte"),
    onlyRenderVisibleElements: writable(false),
    onerror: writable(devWarn),
    ondelete: writable(void 0),
    onedgecreate: writable(void 0),
    onconnect: writable(void 0),
    onconnectstart: writable(void 0),
    onconnectend: writable(void 0),
    onbeforedelete: writable(void 0),
    nodesInitialized: writable(false),
    edgesInitialized: writable(false),
    viewportInitialized: writable(false),
    initialized: readable(false)
  };
};
function getVisibleEdges(store) {
  const visibleEdges = derived([
    store.edges,
    store.nodes,
    store.nodeLookup,
    store.onlyRenderVisibleElements,
    store.viewport,
    store.width,
    store.height
  ], ([edges, , nodeLookup, onlyRenderVisibleElements, viewport, width, height]) => {
    const visibleEdges2 = onlyRenderVisibleElements && width && height ? edges.filter((edge) => {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      return sourceNode && targetNode && isEdgeVisible({
        sourceNode,
        targetNode,
        width,
        height,
        transform: [viewport.x, viewport.y, viewport.zoom]
      });
    }) : edges;
    return visibleEdges2;
  });
  return derived([visibleEdges, store.nodes, store.nodeLookup, store.connectionMode, store.onerror], ([visibleEdges2, , nodeLookup, connectionMode, onerror]) => {
    const layoutedEdges = visibleEdges2.reduce((res, edge) => {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      if (!sourceNode || !targetNode) {
        return res;
      }
      const edgePosition = getEdgePosition({
        id: edge.id,
        sourceNode,
        targetNode,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        connectionMode,
        onError: onerror
      });
      if (edgePosition) {
        res.push({
          ...edge,
          zIndex: getElevatedEdgeZIndex({
            selected: edge.selected,
            zIndex: edge.zIndex,
            sourceNode,
            targetNode,
            elevateOnSelect: false
          }),
          ...edgePosition
        });
      }
      return res;
    }, []);
    return layoutedEdges;
  });
}
function getVisibleNodes(store) {
  return derived([
    store.nodeLookup,
    store.onlyRenderVisibleElements,
    store.width,
    store.height,
    store.viewport,
    store.nodes
  ], ([nodeLookup, onlyRenderVisibleElements, width, height, viewport]) => {
    const transform = [viewport.x, viewport.y, viewport.zoom];
    return onlyRenderVisibleElements ? getNodesInside(nodeLookup, { x: 0, y: 0, width, height }, transform, true) : Array.from(nodeLookup.values());
  });
}
const key = Symbol();
function createStore({ nodes, edges, width, height, fitView: fitViewOnCreate, nodeOrigin, nodeExtent }) {
  const store = getInitialStore({
    nodes,
    edges,
    width,
    height,
    fitView: fitViewOnCreate,
    nodeOrigin,
    nodeExtent
  });
  function setNodeTypes(nodeTypes) {
    store.nodeTypes.set({
      ...initialNodeTypes,
      ...nodeTypes
    });
  }
  function setEdgeTypes(edgeTypes) {
    store.edgeTypes.set({
      ...initialEdgeTypes,
      ...edgeTypes
    });
  }
  function addEdge$1(edgeParams) {
    const edges2 = get(store.edges);
    store.edges.set(addEdge(edgeParams, edges2));
  }
  const updateNodePositions = (nodeDragItems, dragging = false) => {
    const nodeLookup = get(store.nodeLookup);
    for (const [id, dragItem] of nodeDragItems) {
      const node = nodeLookup.get(id)?.internals.userNode;
      if (!node) {
        continue;
      }
      node.position = dragItem.position;
      node.dragging = dragging;
    }
    store.nodes.update((nds) => nds);
  };
  function updateNodeInternals$1(updates) {
    const nodeLookup = get(store.nodeLookup);
    const parentLookup = get(store.parentLookup);
    const { changes, updatedInternals } = updateNodeInternals(updates, nodeLookup, get(store.parentLookup), get(store.domNode), get(store.nodeOrigin));
    if (!updatedInternals) {
      return;
    }
    updateAbsolutePositions(nodeLookup, parentLookup, { nodeOrigin, nodeExtent });
    for (const change of changes) {
      const node = nodeLookup.get(change.id)?.internals.userNode;
      if (!node) {
        continue;
      }
      switch (change.type) {
        case "dimensions": {
          const measured = { ...node.measured, ...change.dimensions };
          if (change.setAttributes) {
            node.width = change.dimensions?.width ?? node.width;
            node.height = change.dimensions?.height ?? node.height;
          }
          node.measured = measured;
          break;
        }
        case "position":
          node.position = change.position ?? node.position;
          break;
      }
    }
    store.nodes.update((nds) => nds);
    if (!get(store.nodesInitialized)) {
      store.nodesInitialized.set(true);
    }
  }
  function fitView(options) {
    const fitViewResolver = get(store.fitViewResolver) ?? withResolvers();
    store.fitViewQueued.set(true);
    store.fitViewOptions.set(options);
    store.fitViewResolver.set(fitViewResolver);
    store.nodes.set(get(store.nodes));
    return fitViewResolver.promise;
  }
  function zoomBy(factor, options) {
    const panZoom = get(store.panZoom);
    if (!panZoom) {
      return Promise.resolve(false);
    }
    return panZoom.scaleBy(factor, options);
  }
  function zoomIn(options) {
    return zoomBy(1.2, options);
  }
  function zoomOut(options) {
    return zoomBy(1 / 1.2, options);
  }
  function setMinZoom(minZoom) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setScaleExtent([minZoom, get(store.maxZoom)]);
      store.minZoom.set(minZoom);
    }
  }
  function setMaxZoom(maxZoom) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setScaleExtent([get(store.minZoom), maxZoom]);
      store.maxZoom.set(maxZoom);
    }
  }
  function setTranslateExtent(extent) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setTranslateExtent(extent);
      store.translateExtent.set(extent);
    }
  }
  function resetSelectedElements(elements) {
    let elementsChanged = false;
    elements.forEach((element) => {
      if (element.selected) {
        element.selected = false;
        elementsChanged = true;
      }
    });
    return elementsChanged;
  }
  function setPaneClickDistance(distance) {
    get(store.panZoom)?.setClickDistance(distance);
  }
  function unselectNodesAndEdges(params) {
    const resetNodes = resetSelectedElements(params?.nodes || get(store.nodes));
    if (resetNodes)
      store.nodes.set(get(store.nodes));
    const resetEdges = resetSelectedElements(params?.edges || get(store.edges));
    if (resetEdges)
      store.edges.set(get(store.edges));
  }
  store.deleteKeyPressed.subscribe(async (deleteKeyPressed) => {
    if (deleteKeyPressed) {
      const nodes2 = get(store.nodes);
      const edges2 = get(store.edges);
      const selectedNodes = nodes2.filter((node) => node.selected);
      const selectedEdges = edges2.filter((edge) => edge.selected);
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove: selectedNodes,
        edgesToRemove: selectedEdges,
        nodes: nodes2,
        edges: edges2,
        onBeforeDelete: get(store.onbeforedelete)
      });
      if (matchingNodes.length || matchingEdges.length) {
        store.nodes.update((nds) => nds.filter((node) => !matchingNodes.some((mN) => mN.id === node.id)));
        store.edges.update((eds) => eds.filter((edge) => !matchingEdges.some((mE) => mE.id === edge.id)));
        get(store.ondelete)?.({
          nodes: matchingNodes,
          edges: matchingEdges
        });
      }
    }
  });
  function addSelectedNodes(ids) {
    const isMultiSelection = get(store.multiselectionKeyPressed);
    store.nodes.update((ns) => ns.map((node) => {
      const nodeWillBeSelected = ids.includes(node.id);
      const selected = isMultiSelection ? node.selected || nodeWillBeSelected : nodeWillBeSelected;
      node.selected = selected;
      return node;
    }));
    if (!isMultiSelection) {
      store.edges.update((es) => es.map((edge) => {
        edge.selected = false;
        return edge;
      }));
    }
  }
  function addSelectedEdges(ids) {
    const isMultiSelection = get(store.multiselectionKeyPressed);
    store.edges.update((edges2) => edges2.map((edge) => {
      const edgeWillBeSelected = ids.includes(edge.id);
      const selected = isMultiSelection ? edge.selected || edgeWillBeSelected : edgeWillBeSelected;
      edge.selected = selected;
      return edge;
    }));
    if (!isMultiSelection) {
      store.nodes.update((ns) => ns.map((node) => {
        node.selected = false;
        return node;
      }));
    }
  }
  function handleNodeSelection(id) {
    const node = get(store.nodes)?.find((n) => n.id === id);
    if (!node) {
      console.warn("012", errorMessages["error012"](id));
      return;
    }
    store.selectionRect.set(null);
    store.selectionRectMode.set(null);
    if (!node.selected) {
      addSelectedNodes([id]);
    } else if (node.selected && get(store.multiselectionKeyPressed)) {
      unselectNodesAndEdges({ nodes: [node], edges: [] });
    }
  }
  function panBy$1(delta) {
    const viewport = get(store.viewport);
    return panBy({
      delta,
      panZoom: get(store.panZoom),
      transform: [viewport.x, viewport.y, viewport.zoom],
      translateExtent: get(store.translateExtent),
      width: get(store.width),
      height: get(store.height)
    });
  }
  const _connection = writable(initialConnection);
  const updateConnection = (newConnection) => {
    _connection.set({ ...newConnection });
  };
  function cancelConnection() {
    _connection.set(initialConnection);
  }
  function reset() {
    store.selectionRect.set(null);
    store.selectionRectMode.set(null);
    store.snapGrid.set(null);
    store.isValidConnection.set(() => true);
    unselectNodesAndEdges();
    cancelConnection();
  }
  return {
    // state
    ...store,
    // derived state
    visibleEdges: getVisibleEdges(store),
    visibleNodes: getVisibleNodes(store),
    connection: derived([_connection, store.viewport], ([connection, viewport]) => {
      return connection.inProgress ? {
        ...connection,
        to: pointToRendererPoint(connection.to, [viewport.x, viewport.y, viewport.zoom])
      } : { ...connection };
    }),
    markers: derived([store.edges, store.defaultMarkerColor, store.flowId], ([edges2, defaultColor, id]) => createMarkerIds(edges2, { defaultColor, id })),
    initialized: (() => {
      let initialized = false;
      const initialNodesLength = get(store.nodes).length;
      const initialEdgesLength = get(store.edges).length;
      return derived([store.nodesInitialized, store.edgesInitialized, store.viewportInitialized], ([nodesInitialized, edgesInitialized, viewportInitialized]) => {
        if (initialized)
          return initialized;
        if (initialNodesLength === 0) {
          initialized = viewportInitialized;
        } else if (initialEdgesLength === 0) {
          initialized = viewportInitialized && nodesInitialized;
        } else {
          initialized = viewportInitialized && nodesInitialized && edgesInitialized;
        }
        return initialized;
      });
    })(),
    // actions
    syncNodeStores: (nodes2) => syncNodeStores(store.nodes, nodes2),
    syncEdgeStores: (edges2) => syncEdgeStores(store.edges, edges2),
    syncViewport: (viewport) => syncViewportStores(store.panZoom, store.viewport, viewport),
    setNodeTypes,
    setEdgeTypes,
    addEdge: addEdge$1,
    updateNodePositions,
    updateNodeInternals: updateNodeInternals$1,
    zoomIn,
    zoomOut,
    fitView: (options) => fitView(options),
    setMinZoom,
    setMaxZoom,
    setTranslateExtent,
    setPaneClickDistance,
    unselectNodesAndEdges,
    addSelectedNodes,
    addSelectedEdges,
    handleNodeSelection,
    panBy: panBy$1,
    updateConnection,
    cancelConnection,
    reset
  };
}
function useStore() {
  const store = getContext(key);
  if (!store) {
    throw new Error("In order to use useStore you need to wrap your component in a <SvelteFlowProvider />");
  }
  return store.getStore();
}
function createStoreContext({ nodes, edges, width, height, fitView, nodeOrigin, nodeExtent }) {
  const store = createStore({ nodes, edges, width, height, fitView, nodeOrigin, nodeExtent });
  setContext(key, {
    getStore: () => store
  });
  return store;
}
function Zoom($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let initialViewport = fallback($$props["initialViewport"], void 0);
    let onMoveStart = fallback($$props["onMoveStart"], void 0);
    let onMove = fallback($$props["onMove"], void 0);
    let onMoveEnd = fallback($$props["onMoveEnd"], void 0);
    let panOnScrollMode = $$props["panOnScrollMode"];
    let preventScrolling = $$props["preventScrolling"];
    let zoomOnScroll = $$props["zoomOnScroll"];
    let zoomOnDoubleClick = $$props["zoomOnDoubleClick"];
    let zoomOnPinch = $$props["zoomOnPinch"];
    let panOnDrag = $$props["panOnDrag"];
    let panOnScroll = $$props["panOnScroll"];
    let paneClickDistance = $$props["paneClickDistance"];
    const {
      viewport,
      panZoom,
      selectionRect,
      minZoom,
      maxZoom,
      dragging,
      translateExtent,
      lib,
      panActivationKeyPressed,
      zoomActivationKeyPressed,
      viewportInitialized
    } = useStore();
    store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnDrag;
    store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnScroll;
    $$renderer2.push(`<div class="svelte-flow__zoom svelte-1vl0uat"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      initialViewport,
      onMoveStart,
      onMove,
      onMoveEnd,
      panOnScrollMode,
      preventScrolling,
      zoomOnScroll,
      zoomOnDoubleClick,
      zoomOnPinch,
      panOnDrag,
      panOnScroll,
      paneClickDistance
    });
  });
}
function Pane($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let _panOnDrag, isSelecting;
    let panOnDrag = fallback($$props["panOnDrag"], void 0);
    let selectionOnDrag = fallback($$props["selectionOnDrag"], void 0);
    const {
      nodes,
      nodeLookup,
      edges,
      viewport,
      dragging,
      elementsSelectable,
      selectionRect,
      selectionRectMode,
      selectionKeyPressed,
      selectionMode,
      panActivationKeyPressed,
      unselectNodesAndEdges,
      connection
    } = useStore();
    _panOnDrag = store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnDrag;
    isSelecting = store_get($$store_subs ??= {}, "$selectionKeyPressed", selectionKeyPressed) || store_get($$store_subs ??= {}, "$selectionRect", selectionRect) || selectionOnDrag && _panOnDrag !== true;
    store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable) && (isSelecting || store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "user");
    $$renderer2.push(`<div${attr_class("svelte-flow__pane svelte-j55c5z", void 0, {
      "draggable": panOnDrag === true || Array.isArray(panOnDrag) && panOnDrag.includes(0),
      "dragging": store_get($$store_subs ??= {}, "$dragging", dragging),
      "selection": isSelecting
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { panOnDrag, selectionOnDrag });
  });
}
function Viewport($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { viewport } = useStore();
    $$renderer2.push(`<div class="svelte-flow__viewport xyflow__viewport svelte-tjeeg3"${attr_style(`transform: translate(${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).x)}px, ${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).y)}px) scale(${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).zoom)})`)}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function getNodeInlineStyleDimensions({ width, height, initialWidth, initialHeight, measuredWidth, measuredHeight }) {
  if (measuredWidth === void 0 && measuredHeight === void 0) {
    const styleWidth = width ?? initialWidth;
    const styleHeight = height ?? initialHeight;
    return {
      width: styleWidth ? `width:${styleWidth}px;` : "",
      height: styleHeight ? `height:${styleHeight}px;` : ""
    };
  }
  return {
    width: width ? `width:${width}px;` : "",
    height: height ? `height:${height}px;` : ""
  };
}
function NodeWrapper($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodeType, nodeTypeValid, nodeComponent, inlineStyleDimensions;
    let node = $$props["node"];
    let id = $$props["id"];
    let data = fallback($$props["data"], () => ({}), true);
    let selected = fallback($$props["selected"], false);
    let draggable = fallback($$props["draggable"], void 0);
    let selectable = fallback($$props["selectable"], void 0);
    let connectable = fallback($$props["connectable"], true);
    let deletable = fallback($$props["deletable"], true);
    let hidden = fallback($$props["hidden"], false);
    let dragging = fallback($$props["dragging"], false);
    let resizeObserver = fallback($$props["resizeObserver"], null);
    let style = fallback($$props["style"], void 0);
    let type = fallback($$props["type"], "default");
    let isParent = fallback($$props["isParent"], false);
    let positionX = $$props["positionX"];
    let positionY = $$props["positionY"];
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    let zIndex = $$props["zIndex"];
    let measuredWidth = fallback($$props["measuredWidth"], void 0);
    let measuredHeight = fallback($$props["measuredHeight"], void 0);
    let initialWidth = fallback($$props["initialWidth"], void 0);
    let initialHeight = fallback($$props["initialHeight"], void 0);
    let width = fallback($$props["width"], void 0);
    let height = fallback($$props["height"], void 0);
    let dragHandle = fallback($$props["dragHandle"], void 0);
    let initialized = fallback($$props["initialized"], false);
    let parentId = fallback($$props["parentId"], void 0);
    let nodeClickDistance = fallback($$props["nodeClickDistance"], void 0);
    let className = fallback($$props["class"], "");
    const store = useStore();
    const {
      nodeTypes,
      nodeDragThreshold,
      selectNodesOnDrag,
      handleNodeSelection,
      updateNodeInternals: updateNodeInternals2,
      elementsSelectable,
      nodesDraggable
    } = store;
    let nodeRef;
    let prevNodeRef = null;
    const connectableStore = writable(connectable);
    let prevType = void 0;
    let prevSourcePosition = void 0;
    let prevTargetPosition = void 0;
    setContext("svelteflow__node_id", id);
    setContext("svelteflow__node_connectable", connectableStore);
    onDestroy(() => {
      if (prevNodeRef) {
        resizeObserver?.unobserve(prevNodeRef);
      }
    });
    nodeType = type || "default";
    nodeTypeValid = !!store_get($$store_subs ??= {}, "$nodeTypes", nodeTypes)[nodeType];
    nodeComponent = store_get($$store_subs ??= {}, "$nodeTypes", nodeTypes)[nodeType] || DefaultNode;
    {
      if (!nodeTypeValid) {
        console.warn("003", errorMessages["error003"](type));
      }
    }
    inlineStyleDimensions = getNodeInlineStyleDimensions({
      width,
      height,
      initialWidth,
      initialHeight,
      measuredWidth,
      measuredHeight
    });
    {
      connectableStore.set(!!connectable);
    }
    {
      const doUpdate = prevType && nodeType !== prevType || prevSourcePosition && sourcePosition !== prevSourcePosition || prevTargetPosition && targetPosition !== prevTargetPosition;
      if (doUpdate) {
        requestAnimationFrame(() => updateNodeInternals2(/* @__PURE__ */ new Map([[id, { id, nodeElement: nodeRef, force: true }]])));
      }
      prevType = nodeType;
      prevSourcePosition = sourcePosition;
      prevTargetPosition = targetPosition;
    }
    {
      if (resizeObserver && (nodeRef !== prevNodeRef || !initialized)) {
        prevNodeRef && resizeObserver.unobserve(prevNodeRef);
        prevNodeRef = nodeRef;
      }
    }
    if (
      // this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
      // here we only need to call it when selectNodesOnDrag=false
      !hidden
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr("data-id", id)}${attr_class(
        clsx(cc([
          "svelte-flow__node",
          `svelte-flow__node-${nodeType}`,
          className
        ])),
        void 0,
        {
          "dragging": dragging,
          "selected": selected,
          "draggable": draggable,
          "connectable": connectable,
          "selectable": selectable,
          "nopan": draggable,
          "parent": isParent
        }
      )}${attr_style(`${stringify(style ?? "")};${stringify(inlineStyleDimensions.width)}${stringify(inlineStyleDimensions.height)}`, {
        "z-index": zIndex,
        transform: `translate(${stringify(positionX)}px, ${stringify(positionY)}px)`,
        visibility: initialized ? "visible" : "hidden"
      })}>`);
      if (nodeComponent) {
        $$renderer2.push("<!--[-->");
        nodeComponent($$renderer2, {
          data,
          id,
          selected: selected ?? false,
          selectable: selectable ?? store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable) ?? true,
          deletable: deletable ?? true,
          sourcePosition,
          targetPosition,
          zIndex,
          dragging,
          draggable: draggable ?? store_get($$store_subs ??= {}, "$nodesDraggable", nodesDraggable) ?? true,
          dragHandle,
          parentId,
          type: nodeType,
          isConnectable: store_get($$store_subs ??= {}, "$connectableStore", connectableStore),
          positionAbsoluteX: positionX,
          positionAbsoluteY: positionY,
          width,
          height
        });
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
      $$renderer2.push(`</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      node,
      id,
      data,
      selected,
      draggable,
      selectable,
      connectable,
      deletable,
      hidden,
      dragging,
      resizeObserver,
      style,
      type,
      isParent,
      positionX,
      positionY,
      sourcePosition,
      targetPosition,
      zIndex,
      measuredWidth,
      measuredHeight,
      initialWidth,
      initialHeight,
      width,
      height,
      dragHandle,
      initialized,
      parentId,
      nodeClickDistance,
      class: className
    });
  });
}
function NodeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodeClickDistance = fallback($$props["nodeClickDistance"], 0);
    const {
      visibleNodes,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable,
      updateNodeInternals: updateNodeInternals2,
      parentLookup
    } = useStore();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver((entries) => {
      const updates = /* @__PURE__ */ new Map();
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-id");
        updates.set(id, { id, nodeElement: entry.target, force: true });
      });
      updateNodeInternals2(updates);
    });
    onDestroy(() => {
      resizeObserver?.disconnect();
    });
    $$renderer2.push(`<div class="svelte-flow__nodes svelte-v0zrhd"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$visibleNodes", visibleNodes));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let node = each_array[$$index];
      NodeWrapper($$renderer2, {
        node,
        id: node.id,
        data: node.data,
        selected: !!node.selected,
        hidden: !!node.hidden,
        draggable: !!(node.draggable || store_get($$store_subs ??= {}, "$nodesDraggable", nodesDraggable) && typeof node.draggable === "undefined"),
        selectable: !!(node.selectable || store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable) && typeof node.selectable === "undefined"),
        connectable: !!(node.connectable || store_get($$store_subs ??= {}, "$nodesConnectable", nodesConnectable) && typeof node.connectable === "undefined"),
        deletable: node.deletable ?? true,
        positionX: node.internals.positionAbsolute.x,
        positionY: node.internals.positionAbsolute.y,
        isParent: store_get($$store_subs ??= {}, "$parentLookup", parentLookup).has(node.id),
        style: node.style,
        class: node.class,
        type: node.type ?? "default",
        sourcePosition: node.sourcePosition,
        targetPosition: node.targetPosition,
        dragging: node.dragging,
        zIndex: node.internals.z ?? 0,
        dragHandle: node.dragHandle,
        initialized: nodeHasDimensions(node),
        width: node.width,
        height: node.height,
        initialWidth: node.initialWidth,
        initialHeight: node.initialHeight,
        measuredWidth: node.measured.width,
        measuredHeight: node.measured.height,
        parentId: node.parentId,
        resizeObserver,
        nodeClickDistance
      });
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { nodeClickDistance });
  });
}
function EdgeWrapper($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let edgeType, edgeComponent, markerStartUrl, markerEndUrl, isSelectable;
    let id = $$props["id"];
    let type = fallback($$props["type"], "default");
    let source = fallback($$props["source"], "");
    let target = fallback($$props["target"], "");
    let data = fallback($$props["data"], () => ({}), true);
    let style = fallback($$props["style"], void 0);
    let zIndex = fallback($$props["zIndex"], void 0);
    let animated = fallback($$props["animated"], false);
    let selected = fallback($$props["selected"], false);
    let selectable = fallback($$props["selectable"], void 0);
    let deletable = fallback($$props["deletable"], void 0);
    let hidden = fallback($$props["hidden"], false);
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let sourceHandle = fallback($$props["sourceHandle"], void 0);
    let targetHandle = fallback($$props["targetHandle"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetPosition = $$props["targetPosition"];
    let ariaLabel = fallback($$props["ariaLabel"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let className = fallback($$props["class"], "");
    setContext("svelteflow__edge_id", id);
    const { edgeLookup, edgeTypes, flowId, elementsSelectable } = useStore();
    useHandleEdgeSelect();
    edgeType = type || "default";
    edgeComponent = store_get($$store_subs ??= {}, "$edgeTypes", edgeTypes)[edgeType] || BezierEdgeInternal;
    markerStartUrl = markerStart ? `url('#${getMarkerId(markerStart, store_get($$store_subs ??= {}, "$flowId", flowId))}')` : void 0;
    markerEndUrl = markerEnd ? `url('#${getMarkerId(markerEnd, store_get($$store_subs ??= {}, "$flowId", flowId))}')` : void 0;
    isSelectable = selectable ?? store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable);
    if (!hidden) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<svg${attr_style("", { "z-index": zIndex })}><g${attr_class(clsx(cc(["svelte-flow__edge", className])), void 0, {
        "animated": animated,
        "selected": selected,
        "selectable": isSelectable
      })}${attr("data-id", id)}${attr("aria-label", ariaLabel === null ? void 0 : ariaLabel ? ariaLabel : `Edge from ${source} to ${target}`)} role="img">`);
      if (edgeComponent) {
        $$renderer2.push("<!--[-->");
        edgeComponent($$renderer2, {
          id,
          source,
          target,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourcePosition,
          targetPosition,
          animated,
          selected,
          label,
          labelStyle,
          data,
          style,
          interactionWidth,
          selectable: isSelectable,
          deletable: deletable ?? true,
          type: edgeType,
          sourceHandleId: sourceHandle,
          targetHandleId: targetHandle,
          markerStart: markerStartUrl,
          markerEnd: markerEndUrl
        });
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
      $$renderer2.push(`</g></svg>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      type,
      source,
      target,
      data,
      style,
      zIndex,
      animated,
      selected,
      selectable,
      deletable,
      hidden,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      sourceHandle,
      targetHandle,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      ariaLabel,
      interactionWidth,
      class: className
    });
  });
}
function CallOnMount($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let _onMount = fallback($$props["onMount"], void 0);
    let _onDestroy = fallback($$props["onDestroy"], void 0);
    bind_props($$props, { onMount: _onMount, onDestroy: _onDestroy });
  });
}
function MarkerDefinition($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { markers } = useStore();
    $$renderer2.push(`<defs><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$markers", markers));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let marker = each_array[$$index];
      Marker($$renderer2, spread_props([marker]));
    }
    $$renderer2.push(`<!--]--></defs>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Marker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = $$props["id"];
    let type = $$props["type"];
    let width = fallback($$props["width"], 12.5);
    let height = fallback($$props["height"], 12.5);
    let markerUnits = fallback($$props["markerUnits"], "strokeWidth");
    let orient = fallback($$props["orient"], "auto-start-reverse");
    let color = fallback($$props["color"], void 0);
    let strokeWidth = fallback($$props["strokeWidth"], void 0);
    $$renderer2.push(`<marker class="svelte-flow__arrowhead"${attr("id", id)}${attr("markerWidth", `${width}`)}${attr("markerHeight", `${height}`)} viewBox="-10 -10 20 20"${attr("markerUnits", markerUnits)}${attr("orient", orient)} refX="0" refY="0">`);
    if (type === MarkerType.Arrow) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<polyline${attr("stroke", color)} stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} fill="none" points="-5,-4 0,0 -5,4"></polyline>`);
    } else if (type === MarkerType.ArrowClosed) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<polyline${attr("stroke", color)} stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)}${attr("fill", color)} points="-5,-4 0,0 -5,4 -5,-4"></polyline>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></marker>`);
    bind_props($$props, {
      id,
      type,
      width,
      height,
      markerUnits,
      orient,
      color,
      strokeWidth
    });
  });
}
function EdgeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let defaultEdgeOptions = $$props["defaultEdgeOptions"];
    const {
      visibleEdges,
      edgesInitialized,
      edges: { setDefaultOptions },
      elementsSelectable
    } = useStore();
    $$renderer2.push(`<div class="svelte-flow__edges"><svg class="svelte-flow__marker">`);
    MarkerDefinition($$renderer2);
    $$renderer2.push(`<!----></svg> <!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$visibleEdges", visibleEdges));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let edge = each_array[$$index];
      EdgeWrapper($$renderer2, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data,
        style: edge.style,
        animated: edge.animated,
        selected: edge.selected,
        selectable: edge.selectable ?? store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable),
        deletable: edge.deletable,
        hidden: edge.hidden,
        label: edge.label,
        labelStyle: edge.labelStyle,
        markerStart: edge.markerStart,
        markerEnd: edge.markerEnd,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        sourceX: edge.sourceX,
        sourceY: edge.sourceY,
        targetX: edge.targetX,
        targetY: edge.targetY,
        sourcePosition: edge.sourcePosition,
        targetPosition: edge.targetPosition,
        ariaLabel: edge.ariaLabel,
        interactionWidth: edge.interactionWidth,
        class: edge.class,
        type: edge.type || "default",
        zIndex: edge.zIndex
      });
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$visibleEdges", visibleEdges).length > 0) {
      $$renderer2.push("<!--[0-->");
      CallOnMount($$renderer2, {
        onMount: () => {
          store_set(edgesInitialized, true);
        },
        onDestroy: () => {
          store_set(edgesInitialized, false);
        }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { defaultEdgeOptions });
  });
}
function Selection($$renderer, $$props) {
  let x = fallback($$props["x"], 0);
  let y = fallback($$props["y"], 0);
  let width = fallback($$props["width"], 0);
  let height = fallback($$props["height"], 0);
  let isVisible = fallback($$props["isVisible"], true);
  if (isVisible) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<div class="svelte-flow__selection svelte-1vr3gfi"${attr_style("", {
      width: typeof width === "string" ? width : `${width}px`,
      height: typeof height === "string" ? height : `${height}px`,
      transform: `translate(${x}px, ${y}px)`
    })}></div>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { x, y, width, height, isVisible });
}
function UserSelection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { selectionRect, selectionRectMode } = useStore();
    Selection($$renderer2, {
      isVisible: !!(store_get($$store_subs ??= {}, "$selectionRect", selectionRect) && store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "user"),
      width: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.width,
      height: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.height,
      x: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.x,
      y: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.y
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function NodeSelection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const store = useStore();
    const { selectionRectMode, nodes, nodeLookup } = store;
    let bounds = null;
    if (store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "nodes") {
      bounds = getInternalNodesBounds(store_get($$store_subs ??= {}, "$nodeLookup", nodeLookup), { filter: (node) => !!node.selected });
      store_get($$store_subs ??= {}, "$nodes", nodes);
    }
    if (store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "nodes" && bounds && isNumeric(bounds.x) && isNumeric(bounds.y)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="selection-wrapper nopan svelte-sf2y5e"${attr_style(`width: ${stringify(bounds.width)}px; height: ${stringify(bounds.height)}px; transform: translate(${stringify(bounds.x)}px, ${stringify(bounds.y)}px)`)} role="button" tabindex="-1">`);
      Selection($$renderer2, { width: "100%", height: "100%", x: 0, y: 0 });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function KeyHandler($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectionKey = fallback($$props["selectionKey"], "Shift");
    let multiSelectionKey = fallback($$props["multiSelectionKey"], () => isMacOs() ? "Meta" : "Control", true);
    let deleteKey = fallback($$props["deleteKey"], "Backspace");
    let panActivationKey = fallback($$props["panActivationKey"], " ");
    let zoomActivationKey = fallback($$props["zoomActivationKey"], () => isMacOs() ? "Meta" : "Control", true);
    const {
      selectionKeyPressed,
      multiselectionKeyPressed,
      deleteKeyPressed,
      panActivationKeyPressed,
      zoomActivationKeyPressed,
      selectionRect
    } = useStore();
    bind_props($$props, {
      selectionKey,
      multiSelectionKey,
      deleteKey,
      panActivationKey,
      zoomActivationKey
    });
  });
}
function ConnectionLine($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let containerStyle = fallback($$props["containerStyle"], "");
    let style = fallback($$props["style"], "");
    let isCustomComponent = fallback($$props["isCustomComponent"], false);
    const { width, height, connection, connectionLineType } = useStore();
    let path = null;
    if (store_get($$store_subs ??= {}, "$connection", connection).inProgress && !isCustomComponent) {
      const { from, to, fromPosition, toPosition } = store_get($$store_subs ??= {}, "$connection", connection);
      const pathParams = {
        sourceX: from.x,
        sourceY: from.y,
        sourcePosition: fromPosition,
        targetX: to.x,
        targetY: to.y,
        targetPosition: toPosition
      };
      switch (store_get($$store_subs ??= {}, "$connectionLineType", connectionLineType)) {
        case ConnectionLineType.Bezier:
          [path] = getBezierPath(pathParams);
          break;
        case ConnectionLineType.Step:
          [path] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
          break;
        case ConnectionLineType.SmoothStep:
          [path] = getSmoothStepPath(pathParams);
          break;
        default:
          [path] = getStraightPath(pathParams);
      }
    }
    if (store_get($$store_subs ??= {}, "$connection", connection).inProgress) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<svg${attr("width", store_get($$store_subs ??= {}, "$width", width))}${attr("height", store_get($$store_subs ??= {}, "$height", height))} class="svelte-flow__connectionline"${attr_style(containerStyle)}><g${attr_class(clsx(cc([
        "svelte-flow__connection",
        getConnectionStatus(store_get($$store_subs ??= {}, "$connection", connection).isValid)
      ])))}><!--[-->`);
      slot($$renderer2, $$props, "connectionLine", {}, null);
      $$renderer2.push(`<!--]-->`);
      if (!isCustomComponent) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<path${attr("d", path)}${attr_style(style)} fill="none" class="svelte-flow__connection-path"></path>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></g></svg>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { containerStyle, style, isCustomComponent });
  });
}
function Panel($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["position", "style", "class"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let positionClasses;
    let position = fallback($$props["position"], "top-right");
    let style = fallback($$props["style"], void 0);
    let className = fallback($$props["class"], void 0);
    const { selectionRectMode } = useStore();
    positionClasses = `${position}`.split("-");
    $$renderer2.push(`<div${attributes(
      {
        class: clsx(cc(["svelte-flow__panel", className, ...positionClasses])),
        style,
        ...$$restProps
      },
      void 0,
      void 0,
      {
        "pointer-events": store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) ? "none" : ""
      }
    )}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { position, style, class: className });
  });
}
function Attribution($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let proOptions = fallback($$props["proOptions"], void 0);
    let position = fallback($$props["position"], "bottom-right");
    if (!proOptions?.hideAttribution) {
      $$renderer2.push("<!--[0-->");
      Panel($$renderer2, {
        position,
        class: "svelte-flow__attribution",
        "data-message": "Feel free to remove the attribution or check out how you could support us: https://svelteflow.dev/support-us",
        children: ($$renderer3) => {
          $$renderer3.push(`<a href="https://svelteflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Svelte Flow attribution">Svelte Flow</a>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { proOptions, position });
  });
}
function updateStore(store, { nodeTypes, edgeTypes, minZoom, maxZoom, translateExtent, paneClickDistance }) {
  if (nodeTypes !== void 0) {
    store.setNodeTypes(nodeTypes);
  }
  if (edgeTypes !== void 0) {
    store.setEdgeTypes(edgeTypes);
  }
  if (minZoom !== void 0) {
    store.setMinZoom(minZoom);
  }
  if (maxZoom !== void 0) {
    store.setMaxZoom(maxZoom);
  }
  if (translateExtent !== void 0) {
    store.setTranslateExtent(translateExtent);
  }
  if (paneClickDistance !== void 0) {
    store.setPaneClickDistance(paneClickDistance);
  }
}
const getKeys = (obj) => Object.keys(obj);
function updateStoreByKeys(store, keys) {
  getKeys(keys).forEach((prop) => {
    const update = keys[prop];
    if (update !== void 0) {
      store[prop].set(update);
    }
  });
}
function getMediaQuery() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)");
}
function useColorModeClass(colorMode = "light") {
  const colorModeClass = readable("light", (set) => {
    if (colorMode !== "system") {
      set(colorMode);
      return;
    }
    const mediaQuery = getMediaQuery();
    const updateColorModeClass = () => set(mediaQuery?.matches ? "dark" : "light");
    set(mediaQuery?.matches ? "dark" : "light");
    mediaQuery?.addEventListener("change", updateColorModeClass);
    return () => {
      mediaQuery?.removeEventListener("change", updateColorModeClass);
    };
  });
  return colorModeClass;
}
function SvelteFlow($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "id",
    "nodes",
    "edges",
    "fitView",
    "fitViewOptions",
    "minZoom",
    "maxZoom",
    "initialViewport",
    "viewport",
    "nodeTypes",
    "edgeTypes",
    "selectionKey",
    "selectionMode",
    "panActivationKey",
    "multiSelectionKey",
    "zoomActivationKey",
    "nodesDraggable",
    "nodesConnectable",
    "nodeDragThreshold",
    "elementsSelectable",
    "snapGrid",
    "deleteKey",
    "connectionRadius",
    "connectionLineType",
    "connectionMode",
    "connectionLineStyle",
    "connectionLineContainerStyle",
    "onMoveStart",
    "onMove",
    "onMoveEnd",
    "isValidConnection",
    "translateExtent",
    "nodeExtent",
    "onlyRenderVisibleElements",
    "panOnScrollMode",
    "preventScrolling",
    "zoomOnScroll",
    "zoomOnDoubleClick",
    "zoomOnPinch",
    "panOnScroll",
    "panOnDrag",
    "selectionOnDrag",
    "autoPanOnConnect",
    "autoPanOnNodeDrag",
    "onerror",
    "ondelete",
    "onedgecreate",
    "attributionPosition",
    "proOptions",
    "defaultEdgeOptions",
    "width",
    "height",
    "colorMode",
    "onconnect",
    "onconnectstart",
    "onconnectend",
    "onbeforedelete",
    "oninit",
    "nodeOrigin",
    "paneClickDistance",
    "nodeClickDistance",
    "defaultMarkerColor",
    "style",
    "class"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let colorModeClass;
    let id = fallback($$props["id"], "1");
    let nodes = $$props["nodes"];
    let edges = $$props["edges"];
    let fitView = fallback($$props["fitView"], void 0);
    let fitViewOptions = fallback($$props["fitViewOptions"], void 0);
    let minZoom = fallback($$props["minZoom"], void 0);
    let maxZoom = fallback($$props["maxZoom"], void 0);
    let initialViewport = fallback($$props["initialViewport"], void 0);
    let viewport = fallback($$props["viewport"], void 0);
    let nodeTypes = fallback($$props["nodeTypes"], void 0);
    let edgeTypes = fallback($$props["edgeTypes"], void 0);
    let selectionKey = fallback($$props["selectionKey"], void 0);
    let selectionMode = fallback($$props["selectionMode"], void 0);
    let panActivationKey = fallback($$props["panActivationKey"], void 0);
    let multiSelectionKey = fallback($$props["multiSelectionKey"], void 0);
    let zoomActivationKey = fallback($$props["zoomActivationKey"], void 0);
    let nodesDraggable = fallback($$props["nodesDraggable"], void 0);
    let nodesConnectable = fallback($$props["nodesConnectable"], void 0);
    let nodeDragThreshold = fallback($$props["nodeDragThreshold"], void 0);
    let elementsSelectable = fallback($$props["elementsSelectable"], void 0);
    let snapGrid = fallback($$props["snapGrid"], void 0);
    let deleteKey = fallback($$props["deleteKey"], void 0);
    let connectionRadius = fallback($$props["connectionRadius"], void 0);
    let connectionLineType = fallback($$props["connectionLineType"], void 0);
    let connectionMode = fallback($$props["connectionMode"], () => ConnectionMode.Strict, true);
    let connectionLineStyle = fallback($$props["connectionLineStyle"], "");
    let connectionLineContainerStyle = fallback($$props["connectionLineContainerStyle"], "");
    let onMoveStart = fallback($$props["onMoveStart"], void 0);
    let onMove = fallback($$props["onMove"], void 0);
    let onMoveEnd = fallback($$props["onMoveEnd"], void 0);
    let isValidConnection = fallback($$props["isValidConnection"], void 0);
    let translateExtent = fallback($$props["translateExtent"], void 0);
    let nodeExtent = fallback($$props["nodeExtent"], void 0);
    let onlyRenderVisibleElements = fallback($$props["onlyRenderVisibleElements"], void 0);
    let panOnScrollMode = fallback($$props["panOnScrollMode"], () => PanOnScrollMode.Free, true);
    let preventScrolling = fallback($$props["preventScrolling"], true);
    let zoomOnScroll = fallback($$props["zoomOnScroll"], true);
    let zoomOnDoubleClick = fallback($$props["zoomOnDoubleClick"], true);
    let zoomOnPinch = fallback($$props["zoomOnPinch"], true);
    let panOnScroll = fallback($$props["panOnScroll"], false);
    let panOnDrag = fallback($$props["panOnDrag"], true);
    let selectionOnDrag = fallback($$props["selectionOnDrag"], void 0);
    let autoPanOnConnect = fallback($$props["autoPanOnConnect"], true);
    let autoPanOnNodeDrag = fallback($$props["autoPanOnNodeDrag"], true);
    let onerror = fallback($$props["onerror"], void 0);
    let ondelete = fallback($$props["ondelete"], void 0);
    let onedgecreate = fallback($$props["onedgecreate"], void 0);
    let attributionPosition = fallback($$props["attributionPosition"], void 0);
    let proOptions = fallback($$props["proOptions"], void 0);
    let defaultEdgeOptions = fallback($$props["defaultEdgeOptions"], void 0);
    let width = fallback($$props["width"], void 0);
    let height = fallback($$props["height"], void 0);
    let colorMode = fallback($$props["colorMode"], "light");
    let onconnect = fallback($$props["onconnect"], void 0);
    let onconnectstart = fallback($$props["onconnectstart"], void 0);
    let onconnectend = fallback($$props["onconnectend"], void 0);
    let onbeforedelete = fallback($$props["onbeforedelete"], void 0);
    let oninit = fallback($$props["oninit"], void 0);
    let nodeOrigin = fallback($$props["nodeOrigin"], void 0);
    let paneClickDistance = fallback($$props["paneClickDistance"], 0);
    let nodeClickDistance = fallback($$props["nodeClickDistance"], 0);
    let defaultMarkerColor = fallback($$props["defaultMarkerColor"], "#b1b1b7");
    let style = fallback($$props["style"], void 0);
    let className = fallback($$props["class"], void 0);
    const initViewport = store_get($$store_subs ??= {}, "$viewport", viewport) || initialViewport;
    const store = hasContext(key) ? useStore() : createStoreContext({
      nodes: get(nodes),
      edges: get(edges),
      width,
      height,
      fitView,
      nodeOrigin,
      nodeExtent
    });
    const { initialized } = store;
    let onInitCalled = false;
    {
      if (!onInitCalled && store_get($$store_subs ??= {}, "$initialized", initialized)) {
        oninit?.();
        onInitCalled = true;
      }
    }
    {
      const updatableProps = {
        flowId: id,
        connectionLineType,
        connectionRadius,
        selectionMode,
        snapGrid,
        defaultMarkerColor,
        nodesDraggable,
        nodesConnectable,
        elementsSelectable,
        onlyRenderVisibleElements,
        isValidConnection,
        autoPanOnConnect,
        autoPanOnNodeDrag,
        onerror,
        ondelete,
        onedgecreate,
        connectionMode,
        nodeDragThreshold,
        onconnect,
        onconnectstart,
        onconnectend,
        onbeforedelete,
        nodeOrigin
      };
      updateStoreByKeys(store, updatableProps);
    }
    updateStore(store, {
      nodeTypes,
      edgeTypes,
      minZoom,
      maxZoom,
      translateExtent,
      paneClickDistance
    });
    colorModeClass = useColorModeClass(colorMode);
    $$renderer2.push(`<div${attributes(
      {
        style,
        class: clsx(cc([
          "svelte-flow",
          className,
          store_get($$store_subs ??= {}, "$colorModeClass", colorModeClass)
        ])),
        "data-testid": "svelte-flow__wrapper",
        ...$$restProps,
        role: "application"
      },
      "svelte-4xqsnx"
    )}>`);
    KeyHandler($$renderer2, {
      selectionKey,
      deleteKey,
      panActivationKey,
      multiSelectionKey,
      zoomActivationKey
    });
    $$renderer2.push(`<!----> `);
    Zoom($$renderer2, {
      initialViewport: initViewport,
      onMoveStart,
      onMove,
      onMoveEnd,
      panOnScrollMode: panOnScrollMode === void 0 ? PanOnScrollMode.Free : panOnScrollMode,
      preventScrolling: preventScrolling === void 0 ? true : preventScrolling,
      zoomOnScroll: zoomOnScroll === void 0 ? true : zoomOnScroll,
      zoomOnDoubleClick: zoomOnDoubleClick === void 0 ? true : zoomOnDoubleClick,
      zoomOnPinch: zoomOnPinch === void 0 ? true : zoomOnPinch,
      panOnScroll: panOnScroll === void 0 ? false : panOnScroll,
      panOnDrag: panOnDrag === void 0 ? true : panOnDrag,
      paneClickDistance: paneClickDistance === void 0 ? 0 : paneClickDistance,
      children: ($$renderer3) => {
        Pane($$renderer3, {
          panOnDrag: panOnDrag === void 0 ? true : panOnDrag,
          selectionOnDrag,
          children: ($$renderer4) => {
            Viewport($$renderer4, {
              children: ($$renderer5) => {
                EdgeRenderer($$renderer5, { defaultEdgeOptions });
                $$renderer5.push(`<!----> `);
                ConnectionLine($$renderer5, {
                  containerStyle: connectionLineContainerStyle,
                  style: connectionLineStyle,
                  isCustomComponent: $$slots.connectionLine,
                  $$slots: {
                    connectionLine: ($$renderer6) => {
                      $$renderer6.push(`<!--[-->`);
                      slot($$renderer6, $$props, "connectionLine", {}, null);
                      $$renderer6.push(`<!--]-->`);
                    }
                  }
                });
                $$renderer5.push(`<!----> <div class="svelte-flow__edgelabel-renderer"></div> <div class="svelte-flow__viewport-portal"></div> `);
                NodeRenderer($$renderer5, { nodeClickDistance });
                $$renderer5.push(`<!----> `);
                NodeSelection($$renderer5);
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            UserSelection($$renderer4);
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Attribution($$renderer2, { proOptions, position: attributionPosition });
    $$renderer2.push(`<!----> <!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      nodes,
      edges,
      fitView,
      fitViewOptions,
      minZoom,
      maxZoom,
      initialViewport,
      viewport,
      nodeTypes,
      edgeTypes,
      selectionKey,
      selectionMode,
      panActivationKey,
      multiSelectionKey,
      zoomActivationKey,
      nodesDraggable,
      nodesConnectable,
      nodeDragThreshold,
      elementsSelectable,
      snapGrid,
      deleteKey,
      connectionRadius,
      connectionLineType,
      connectionMode,
      connectionLineStyle,
      connectionLineContainerStyle,
      onMoveStart,
      onMove,
      onMoveEnd,
      isValidConnection,
      translateExtent,
      nodeExtent,
      onlyRenderVisibleElements,
      panOnScrollMode,
      preventScrolling,
      zoomOnScroll,
      zoomOnDoubleClick,
      zoomOnPinch,
      panOnScroll,
      panOnDrag,
      selectionOnDrag,
      autoPanOnConnect,
      autoPanOnNodeDrag,
      onerror,
      ondelete,
      onedgecreate,
      attributionPosition,
      proOptions,
      defaultEdgeOptions,
      width,
      height,
      colorMode,
      onconnect,
      onconnectstart,
      onconnectend,
      onbeforedelete,
      oninit,
      nodeOrigin,
      paneClickDistance,
      nodeClickDistance,
      defaultMarkerColor,
      style,
      class: className
    });
  });
}
function SvelteFlowProvider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let initialNodes = fallback($$props["initialNodes"], void 0);
    let initialEdges = fallback($$props["initialEdges"], void 0);
    let initialWidth = fallback($$props["initialWidth"], void 0);
    let initialHeight = fallback($$props["initialHeight"], void 0);
    let fitView = fallback($$props["fitView"], void 0);
    let nodeOrigin = fallback($$props["nodeOrigin"], void 0);
    const store = createStore({
      nodes: initialNodes,
      edges: initialEdges,
      width: initialWidth,
      height: initialHeight,
      nodeOrigin,
      fitView
    });
    setContext(key, { getStore: () => store });
    onDestroy(() => {
      store.reset();
    });
    $$renderer2.push(`<!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      initialNodes,
      initialEdges,
      initialWidth,
      initialHeight,
      fitView,
      nodeOrigin
    });
  });
}
function ControlButton($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "bgColor",
    "bgColorHover",
    "color",
    "colorHover",
    "borderColor"
  ]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], void 0);
    let bgColor = fallback($$props["bgColor"], void 0);
    let bgColorHover = fallback($$props["bgColorHover"], void 0);
    let color = fallback($$props["color"], void 0);
    let colorHover = fallback($$props["colorHover"], void 0);
    let borderColor = fallback($$props["borderColor"], void 0);
    $$renderer2.push(`<button${attributes(
      {
        type: "button",
        class: clsx(cc(["svelte-flow__controls-button", className])),
        ...$$restProps
      },
      void 0,
      void 0,
      {
        "--xy-controls-button-background-color-props": bgColor,
        "--xy-controls-button-background-color-hover-props": bgColorHover,
        "--xy-controls-button-color-props": color,
        "--xy-controls-button-color-hover-props": colorHover,
        "--xy-controls-button-border-color-props": borderColor
      }
    )}><!--[-->`);
    slot($$renderer2, $$props, "default", { class: "button-svg" }, null);
    $$renderer2.push(`<!--]--></button>`);
    bind_props($$props, {
      class: className,
      bgColor,
      bgColorHover,
      color,
      colorHover,
      borderColor
    });
  });
}
function Plus($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"></path></svg>`);
}
function Minus($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5"><path d="M0 0h32v4.2H0z"></path></svg>`);
}
function Fit($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30"><path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"></path></svg>`);
}
function Lock($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"></path></svg>`);
}
function Unlock($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"></path></svg>`);
}
function Controls$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isInteractive, minZoomReached, maxZoomReached, orientationClass;
    let position = fallback($$props["position"], "bottom-left");
    let showZoom = fallback($$props["showZoom"], true);
    let showFitView = fallback($$props["showFitView"], true);
    let showLock = fallback($$props["showLock"], true);
    let buttonBgColor = fallback($$props["buttonBgColor"], void 0);
    let buttonBgColorHover = fallback($$props["buttonBgColorHover"], void 0);
    let buttonColor = fallback($$props["buttonColor"], void 0);
    let buttonColorHover = fallback($$props["buttonColorHover"], void 0);
    let buttonBorderColor = fallback($$props["buttonBorderColor"], void 0);
    let ariaLabel = fallback($$props["ariaLabel"], void 0);
    let style = fallback($$props["style"], void 0);
    let orientation = fallback($$props["orientation"], "vertical");
    let fitViewOptions = fallback($$props["fitViewOptions"], void 0);
    let className = fallback($$props["class"], "");
    const {
      zoomIn,
      zoomOut,
      fitView,
      viewport,
      minZoom,
      maxZoom,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable
    } = useStore();
    const buttonProps = {
      bgColor: buttonBgColor,
      bgColorHover: buttonBgColorHover,
      color: buttonColor,
      colorHover: buttonColorHover,
      borderColor: buttonBorderColor
    };
    isInteractive = store_get($$store_subs ??= {}, "$nodesDraggable", nodesDraggable) || store_get($$store_subs ??= {}, "$nodesConnectable", nodesConnectable) || store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable);
    minZoomReached = store_get($$store_subs ??= {}, "$viewport", viewport).zoom <= store_get($$store_subs ??= {}, "$minZoom", minZoom);
    maxZoomReached = store_get($$store_subs ??= {}, "$viewport", viewport).zoom >= store_get($$store_subs ??= {}, "$maxZoom", maxZoom);
    orientationClass = orientation === "horizontal" ? "horizontal" : "vertical";
    Panel($$renderer2, {
      class: cc(["svelte-flow__controls", orientationClass, className]),
      position,
      "data-testid": "svelte-flow__controls",
      "aria-label": ariaLabel ?? "Svelte Flow controls",
      style,
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        slot($$renderer3, $$props, "before", {}, null);
        $$renderer3.push(`<!--]--> `);
        if (showZoom) {
          $$renderer3.push("<!--[0-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-zoomin",
              title: "zoom in",
              "aria-label": "zoom in",
              disabled: maxZoomReached
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Plus($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
          $$renderer3.push(`<!----> `);
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-zoomout",
              title: "zoom out",
              "aria-label": "zoom out",
              disabled: minZoomReached
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Minus($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (showFitView) {
          $$renderer3.push("<!--[0-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-fitview",
              title: "fit view",
              "aria-label": "fit view"
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Fit($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (showLock) {
          $$renderer3.push("<!--[0-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-interactive",
              title: "toggle interactivity",
              "aria-label": "toggle interactivity"
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                if (isInteractive) {
                  $$renderer4.push("<!--[0-->");
                  Unlock($$renderer4);
                } else {
                  $$renderer4.push("<!--[-1-->");
                  Lock($$renderer4);
                }
                $$renderer4.push(`<!--]-->`);
              },
              $$slots: { default: true }
            }
          ]));
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <!--[-->`);
        slot($$renderer3, $$props, "default", {}, null);
        $$renderer3.push(`<!--]--> <!--[-->`);
        slot($$renderer3, $$props, "after", {}, null);
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      position,
      showZoom,
      showFitView,
      showLock,
      buttonBgColor,
      buttonBgColorHover,
      buttonColor,
      buttonColorHover,
      buttonBorderColor,
      ariaLabel,
      style,
      orientation,
      fitViewOptions,
      class: className
    });
  });
}
var BackgroundVariant;
(function(BackgroundVariant2) {
  BackgroundVariant2["Lines"] = "lines";
  BackgroundVariant2["Dots"] = "dots";
  BackgroundVariant2["Cross"] = "cross";
})(BackgroundVariant || (BackgroundVariant = {}));
function DotPattern($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let radius = fallback($$props["radius"], 5);
    let className = fallback($$props["class"], "");
    $$renderer2.push(`<circle${attr("cx", radius)}${attr("cy", radius)}${attr("r", radius)}${attr_class(clsx(cc(["svelte-flow__background-pattern", "dots", className])))}></circle>`);
    bind_props($$props, { radius, class: className });
  });
}
function LinePattern($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let lineWidth = fallback($$props["lineWidth"], 1);
    let dimensions = $$props["dimensions"];
    let variant = fallback($$props["variant"], void 0);
    let className = fallback($$props["class"], "");
    $$renderer2.push(`<path${attr("stroke-width", lineWidth)}${attr("d", `M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}`)}${attr_class(clsx(cc(["svelte-flow__background-pattern", variant, className])))}></path>`);
    bind_props($$props, { lineWidth, dimensions, variant, class: className });
  });
}
const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6
};
function Background($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let patternId, scaledGap, scaledSize, patternDimensions, patternOffset;
    let id = fallback($$props["id"], void 0);
    let variant = fallback($$props["variant"], () => BackgroundVariant.Dots, true);
    let gap = fallback($$props["gap"], 20);
    let size = fallback($$props["size"], 1);
    let lineWidth = fallback($$props["lineWidth"], 1);
    let bgColor = fallback($$props["bgColor"], void 0);
    let patternColor = fallback($$props["patternColor"], void 0);
    let patternClass = fallback($$props["patternClass"], void 0);
    let className = fallback($$props["class"], "");
    const { viewport, flowId } = useStore();
    const patternSize = size || defaultSize[variant];
    const isDots = variant === BackgroundVariant.Dots;
    const isCross = variant === BackgroundVariant.Cross;
    const gapXY = Array.isArray(gap) ? gap : [gap, gap];
    patternId = `background-pattern-${store_get($$store_subs ??= {}, "$flowId", flowId)}-${id ? id : ""}`;
    scaledGap = [
      gapXY[0] * store_get($$store_subs ??= {}, "$viewport", viewport).zoom || 1,
      gapXY[1] * store_get($$store_subs ??= {}, "$viewport", viewport).zoom || 1
    ];
    scaledSize = patternSize * store_get($$store_subs ??= {}, "$viewport", viewport).zoom;
    patternDimensions = isCross ? [scaledSize, scaledSize] : scaledGap;
    patternOffset = isDots ? [scaledSize / 2, scaledSize / 2] : [patternDimensions[0] / 2, patternDimensions[1] / 2];
    $$renderer2.push(`<svg${attr_class(clsx(cc(["svelte-flow__background", className])), "svelte-11j66u4")} data-testid="svelte-flow__background"${attr_style("", {
      "--xy-background-color-props": bgColor,
      "--xy-background-pattern-color-props": patternColor
    })}><pattern${attr("id", patternId)}${attr("x", store_get($$store_subs ??= {}, "$viewport", viewport).x % scaledGap[0])}${attr("y", store_get($$store_subs ??= {}, "$viewport", viewport).y % scaledGap[1])}${attr("width", scaledGap[0])}${attr("height", scaledGap[1])} patternUnits="userSpaceOnUse"${attr("patternTransform", `translate(-${patternOffset[0]},-${patternOffset[1]})`)}>`);
    if (isDots) {
      $$renderer2.push("<!--[0-->");
      DotPattern($$renderer2, { radius: scaledSize / 2, class: patternClass });
    } else {
      $$renderer2.push("<!--[-1-->");
      LinePattern($$renderer2, {
        dimensions: patternDimensions,
        variant,
        lineWidth,
        class: patternClass
      });
    }
    $$renderer2.push(`<!--]--></pattern><rect x="0" y="0" width="100%" height="100%"${attr("fill", `url(#${patternId})`)}></rect></svg>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      variant,
      gap,
      size,
      lineWidth,
      bgColor,
      patternColor,
      patternClass,
      class: className
    });
  });
}
const isNode = (element) => isNodeBase(element);
function useSvelteFlow() {
  const { zoomIn, zoomOut, fitView, onbeforedelete, snapGrid, viewport, width, height, minZoom, maxZoom, panZoom, nodes, edges, domNode, nodeLookup, nodeOrigin, edgeLookup, connectionLookup } = useStore();
  const getNodeRect = (node) => {
    const $nodeLookup = get(nodeLookup);
    const nodeToUse = isNode(node) ? node : $nodeLookup.get(node.id);
    const position = nodeToUse.parentId ? evaluateAbsolutePosition(nodeToUse.position, nodeToUse.measured, nodeToUse.parentId, $nodeLookup, get(nodeOrigin)) : nodeToUse.position;
    const nodeWithPosition = {
      ...nodeToUse,
      position,
      width: nodeToUse.measured?.width ?? nodeToUse.width,
      height: nodeToUse.measured?.height ?? nodeToUse.height
    };
    return nodeToRect(nodeWithPosition);
  };
  const updateNode = (id, nodeUpdate, options = { replace: false }) => {
    const node = get(nodeLookup).get(id)?.internals.userNode;
    if (!node) {
      return;
    }
    const nextNode = typeof nodeUpdate === "function" ? nodeUpdate(node) : nodeUpdate;
    if (options.replace) {
      nodes.update((nds) => nds.map((node2) => {
        if (node2.id === id) {
          return isNode(nextNode) ? nextNode : { ...node2, ...nextNode };
        }
        return node2;
      }));
    } else {
      Object.assign(node, nextNode);
      nodes.update((nds) => nds);
    }
  };
  const getInternalNode = (id) => get(nodeLookup).get(id);
  return {
    zoomIn,
    zoomOut,
    getInternalNode,
    getNode: (id) => getInternalNode(id)?.internals.userNode,
    getNodes: (ids) => ids === void 0 ? get(nodes) : getElements(get(nodeLookup), ids),
    getEdge: (id) => get(edgeLookup).get(id),
    getEdges: (ids) => ids === void 0 ? get(edges) : getElements(get(edgeLookup), ids),
    setZoom: (zoomLevel, options) => {
      const currentPanZoom = get(panZoom);
      return currentPanZoom ? currentPanZoom.scaleTo(zoomLevel, { duration: options?.duration }) : Promise.resolve(false);
    },
    getZoom: () => get(viewport).zoom,
    setViewport: async (nextViewport, options) => {
      const currentViewport = get(viewport);
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      await currentPanZoom.setViewport({
        x: nextViewport.x ?? currentViewport.x,
        y: nextViewport.y ?? currentViewport.y,
        zoom: nextViewport.zoom ?? currentViewport.zoom
      }, { duration: options?.duration });
      return Promise.resolve(true);
    },
    getViewport: () => get(viewport),
    setCenter: async (x, y, options) => {
      const nextZoom = typeof options?.zoom !== "undefined" ? options.zoom : get(maxZoom);
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      await currentPanZoom.setViewport({
        x: get(width) / 2 - x * nextZoom,
        y: get(height) / 2 - y * nextZoom,
        zoom: nextZoom
      }, { duration: options?.duration });
      return Promise.resolve(true);
    },
    fitView,
    fitBounds: async (bounds, options) => {
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      const viewport2 = getViewportForBounds(bounds, get(width), get(height), get(minZoom), get(maxZoom), options?.padding ?? 0.1);
      await currentPanZoom.setViewport(viewport2, { duration: options?.duration });
      return Promise.resolve(true);
    },
    getIntersectingNodes: (nodeOrRect, partially = true, nodesToIntersect) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
      if (!nodeRect) {
        return [];
      }
      return (nodesToIntersect || get(nodes)).filter((n) => {
        const internalNode = get(nodeLookup).get(n.id);
        if (!internalNode || !isRect && n.id === nodeOrRect.id) {
          return false;
        }
        const currNodeRect = nodeToRect(internalNode);
        const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
        const partiallyVisible = partially && overlappingArea > 0;
        return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
      });
    },
    isNodeIntersecting: (nodeOrRect, area, partially = true) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
      if (!nodeRect) {
        return false;
      }
      const overlappingArea = getOverlappingArea(nodeRect, area);
      const partiallyVisible = partially && overlappingArea > 0;
      return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
    },
    deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove,
        edgesToRemove,
        nodes: get(nodes),
        edges: get(edges),
        onBeforeDelete: get(onbeforedelete)
      });
      if (matchingNodes) {
        nodes.update((nds) => nds.filter((node) => !matchingNodes.some(({ id }) => id === node.id)));
      }
      if (matchingEdges) {
        edges.update((eds) => eds.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id)));
      }
      return {
        deletedNodes: matchingNodes,
        deletedEdges: matchingEdges
      };
    },
    screenToFlowPosition: (position, options = { snapToGrid: true }) => {
      const _domNode = get(domNode);
      if (!_domNode) {
        return position;
      }
      const _snapGrid = options.snapToGrid ? get(snapGrid) : false;
      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const correctedPosition = {
        x: position.x - domX,
        y: position.y - domY
      };
      return pointToRendererPoint(correctedPosition, [x, y, zoom], _snapGrid !== null, _snapGrid || [1, 1]);
    },
    /**
     *
     * @param position
     * @returns
     */
    flowToScreenPosition: (position) => {
      const _domNode = get(domNode);
      if (!_domNode) {
        return position;
      }
      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const rendererPosition = rendererPointToPoint(position, [x, y, zoom]);
      return {
        x: rendererPosition.x + domX,
        y: rendererPosition.y + domY
      };
    },
    toObject: () => {
      return {
        nodes: get(nodes).map((node) => ({
          ...node,
          // we want to make sure that changes to the nodes object that gets returned by toObject
          // do not affect the nodes object
          position: { ...node.position },
          data: { ...node.data }
        })),
        edges: get(edges).map((edge) => ({ ...edge })),
        viewport: { ...get(viewport) }
      };
    },
    updateNode,
    updateNodeData: (id, dataUpdate, options) => {
      const node = get(nodeLookup).get(id)?.internals.userNode;
      if (!node) {
        return;
      }
      const nextData = typeof dataUpdate === "function" ? dataUpdate(node) : dataUpdate;
      node.data = options?.replace ? nextData : { ...node.data, ...nextData };
      nodes.update((nds) => nds);
    },
    getNodesBounds: (nodes2) => {
      const _nodeLookup = get(nodeLookup);
      const _nodeOrigin = get(nodeOrigin);
      return getNodesBounds(nodes2, { nodeLookup: _nodeLookup, nodeOrigin: _nodeOrigin });
    },
    getHandleConnections: ({ type, id, nodeId }) => Array.from(get(connectionLookup).get(`${nodeId}-${type}-${id ?? null}`)?.values() ?? []),
    viewport
  };
}
function getElements(lookup, ids) {
  const result = [];
  for (const id of ids) {
    const item = lookup.get(id);
    if (item) {
      const element = "internals" in item ? item.internals?.userNode : item;
      result.push(element);
    }
  }
  return result;
}
function useNodesInitialized() {
  const { nodesInitialized } = useStore();
  return {
    subscribe: nodesInitialized.subscribe
  };
}
function Valves_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let tab = "tools";
    let selectedId = "";
    let loading = false;
    let valvesSpec = null;
    let valves = {};
    const getUserValves = async () => {
      loading = true;
      {
        valves = await getUserValvesById(localStorage.token, selectedId);
        valvesSpec = await getUserValvesSpecById(localStorage.token, selectedId);
      }
      if (valvesSpec) {
        for (const property in valvesSpec.properties) {
          if (valvesSpec.properties[property]?.type === "array") {
            valves[property] = (valves[property] ?? []).join(",");
          }
        }
      }
      loading = false;
    };
    const init = async () => {
      loading = true;
      if (store_get($$store_subs ??= {}, "$functions", functions) === null) {
        functions.set(await getFunctions(localStorage.token));
      }
      if (store_get($$store_subs ??= {}, "$tools", tools) === null) {
        tools.set(await getTools(localStorage.token));
      }
      loading = false;
    };
    {
      selectedId = "";
    }
    if (selectedId) {
      getUserValves();
    }
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (show && !loading) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="flex flex-col"><div class="space-y-1"><div class="flex gap-2"><div class="flex-1">`);
        $$renderer3.select(
          {
            class: "w-full rounded-sm text-xs py-2 px-1 bg-transparent outline-hidden",
            value: tab,
            placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select")
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "tools", class: "bg-gray-100 dark:bg-gray-800" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tools"))}`);
            });
            $$renderer4.option({ value: "functions", class: "bg-gray-100 dark:bg-gray-800" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Functions"))}`);
            });
          }
        );
        $$renderer3.push(`</div> <div class="flex-1">`);
        $$renderer3.select(
          {
            class: "w-full rounded-sm py-2 px-1 text-xs bg-transparent outline-hidden",
            value: selectedId
          },
          ($$renderer4) => {
            {
              $$renderer4.push("<!--[0-->");
              $$renderer4.option(
                {
                  value: "",
                  selected: true,
                  disabled: true,
                  class: "bg-gray-100 dark:bg-gray-800"
                },
                ($$renderer5) => {
                  $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a tool"))}`);
                }
              );
              $$renderer4.push(` <!--[-->`);
              const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$tools", tools).filter((tool) => !tool?.id?.startsWith("server:")).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));
              for (let toolIdx = 0, $$length = each_array.length; toolIdx < $$length; toolIdx++) {
                let tool = each_array[toolIdx];
                $$renderer4.option({ value: tool.id, class: "bg-gray-100 dark:bg-gray-800" }, ($$renderer5) => {
                  $$renderer5.push(`${escape_html(tool.name)}`);
                });
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(`</div></div></div> `);
        if (selectedId) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<hr class="border-gray-50/30 dark:border-gray-800/30 my-1 w-full"/> <div class="my-2 text-xs">`);
          if (!loading) {
            $$renderer3.push("<!--[0-->");
            Valves($$renderer3, {
              valvesSpec,
              get valves() {
                return valves;
              },
              set valves($$value) {
                valves = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
            Spinner($$renderer3, { className: "size-5" });
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></form>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        Spinner($$renderer3, { className: "size-4" });
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
    bind_props($$props, { show });
  });
}
function Controls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let models2 = fallback($$props["models"], () => [], true);
    let chatFiles = fallback($$props["chatFiles"], () => [], true);
    let params = fallback($$props["params"], () => ({}), true);
    let embed2 = fallback($$props["embed"], false);
    const getOpen = (key2, fallback2 = true) => {
      const v = localStorage.getItem(`chatControls.${key2}`);
      return v !== null ? v === "true" : fallback2;
    };
    const setOpen = (key2) => (open) => {
      localStorage.setItem(`chatControls.${key2}`, String(open));
    };
    let showFiles = getOpen("files");
    let showValves = getOpen("valves", false);
    let showSystemPrompt = getOpen("systemPrompt");
    let showAdvancedParams = getOpen("advancedParams");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="dark:text-white">`);
      if (!embed2) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex items-center justify-between dark:text-gray-100 mb-2"><div class="text-md self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Controls"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close chat controls"))}>`);
        XMark($$renderer3, { className: "size-3.5" });
        $$renderer3.push(`<!----></button></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.controls ?? true)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="dark:text-gray-200 text-sm py-0.5 px-0.5">`);
        if (chatFiles.length > 0) {
          $$renderer3.push("<!--[0-->");
          Collapsible($$renderer3, {
            title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Files"),
            onChange: setOpen("files"),
            buttonClassName: "w-full",
            get open() {
              return showFiles;
            },
            set open($$value) {
              showFiles = $$value;
              $$settled = false;
            },
            $$slots: {
              content: ($$renderer4) => {
                $$renderer4.push(`<div class="flex flex-col gap-1 mt-1.5" slot="content"><!--[-->`);
                const each_array = ensure_array_like(chatFiles);
                for (let fileIdx = 0, $$length = each_array.length; fileIdx < $$length; fileIdx++) {
                  let file = each_array[fileIdx];
                  FileItem($$renderer4, {
                    className: "w-full",
                    item: file,
                    edit: true,
                    url: file?.url ? file.url : null,
                    name: file.name,
                    type: file.type,
                    size: file?.size,
                    dismissible: true,
                    small: true
                  });
                }
                $$renderer4.push(`<!--]--></div>`);
              }
            }
          });
          $$renderer3.push(`<!----> <hr class="my-2 border-gray-50 dark:border-gray-700/10"/>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.valves ?? true)) {
          $$renderer3.push("<!--[0-->");
          Collapsible($$renderer3, {
            onChange: setOpen("valves"),
            title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Valves"),
            buttonClassName: "w-full",
            get open() {
              return showValves;
            },
            set open($$value) {
              showValves = $$value;
              $$settled = false;
            },
            $$slots: {
              content: ($$renderer4) => {
                $$renderer4.push(`<div class="text-sm" slot="content">`);
                Valves_1($$renderer4, { show: showValves });
                $$renderer4.push(`<!----></div>`);
              }
            }
          });
          $$renderer3.push(`<!----> <hr class="my-2 border-gray-50 dark:border-gray-700/10"/>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.system_prompt ?? true)) {
          $$renderer3.push("<!--[0-->");
          Collapsible($$renderer3, {
            title: store_get($$store_subs ??= {}, "$i18n", i18n).t("System Prompt"),
            onChange: setOpen("systemPrompt"),
            buttonClassName: "w-full",
            get open() {
              return showSystemPrompt;
            },
            set open($$value) {
              showSystemPrompt = $$value;
              $$settled = false;
            },
            $$slots: {
              content: ($$renderer4) => {
                $$renderer4.push(`<div slot="content"><textarea${attr_class(`w-full text-xs outline-hidden resize-vertical ${stringify(store_get($$store_subs ??= {}, "$settings", settings).highContrastMode ? "border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5" : "py-1.5 bg-transparent")}`)} rows="4"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter system prompt"))}>`);
                const $$body = escape_html(params.system);
                if ($$body) {
                  $$renderer4.push(`${$$body}`);
                }
                $$renderer4.push(`</textarea></div>`);
              }
            }
          });
          $$renderer3.push(`<!----> <hr class="my-2 border-gray-50 dark:border-gray-700/10"/>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.params ?? true)) {
          $$renderer3.push("<!--[0-->");
          Collapsible($$renderer3, {
            title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Advanced Params"),
            onChange: setOpen("advancedParams"),
            buttonClassName: "w-full",
            get open() {
              return showAdvancedParams;
            },
            set open($$value) {
              showAdvancedParams = $$value;
              $$settled = false;
            },
            $$slots: {
              content: ($$renderer4) => {
                $$renderer4.push(`<div class="text-sm mt-1.5" slot="content"><div>`);
                AdvancedParams($$renderer4, {
                  admin: store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
                  custom: true,
                  get params() {
                    return params;
                  },
                  set params($$value) {
                    params = $$value;
                    $$settled = false;
                  }
                });
                $$renderer4.push(`<!----></div></div>`);
              }
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
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
    bind_props($$props, { models: models2, chatFiles, params, embed: embed2 });
  });
}
function VideoInputMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let onClose = fallback($$props["onClose"], () => {
    });
    let devices = $$props["devices"];
    let show = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        side: "top",
        sideOffset: 6,
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
          $$renderer4.push(`<!--[-->`);
          slot($$renderer4, $$props, "default", {}, null);
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content"><div class="min-w-[180px] rounded-lg p-1 border border-gray-100 dark:border-gray-800 z-[9999] bg-white dark:bg-gray-900 dark:text-white shadow-xs"><!--[-->`);
            const each_array = ensure_array_like(devices);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let device = each_array[$$index];
              $$renderer4.push(`<button class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md w-full"><div class="flex items-center"><div class="line-clamp-1">${escape_html(device?.label ?? "Camera")}</div></div></button>`);
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
    bind_props($$props, { onClose, devices });
  });
}
function CallOverlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let eventTarget = $$props["eventTarget"];
    let submitPrompt = $$props["submitPrompt"];
    let stopResponse = $$props["stopResponse"];
    let files = $$props["files"];
    let chatId2 = $$props["chatId"];
    let modelId = $$props["modelId"];
    let model = null;
    let loading = false;
    let confirmed = false;
    let assistantSpeaking = false;
    let emoji = null;
    let camera = false;
    let cameraStream = null;
    let chatStreaming = false;
    let rmsLevel = 0;
    let hasStartedSpeaking = false;
    let mediaRecorder;
    let audioStream = null;
    let audioChunks = [];
    let videoInputDevices = [];
    const stopVideoStream = async () => {
      if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      cameraStream = null;
    };
    const takeScreenshot = () => {
      const video = document.getElementById("camera-feed");
      const canvas = document.getElementById("camera-canvas");
      if (!canvas) {
        return;
      }
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataURL = canvas.toDataURL("image/png");
      /* @__PURE__ */ console.log(dataURL);
      return dataURL;
    };
    const stopCamera = async () => {
      await stopVideoStream();
      camera = false;
    };
    const MIN_DECIBELS = -55;
    const transcribeHandler = async (audioBlob) => {
      await tick();
      const file = blobToFile(audioBlob, "recording.wav");
      const res = await transcribeAudio(localStorage.token, file, store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        /* @__PURE__ */ console.log(res.text);
        if (res.text !== "") {
          const _responses = await submitPrompt(res.text, { _raw: true });
          /* @__PURE__ */ console.log(_responses);
        }
      }
    };
    const stopRecordingCallback = async (_continue = true) => {
      if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
        /* @__PURE__ */ console.log("%c%s", "color: red; font-size: 20px;", "🚨 stopRecordingCallback 🚨");
        const _audioChunks = audioChunks.slice(0);
        audioChunks = [];
        mediaRecorder = false;
        if (_continue) {
          startRecording();
        }
        if (confirmed) {
          loading = true;
          emoji = null;
          if (cameraStream) {
            const imageUrl = takeScreenshot();
            files = [{ type: "image", url: imageUrl }];
          }
          const audioBlob = new Blob(_audioChunks, { type: "audio/wav" });
          await transcribeHandler(audioBlob);
          confirmed = false;
          loading = false;
        }
      } else {
        audioChunks = [];
        mediaRecorder = false;
        if (audioStream) {
          const tracks = audioStream.getTracks();
          tracks.forEach((track) => track.stop());
        }
        audioStream = null;
      }
    };
    const startRecording = async () => {
      if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
        if (!audioStream) {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
        }
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.onstart = () => {
          /* @__PURE__ */ console.log("Recording started");
          audioChunks = [];
        };
        mediaRecorder.ondataavailable = (event) => {
          if (hasStartedSpeaking) {
            audioChunks.push(event.data);
          }
        };
        mediaRecorder.onstop = (e) => {
          /* @__PURE__ */ console.log("Recording stopped", audioStream, e);
          stopRecordingCallback();
        };
        analyseAudio(audioStream);
      }
    };
    const stopAudioStream = async () => {
      try {
        if (mediaRecorder) {
          mediaRecorder.stop();
        }
      } catch (error) {
        /* @__PURE__ */ console.log("Error stopping audio stream:", error);
      }
      if (!audioStream) return;
      audioStream.getAudioTracks().forEach(function(track) {
        track.stop();
      });
      audioStream = null;
    };
    const calculateRMS = (data) => {
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalizedValue = (data[i] - 128) / 128;
        sumSquares += normalizedValue * normalizedValue;
      }
      return Math.sqrt(sumSquares / data.length);
    };
    const analyseAudio = (stream) => {
      const audioContext = new AudioContext();
      const audioStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = MIN_DECIBELS;
      audioStreamSource.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const domainData = new Uint8Array(bufferLength);
      const timeDomainData = new Uint8Array(analyser.fftSize);
      let lastSoundTime = Date.now();
      hasStartedSpeaking = false;
      /* @__PURE__ */ console.log("🔊 Sound detection started", lastSoundTime, hasStartedSpeaking);
      const detectSound = () => {
        const processFrame = () => {
          if (!mediaRecorder || !store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
            return;
          }
          if (assistantSpeaking && !(store_get($$store_subs ??= {}, "$settings", settings)?.voiceInterruption ?? false)) {
            analyser.maxDecibels = 0;
            analyser.minDecibels = -1;
          } else {
            analyser.minDecibels = MIN_DECIBELS;
            analyser.maxDecibels = -30;
          }
          analyser.getByteTimeDomainData(timeDomainData);
          analyser.getByteFrequencyData(domainData);
          rmsLevel = calculateRMS(timeDomainData);
          const hasSound = domainData.some((value) => value > 0);
          if (hasSound) {
            /* @__PURE__ */ console.log("%c%s", "color: red; font-size: 20px;", "🔊 Sound detected");
            if (mediaRecorder && mediaRecorder.state !== "recording") {
              mediaRecorder.start();
            }
            if (!hasStartedSpeaking) {
              hasStartedSpeaking = true;
              stopAllAudio();
            }
            lastSoundTime = Date.now();
          }
          if (hasStartedSpeaking) {
            if (Date.now() - lastSoundTime > 2e3) {
              confirmed = true;
              if (mediaRecorder) {
                /* @__PURE__ */ console.log("%c%s", "color: red; font-size: 20px;", "🔇 Silence detected");
                mediaRecorder.stop();
                return;
              }
            }
          }
          window.requestAnimationFrame(processFrame);
        };
        window.requestAnimationFrame(processFrame);
      };
      detectSound();
    };
    let finishedMessages = {};
    let currentMessageId = null;
    let currentUtterance = null;
    const getVoiceId = () => {
      if (store_get($$store_subs ??= {}, "$settings", settings)?.audio?.tts?.defaultVoice === store_get($$store_subs ??= {}, "$config", config).audio.tts.voice) {
        return store_get($$store_subs ??= {}, "$settings", settings)?.audio?.tts?.voice ?? store_get($$store_subs ??= {}, "$config", config)?.audio?.tts?.voice;
      }
      return store_get($$store_subs ??= {}, "$config", config)?.audio?.tts?.voice;
    };
    const speakSpeechSynthesisHandler = (content) => {
      if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
        return new Promise((resolve) => {
          let voices = [];
          const getVoicesLoop = setInterval(
            async () => {
              voices = await speechSynthesis.getVoices();
              if (voices.length > 0) {
                clearInterval(getVoicesLoop);
                const voiceId = getVoiceId();
                const voice = voices?.filter((v) => v.voiceURI === voiceId)?.at(0) ?? void 0;
                currentUtterance = new SpeechSynthesisUtterance(content);
                currentUtterance.rate = store_get($$store_subs ??= {}, "$settings", settings).audio?.tts?.playbackRate ?? 1;
                if (voice) {
                  currentUtterance.voice = voice;
                }
                speechSynthesis.speak(currentUtterance);
                currentUtterance.onend = async (e) => {
                  await new Promise((r) => setTimeout(r, 200));
                  resolve(e);
                };
              }
            },
            100
          );
        });
      } else {
        return Promise.resolve();
      }
    };
    const playAudio = (audio) => {
      if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
        return new Promise((resolve) => {
          const audioElement = document.getElementById("audioElement");
          if (audioElement) {
            audioElement.src = audio.src;
            audioElement.muted = true;
            audioElement.playbackRate = store_get($$store_subs ??= {}, "$settings", settings).audio?.tts?.playbackRate ?? 1;
            audioElement.play().then(() => {
              audioElement.muted = false;
            }).catch((error) => {
              /* @__PURE__ */ console.error(error);
            });
            audioElement.onended = async (e) => {
              await new Promise((r) => setTimeout(r, 100));
              resolve(e);
            };
          }
        });
      } else {
        return Promise.resolve();
      }
    };
    const stopAllAudio = async () => {
      assistantSpeaking = false;
      if (chatStreaming) {
        stopResponse();
      }
      if (currentUtterance) {
        speechSynthesis.cancel();
        currentUtterance = null;
      }
      const audioElement = document.getElementById("audioElement");
      if (audioElement) {
        audioElement.muted = true;
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
    let audioAbortController = new AbortController();
    const audioCache = /* @__PURE__ */ new Map();
    const emojiCache = /* @__PURE__ */ new Map();
    const fetchAudio = async (content) => {
      if (!audioCache.has(content)) {
        try {
          if (store_get($$store_subs ??= {}, "$settings", settings)?.showEmojiInCall ?? false) {
            const emoji2 = await generateEmoji(localStorage.token, modelId, content, chatId2);
            if (emoji2) {
              emojiCache.set(content, emoji2);
            }
          }
          if (store_get($$store_subs ??= {}, "$settings", settings).audio?.tts?.engine === "browser-kokoro") {
            const url2 = await store_get($$store_subs ??= {}, "$TTSWorker", TTSWorker).generate({ text: content, voice: getVoiceId() }).catch((error) => {
              /* @__PURE__ */ console.error(error);
              toast.error(`${error}`);
            });
            if (url2) {
              audioCache.set(content, new Audio(url2));
            }
          } else if (store_get($$store_subs ??= {}, "$config", config).audio.tts.engine !== "") {
            const res = await synthesizeOpenAISpeech(localStorage.token, getVoiceId(), content).catch((error) => {
              /* @__PURE__ */ console.error(error);
              return null;
            });
            if (res) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              audioCache.set(content, new Audio(blobUrl));
            }
          } else {
            audioCache.set(content, true);
          }
        } catch (error) {
          /* @__PURE__ */ console.error("Error synthesizing speech:", error);
        }
      }
      return audioCache.get(content);
    };
    let messages = {};
    const monitorAndPlayAudio = async (id, signal) => {
      while (!signal.aborted) {
        if (messages[id] && messages[id].length > 0) {
          const content = messages[id].shift();
          if (audioCache.has(content)) {
            if ((store_get($$store_subs ??= {}, "$settings", settings)?.showEmojiInCall ?? false) && emojiCache.has(content)) {
              emoji = emojiCache.get(content);
            } else {
              emoji = null;
            }
            if (store_get($$store_subs ??= {}, "$config", config).audio.tts.engine !== "") {
              try {
                /* @__PURE__ */ console.log("%c%s", "color: red; font-size: 20px;", `Playing audio for content: ${content}`);
                const audio = audioCache.get(content);
                await playAudio(audio);
                /* @__PURE__ */ console.log(`Played audio for content: ${content}`);
                await new Promise((resolve) => setTimeout(resolve, 200));
              } catch (error) {
                /* @__PURE__ */ console.error("Error playing audio:", error);
              }
            } else {
              await speakSpeechSynthesisHandler(content);
            }
          } else {
            messages[id].unshift(content);
            /* @__PURE__ */ console.log(`Audio for "${content}" not yet available in the cache, re-queued...`);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } else if (finishedMessages[id] && messages[id] && messages[id].length === 0) {
          assistantSpeaking = false;
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
      /* @__PURE__ */ console.log(`Audio monitoring and playing stopped for message ID ${id}`);
    };
    const chatStartHandler = async (e) => {
      const { id } = e.detail;
      chatStreaming = true;
      if (currentMessageId !== id) {
        /* @__PURE__ */ console.log(`Received chat start event for message ID ${id}`);
        currentMessageId = id;
        if (audioAbortController) {
          audioAbortController.abort();
        }
        audioAbortController = new AbortController();
        assistantSpeaking = true;
        monitorAndPlayAudio(id, audioAbortController.signal);
      }
    };
    const chatEventHandler = async (e) => {
      const { id, content } = e.detail;
      if (currentMessageId === id) {
        /* @__PURE__ */ console.log(`Received chat event for message ID ${id}: ${content}`);
        try {
          if (messages[id] === void 0) {
            messages[id] = [content];
          } else {
            messages[id].push(content);
          }
          /* @__PURE__ */ console.log(content);
          fetchAudio(content);
        } catch (error) {
          /* @__PURE__ */ console.error("Failed to fetch or play audio:", error);
        }
      }
    };
    const chatFinishHandler = async (e) => {
      const { id, content } = e.detail;
      finishedMessages[id] = true;
      chatStreaming = false;
    };
    onDestroy(async () => {
      await stopAllAudio();
      await stopRecordingCallback(false);
      await stopCamera();
      await stopAudioStream();
      eventTarget.removeEventListener("chat:start", chatStartHandler);
      eventTarget.removeEventListener("chat", chatEventHandler);
      eventTarget.removeEventListener("chat:finish", chatFinishHandler);
      audioAbortController.abort();
      await tick();
      await stopAllAudio();
    });
    if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="max-w-lg w-full h-full max-h-[100dvh] flex flex-col justify-between p-3 md:p-6">`);
      if (camera) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button type="button" class="flex justify-center items-center w-full h-20 min-h-20">`);
        if (emoji) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="transition-all rounded-full"${attr_style(`font-size:${stringify(rmsLevel * 100 > 4 ? "4.5" : rmsLevel * 100 > 2 ? "4.25" : rmsLevel * 100 > 1 ? "3.75" : "3.5")}rem;width: 100%; text-align:center;`)}>${escape_html(emoji)}</div>`);
        } else if (loading || assistantSpeaking) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<svg class="size-12 text-gray-900 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">`);
          $$renderer2.push(`<style>
							.spinner_qM83 {
								animation: spinner_8HQG 1.05s infinite;
							}
							.spinner_oXPr {
								animation-delay: 0.1s;
							}
							.spinner_ZTLf {
								animation-delay: 0.2s;
							}
							@keyframes spinner_8HQG {
								0%,
								57.14% {
									animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
									transform: translate(0);
								}
								28.57% {
									animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
									transform: translateY(-6px);
								}
								100% {
									transform: translate(0);
								}
							}
						</style>`);
          $$renderer2.push(`<circle class="spinner_qM83" cx="4" cy="12" r="3"></circle><circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3"></circle><circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3"></circle></svg>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div${attr_class(` ${stringify(rmsLevel * 100 > 4 ? " size-[4.5rem]" : rmsLevel * 100 > 2 ? " size-16" : rmsLevel * 100 > 1 ? "size-14" : "size-12")} transition-all rounded-full bg-cover bg-center bg-no-repeat`)}${attr_style(`background-image: url('${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model?.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}&voice=true');`)}></div>`);
        }
        $$renderer2.push(`<!--]--></button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex justify-center items-center flex-1 h-full w-full max-h-full">`);
      if (!camera) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button type="button">`);
        if (emoji) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="transition-all rounded-full"${attr_style(`font-size:${stringify(rmsLevel * 100 > 4 ? "13" : rmsLevel * 100 > 2 ? "12" : rmsLevel * 100 > 1 ? "11.5" : "11")}rem;width:100%;text-align:center;`)}>${escape_html(emoji)}</div>`);
        } else if (loading || assistantSpeaking) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<svg class="size-44 text-gray-900 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">`);
          $$renderer2.push(`<style>
								.spinner_qM83 {
									animation: spinner_8HQG 1.05s infinite;
								}
								.spinner_oXPr {
									animation-delay: 0.1s;
								}
								.spinner_ZTLf {
									animation-delay: 0.2s;
								}
								@keyframes spinner_8HQG {
									0%,
									57.14% {
										animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
										transform: translate(0);
									}
									28.57% {
										animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
										transform: translateY(-6px);
									}
									100% {
										transform: translate(0);
									}
								}
							</style>`);
          $$renderer2.push(`<circle class="spinner_qM83" cx="4" cy="12" r="3"></circle><circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3"></circle><circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3"></circle></svg>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div${attr_class(` ${stringify(rmsLevel * 100 > 4 ? " size-52" : rmsLevel * 100 > 2 ? "size-48" : rmsLevel * 100 > 1 ? "size-44" : "size-40")} transition-all rounded-full bg-cover bg-center bg-no-repeat`)}${attr_style(`background-image: url('${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model?.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}&voice=true');`)}></div>`);
        }
        $$renderer2.push(`<!--]--></button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="relative flex video-container w-full max-h-full pt-2 pb-4 md:py-6 px-2 h-full"><video id="camera-feed" autoplay="" class="rounded-2xl h-full min-w-full object-cover object-center" playsinline=""></video> <canvas id="camera-canvas" style="display:none;"></canvas> <div class="absolute top-4 md:top-8 left-4"><button type="button" class="p-1.5 text-white cursor-pointer backdrop-blur-xl bg-black/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-6"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"></path></svg></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="flex justify-between items-center pb-2 w-full"><div>`);
      if (camera) {
        $$renderer2.push("<!--[0-->");
        VideoInputMenu($$renderer2, {
          devices: videoInputDevices,
          children: ($$renderer3) => {
            $$renderer3.push(`<button class="p-3 rounded-full bg-gray-50 dark:bg-gray-900" type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd"></path></svg></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[-1-->");
        Tooltip($$renderer2, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Camera"),
          children: ($$renderer3) => {
            $$renderer3.push(`<button class="p-3 rounded-full bg-gray-50 dark:bg-gray-900" type="button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"></path></svg></button>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]--></div> <div><button type="button"><div class="line-clamp-1 text-sm font-medium">`);
      if (loading) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thinking..."))}`);
      } else if (assistantSpeaking) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tap to interrupt"))}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Listening..."))}`);
      }
      $$renderer2.push(`<!--]--></div></button></div> <div><button class="p-3 rounded-full bg-gray-50 dark:bg-gray-900" type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path></svg></button></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      eventTarget,
      submitPrompt,
      stopResponse,
      files,
      chatId: chatId2,
      modelId
    });
  });
}
function ArrowsPointingOut($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Artifacts($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let overlay = fallback($$props["overlay"], false);
    let contents = [];
    let selectedContentIdx = 0;
    $$renderer2.push(`<div class="w-full h-full relative flex flex-col bg-white dark:bg-gray-850" id="artifacts-container"><div class="w-full h-full flex flex-col flex-1 relative">`);
    if (contents.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="pointer-events-auto z-20 flex justify-between items-center p-2.5 font-primar text-gray-900 dark:text-white"><div class="flex-1 flex items-center justify-between pr-1"><div class="flex items-center space-x-2"><div class="flex items-center gap-0.5 self-center min-w-fit" dir="ltr"><button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition disabled:cursor-not-allowed"${attr("disabled", contents.length <= 1, true)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> <div class="text-xs self-center dark:text-gray-100 min-w-fit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Version {{selectedVersion}} of {{totalVersions}}", {
        selectedVersion: selectedContentIdx + 1,
        totalVersions: contents.length
      }))}</div> <button class="self-center p-1 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white hover:text-black rounded-md transition disabled:cursor-not-allowed"${attr("disabled", contents.length <= 1, true)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button></div></div> <div class="flex items-center gap-1.5"><button class="copy-code-button bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-1.5 py-0.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"))}</button> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md p-0.5">`);
          Download($$renderer3, { className: "size-3.5" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      if (contents[selectedContentIdx].type === "iframe") {
        $$renderer2.push("<!--[0-->");
        Tooltip($$renderer2, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Open in full screen"),
          children: ($$renderer3) => {
            $$renderer3.push(`<button class="bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md p-0.5">`);
            ArrowsPointingOut($$renderer3, { className: "size-3.5" });
            $$renderer3.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <button class="self-center pointer-events-auto p-1 rounded-full bg-white dark:bg-gray-850">`);
      XMark($$renderer2, { className: "size-3.5 text-gray-900 dark:text-white" });
      $$renderer2.push(`<!----></button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (overlay) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute top-0 left-0 right-0 bottom-0 z-10"></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex-1 w-full h-full"><div class="h-full flex flex-col">`);
    if (contents.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="max-w-full w-full h-full">`);
      if (contents[selectedContentIdx].type === "iframe") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<iframe title="Content"${attr("srcdoc", contents[selectedContentIdx].content)} class="w-full border-0 h-full rounded-none"${attr("sandbox", `allow-scripts allow-downloads${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowForms ?? false ? " allow-forms" : "")}${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowSameOrigin ?? false ? " allow-same-origin" : "")}`)}></iframe>`);
      } else if (contents[selectedContentIdx].type === "svg") {
        $$renderer2.push("<!--[1-->");
        SVGPanZoom($$renderer2, {
          className: " w-full h-full max-h-full overflow-hidden",
          svg: contents[selectedContentIdx].content
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="m-auto font-medium text-xs text-gray-900 dark:text-white">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No HTML, CSS, or JavaScript content found."))}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { overlay });
  });
}
function Embeds($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let overlay = fallback($$props["overlay"], false);
    const getSrcUrl = (url2, chatId2, messageId, sourceId) => {
      try {
        const parsed = new URL(url2);
        if (chatId2) {
          parsed.searchParams.set("chat_id", chatId2);
        }
        if (messageId) {
          parsed.searchParams.set("message_id", messageId);
        }
        if (sourceId) {
          parsed.searchParams.set("source_id", sourceId);
        }
        return parsed.toString();
      } catch {
        const hasQuery = url2.includes("?");
        const parts = [];
        if (chatId2) parts.push(`chat_id=${encodeURIComponent(chatId2)}`);
        if (messageId) parts.push(`message_id=${encodeURIComponent(messageId)}`);
        if (sourceId) parts.push(`source_id=${encodeURIComponent(sourceId)}`);
        if (parts.length === 0) return url2;
        return url2 + (hasQuery ? "&" : "?") + parts.join("&");
      }
    };
    if (store_get($$store_subs ??= {}, "$embed", embed)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="h-full w-full flex flex-col"><div class="pointer-events-auto z-20 flex justify-between items-center py-3 px-2 font-primar text-gray-900 dark:text-white flex-shrink-0"><div class="flex-1 flex items-center justify-between pl-2"><a class="flex items-center space-x-2 hover:underline"${attr("href", store_get($$store_subs ??= {}, "$embed", embed)?.url)} target="_blank" rel="noopener noreferrer">${escape_html(store_get($$store_subs ??= {}, "$embed", embed)?.title ?? "Embedded Content")}</a></div> <button class="self-center pointer-events-auto p-1 rounded-full bg-white dark:bg-gray-850" aria-label="Close embed">`);
      XMark($$renderer2, { className: "size-3.5 text-gray-900 dark:text-white" });
      $$renderer2.push(`<!----></button></div> <div class="w-full flex-1 min-h-0 relative">`);
      if (overlay) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="absolute top-0 left-0 right-0 bottom-0 z-10"></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      FullHeightIframe($$renderer2, {
        src: getSrcUrl(store_get($$store_subs ??= {}, "$embed", embed)?.url ?? "", store_get($$store_subs ??= {}, "$embed", embed)?.chatId, store_get($$store_subs ??= {}, "$embed", embed)?.messageId, store_get($$store_subs ??= {}, "$embed", embed)?.sourceId),
        payload: store_get($$store_subs ??= {}, "$embed", embed)?.source ?? null,
        iframeClassName: "w-full h-full"
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { overlay });
  });
}
const EXT_OVERRIDE = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  cs: "csharp",
  fs: "fsharp",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  mdx: "mdx",
  dockerfile: "dockerfile",
  tf: "terraform",
  hcl: "hcl",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hs: "haskell",
  ml: "ocaml",
  mli: "ocaml",
  pl: "perl",
  pm: "perl",
  r: "r",
  m: "objective-c",
  mm: "objective-cpp",
  h: "c",
  hpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  proto: "proto",
  nim: "nim",
  zig: "zig",
  v: "v",
  svelte: "svelte",
  vue: "vue",
  astro: "astro",
  prisma: "prisma",
  graphql: "graphql",
  gql: "graphql",
  jsonc: "jsonc",
  jsonl: "jsonl"
};
const KNOWN_LANG_IDS = /* @__PURE__ */ new Set([
  "ada",
  "awk",
  "bat",
  "c",
  "cmake",
  "clojure",
  "cpp",
  "crystal",
  "css",
  "d",
  "dart",
  "diff",
  "elixir",
  "elm",
  "erlang",
  "fish",
  "gleam",
  "glsl",
  "go",
  "groovy",
  "haml",
  "haskell",
  "hlsl",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "json5",
  "jsonc",
  "jsx",
  "julia",
  "kotlin",
  "latex",
  "less",
  "lisp",
  "log",
  "lua",
  "make",
  "markdown",
  "matlab",
  "mdx",
  "mojo",
  "nim",
  "nix",
  "nushell",
  "ocaml",
  "pascal",
  "perl",
  "php",
  "postcss",
  "powershell",
  "prisma",
  "prolog",
  "proto",
  "pug",
  "python",
  "r",
  "ruby",
  "rust",
  "sass",
  "scala",
  "scheme",
  "scss",
  "solidity",
  "sql",
  "svelte",
  "swift",
  "tcl",
  "terraform",
  "tex",
  "toml",
  "tsx",
  "typescript",
  "typst",
  "v",
  "vb",
  "verilog",
  "vhdl",
  "vue",
  "wasm",
  "wgsl",
  "xml",
  "yaml",
  "zig"
]);
function extToLang(ext) {
  const lower = ext.toLowerCase();
  if (EXT_OVERRIDE[lower]) return EXT_OVERRIDE[lower];
  if (KNOWN_LANG_IDS.has(lower)) return lower;
  return null;
}
function isCodeFile(path) {
  if (!path) return false;
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return extToLang(ext) !== null;
}
function PenAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"${attr_class(clsx(className))}><path d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className });
}
function ZoomReset($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><rect x="2" y="4" width="20" height="16" rx="3" fill="none"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 9v6M6 10.5l1.5-1.5"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v.01M12 13.5v.01" stroke-width="2"></path><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 9v6M15 10.5l1.5-1.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function NewFolderAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"${attr_class(clsx(className))}><path d="M18 6H20M22 6H20M20 6V4M20 6V8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21.4 20H2.6C2.26863 20 2 19.7314 2 19.4V11H21.4C21.7314 11 22 11.2686 22 11.6V19.4C22 19.7314 21.7314 20 21.4 20Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H14" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className });
}
function FilePlusAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"${attr_class(clsx(className))}><path d="M4 12V2.6C4 2.26863 4.26863 2 4.6 2H16.2515C16.4106 2 16.5632 2.06321 16.6757 2.17574L19.8243 5.32426C19.9368 5.43679 20 5.5894 20 5.74853V21.4C20 21.7314 19.7314 22 19.4 22H11" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1.99219 19H4.99219M7.99219 19H4.99219M4.99219 19V16M4.99219 19V22" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className });
}
function FileNavToolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let breadcrumbs = fallback($$props["breadcrumbs"], () => [], true);
    let selectedFile = fallback($$props["selectedFile"], null);
    let loading = fallback($$props["loading"], false);
    let onNavigate = fallback($$props["onNavigate"], () => {
    });
    let onRefresh = fallback($$props["onRefresh"], () => {
    });
    let onNewFolder = fallback($$props["onNewFolder"], () => {
    });
    let onNewFile = fallback($$props["onNewFile"], () => {
    });
    let onUploadFiles = fallback($$props["onUploadFiles"], () => {
    });
    let onDownloadDir = fallback($$props["onDownloadDir"], () => {
    });
    let onMove = fallback($$props["onMove"], () => {
    });
    let canGoBack = fallback($$props["canGoBack"], false);
    let canGoForward = fallback($$props["canGoForward"], false);
    let onGoBack = fallback($$props["onGoBack"], () => {
    });
    let onGoForward = fallback($$props["onGoForward"], () => {
    });
    let dragOverCrumb = null;
    $$renderer2.push(`<div class="flex items-center px-2 pb-1.5 shrink-0 gap-1">`);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`shrink-0 p-1 rounded transition ${stringify(canGoBack ? "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400" : "text-gray-200 dark:text-gray-700 cursor-default")}`)}${attr("disabled", !canGoBack, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Forward"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`shrink-0 p-1 rounded transition ${stringify(canGoForward ? "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400" : "text-gray-200 dark:text-gray-700 cursor-default")}`)}${attr("disabled", !canGoForward, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Forward"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <div class="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none"><!--[-->`);
    const each_array = ensure_array_like(breadcrumbs);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let crumb = each_array[i];
      if (i > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-gray-300 dark:text-gray-600 text-xs shrink-0 select-none mx-0.5">/</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button${attr_class(`text-xs shrink-0 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition ${stringify(!selectedFile && i === breadcrumbs.length - 1 ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400")} ${stringify(dragOverCrumb === i ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-400 dark:ring-blue-500" : "")}`)}>${escape_html(crumb.label)}</button>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (selectedFile) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-gray-300 dark:text-gray-600 text-xs shrink-0 select-none mx-0.5">/</span> <span class="text-xs shrink-0 px-1.5 py-0.5 text-gray-700 dark:text-gray-300">${escape_html(selectedFile.split("/").pop())}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`size-3.5 ${stringify(loading ? "animate-spin" : "")}`)}><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.127l.13.13a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H11.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.126l-.13-.129A7 7 0 0 0 3.239 8.555a.75.75 0 0 0 1.449.39Z" clip-rule="evenodd"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (!selectedFile) {
      $$renderer2.push("<!--[0-->");
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("New Folder"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("New Folder"))}>`);
          NewFolderAlt($$renderer3, { className: "size-3.5" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("New File"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("New File"))}>`);
          FilePlusAlt($$renderer3, { className: "size-3.5" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"></path></svg></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Upload"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Upload"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"></path></svg></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> <input type="file" multiple="" hidden=""/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      breadcrumbs,
      selectedFile,
      loading,
      onNavigate,
      onRefresh,
      onNewFolder,
      onNewFile,
      onUploadFiles,
      onDownloadDir,
      onMove,
      canGoBack,
      canGoForward,
      onGoBack,
      onGoForward
    });
  });
}
function JsonTreeView($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let expanded, type, isExpandable, entries, bracket, preview;
    let data = $$props["data"];
    let key2 = fallback($$props["key"], null);
    let root = fallback($$props["root"], true);
    let expandDepth = fallback($$props["expandDepth"], 2);
    let depth = fallback($$props["depth"], 0);
    expanded = depth < expandDepth;
    type = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
    isExpandable = type === "object" || type === "array";
    entries = isExpandable && data !== null ? Object.entries(data) : [];
    bracket = type === "array" ? ["[", "]"] : ["{", "}"];
    preview = type === "array" ? `[${data.length}]` : type === "object" ? `{${entries.length}}` : "";
    if (isExpandable) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class("json-node svelte-puld9w", void 0, { "json-root": root })}><span class="json-toggle svelte-puld9w"><span${attr_class("json-arrow svelte-puld9w", void 0, { "json-expanded": expanded })}>▶</span> `);
      if (key2 !== null) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="json-key svelte-puld9w">${escape_html(key2)}</span><span class="json-colon svelte-puld9w">:</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!expanded) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="json-preview svelte-puld9w">${escape_html(bracket[0])} ${escape_html(preview)} ${escape_html(bracket[1])}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (expanded) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="json-bracket svelte-puld9w">${escape_html(bracket[0])}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></span> `);
      if (expanded) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="json-children svelte-puld9w"><!--[-->`);
        const each_array = ensure_array_like(entries);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let [k, v] = each_array[i];
          $$renderer2.push(`<div class="json-entry svelte-puld9w">`);
          JsonTreeView($$renderer2, {
            data: v,
            key: type === "array" ? null : k,
            root: false,
            depth: depth + 1,
            expandDepth
          });
          $$renderer2.push(`<!----> `);
          if (i < entries.length - 1) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="json-comma svelte-puld9w">,</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div> <span class="json-bracket svelte-puld9w">${escape_html(bracket[1])}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="json-leaf">`);
      if (key2 !== null) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="json-key svelte-puld9w">${escape_html(key2)}</span><span class="json-colon svelte-puld9w">:</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (type === "string") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="json-string svelte-puld9w">"${escape_html(data)}"</span>`);
      } else if (type === "number") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<span class="json-number svelte-puld9w">${escape_html(data)}</span>`);
      } else if (type === "boolean") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<span class="json-boolean svelte-puld9w">${escape_html(data)}</span>`);
      } else if (type === "null") {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<span class="json-null svelte-puld9w">null</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<span>${escape_html(String(data))}</span>`);
      }
      $$renderer2.push(`<!--]--></span>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { data, key: key2, root, expandDepth, depth });
  });
}
function CellEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let lang = fallback($$props["lang"], "python");
    let editor = null;
    new Compartment();
    new Compartment();
    onDestroy(() => {
      editor?.destroy();
      editor = null;
    });
    $$renderer2.push(`<div class="nb-cm-editor svelte-1te01iq"></div>`);
    bind_props($$props, { value, lang });
  });
}
function NotebookView($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let cells, lang;
    const i18n = getContext("i18n");
    let notebook = $$props["notebook"];
    let filePath = fallback($$props["filePath"], "");
    let baseUrl = fallback($$props["baseUrl"], "");
    let apiKey = fallback($$props["apiKey"], "");
    const toStr = (s) => Array.isArray(s) ? s.join("") : s ?? "";
    let highlightedCells = {};
    const highlightCell = async (index, code, language) => {
      try {
        const { codeToHtml } = await import("shiki");
        const html2 = await codeToHtml(code, {
          lang: language,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: "light"
        });
        highlightedCells[index] = html2;
        highlightedCells = highlightedCells;
      } catch {
      }
    };
    const renderMarkdown = (src) => DOMPurify.sanitize(marked.parse(src, { async: false }));
    const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
    const getOutputImages = (output) => {
      if (!output.data) return [];
      const images = [];
      for (const [mime, content] of Object.entries(output.data)) {
        if (mime.startsWith("image/")) {
          const raw = Array.isArray(content) ? content.join("") : content;
          images.push(raw.startsWith("data:") ? raw : `data:${mime};base64,${raw}`);
        }
      }
      return images;
    };
    const getOutputHtml = (output) => {
      if (!output.data?.["text/html"]) return null;
      return DOMPurify.sanitize(toStr(output.data["text/html"]));
    };
    const getOutputText = (output) => {
      if (output.output_type === "stream") return toStr(output.text);
      if (output.data?.["text/plain"]) return toStr(output.data["text/plain"]);
      return null;
    };
    let editingCell = {};
    let editedSources = {};
    let runningCell = null;
    onDestroy(() => {
    });
    cells = notebook?.cells ?? [];
    lang = notebook?.metadata?.kernelspec ? notebook.metadata.kernelspec?.language ?? "python" : "python";
    {
      highlightedCells = {};
      cells.forEach((cell, i) => {
        if (cell.cell_type === "code" && !editingCell[i]) {
          highlightCell(i, toStr(cell.source), lang);
        }
      });
    }
    $$renderer2.push(`<div class="notebook-view svelte-1wcdx53">`);
    if (
      // ── Markdown / output helpers ────────────────────────────────────────
      // ── Cell editing ─────────────────────────────────────────────────────
      // ── Session / kernel ─────────────────────────────────────────────────
      // Apply edits
      baseUrl && apiKey && filePath
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="nb-toolbar flex items-center gap-1 px-2 py-0.5 svelte-1wcdx53"><button class="nb-btn text-[0.6rem] svelte-1wcdx53"${attr("disabled", runningCell !== null, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run All"))}</button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex-1"></div> <div class="flex items-center select-none">`);
      {
        $$renderer2.push("<!--[-1-->");
        Tooltip($$renderer2, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("No kernel"),
          placement: "bottom",
          children: ($$renderer3) => {
            $$renderer3.push(`<span class="size-1.5 rounded-full bg-gray-400 dark:bg-gray-600 inline-block"></span>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]--></div></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(cells);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let cell = each_array[i];
      $$renderer2.push(`<div${attr_class(`nb-cell nb-cell-${stringify(cell.cell_type)}`, "svelte-1wcdx53")}>`);
      if (cell.cell_type === "markdown") {
        $$renderer2.push("<!--[0-->");
        if (editingCell[i]) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<textarea class="nb-edit-textarea text-sm svelte-1wcdx53">`);
          const $$body = escape_html(editedSources[i]);
          if ($$body) {
            $$renderer2.push(`${$$body}`);
          }
          $$renderer2.push(`</textarea>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="nb-markdown prose dark:prose-invert max-w-full text-sm cursor-text svelte-1wcdx53" role="textbox" tabindex="0">${html(renderMarkdown(toStr(cell.source)))}</div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (cell.cell_type === "code") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="nb-code-wrap svelte-1wcdx53"><div class="nb-cell-gutter svelte-1wcdx53">`);
        if (runningCell === i) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="nb-cell-label svelte-1wcdx53">`);
          Spinner($$renderer2, { className: "size-3" });
          $$renderer2.push(`<!----></div>`);
        } else if (baseUrl && apiKey && filePath) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<button class="nb-run-btn svelte-1wcdx53"${attr("disabled", runningCell !== null, true)} title="Run cell (⌘+Enter)"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"></path></svg></button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <div class="nb-cell-label svelte-1wcdx53">`);
        if (cell.execution_count !== void 0 && cell.execution_count !== null) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`[${escape_html(cell.execution_count)}]`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`[ ]`);
        }
        $$renderer2.push(`<!--]--></div></div> <div class="nb-code-content svelte-1wcdx53">`);
        if (editingCell[i]) {
          $$renderer2.push("<!--[0-->");
          CellEditor($$renderer2, { value: editedSources[i], lang });
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="nb-code-source-clickable svelte-1wcdx53" role="textbox" tabindex="0">`);
          if (highlightedCells[i]) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="nb-code-source shiki-preview svelte-1wcdx53">${html(highlightedCells[i])}</div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<pre class="nb-code-source-raw svelte-1wcdx53">${escape_html(toStr(cell.source))}</pre>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--> `);
        if (cell.outputs && cell.outputs.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="nb-outputs svelte-1wcdx53"><!--[-->`);
          const each_array_1 = ensure_array_like(cell.outputs);
          for (let $$index_1 = 0, $$length2 = each_array_1.length; $$index_1 < $$length2; $$index_1++) {
            let output = each_array_1[$$index_1];
            if (output.output_type === "error") {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<pre class="nb-error svelte-1wcdx53">${escape_html(stripAnsi((output.traceback ?? []).join("\n") || `${output.ename}: ${output.evalue}`))}</pre>`);
            } else {
              $$renderer2.push("<!--[-1-->");
              const html$1 = getOutputHtml(output);
              const images = getOutputImages(output);
              const text = getOutputText(output);
              if (html$1) {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<div class="nb-output-html svelte-1wcdx53">${html(html$1)}</div>`);
              } else {
                $$renderer2.push("<!--[-1-->");
              }
              $$renderer2.push(`<!--]--> <!--[-->`);
              const each_array_2 = ensure_array_like(images);
              for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
                let src = each_array_2[$$index];
                $$renderer2.push(`<img${attr("src", src)} alt="Output" class="nb-output-img svelte-1wcdx53"/>`);
              }
              $$renderer2.push(`<!--]--> `);
              if (text) {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<pre class="nb-output-text svelte-1wcdx53">${escape_html(text)}</pre>`);
              } else {
                $$renderer2.push("<!--[-1-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else if (cell.cell_type === "raw") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<pre class="nb-raw svelte-1wcdx53">${escape_html(toStr(cell.source))}</pre>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { notebook, filePath, baseUrl, apiKey });
  });
}
function SqliteView($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let totalPages;
    const i18n = getContext("i18n");
    let data = $$props["data"];
    let db = null;
    let loading = true;
    let error = null;
    let tables = [];
    let selectedTable = "";
    let columns = [];
    let rows = [];
    let totalRows = 0;
    let page2 = 0;
    const pageSize = 100;
    let queryMode = false;
    let queryText = "";
    let queryColumns = [];
    let queryRows = [];
    const init = async () => {
      try {
        const initSqlJs = (await import("sql.js")).default;
        const SQL = await initSqlJs({ locateFile: () => "/sql.js/sql-wasm.wasm" });
        db = new SQL.Database(new Uint8Array(data));
        const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
        if (result.length > 0) {
          tables = result[0].values.map((r) => r[0]);
          if (tables.length > 0) {
            selectTable(tables[0]);
          }
        }
        loading = false;
      } catch (e) {
        loading = false;
        error = e instanceof Error ? e.message : "Failed to open database";
      }
    };
    const selectTable = (table) => {
      if (!db) return;
      selectedTable = table;
      page2 = 0;
      queryMode = false;
      loadPage();
    };
    const loadPage = () => {
      if (!db || !selectedTable) return;
      try {
        const info = db.exec(`PRAGMA table_info("${selectedTable}")`);
        if (info.length > 0) {
          columns = info[0].values.map((r) => r[1]);
        }
        const countResult = db.exec(`SELECT COUNT(*) FROM "${selectedTable}"`);
        if (countResult.length > 0) {
          totalRows = countResult[0].values[0][0];
        }
        const offset = page2 * pageSize;
        const result = db.exec(`SELECT * FROM "${selectedTable}" LIMIT ${pageSize} OFFSET ${offset}`);
        if (result.length > 0) {
          rows = result[0].values.map((r) => r.map((v) => formatValue(v)));
        } else {
          rows = [];
        }
      } catch (e) {
        error = e instanceof Error ? e.message : "Query failed";
      }
    };
    const formatValue = (v) => {
      if (v === null) return "NULL";
      if (v instanceof Uint8Array) return `[BLOB ${v.length}B]`;
      return String(v);
    };
    onDestroy(() => {
      if (db) {
        try {
          db.close();
        } catch {
        }
        db = null;
      }
    });
    totalPages = Math.ceil(totalRows / pageSize);
    data && init();
    $$renderer2.push(`<div class="sqlite-view flex flex-col h-full">`);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-full">`);
      Spinner($$renderer2, { className: "size-4" });
      $$renderer2.push(`<!----></div>`);
    } else if (error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="p-3 text-xs text-red-500">${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-none shrink-0"><!--[-->`);
      const each_array = ensure_array_like(tables);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let table = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`shrink-0 px-2 py-1 text-xs rounded-lg transition ${stringify(table === selectedTable && !queryMode ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}`)}>${escape_html(table)}</button>`);
      }
      $$renderer2.push(`<!--]--> <div class="flex-1"></div> <button${attr_class(`shrink-0 px-2 py-1 text-xs rounded-lg transition font-mono ${stringify(queryMode ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}`)}>SQL</button></div> `);
      if (queryMode) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="shrink-0"><textarea placeholder="SELECT * FROM ..." class="query-editor w-full text-xs font-mono bg-transparent text-gray-800 dark:text-gray-200 px-3 py-2 outline-none resize-none svelte-1lnyy8y" rows="3" spellcheck="false">`);
        const $$body = escape_html(queryText);
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea> <div class="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">`);
        {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="text-[0.6rem] text-gray-400 dark:text-gray-600 select-none">⌘+Enter</span>`);
        }
        $$renderer2.push(`<!--]--> <button class="shrink-0 px-2.5 py-0.5 text-[0.65rem] font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run"))}</button></div></div> `);
        if (queryColumns.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="flex-1 overflow-auto min-h-0"><table class="sqlite-table w-full text-xs font-mono border-collapse svelte-1lnyy8y"><thead class="svelte-1lnyy8y"><tr><th class="sqlite-row-num svelte-1lnyy8y">#</th><!--[-->`);
          const each_array_1 = ensure_array_like(queryColumns);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let col = each_array_1[$$index_1];
            $$renderer2.push(`<th class="svelte-1lnyy8y">${escape_html(col)}</th>`);
          }
          $$renderer2.push(`<!--]--></tr></thead><tbody class="svelte-1lnyy8y"><!--[-->`);
          const each_array_2 = ensure_array_like(queryRows);
          for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
            let row = each_array_2[i];
            $$renderer2.push(`<tr class="svelte-1lnyy8y"><td class="sqlite-row-num svelte-1lnyy8y">${escape_html(i + 1)}</td><!--[-->`);
            const each_array_3 = ensure_array_like(row);
            for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
              let cell = each_array_3[$$index_2];
              $$renderer2.push(`<td${attr_class("svelte-1lnyy8y", void 0, { "sqlite-null": cell === "NULL" })}>${escape_html(cell)}</td>`);
            }
            $$renderer2.push(`<!--]--></tr>`);
          }
          $$renderer2.push(`<!--]--></tbody></table></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="flex-1 overflow-auto min-h-0">`);
        if (columns.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<table class="sqlite-table w-full text-xs font-mono border-collapse svelte-1lnyy8y"><thead class="svelte-1lnyy8y"><tr><th class="sqlite-row-num svelte-1lnyy8y">#</th><!--[-->`);
          const each_array_4 = ensure_array_like(columns);
          for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
            let col = each_array_4[$$index_4];
            $$renderer2.push(`<th class="svelte-1lnyy8y">${escape_html(col)}</th>`);
          }
          $$renderer2.push(`<!--]--></tr></thead><tbody class="svelte-1lnyy8y"><!--[-->`);
          const each_array_5 = ensure_array_like(rows);
          for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
            let row = each_array_5[i];
            $$renderer2.push(`<tr class="svelte-1lnyy8y"><td class="sqlite-row-num svelte-1lnyy8y">${escape_html(page2 * pageSize + i + 1)}</td><!--[-->`);
            const each_array_6 = ensure_array_like(row);
            for (let $$index_5 = 0, $$length2 = each_array_6.length; $$index_5 < $$length2; $$index_5++) {
              let cell = each_array_6[$$index_5];
              $$renderer2.push(`<td${attr_class("svelte-1lnyy8y", void 0, { "sqlite-null": cell === "NULL" })}>${escape_html(cell)}</td>`);
            }
            $$renderer2.push(`<!--]--></tr>`);
          }
          $$renderer2.push(`<!--]--></tbody></table>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="text-xs text-gray-400 text-center pt-6">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No data"))}</div>`);
        }
        $$renderer2.push(`<!--]--></div> `);
        if (totalPages > 1) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="flex items-center justify-center gap-3 py-1.5 px-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 shrink-0"><button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", page2 === 0, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button> <span>${escape_html(page2 + 1)} / ${escape_html(totalPages)} (${escape_html(totalRows.toLocaleString())} rows)</span> <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", page2 >= totalPages - 1, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
function FileCodeEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let filePath = fallback($$props["filePath"], null);
    let onSave = fallback($$props["onSave"], null);
    let editor = null;
    new Compartment();
    let editorLanguage = new Compartment();
    let internalValue = "";
    const getValue = () => {
      return editor?.state.doc.toString() ?? value;
    };
    const setValue = (newValue) => {
      if (!editor) return;
      internalValue = newValue;
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: newValue }
      });
    };
    const focus = () => {
      editor?.focus();
    };
    const detectLanguage = async (path) => {
      if (!path) return;
      const match = LanguageDescription.matchFilename(languages, path);
      if (match) {
        const lang = await match.load();
        if (lang && editor) {
          editor.dispatch({ effects: editorLanguage.reconfigure(lang) });
        }
      }
    };
    onDestroy(() => {
      editor?.destroy();
      editor = null;
    });
    if (editor && value !== internalValue) {
      internalValue = value;
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value }
      });
    }
    if (editor && filePath) {
      detectLanguage(filePath);
    }
    $$renderer2.push(`<div class="file-code-editor svelte-d5j1z1"></div>`);
    bind_props($$props, { value, filePath, onSave, getValue, setValue, focus });
  });
}
function FilePreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isMarkdown, isCsv, isHtml, isJson, isSvg, isNotebook, isCode, csvDelimiter, renderedHtml, csvRows, csvHeader, csvBody;
    const i18n = getContext("i18n");
    let selectedFile = fallback($$props["selectedFile"], null);
    let fileLoading = fallback($$props["fileLoading"], false);
    let fileImageUrl = fallback($$props["fileImageUrl"], null);
    let fileVideoUrl = fallback($$props["fileVideoUrl"], null);
    let fileAudioUrl = fallback($$props["fileAudioUrl"], null);
    let filePdfData = fallback($$props["filePdfData"], null);
    let fileSqliteData = fallback($$props["fileSqliteData"], null);
    let fileContent = fallback($$props["fileContent"], null);
    let baseUrl = fallback($$props["baseUrl"], "");
    let apiKey = fallback($$props["apiKey"], "");
    let fileOfficeHtml = fallback($$props["fileOfficeHtml"], null);
    let fileOfficeSlides = fallback($$props["fileOfficeSlides"], null);
    let currentSlide = fallback($$props["currentSlide"], 0);
    let excelSheetNames = fallback($$props["excelSheetNames"], () => [], true);
    let selectedExcelSheet = fallback($$props["selectedExcelSheet"], "");
    let onSheetChange = fallback($$props["onSheetChange"], null);
    let overlay = fallback($$props["overlay"], false);
    let onSave = fallback($$props["onSave"], null);
    let editing = fallback($$props["editing"], false);
    let editContent = "";
    let saving = fallback($$props["saving"], false);
    const resetEdit = () => {
      editing = false;
      editContent = "";
      saving = false;
    };
    const startEdit = async () => {
      editContent = fileContent ?? "";
      editing = true;
      showRaw = true;
      await tick();
    };
    const saveEdit = async () => {
      if (!onSave) return;
      saving = true;
      await onSave(editContent);
      saving = false;
      editing = false;
    };
    const cancelEdit = () => {
      editing = false;
      editContent = "";
    };
    const saveCodeFile = async () => {
      if (!onSave) return;
      saving = true;
      const content = "";
      await onSave(content);
      saving = false;
    };
    const MD_EXTS = /* @__PURE__ */ new Set(["md", "markdown", "mdx"]);
    const CSV_EXTS = /* @__PURE__ */ new Set(["csv", "tsv"]);
    const HTML_EXTS = /* @__PURE__ */ new Set(["html", "htm"]);
    const JSON_EXTS = /* @__PURE__ */ new Set(["json", "jsonc", "jsonl", "json5"]);
    const getExt = (path) => path?.split(".").pop()?.toLowerCase() ?? "";
    const parseCsv = (text, delimiter) => {
      const rows = [];
      let row = [];
      let field = "";
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i + 1] === '"') {
              field += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            field += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          row.push(field);
          field = "";
        } else if (ch === "\n" || ch === "\r" && text[i + 1] === "\n") {
          if (ch === "\r") i++;
          row.push(field);
          field = "";
          if (row.some((c) => c !== "")) rows.push(row);
          row = [];
        } else {
          field += ch;
        }
      }
      row.push(field);
      if (row.some((c) => c !== "")) rows.push(row);
      return rows;
    };
    let highlightedHtml = null;
    let highlightingFile = null;
    let parsedJson = void 0;
    let jsonError = null;
    let parsedNotebook = null;
    let showRaw = fallback($$props["showRaw"], false);
    const resetImageView = () => {
    };
    const disposePanzoom = () => {
    };
    const resetPdfView = () => {
    };
    onDestroy(() => {
    });
    resetEdit();
    isMarkdown = MD_EXTS.has(getExt(selectedFile));
    isCsv = CSV_EXTS.has(getExt(selectedFile));
    isHtml = HTML_EXTS.has(getExt(selectedFile));
    isJson = JSON_EXTS.has(getExt(selectedFile));
    isSvg = getExt(selectedFile) === "svg";
    isNotebook = getExt(selectedFile) === "ipynb";
    isCode = isCodeFile(selectedFile);
    csvDelimiter = getExt(selectedFile) === "tsv" ? "	" : ",";
    renderedHtml = isMarkdown && fileContent ? DOMPurify.sanitize(marked.parse(fileContent, { async: false })) : "";
    csvRows = isCsv && fileContent ? parseCsv(fileContent, csvDelimiter) : [];
    csvHeader = csvRows.length > 0 ? csvRows[0] : [];
    csvBody = csvRows.length > 1 ? csvRows.slice(1) : [];
    if (isSvg && fileContent !== null && selectedFile) {
      const currentFile = selectedFile;
      highlightingFile = currentFile;
      import("shiki").then(({ codeToHtml }) => codeToHtml(fileContent, {
        lang: "xml",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: "light"
      })).then((html2) => {
        if (highlightingFile === currentFile) highlightedHtml = html2;
      }).catch(() => {
        if (highlightingFile === currentFile) highlightedHtml = null;
      });
    } else {
      highlightedHtml = null;
    }
    if (isJson && fileContent !== null) {
      try {
        parsedJson = JSON.parse(fileContent);
        jsonError = null;
      } catch (e) {
        parsedJson = void 0;
        jsonError = e instanceof Error ? e.message : "Invalid JSON";
      }
    } else {
      parsedJson = void 0;
      jsonError = null;
    }
    if (isNotebook && fileContent !== null) {
      try {
        parsedNotebook = JSON.parse(fileContent);
      } catch {
        parsedNotebook = null;
      }
    } else {
      parsedNotebook = null;
    }
    showRaw = false;
    if (fileContent !== null && fileContent.trim() === "" && (isMarkdown || isCsv || isJson)) {
      showRaw = true;
    }
    $$renderer2.push(`<div${attr_class(`flex-1 ${stringify(fileImageUrl !== null || fileOfficeSlides !== null && fileOfficeSlides.length > 0 ? "overflow-hidden" : "overflow-y-auto")} min-h-0 min-w-0 relative h-full`)}>`);
    if (fileLoading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-full">`);
      Spinner($$renderer2, { className: "size-4" });
      $$renderer2.push(`<!----></div>`);
    } else if (fileImageUrl !== null) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="w-full h-full flex items-center justify-center"><img${attr("src", fileImageUrl)}${attr("alt", selectedFile?.split("/").pop())} class="max-w-full max-h-full object-contain p-3" draggable="false"/></div>`);
    } else if (fileVideoUrl !== null) {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="w-full h-full flex items-center justify-center bg-black"><video${attr("src", fileVideoUrl)} controls="" class="max-w-full max-h-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Your browser does not support the video tag."))}</video></div>`);
    } else if (fileAudioUrl !== null) {
      $$renderer2.push("<!--[3-->");
      $$renderer2.push(`<div class="w-full h-full flex items-center justify-center p-6"><audio${attr("src", fileAudioUrl)} controls="" class="w-full max-w-md">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Your browser does not support the audio tag."))}</audio></div>`);
    } else if (filePdfData !== null) {
      $$renderer2.push("<!--[4-->");
      PDFViewer($$renderer2, { data: filePdfData, className: "w-full h-full" });
    } else if (fileSqliteData !== null) {
      $$renderer2.push("<!--[5-->");
      SqliteView($$renderer2, { data: fileSqliteData });
    } else if (fileOfficeHtml !== null) {
      $$renderer2.push("<!--[6-->");
      $$renderer2.push(`<div class="flex flex-col h-full"><div class="office-preview overflow-auto flex-1 min-h-0">${html(fileOfficeHtml)}</div> `);
      if (excelSheetNames.length > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex items-center gap-1 py-1.5 px-3 border-t border-gray-100 dark:border-gray-800 overflow-x-auto"><!--[-->`);
        const each_array = ensure_array_like(excelSheetNames);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let sheet = each_array[$$index];
          $$renderer2.push(`<button${attr_class(`shrink-0 px-3 py-1 text-xs rounded-md transition-colors ${stringify(selectedExcelSheet === sheet ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}`)}>${escape_html(sheet)}</button>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (fileOfficeSlides !== null && fileOfficeSlides.length > 0) {
      $$renderer2.push("<!--[7-->");
      $$renderer2.push(`<div class="flex flex-col h-full"><div class="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden"><img${attr("src", fileOfficeSlides[currentSlide])}${attr("alt", `Slide ${stringify(currentSlide + 1)}`)} class="max-w-full max-h-full object-contain p-3" draggable="false"/></div> `);
      if (fileOfficeSlides.length > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex items-center justify-center gap-3 py-2 px-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500"><button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", currentSlide === 0, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg></button> <span>${escape_html(currentSlide + 1)} / ${escape_html(fileOfficeSlides.length)}</span> <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"${attr("disabled", currentSlide === fileOfficeSlides.length - 1, true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg></button></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (fileContent !== null) {
      $$renderer2.push("<!--[8-->");
      if (isHtml && !showRaw) {
        $$renderer2.push("<!--[0-->");
        if (overlay) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="absolute top-0 left-0 right-0 bottom-0 z-10"></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <iframe${attr("srcdoc", fileContent)}${attr("sandbox", `allow-scripts allow-downloads${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowForms ?? false ? " allow-forms" : "")}${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowSameOrigin ?? false ? " allow-same-origin" : "")}`)} class="w-full h-full border-none bg-white" title="HTML Preview"></iframe>`);
      } else if (isHtml && showRaw) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="absolute inset-0">`);
        FileCodeEditor($$renderer2, { value: fileContent ?? "", filePath: selectedFile, onSave });
        $$renderer2.push(`<!----></div>`);
      } else if (isMarkdown && !showRaw) {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div class="prose dark:prose-invert max-w-full text-sm p-3">${html(renderedHtml)}</div>`);
      } else if (isMarkdown && showRaw) {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<div class="absolute inset-0">`);
        FileCodeEditor($$renderer2, { value: fileContent ?? "", filePath: selectedFile, onSave });
        $$renderer2.push(`<!----></div>`);
      } else if (isCsv && !showRaw && csvRows.length > 0) {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`<div class="absolute inset-0 overflow-auto px-3 pb-3"><table class="csv-table text-xs font-mono border-collapse svelte-fddz6d"><thead class="svelte-fddz6d"><tr><th class="csv-row-num svelte-fddz6d">#</th><!--[-->`);
        const each_array_1 = ensure_array_like(csvHeader);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let cell = each_array_1[$$index_1];
          $$renderer2.push(`<th class="svelte-fddz6d">${escape_html(cell)}</th>`);
        }
        $$renderer2.push(`<!--]--></tr></thead><tbody class="svelte-fddz6d"><!--[-->`);
        const each_array_2 = ensure_array_like(csvBody);
        for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
          let row = each_array_2[i];
          $$renderer2.push(`<tr class="svelte-fddz6d"><td class="csv-row-num svelte-fddz6d">${escape_html(i + 1)}</td><!--[-->`);
          const each_array_3 = ensure_array_like(row);
          for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
            let cell = each_array_3[$$index_2];
            $$renderer2.push(`<td class="svelte-fddz6d">${escape_html(cell)}</td>`);
          }
          $$renderer2.push(`<!--]--><!--[-->`);
          const each_array_4 = ensure_array_like(Array(Math.max(0, csvHeader.length - row.length)));
          for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
            each_array_4[$$index_3];
            $$renderer2.push(`<td class="svelte-fddz6d"></td>`);
          }
          $$renderer2.push(`<!--]--></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      } else if (isNotebook && !showRaw && parsedNotebook) {
        $$renderer2.push("<!--[5-->");
        $$renderer2.push(`<div class="overflow-auto h-full">`);
        NotebookView($$renderer2, {
          notebook: parsedNotebook,
          filePath: selectedFile ?? "",
          baseUrl,
          apiKey
        });
        $$renderer2.push(`<!----></div>`);
      } else if (isJson && !showRaw && parsedJson !== void 0) {
        $$renderer2.push("<!--[6-->");
        $$renderer2.push(`<div class="overflow-auto h-full">`);
        JsonTreeView($$renderer2, { data: parsedJson });
        $$renderer2.push(`<!----></div>`);
      } else if (isJson && !showRaw && jsonError) {
        $$renderer2.push("<!--[7-->");
        $$renderer2.push(`<div class="p-3 text-xs"><div class="text-red-500 mb-2">JSON parse error: ${escape_html(jsonError)}</div> <pre class="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all leading-relaxed">${escape_html(fileContent)}</pre></div>`);
      } else if (isSvg && !showRaw && fileContent) {
        $$renderer2.push("<!--[8-->");
        $$renderer2.push(`<div class="svg-preview w-full h-full flex items-center justify-center overflow-auto p-3">${html(DOMPurify.sanitize(fileContent, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ["use"]
        }))}</div>`);
      } else if (isCode && !showRaw) {
        $$renderer2.push("<!--[9-->");
        $$renderer2.push(`<div class="absolute inset-0">`);
        FileCodeEditor($$renderer2, { value: fileContent ?? "", filePath: selectedFile, onSave });
        $$renderer2.push(`<!----></div>`);
      } else if (isSvg && highlightedHtml && !showRaw) {
        $$renderer2.push("<!--[10-->");
        $$renderer2.push(`<div class="shiki-preview overflow-auto h-full text-xs svelte-fddz6d">${html(highlightedHtml)}</div>`);
      } else if (editing) {
        $$renderer2.push("<!--[11-->");
        $$renderer2.push(`<textarea class="w-full h-full text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre break-all leading-relaxed p-3 bg-transparent border-none outline-none resize-none" spellcheck="false">`);
        const $$body = escape_html(editContent);
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<pre class="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all leading-relaxed p-3">${escape_html(fileContent)}</pre>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="text-xs text-gray-400 text-center pt-8">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Could not read file."))}</div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      selectedFile,
      fileLoading,
      fileImageUrl,
      fileVideoUrl,
      fileAudioUrl,
      filePdfData,
      fileSqliteData,
      fileContent,
      baseUrl,
      apiKey,
      fileOfficeHtml,
      fileOfficeSlides,
      currentSlide,
      excelSheetNames,
      selectedExcelSheet,
      onSheetChange,
      overlay,
      onSave,
      editing,
      saving,
      showRaw,
      startEdit,
      saveEdit,
      cancelEdit,
      saveCodeFile,
      resetImageView,
      disposePanzoom,
      resetPdfView
    });
  });
}
function FileEntryRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let entry = $$props["entry"];
    let currentPath = $$props["currentPath"];
    let terminalUrl = fallback($$props["terminalUrl"], "");
    let terminalKey = fallback($$props["terminalKey"], "");
    let onOpen = fallback($$props["onOpen"], () => {
    });
    let onDownload = fallback($$props["onDownload"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onMove = fallback($$props["onMove"], () => {
    });
    let onRename = fallback($$props["onRename"], () => {
    });
    let selected = fallback($$props["selected"], false);
    let selectionMode = fallback($$props["selectionMode"], false);
    let selectedPaths = fallback($$props["selectedPaths"], () => /* @__PURE__ */ new Set(), true);
    let onSelect = fallback($$props["onSelect"], () => {
    });
    let onLongPress = fallback($$props["onLongPress"], () => {
    });
    onDestroy(() => {
    });
    $$renderer2.push(`<li class="group"><div${attr_class(`w-full flex items-center transition ${stringify(selected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800")} ${stringify("")}`)}${attr("role", entry.type === "directory" ? "button" : void 0)}><button class="flex-1 flex items-center gap-2 px-3 py-1.5 text-left min-w-0"${attr("draggable", true)}>`);
    if (
      // If dragging a selected item, drag all selected
      // Custom drag ghost showing count
      selectionMode || selected
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`size-3.5 shrink-0 rounded border transition-colors flex items-center justify-center ${stringify(selected ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 text-white" : "border-gray-300 dark:border-gray-600")}`)}>`);
      if (selected) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-2.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (entry.type === "directory") {
      $$renderer2.push("<!--[0-->");
      Folder($$renderer2, {
        className: "size-4 shrink-0 text-blue-400 dark:text-blue-300"
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4 shrink-0 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"></path></svg>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="flex-1 text-xs text-gray-800 dark:text-gray-200 truncate">${escape_html(entry.name)}</span>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (entry.type === "file" && entry.size !== void 0 && true) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-xs text-gray-400 shrink-0">${escape_html(formatFileSize(entry.size))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></button> `);
    Dropdown($$renderer2, {
      align: "end",
      sideOffset: 4,
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="shrink-0 p-0.5 mr-1 rounded-lg transition text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("More"))}>`);
        EllipsisHorizontal($$renderer3, { className: "size-3.5" });
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: {
        default: true,
        content: ($$renderer3) => {
          $$renderer3.push(`<div slot="content"><div class="min-w-[150px] rounded-2xl p-1 z-[9999999] bg-white dark:bg-gray-850 dark:text-white shadow-lg border border-gray-100 dark:border-gray-800"><button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2 text-sm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"></path></svg> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}</div></button> <button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2 text-sm">`);
          Pencil($$renderer3, { className: "size-4", strokeWidth: "1.5" });
          $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Rename"))}</div></button> <button type="button" class="select-none flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center gap-2 text-sm">`);
          GarbageBin($$renderer3, { className: "size-4" });
          $$renderer3.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</div></button></div></div>`);
        }
      }
    });
    $$renderer2.push(`<!----></div></li>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      entry,
      currentPath,
      terminalUrl,
      terminalKey,
      onOpen,
      onDownload,
      onDelete,
      onMove,
      onRename,
      selected,
      selectionMode,
      selectedPaths,
      onSelect,
      onLongPress
    });
  });
}
function BulkActionBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let count = fallback($$props["count"], 0);
    let hasFiles = fallback($$props["hasFiles"], false);
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onDownload = fallback($$props["onDownload"], () => {
    });
    let onSelectAll = fallback($$props["onSelectAll"], () => {
    });
    let onClear = fallback($$props["onClear"], () => {
    });
    $$renderer2.push(`<div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 shrink-0"><span class="text-xs font-medium text-gray-600 dark:text-gray-400 flex-1 truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("{{count}} selected", { count }))}</span> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select All"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded transition text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Select All"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded transition text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded transition text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}>`);
        GarbageBin($$renderer3, { className: "size-3.5" });
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Deselect"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded transition text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Deselect"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { count, hasFiles, onDelete, onDownload, onSelectAll, onClear });
  });
}
function PortList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let baseUrl = $$props["baseUrl"];
    let apiKey = $$props["apiKey"];
    let ports = [];
    let loading = false;
    let pollTimer = null;
    const loadPorts = async () => {
      loading = true;
      ports = await getListeningPorts(baseUrl, apiKey);
      loading = false;
    };
    const startPolling = () => {
      stopPolling();
      loadPorts();
      pollTimer = setInterval(loadPorts, 5e3);
    };
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
    onDestroy(() => {
      stopPolling();
    });
    if (baseUrl) {
      startPolling();
    }
    $$renderer2.push(`<div class="px-2 py-1"><button class="flex items-center gap-1 w-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`size-3 transition-transform ${stringify("-rotate-90")}`)}><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Ports"))} <span class="ml-auto flex items-center gap-1">`);
    if (ports.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">${escape_html(ports.length)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`size-3 ${stringify(loading ? "animate-spin" : "")}`)}><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.127l.13.13a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H11.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.126l-.13-.129A7 7 0 0 0 3.239 8.555a.75.75 0 0 0 1.449.39Z" clip-rule="evenodd"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { baseUrl, apiKey });
  });
}
function PortPreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canGoBack, canGoForward, proxyUrl;
    const i18n = getContext("i18n");
    let baseUrl = $$props["baseUrl"];
    let port = $$props["port"];
    let path = fallback($$props["path"], "");
    let onClose = fallback($$props["onClose"], () => {
    });
    let overlay = fallback($$props["overlay"], false);
    let urlInput = "";
    let isLoading = false;
    let history = [path];
    let historyIndex = 0;
    const makeDisplayUrl = (p) => `localhost:${port}${p ? "/" + p : ""}`;
    urlInput = makeDisplayUrl(path);
    canGoBack = historyIndex > 0;
    canGoForward = historyIndex < history.length - 1;
    proxyUrl = getPortProxyUrl(baseUrl, port, path);
    (() => {
      try {
        return new URL(getPortProxyUrl(baseUrl, port, ""), window.location.origin).pathname;
      } catch {
        return `/proxy/${port}/`;
      }
    })();
    $$renderer2.push(`<div class="flex flex-col h-full min-h-0 svelte-1v7nouw"><div class="flex items-center gap-1 px-1.5 py-1 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0 svelte-1v7nouw">`);
    Tooltip($$renderer2, {
      content: (
        /**
        * Read the iframe's current location and sync the URL bar.
        * If the iframe escaped the proxy prefix, redirect it back.
        */
        // Cross-origin — can't access
        store_get($$store_subs ??= {}, "$i18n", i18n).t("Back")
      ),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(
          `p-1 rounded transition ${stringify(canGoBack ? "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" : "text-gray-300 dark:text-gray-700 cursor-default")}`,
          "svelte-1v7nouw"
        )}${attr("disabled", !canGoBack, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Back"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5 svelte-1v7nouw"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" class="svelte-1v7nouw"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Forward"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(
          `p-1 rounded transition ${stringify(canGoForward ? "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300" : "text-gray-300 dark:text-gray-700 cursor-default")}`,
          "svelte-1v7nouw"
        )}${attr("disabled", !canGoForward, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Forward"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5 svelte-1v7nouw"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" class="svelte-1v7nouw"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition svelte-1v7nouw"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Refresh"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class("size-3.5 svelte-1v7nouw", void 0, { "animate-spin": isLoading })}><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.127l.13.13a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H11.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.126l-.13-.129A7 7 0 0 0 3.239 8.555a.75.75 0 0 0 1.449.39Z" clip-rule="evenodd" class="svelte-1v7nouw"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <form class="flex-1 min-w-0 svelte-1v7nouw"><input type="text"${attr("value", urlInput)} class="w-full text-[11px] font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20 text-gray-600 dark:text-gray-300 transition svelte-1v7nouw"${attr("placeholder", `localhost:${stringify(port)}`)}/></form> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Open in new tab"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition svelte-1v7nouw"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Open in new tab"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5 svelte-1v7nouw"><path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.5-3.5a.75.75 0 0 0 0 1.5h2.69l-4.72 4.72a.75.75 0 0 0 1.06 1.06l4.72-4.72v2.69a.75.75 0 0 0 1.5 0v-5.25a.75.75 0 0 0-.75-.75h-5.25Z" clip-rule="evenodd" class="svelte-1v7nouw"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button class="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition svelte-1v7nouw"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5 svelte-1v7nouw"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" class="svelte-1v7nouw"></path></svg></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex-1 min-h-0 relative svelte-1v7nouw">`);
    if (overlay) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute inset-0 z-10 svelte-1v7nouw"></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <!---->`);
    {
      $$renderer2.push(`<iframe${attr("src", proxyUrl)}${attr("title", `Port ${stringify(port)} preview`)} class="w-full h-full border-0 bg-white svelte-1v7nouw" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"></iframe>`);
    }
    $$renderer2.push(`<!----></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { baseUrl, port, path, onClose, overlay });
  });
}
let savedPath = "/";
function FileNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canGoBack, canGoForward, isMarkdown, isCsv, isHtml, isJson, isSvg, isNotebook, isCode, isOfficeFile, isTextFile, selectedCount, hasSelectedFiles;
    const i18n = getContext("i18n");
    let onAttach = fallback($$props["onAttach"], null);
    let overlay = fallback($$props["overlay"], false);
    let isDraggingHandle = false;
    let terminalEnabled = true;
    let currentPath = savedPath;
    let entries = [];
    let loading = false;
    let error = null;
    let navHistory = [];
    let navIndex = -1;
    let navigatingHistory = false;
    const pushNavHistory = (path, file = null) => {
      if (navigatingHistory) return;
      const current = navHistory[navIndex];
      if (current && current.path === path && current.file === file) return;
      if (navIndex < navHistory.length - 1) {
        navHistory = navHistory.slice(0, navIndex + 1);
      }
      navHistory = [...navHistory, { path, file }];
      navIndex = navHistory.length - 1;
    };
    const goBack = async () => {
      if (!canGoBack) return;
      navigatingHistory = true;
      navIndex -= 1;
      const entry = navHistory[navIndex];
      await loadDir(entry.path);
      if (entry.file) {
        const fileName = entry.file.split("/").pop() ?? "";
        await openEntry({ name: fileName, type: "file" });
      }
      navigatingHistory = false;
    };
    const goForward = async () => {
      if (!canGoForward) return;
      navigatingHistory = true;
      navIndex += 1;
      const entry = navHistory[navIndex];
      await loadDir(entry.path);
      if (entry.file) {
        const fileName = entry.file.split("/").pop() ?? "";
        await openEntry({ name: fileName, type: "file" });
      }
      navigatingHistory = false;
    };
    let selectedFile = null;
    let previewPort = null;
    let fileContent = null;
    let fileImageUrl = null;
    let fileVideoUrl = null;
    let fileAudioUrl = null;
    let filePdfData = null;
    let fileSqliteData = null;
    let fileLoading = false;
    let fileOfficeHtml = null;
    let fileOfficeSlides = null;
    let currentSlide = 0;
    let excelSheetNames = [];
    let selectedExcelSheet = "";
    let excelWorkbook = null;
    let editing = false;
    let showRaw = false;
    let saving = false;
    const MD_EXTS = /* @__PURE__ */ new Set(["md", "markdown", "mdx"]);
    const CSV_EXTS = /* @__PURE__ */ new Set(["csv", "tsv"]);
    const HTML_EXTS = /* @__PURE__ */ new Set(["html", "htm"]);
    const OFFICE_EXTS = /* @__PURE__ */ new Set(["docx", "xlsx", "pptx"]);
    const getFileExt = (path) => path?.split(".").pop()?.toLowerCase() ?? "";
    let uploading = false;
    let creatingFolder = false;
    let newFolderName = "";
    let creatingFile = false;
    let newFileName = "";
    let showDeleteConfirm = false;
    let selectedTerminal = null;
    const getTerminal = () => {
      const systemTerminal = store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId) ? (store_get($$store_subs ??= {}, "$terminalServers", terminalServers) ?? []).find((t) => t.id === store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId)) ?? null : store_get($$store_subs ??= {}, "$terminalServers", terminalServers)?.[0] ?? null;
      const userTerminal = (store_get($$store_subs ??= {}, "$settings", settings)?.terminalServers ?? []).find((s) => s.url === store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId));
      const isSystem = !!systemTerminal;
      const url2 = systemTerminal?.url ?? userTerminal?.url ?? "";
      const key2 = isSystem ? localStorage.token : userTerminal?.key ?? "";
      return url2 ? { url: url2, key: key2 } : null;
    };
    let prevTerminalUrl = "";
    const IMAGE_EXTS = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "ico", "avif"]);
    const VIDEO_EXTS = /* @__PURE__ */ new Set(["mp4", "webm", "mov", "ogv", "avi", "mkv"]);
    const AUDIO_EXTS = /* @__PURE__ */ new Set([
      "mp3",
      "wav",
      "ogg",
      "oga",
      "flac",
      "m4a",
      "aac",
      "wma",
      "opus"
    ]);
    const SQLITE_EXTS = /* @__PURE__ */ new Set(["db", "sqlite", "sqlite3", "db3"]);
    const isImage = (path) => IMAGE_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    const isVideo = (path) => VIDEO_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    const isAudio = (path) => AUDIO_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    const isSqlite = (path) => SQLITE_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    const isPdf = (path) => path.split(".").pop()?.toLowerCase() === "pdf";
    const isOffice = (path) => OFFICE_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    const normalizePath = (p) => p.replace(/\\/g, "/");
    const buildBreadcrumbs = (path) => {
      const parts = path.split("/").filter(Boolean);
      const isDrive = /^[A-Za-z]:$/.test(parts[0] ?? "");
      const root = isDrive ? { label: parts[0], path: `${parts[0]}/` } : { label: "/", path: "/" };
      return (isDrive ? parts.slice(1) : parts).reduce(
        (acc, part) => {
          const prev = acc[acc.length - 1];
          acc.push({ label: part, path: `${prev.path}${part}/` });
          return acc;
        },
        [root]
      );
    };
    const clearFilePreview = () => {
      fileContent = null;
      if (fileImageUrl) {
        URL.revokeObjectURL(fileImageUrl);
        fileImageUrl = null;
      }
      if (fileVideoUrl) {
        URL.revokeObjectURL(fileVideoUrl);
        fileVideoUrl = null;
      }
      if (fileAudioUrl) {
        URL.revokeObjectURL(fileAudioUrl);
        fileAudioUrl = null;
      }
      filePdfData = null;
      fileSqliteData = null;
      fileOfficeHtml = null;
      fileOfficeSlides = null;
      currentSlide = 0;
      excelSheetNames = [];
      selectedExcelSheet = "";
      excelWorkbook = null;
    };
    const loadDir = async (path) => {
      const terminal = selectedTerminal;
      if (!terminal) return;
      loading = true;
      error = null;
      selectedFile = null;
      previewPort = null;
      clearFilePreview();
      clearSelection();
      currentPath = path;
      savedPath = path;
      pushNavHistory(path);
      const result = await listFiles(terminal.url, terminal.key, path);
      loading = false;
      setCwd(terminal.url, terminal.key, path);
      if (result === null) {
        error = "Failed to load directory. Check your Terminal connection in Settings → Integrations.";
        entries = [];
      } else {
        entries = result.sort((a, b) => {
          if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }
    };
    const openEntry = async (entry) => {
      if (entry.type === "directory") {
        await loadDir(`${currentPath}${entry.name}/`);
        return;
      }
      const filePath = `${currentPath}${entry.name}`;
      pushNavHistory(currentPath, filePath);
      const terminal = selectedTerminal;
      if (!terminal) return;
      selectedFile = filePath;
      fileLoading = true;
      clearFilePreview();
      if (isImage(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) fileImageUrl = URL.createObjectURL(result.blob);
      } else if (isVideo(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) fileVideoUrl = URL.createObjectURL(result.blob);
      } else if (isAudio(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) fileAudioUrl = URL.createObjectURL(result.blob);
      } else if (isPdf(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) filePdfData = await result.blob.arrayBuffer();
      } else if (isSqlite(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) fileSqliteData = await result.blob.arrayBuffer();
      } else if (isOffice(filePath)) {
        const result = await downloadFileBlob(terminal.url, terminal.key, filePath);
        if (result) {
          const ext = getFileExt(filePath);
          const arrayBuffer = await result.blob.arrayBuffer();
          try {
            if (ext === "docx") {
              const mammoth = await import("mammoth");
              const res = await mammoth.convertToHtml({ arrayBuffer });
              const DOMPurify2 = (await import("dompurify")).default;
              fileOfficeHtml = DOMPurify2.sanitize(res.value);
            } else if (ext === "xlsx") {
              const XLSX = await import("xlsx");
              const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
              excelWorkbook = wb;
              excelSheetNames = wb.SheetNames;
              if (excelSheetNames.length > 0) {
                selectedExcelSheet = excelSheetNames[0];
                const { excelToTable } = await import("./excelToTable.js");
                const result2 = await excelToTable(wb.Sheets[selectedExcelSheet]);
                fileOfficeHtml = result2.html;
              }
            } else if (ext === "pptx") {
              const { pptxToImages } = await import("./pptxToHtml.js");
              const result2 = await pptxToImages(arrayBuffer);
              fileOfficeSlides = result2.images;
              currentSlide = 0;
            }
          } catch (e) {
            /* @__PURE__ */ console.error("Failed to render Office file:", e);
            fileContent = `Error previewing file: ${e instanceof Error ? e.message : "Unknown error"}`;
          }
        }
      } else {
        fileContent = await readFile(terminal.url, terminal.key, filePath);
      }
      fileLoading = false;
    };
    const downloadFile = async (path) => {
      const terminal = selectedTerminal;
      if (!terminal) return;
      const isDir = path.endsWith("/");
      const result = isDir ? await archiveFromTerminal(terminal.url, terminal.key, [path.replace(/\/$/, "")]) : await downloadFileBlob(terminal.url, terminal.key, path);
      if (!result) return;
      const url2 = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url2;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url2);
    };
    const handleUploadFiles = async (files) => {
      const terminal = selectedTerminal;
      if (!files.length || !terminal) return;
      uploading = true;
      for (const file of files) {
        await uploadToTerminal(terminal.url, terminal.key, currentPath, file);
      }
      uploading = false;
      await loadDir(currentPath);
    };
    const startNewFolder = async () => {
      creatingFolder = true;
      newFolderName = "";
      await tick();
    };
    const startNewFile = async () => {
      creatingFile = true;
      newFileName = "";
      await tick();
    };
    const requestDelete = (path, name) => {
      showDeleteConfirm = true;
    };
    const handleMove = async (source, destFolder) => {
      const terminal = selectedTerminal;
      if (!terminal) return;
      const fileName = source.split("/").pop() ?? "";
      const destination = `${destFolder}${fileName}`;
      if (source === destination) return;
      const sourceDir = source.endsWith("/") ? source : source + "/";
      if (destFolder.startsWith(sourceDir)) return;
      const result = await moveEntry(terminal.url, terminal.key, source, destination);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Moved {{name}}", { name: fileName }));
      }
      await loadDir(currentPath);
    };
    const handleRename = async (oldPath, newName) => {
      const terminal = selectedTerminal;
      if (!terminal || !newName) return;
      const dir = oldPath.substring(0, oldPath.lastIndexOf("/") + 1) || currentPath;
      const destination = `${dir}${newName}`;
      if (oldPath === destination) return;
      const result = await moveEntry(terminal.url, terminal.key, oldPath, destination);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Renamed to {{name}}", { name: newName }));
      }
      await loadDir(currentPath);
    };
    let selectedEntries = /* @__PURE__ */ new Set();
    let lastClickedIndex = null;
    let selectionMode = false;
    const clearSelection = () => {
      selectedEntries = /* @__PURE__ */ new Set();
      lastClickedIndex = null;
      selectionMode = false;
    };
    const selectAll = () => {
      selectedEntries = new Set(entries.map((e) => {
        const p = `${currentPath}${e.name}`;
        return e.type === "directory" ? p + "/" : p;
      }));
      selectedEntries = selectedEntries;
    };
    const handleSelect = (entry, event) => {
      const path = entry.type === "directory" ? `${currentPath}${entry.name}/` : `${currentPath}${entry.name}`;
      const idx = entries.indexOf(entry);
      if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, idx);
        const end = Math.max(lastClickedIndex, idx);
        const newSet = /* @__PURE__ */ new Set();
        for (let i = start; i <= end; i++) {
          const e = entries[i];
          const p = e.type === "directory" ? `${currentPath}${e.name}/` : `${currentPath}${e.name}`;
          newSet.add(p);
        }
        selectedEntries = newSet;
      } else if (event.metaKey || event.ctrlKey) {
        if (selectedEntries.has(path)) {
          selectedEntries.delete(path);
        } else {
          selectedEntries.add(path);
        }
        selectedEntries = selectedEntries;
      } else {
        if (selectedEntries.has(path)) {
          selectedEntries.delete(path);
        } else {
          selectedEntries.add(path);
        }
        selectedEntries = selectedEntries;
      }
      lastClickedIndex = idx;
    };
    const enterSelectionMode = () => {
      selectionMode = true;
    };
    const bulkDownload = async () => {
      const terminal = selectedTerminal;
      if (!terminal) return;
      const paths = [...selectedEntries].map((p) => p.replace(/\/$/, ""));
      if (paths.length === 0) return;
      if (paths.length === 1 && ![...selectedEntries][0].endsWith("/")) {
        await downloadFile([...selectedEntries][0]);
        return;
      }
      const result = await archiveFromTerminal(terminal.url, terminal.key, paths);
      if (!result) return;
      const url2 = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url2;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url2);
    };
    onDestroy(() => {
      if (fileImageUrl) URL.revokeObjectURL(fileImageUrl);
      if (fileVideoUrl) URL.revokeObjectURL(fileVideoUrl);
      if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    });
    canGoBack = navIndex > 0;
    canGoForward = navIndex < navHistory.length - 1;
    isMarkdown = MD_EXTS.has(getFileExt(selectedFile));
    isCsv = CSV_EXTS.has(getFileExt(selectedFile));
    isHtml = HTML_EXTS.has(getFileExt(selectedFile));
    isJson = ["json", "jsonc", "jsonl", "json5"].includes(getFileExt(selectedFile));
    isSvg = getFileExt(selectedFile) === "svg";
    isNotebook = getFileExt(selectedFile) === "ipynb";
    isCode = isCodeFile(selectedFile);
    isOfficeFile = OFFICE_EXTS.has(getFileExt(selectedFile));
    isTextFile = fileContent !== null && fileImageUrl === null && filePdfData === null && !isOfficeFile;
    {
      store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId), store_get($$store_subs ??= {}, "$terminalServers", terminalServers), store_get($$store_subs ??= {}, "$settings", settings);
      const terminal = getTerminal();
      selectedTerminal = terminal;
      if (terminal && terminal.url !== prevTerminalUrl) {
        prevTerminalUrl = terminal.url;
        loading = true;
        error = null;
        entries = [];
        (async () => {
          const config2 = await getTerminalConfig(terminal.url, terminal.key);
          terminalEnabled = config2?.features?.terminal !== false;
          const rawCwd = await getCwd(terminal.url, terminal.key);
          const cwd = rawCwd ? normalizePath(rawCwd) : null;
          const dir = cwd ? cwd.endsWith("/") ? cwd : cwd + "/" : "/";
          savedPath = dir;
          loadDir(dir);
        })();
      }
    }
    selectedCount = selectedEntries.size;
    hasSelectedFiles = [...selectedEntries].some((p) => !p.endsWith("/"));
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirm;
        },
        set show($$value) {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (!selectedTerminal) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex-1 flex flex-col items-center justify-center p-6 text-center">`);
        Folder($$renderer3, { className: "size-6 text-gray-300 dark:text-gray-600 mb-2" });
        $$renderer3.push(`<!----> <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No Terminal connection configured."))}</div> <div class="text-[10px] text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add your Open Terminal URL and API key in Settings → Integrations."))}</div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex flex-col h-full min-h-0 min-w-0 relative" role="region"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("File browser"))}>`);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (previewPort === null) {
          $$renderer3.push("<!--[0-->");
          FileNavToolbar($$renderer3, {
            breadcrumbs: buildBreadcrumbs(currentPath),
            selectedFile,
            loading,
            canGoBack,
            canGoForward,
            onGoBack: goBack,
            onGoForward: goForward,
            onNavigate: loadDir,
            onRefresh: () => {
              if (selectedFile) {
                const fileName = selectedFile.split("/").pop() ?? "";
                openEntry({ name: fileName, type: "file" });
              } else {
                loadDir(currentPath);
              }
            },
            onNewFolder: startNewFolder,
            onNewFile: startNewFile,
            onUploadFiles: handleUploadFiles,
            onDownloadDir: () => downloadFile(currentPath),
            onMove: handleMove,
            children: ($$renderer4) => {
              if (fileImageUrl !== null || fileOfficeSlides !== null && fileOfficeSlides.length > 0) {
                $$renderer4.push("<!--[0-->");
                Tooltip($$renderer4, {
                  content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"))}>`);
                    ZoomReset($$renderer5, { className: "size-3.5" });
                    $$renderer5.push(`<!----></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> `);
              if (filePdfData !== null) {
                $$renderer4.push("<!--[0-->");
                Tooltip($$renderer4, {
                  content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"))}>`);
                    ZoomReset($$renderer5, { className: "size-3.5" });
                    $$renderer5.push(`<!----></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> `);
              if ((isMarkdown || isCsv || isHtml || isJson || isSvg || isNotebook) && fileContent !== null && !editing) {
                $$renderer4.push("<!--[0-->");
                Tooltip($$renderer4, {
                  content: showRaw ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Preview") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Source"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", showRaw ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Preview") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Source"))}>`);
                    if (showRaw) {
                      $$renderer5.push("<!--[0-->");
                      $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>`);
                    } else {
                      $$renderer5.push("<!--[-1-->");
                      $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"></path></svg>`);
                    }
                    $$renderer5.push(`<!--]--></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> `);
              if (isTextFile) {
                $$renderer4.push("<!--[0-->");
                if (isHtml && showRaw) {
                  $$renderer4.push("<!--[0-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("disabled", saving, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}>`);
                      if (saving) {
                        $$renderer5.push("<!--[0-->");
                        Spinner($$renderer5, { className: "size-3.5" });
                      } else {
                        $$renderer5.push("<!--[-1-->");
                        $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>`);
                      }
                      $$renderer5.push(`<!--]--></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else if (isHtml) {
                  $$renderer4.push("<!--[1-->");
                } else if (isMarkdown && showRaw) {
                  $$renderer4.push("<!--[2-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("disabled", saving, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}>`);
                      if (saving) {
                        $$renderer5.push("<!--[0-->");
                        Spinner($$renderer5, { className: "size-3.5" });
                      } else {
                        $$renderer5.push("<!--[-1-->");
                        $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>`);
                      }
                      $$renderer5.push(`<!--]--></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else if (isMarkdown) {
                  $$renderer4.push("<!--[3-->");
                } else if (isCode) {
                  $$renderer4.push("<!--[4-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("disabled", saving, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}>`);
                      if (saving) {
                        $$renderer5.push("<!--[0-->");
                        Spinner($$renderer5, { className: "size-3.5" });
                      } else {
                        $$renderer5.push("<!--[-1-->");
                        $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>`);
                      }
                      $$renderer5.push(`<!--]--></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else if (editing) {
                  $$renderer4.push("<!--[5-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!----> `);
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("disabled", saving, true)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}>`);
                      if (saving) {
                        $$renderer5.push("<!--[0-->");
                        Spinner($$renderer5, { className: "size-3.5" });
                      } else {
                        $$renderer5.push("<!--[-1-->");
                        $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"></path></svg>`);
                      }
                      $$renderer5.push(`<!--]--></button>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!---->`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}>`);
                      PenAlt($$renderer5, { className: "size-3.5" });
                      $$renderer5.push(`<!----></button>`);
                    },
                    $$slots: { default: true }
                  });
                }
                $$renderer4.push(`<!--]-->`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> `);
              if (fileContent !== null) {
                $$renderer4.push("<!--[0-->");
                Tooltip($$renderer4, {
                  content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"></path></svg></button>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> `);
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg></button>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          if (selectedCount > 0) {
            $$renderer3.push("<!--[0-->");
            BulkActionBar($$renderer3, {
              count: selectedCount,
              hasFiles: hasSelectedFiles,
              onDelete: () => {
                showDeleteConfirm = true;
              },
              onDownload: bulkDownload,
              onSelectAll: selectAll,
              onClear: clearSelection
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="flex-1 overflow-y-auto min-h-0 min-w-0">`);
        if (previewPort !== null) {
          $$renderer3.push("<!--[0-->");
          PortPreview($$renderer3, {
            baseUrl: selectedTerminal?.url ?? "",
            port: previewPort,
            overlay: overlay || isDraggingHandle,
            onClose: () => {
              previewPort = null;
            }
          });
        } else if (selectedFile !== null) {
          $$renderer3.push("<!--[1-->");
          FilePreview($$renderer3, {
            selectedFile,
            fileLoading,
            fileImageUrl,
            fileVideoUrl,
            fileAudioUrl,
            filePdfData,
            fileSqliteData,
            fileContent,
            fileOfficeHtml,
            fileOfficeSlides,
            excelSheetNames,
            selectedExcelSheet,
            onSheetChange: async (sheet) => {
              if (!excelWorkbook) return;
              selectedExcelSheet = sheet;
              const { excelToTable } = await import("./excelToTable.js");
              const result = await excelToTable(excelWorkbook.Sheets[sheet]);
              fileOfficeHtml = result.html;
            },
            baseUrl: selectedTerminal?.url ?? "",
            apiKey: selectedTerminal?.key ?? "",
            overlay: overlay || isDraggingHandle,
            onSave: async (content) => {
              const terminal = selectedTerminal;
              if (!terminal || !selectedFile) return;
              const fileName = selectedFile.split("/").pop() ?? "file";
              const dir = selectedFile.substring(0, selectedFile.lastIndexOf("/") + 1) || "/";
              const file = new File([content], fileName, { type: "text/plain" });
              const result = await uploadToTerminal(terminal.url, terminal.key, dir, file);
              toast[result ? "success" : "error"](store_get($$store_subs ??= {}, "$i18n", i18n).t(result ? "File saved" : "Failed to save file"));
              if (result) fileContent = content;
            },
            get editing() {
              return editing;
            },
            set editing($$value) {
              editing = $$value;
              $$settled = false;
            },
            get showRaw() {
              return showRaw;
            },
            set showRaw($$value) {
              showRaw = $$value;
              $$settled = false;
            },
            get saving() {
              return saving;
            },
            set saving($$value) {
              saving = $$value;
              $$settled = false;
            },
            get currentSlide() {
              return currentSlide;
            },
            set currentSlide($$value) {
              currentSlide = $$value;
              $$settled = false;
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
          if (uploading) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="flex items-center justify-center gap-2 p-4 text-xs text-gray-500">`);
            Spinner($$renderer3, { className: "size-4" });
            $$renderer3.push(`<!----> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uploading..."))}</div>`);
          } else if (loading) {
            $$renderer3.push("<!--[1-->");
            $$renderer3.push(`<div class="flex justify-center pt-8">`);
            Spinner($$renderer3, { className: "size-4" });
            $$renderer3.push(`<!----></div>`);
          } else if (error) {
            $$renderer3.push("<!--[2-->");
            $$renderer3.push(`<div class="p-4 text-xs">${escape_html(error)}</div>`);
          } else if (entries.length === 0 && !creatingFolder && !creatingFile) {
            $$renderer3.push("<!--[3-->");
            $$renderer3.push(`<div class="flex flex-col items-center justify-center gap-1.5 py-12 text-center">`);
            Folder($$renderer3, { className: "size-6 text-gray-200 dark:text-gray-700" });
            $$renderer3.push(`<!----> <div class="text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("This folder is empty"))}</div> <div class="text-[11px] text-gray-300 dark:text-gray-600">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Drop files here to upload"))}</div></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (!loading && !error && !uploading) {
            $$renderer3.push("<!--[0-->");
            if (creatingFolder) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="flex items-center gap-2 px-3 py-1.5">`);
              Folder($$renderer3, {
                className: "size-4 shrink-0 text-blue-400 dark:text-blue-300"
              });
              $$renderer3.push(`<!----> <input${attr("value", newFolderName)} class="flex-1 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 dark:focus:border-blue-500"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name"))}/></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (creatingFile) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="flex items-center gap-2 px-3 py-1.5">`);
              Document($$renderer3, {
                className: "size-4 shrink-0 text-gray-400 dark:text-gray-500"
              });
              $$renderer3.push(`<!----> <input${attr("value", newFileName)} class="flex-1 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 dark:focus:border-blue-500"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("File name"))}/></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (entries.length > 0 || creatingFolder || creatingFile) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<ul><!--[-->`);
              const each_array = ensure_array_like(entries);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let entry = each_array[$$index];
                FileEntryRow($$renderer3, {
                  entry,
                  currentPath,
                  terminalUrl: selectedTerminal.url,
                  terminalKey: selectedTerminal.key,
                  selected: selectedEntries.has(entry.type === "directory" ? `${currentPath}${entry.name}/` : `${currentPath}${entry.name}`),
                  selectionMode,
                  selectedPaths: selectedEntries,
                  onOpen: openEntry,
                  onDownload: downloadFile,
                  onDelete: requestDelete,
                  onMove: handleMove,
                  onRename: handleRename,
                  onSelect: handleSelect,
                  onLongPress: enterSelectionMode
                });
              }
              $$renderer3.push(`<!--]--></ul>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div> `);
        if (selectedTerminal && !selectedFile && previewPort === null) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="shrink-0 border-t border-gray-100 dark:border-gray-800">`);
          PortList($$renderer3, { baseUrl: selectedTerminal.url, apiKey: selectedTerminal.key });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (terminalEnabled) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850">`);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <button class="w-full flex items-center gap-2 px-3 py-1 mb-0.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path fill-rule="evenodd" d="M3.25 3A2.25 2.25 0 0 0 1 5.25v9.5A2.25 2.25 0 0 0 3.25 17h13.5A2.25 2.25 0 0 0 19 14.75v-9.5A2.25 2.25 0 0 0 16.75 3H3.25Zm.943 8.752a.75.75 0 0 1 .055-1.06L6.128 9l-1.88-1.693a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 0 1-1.06-.055ZM9.75 10.25a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clip-rule="evenodd"></path></svg> <span class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Terminal"))}</span> `);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(`size-3 ml-auto transition-transform ${stringify("")}`)}><path fill-rule="evenodd" d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z" clip-rule="evenodd"></path></svg></button> `);
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
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
    bind_props($$props, { onAttach, overlay });
  });
}
let savedPyodidePath = "/mnt/uploads";
function PyodideFileNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canGoBack, canGoForward, breadcrumbs;
    const i18n = getContext("i18n");
    let overlay = fallback($$props["overlay"], false);
    let currentPath = savedPyodidePath;
    let entries = [];
    let loading = false;
    let error = null;
    let selectedFile = null;
    let fileLoading = false;
    let fileContent = null;
    let fileImageUrl = null;
    let showDeleteConfirm = false;
    let deleteName = "";
    let creatingFolder = false;
    let newFolderName = "";
    let creatingFile = false;
    let newFileName = "";
    let navHistory = [];
    let navIndex = -1;
    let navigatingHistory = false;
    const pushNavHistory = (path, file = null) => {
      if (navigatingHistory) return;
      const current = navHistory[navIndex];
      if (current && current.path === path && current.file === file) return;
      if (navIndex < navHistory.length - 1) {
        navHistory = navHistory.slice(0, navIndex + 1);
      }
      navHistory = [...navHistory, { path, file }];
      navIndex = navHistory.length - 1;
    };
    const goBack = async () => {
      if (!canGoBack) return;
      navigatingHistory = true;
      navIndex -= 1;
      const entry = navHistory[navIndex];
      await loadDir(entry.path);
      if (entry.file) {
        const fileName = entry.file.split("/").pop() ?? "";
        await openEntry({ name: fileName, type: "file", size: 0 });
      }
      navigatingHistory = false;
    };
    const goForward = async () => {
      if (!canGoForward) return;
      navigatingHistory = true;
      navIndex += 1;
      const entry = navHistory[navIndex];
      await loadDir(entry.path);
      if (entry.file) {
        const fileName = entry.file.split("/").pop() ?? "";
        await openEntry({ name: fileName, type: "file", size: 0 });
      }
      navigatingHistory = false;
    };
    let _reqId = 0;
    const IMAGE_EXTS = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "ico", "avif"]);
    const isImage = (path) => IMAGE_EXTS.has(path.split(".").pop()?.toLowerCase() ?? "");
    function ensureWorker() {
      let worker = store_get($$store_subs ??= {}, "$pyodideWorker", pyodideWorker);
      if (!worker) {
        worker = new WorkerWrapper();
        pyodideWorker.set(worker);
      }
      return worker;
    }
    function sendWorkerMessage(msg) {
      const worker = ensureWorker();
      const id = `fs-${++_reqId}`;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => {
            worker.removeEventListener("message", handler);
            reject("Timeout");
          },
          3e4
        );
        function handler(event) {
          if (event.data?.id !== id) return;
          clearTimeout(timeout);
          worker.removeEventListener("message", handler);
          resolve(event.data);
        }
        worker.addEventListener("message", handler);
        worker.postMessage({ ...msg, id });
      });
    }
    const buildBreadcrumbs = (path) => {
      const parts = path.split("/").filter(Boolean);
      return parts.reduce(
        (acc, part) => {
          const prev = acc[acc.length - 1];
          acc.push({ label: part, path: `${prev.path}${part}/` });
          return acc;
        },
        [{ label: "/", path: "/" }]
      );
    };
    const loadDir = async (path) => {
      loading = true;
      error = null;
      selectedFile = null;
      clearPreview();
      currentPath = path.endsWith("/") ? path : path + "/";
      savedPyodidePath = currentPath;
      pushNavHistory(currentPath);
      try {
        const res = await sendWorkerMessage({ type: "fs:list", path: currentPath.replace(/\/$/, "") || "/" });
        entries = (res.entries || []).sort((a, b) => {
          if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      } catch {
        error = "Failed to list directory";
        entries = [];
      }
      loading = false;
    };
    const openEntry = async (entry) => {
      if (entry.type === "directory") {
        await loadDir(`${currentPath}${entry.name}/`);
        return;
      }
      const filePath = `${currentPath}${entry.name}`;
      pushNavHistory(currentPath, filePath);
      selectedFile = filePath;
      fileLoading = true;
      clearPreview();
      try {
        const res = await sendWorkerMessage({ type: "fs:read", path: filePath });
        if (res.error) {
          fileContent = `Error: ${res.error}`;
        } else if (isImage(filePath)) {
          const blob = new Blob([res.data]);
          fileImageUrl = URL.createObjectURL(blob);
        } else {
          const decoder = new TextDecoder("utf-8", { fatal: true });
          try {
            fileContent = decoder.decode(res.data);
          } catch {
            fileContent = `[Binary file: ${entry.size ?? 0} bytes]`;
          }
        }
      } catch {
        fileContent = "Failed to read file";
      }
      fileLoading = false;
    };
    const clearPreview = () => {
      fileContent = null;
      if (fileImageUrl) {
        URL.revokeObjectURL(fileImageUrl);
        fileImageUrl = null;
      }
    };
    const downloadFile = async (path) => {
      try {
        const res = await sendWorkerMessage({ type: "fs:read", path });
        if (res.data) {
          const blob = new Blob([res.data]);
          const url2 = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url2;
          a.download = path.split("/").pop() ?? "file";
          a.click();
          URL.revokeObjectURL(url2);
        }
      } catch (e) {
        /* @__PURE__ */ console.error("Download failed:", e);
      }
    };
    const confirmDelete = (path, name) => {
      deleteName = name;
      showDeleteConfirm = true;
    };
    const startNewFolder = async () => {
      creatingFolder = true;
      newFolderName = "";
      await tick();
    };
    const startNewFile = async () => {
      creatingFile = true;
      newFileName = "";
      await tick();
    };
    const uploadFiles = async (fileList) => {
      const payloads = [];
      for (const file of fileList) {
        payloads.push({ name: file.name, data: await file.arrayBuffer() });
      }
      try {
        await sendWorkerMessage({
          type: "fs:upload",
          files: payloads,
          dir: currentPath.replace(/\/$/, "") || "/"
        });
      } catch (e) {
        /* @__PURE__ */ console.error("Upload failed:", e);
      }
      await loadDir(currentPath);
    };
    const onFilesChanged = async () => {
      try {
        await sendWorkerMessage({ type: "fs:sync" });
      } catch {
      }
      loadDir(currentPath);
    };
    onDestroy(() => {
      window.removeEventListener("pyodide:files", onFilesChanged);
    });
    canGoBack = navIndex > 0;
    canGoForward = navIndex < navHistory.length - 1;
    breadcrumbs = buildBreadcrumbs(currentPath);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete {{name}}", { name: deleteName }),
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to delete this?"),
        get show() {
          return showDeleteConfirm;
        },
        set show($$value) {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex flex-col h-full min-h-0 min-w-0 relative" role="region"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Pyodide file browser"))}>`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (overlay) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="absolute inset-0 z-10 pointer-events-none"></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      FileNavToolbar($$renderer3, {
        breadcrumbs,
        selectedFile,
        loading,
        canGoBack,
        canGoForward,
        onGoBack: goBack,
        onGoForward: goForward,
        onNavigate: (path) => loadDir(path),
        onRefresh: async () => {
          try {
            await sendWorkerMessage({ type: "fs:sync" });
          } catch {
          }
          if (selectedFile) {
            const name = selectedFile.split("/").pop() ?? "";
            openEntry({ name, type: "file", size: 0 });
          } else {
            loadDir(currentPath);
          }
        },
        onNewFolder: startNewFolder,
        onNewFile: startNewFile,
        onUploadFiles: uploadFiles,
        onMove: () => {
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<button class="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3.5"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"></path></svg></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> <div class="flex-1 min-h-0 flex flex-col">`);
      if (selectedFile) {
        $$renderer3.push("<!--[0-->");
        FilePreview($$renderer3, {
          selectedFile,
          fileLoading,
          fileImageUrl,
          fileContent,
          overlay
        });
      } else if (loading) {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="flex items-center justify-center flex-1 p-6">`);
        Spinner($$renderer3, { className: "size-4" });
        $$renderer3.push(`<!----></div>`);
      } else if (error) {
        $$renderer3.push("<!--[2-->");
        $$renderer3.push(`<div class="flex items-center justify-center flex-1 p-6"><div class="text-xs text-red-500">${escape_html(error)}</div></div>`);
      } else if (entries.length === 0 && !creatingFolder && !creatingFile) {
        $$renderer3.push("<!--[3-->");
        $$renderer3.push(`<div class="flex flex-col items-center justify-center flex-1 p-6 text-center gap-2">`);
        Folder($$renderer3, { className: "size-5 text-gray-300 dark:text-gray-600" });
        $$renderer3.push(`<!----> <div class="text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No files yet. Upload files or run Python code to create them."))}</div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (!loading && !error && !selectedFile) {
        $$renderer3.push("<!--[0-->");
        if (creatingFolder) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex items-center gap-2 px-3 py-1.5">`);
          Folder($$renderer3, {
            className: "size-4 shrink-0 text-blue-400 dark:text-blue-300"
          });
          $$renderer3.push(`<!----> <input${attr("value", newFolderName)} class="flex-1 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 dark:focus:border-blue-500"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name"))}/></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (creatingFile) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex items-center gap-2 px-3 py-1.5">`);
          Document($$renderer3, {
            className: "size-4 shrink-0 text-gray-400 dark:text-gray-500"
          });
          $$renderer3.push(`<!----> <input${attr("value", newFileName)} class="flex-1 text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 outline-none focus:border-blue-400 dark:focus:border-blue-500"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("File name"))}/></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (entries.length > 0 || creatingFolder || creatingFile) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<ul class="overflow-y-auto flex-1 min-h-0"><!--[-->`);
          const each_array = ensure_array_like(entries);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let entry = each_array[$$index];
            FileEntryRow($$renderer3, {
              entry,
              currentPath,
              onOpen: openEntry,
              onDownload: downloadFile,
              onDelete: confirmDelete
            });
          }
          $$renderer3.push(`<!--]--></ul>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { overlay });
  });
}
function Heart($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Node($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let data = $$props["data"];
    $$renderer2.push(`<div class="px-4 py-3 shadow-md rounded-xl dark:bg-black bg-white border border-gray-100 dark:border-gray-900 w-60 h-20 group">`);
    Tooltip($$renderer2, {
      content: data?.message?.error ? data.message.error.content : data.message.content,
      class: "w-full",
      allowHTML: false,
      children: ($$renderer3) => {
        if (data.message.role === "user") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="flex w-full">`);
          ProfileImage($$renderer3, {
            src: `${WEBUI_API_BASE_URL}/users/${data.user.id}/profile/image`,
            className: "size-5 -translate-y-[1px] flex-shrink-0"
          });
          $$renderer3.push(`<!----> <div class="ml-2"><div class="flex justify-between items-center"><div class="text-xs text-black dark:text-white font-medium line-clamp-1">${escape_html(data?.user?.name ?? "User")}</div></div> `);
          if (data?.message?.error) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="text-red-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.error.content)}</div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div class="text-gray-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.content)}</div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div class="flex w-full">`);
          ProfileImage($$renderer3, {
            src: `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${data.model?.id ?? data.message.model}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`,
            className: "size-5 -translate-y-[1px] flex-shrink-0"
          });
          $$renderer3.push(`<!----> <div class="ml-2"><div class="flex justify-between items-center"><div class="text-xs text-black dark:text-white font-medium line-clamp-1">${escape_html(data?.model?.name ?? data?.message?.model ?? "Assistant")}</div> <button${attr_class(clsx(data?.message?.favorite ? "" : "invisible group-hover:visible"))}${attr("aria-label", data?.message?.favorite ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove from favorites") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Add to favorites"))}>`);
          Heart($$renderer3, {
            className: `size-3 ${stringify(data?.message?.favorite ? "fill-red-500 stroke-red-500" : "hover:fill-red-500 hover:stroke-red-500")} `,
            strokeWidth: "2.5"
          });
          $$renderer3.push(`<!----></button></div> `);
          if (data?.message?.error) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="text-red-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.error.content)}</div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div class="text-gray-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.content)}</div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Handle($$renderer2, {
      type: "target",
      position: Position.Top,
      class: "w-2 rounded-full dark:bg-gray-900"
    });
    $$renderer2.push(`<!----> `);
    Handle($$renderer2, {
      type: "source",
      position: Position.Bottom,
      class: "w-2 rounded-full dark:bg-gray-900"
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
function AlignVertical($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 3L2 3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22 21L2 21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 15V9C8 7.89543 8.89543 7 10 7H14C15.1046 7 16 7.89543 16 9V15C16 16.1046 15.1046 17 14 17H10C8.89543 17 8 16.1046 8 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AlignHorizontal($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 22L3 2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 22V2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 16H9C7.89543 16 7 15.1046 7 14V10C7 8.89543 7.89543 8 9 8H15C16.1046 8 17 8.89543 17 10V14C17 15.1046 16.1046 16 15 16Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Flow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodes = $$props["nodes"];
    let nodeTypes = $$props["nodeTypes"];
    let edges = $$props["edges"];
    let setLayoutDirection = $$props["setLayoutDirection"];
    SvelteFlow($$renderer2, {
      nodes,
      nodeTypes,
      edges,
      fitView: true,
      minZoom: 1e-3,
      colorMode: store_get($$store_subs ??= {}, "$theme", theme).includes("dark") ? "dark" : store_get($$store_subs ??= {}, "$theme", theme) === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light",
      nodesConnectable: false,
      nodesDraggable: false,
      oninit: () => {
        /* @__PURE__ */ console.log("Flow initialized");
      },
      children: ($$renderer3) => {
        Controls$1($$renderer3, {
          showLock: false,
          children: ($$renderer4) => {
            ControlButton($$renderer4, {
              title: "Vertical Layout",
              children: ($$renderer5) => {
                AlignVertical($$renderer5, { className: "size-4" });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            ControlButton($$renderer4, {
              title: "Horizontal Layout",
              children: ($$renderer5) => {
                AlignHorizontal($$renderer5, { className: "size-4" });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Background($$renderer3, { variant: BackgroundVariant.Dots });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { nodes, nodeTypes, edges, setLayoutDirection });
  });
}
function View($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    const { width, height } = useStore();
    const { fitView } = useSvelteFlow();
    useNodesInitialized();
    let history = $$props["history"];
    let onClose = $$props["onClose"];
    let onNodeClick = $$props["onNodeClick"];
    let selectedMessageId = null;
    const nodes = writable([]);
    const edges = writable([]);
    let layoutDirection = "vertical";
    const nodeTypes = { custom: Node };
    const focusNode = async () => {
      if (selectedMessageId === null) {
        await fitView({ nodes: [{ id: history.currentId }] });
      } else {
        await fitView({ nodes: [{ id: selectedMessageId }] });
      }
      selectedMessageId = null;
    };
    const drawFlow = async (direction) => {
      const nodeList = [];
      const edgeList = [];
      const levelOffset = direction === "vertical" ? 150 : 300;
      const siblingOffset = direction === "vertical" ? 250 : 150;
      let positionMap = /* @__PURE__ */ new Map();
      let layerWidths = {};
      Object.keys(history.messages).forEach((id) => {
        const message = history.messages[id];
        if (!message) return;
        const level = message.parentId ? (positionMap.get(message.parentId)?.level ?? -1) + 1 : 0;
        if (!layerWidths[level]) layerWidths[level] = 0;
        positionMap.set(id, { id: message.id, level, position: layerWidths[level]++ });
      });
      Object.keys(history.messages).forEach((id) => {
        const pos = positionMap.get(id);
        if (!pos) return;
        const x = direction === "vertical" ? pos.position * siblingOffset : pos.level * levelOffset;
        const y = direction === "vertical" ? pos.level * levelOffset : pos.position * siblingOffset;
        nodeList.push({
          id: pos.id,
          type: "custom",
          data: {
            user: store_get($$store_subs ??= {}, "$user", user),
            message: history.messages[id],
            model: store_get($$store_subs ??= {}, "$models", models).find((model) => model.id === history.messages[id].model)
          },
          position: { x, y }
        });
        const parentId = history.messages[id].parentId;
        if (parentId) {
          edgeList.push({
            id: parentId + "-" + pos.id,
            source: parentId,
            target: pos.id,
            selectable: false,
            class: " dark:fill-gray-300 fill-gray-300",
            type: "smoothstep",
            animated: history.currentId === id || recurseCheckChild(id, history.currentId)
          });
        }
      });
      await edges.set([...edgeList]);
      await nodes.set([...nodeList]);
    };
    const recurseCheckChild = (nodeId, currentId) => {
      const node = history.messages[nodeId];
      return node.childrenIds && node.childrenIds.some((id) => id === currentId || recurseCheckChild(id, currentId));
    };
    const setLayoutDirection = (direction) => {
      layoutDirection = direction;
      drawFlow(layoutDirection);
    };
    onDestroy(() => {
      /* @__PURE__ */ console.log("Overview destroyed");
      nodes.set([]);
      edges.set([]);
    });
    if (history) {
      drawFlow(layoutDirection);
    }
    if (history && history.currentId) {
      focusNode();
    }
    $$renderer2.push(`<div class="w-full h-full relative">`);
    if (
      // Map to keep track of node positions at each level
      // Helper function to truncate labels
      // Create nodes and map children to ensure alignment in width
      // Track widths of each layer
      // Adjust positions based on siblings count to centralize vertical spacing
      // Create edges
      // fitView();
      // fitView();
      store_get($$store_subs ??= {}, "$nodes", nodes).length > 0
    ) {
      $$renderer2.push("<!--[0-->");
      Flow($$renderer2, { nodes, nodeTypes, edges, setLayoutDirection });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { history, onClose, onNodeClick });
  });
}
function Overview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let history = $$props["history"];
    let onClose = $$props["onClose"];
    let onNodeClick = $$props["onNodeClick"];
    SvelteFlowProvider($$renderer2, {
      children: ($$renderer3) => {
        View($$renderer3, { history, onClose, onNodeClick });
      },
      $$slots: { default: true }
    });
    bind_props($$props, { history, onClose, onNodeClick });
  });
}
let savedTab = "controls";
function ChatControls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let hasMessages, showOverviewTab, showFilesTab, showControlsTab;
    const i18n = getContext("i18n");
    let history = $$props["history"];
    let models2 = fallback($$props["models"], () => [], true);
    let chatId2 = fallback($$props["chatId"], null);
    let chatFiles = fallback($$props["chatFiles"], () => [], true);
    let params = fallback($$props["params"], () => ({}), true);
    let eventTarget = $$props["eventTarget"];
    let submitPrompt = $$props["submitPrompt"];
    let stopResponse = $$props["stopResponse"];
    let showMessage = $$props["showMessage"];
    let files = $$props["files"];
    let modelId = $$props["modelId"];
    let codeInterpreterEnabled = fallback($$props["codeInterpreterEnabled"], false);
    let pane = fallback($$props["pane"], null);
    let minSize = 0;
    let activeTab = savedTab;
    const handleTerminalAttach = async (blob, name, contentType) => {
      const tempItemId = v4();
      const fileItem = {
        type: "file",
        file: "",
        id: null,
        url: "",
        name,
        collection_name: "",
        status: "uploading",
        error: "",
        itemId: tempItemId,
        size: blob.size
      };
      files = [...files, fileItem];
      try {
        const file = new File([blob], name, { type: contentType || "application/octet-stream" });
        const uploaded = await uploadFile(localStorage.token, file);
        if (!uploaded) throw new Error("Upload failed");
        const idx = files.findIndex((f) => f.itemId === tempItemId);
        if (idx !== -1) {
          files[idx] = {
            ...fileItem,
            status: "uploaded",
            file: uploaded,
            id: uploaded.id,
            url: `${uploaded.id}`,
            collection_name: uploaded?.meta?.collection_name
          };
          files = files;
        }
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("File attached to chat"));
      } catch (e) {
        files = files.filter((f) => f.itemId !== tempItemId);
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to attach file"));
      }
    };
    const openPane = () => {
      if (parseInt(localStorage?.chatControlsSize)) {
        const container = document.getElementById("chat-container");
        let size = Math.floor(parseInt(localStorage?.chatControlsSize) / container.clientWidth * 100);
        pane.resize(size);
      } else {
        pane.resize(minSize);
      }
    };
    hasMessages = history?.messages && Object.keys(history.messages).length > 0;
    showOverviewTab = hasMessages;
    if (!showOverviewTab && activeTab === "overview") activeTab = "controls";
    showFilesTab = !!store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId) || codeInterpreterEnabled && store_get($$store_subs ??= {}, "$config", config)?.code?.interpreter_engine !== "jupyter";
    if (!showFilesTab && activeTab === "files") activeTab = "controls";
    showControlsTab = store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.controls ?? true);
    if (!showControlsTab && activeTab === "controls") {
      if (showFilesTab) activeTab = "files";
      else if (showOverviewTab) activeTab = "overview";
    }
    if (store_get($$store_subs ??= {}, "$showFileNavPath", showFileNavPath)) {
      activeTab = "files";
      showControls.set(true);
    }
    if (store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId)) {
      activeTab = "files";
    }
    {
      savedTab = activeTab;
    }
    if (!showControlsTab && !showFilesTab && !showOverviewTab) {
      showControls.set(false);
    }
    store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay) || store_get($$store_subs ??= {}, "$showArtifacts", showArtifacts) || store_get($$store_subs ??= {}, "$showEmbeds", showEmbeds);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[0-->");
        if (store_get($$store_subs ??= {}, "$showControls", showControls)) {
          $$renderer3.push("<!--[0-->");
          Drawer($$renderer3, {
            show: store_get($$store_subs ??= {}, "$showControls", showControls),
            onClose: () => showControls.set(false),
            className: "min-h-[100dvh] !bg-white dark:!bg-gray-850",
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="h-[100dvh] flex flex-col">`);
              if (store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay)) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="h-full max-h-[100dvh] bg-white text-gray-700 dark:bg-black dark:text-gray-300 flex justify-center">`);
                CallOverlay($$renderer4, {
                  submitPrompt,
                  stopResponse,
                  modelId,
                  chatId: chatId2,
                  eventTarget,
                  get files() {
                    return files;
                  },
                  set files($$value) {
                    files = $$value;
                    $$settled = false;
                  }
                });
                $$renderer4.push(`<!----></div>`);
              } else if (store_get($$store_subs ??= {}, "$showEmbeds", showEmbeds)) {
                $$renderer4.push("<!--[1-->");
                Embeds($$renderer4, {});
              } else if (store_get($$store_subs ??= {}, "$showArtifacts", showArtifacts)) {
                $$renderer4.push("<!--[2-->");
                Artifacts($$renderer4, { history });
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<div class="flex flex-col h-full min-h-0"><div class="flex items-center justify-between px-2 pt-2 pb-2 shrink-0"><div class="flex gap-1 min-w-0 overflow-x-auto scrollbar-hidden">`);
                if (showControlsTab) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button${attr_class(`px-2.5 py-1 text-sm rounded-lg transition whitespace-nowrap ${stringify(activeTab === "controls" ? "bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Controls"))}</button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                if (showFilesTab) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button${attr_class(`px-2.5 py-1 text-sm rounded-lg transition whitespace-nowrap ${stringify(activeTab === "files" ? "bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Files"))}</button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                if (showOverviewTab) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button${attr_class(`px-2.5 py-1 text-sm rounded-lg transition whitespace-nowrap ${stringify(activeTab === "overview" ? "bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Overview"))}</button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--></div> <button class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg></button></div> <div${attr_class(`flex-1 min-h-0 ${stringify(activeTab === "overview" ? "h-full" : activeTab === "controls" ? "overflow-y-auto px-3 pt-1" : "")}`)}>`);
                if (activeTab === "overview") {
                  $$renderer4.push("<!--[0-->");
                  Overview($$renderer4, {
                    history,
                    onNodeClick: (e) => {
                      const node = e.node;
                      showMessage(node.data.message, true);
                    },
                    onClose: () => showControls.set(false)
                  });
                } else if (activeTab === "files" && store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId)) {
                  $$renderer4.push("<!--[1-->");
                  FileNav($$renderer4, { onAttach: handleTerminalAttach });
                } else if (activeTab === "files" && codeInterpreterEnabled) {
                  $$renderer4.push("<!--[2-->");
                  PyodideFileNav($$renderer4, {});
                } else {
                  $$renderer4.push("<!--[-1-->");
                  Controls($$renderer4, {
                    embed: true,
                    models: models2,
                    get chatFiles() {
                      return chatFiles;
                    },
                    set chatFiles($$value) {
                      chatFiles = $$value;
                      $$settled = false;
                    },
                    get params() {
                      return params;
                    },
                    set params($$value) {
                      params = $$value;
                      $$settled = false;
                    }
                  });
                }
                $$renderer4.push(`<!--]--></div></div>`);
              }
              $$renderer4.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
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
      history,
      models: models2,
      chatId: chatId2,
      chatFiles,
      params,
      eventTarget,
      submitPrompt,
      stopResponse,
      showMessage,
      files,
      modelId,
      codeInterpreterEnabled,
      pane,
      openPane
    });
  });
}
function ChatList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(localizedFormat);
    let chats2 = fallback($$props["chats"], () => [], true);
    let chatListLoading = fallback($$props["chatListLoading"], false);
    let allChatsLoaded = fallback($$props["allChatsLoaded"], false);
    let loadHandler = fallback($$props["loadHandler"], null);
    let chatList = null;
    const init = async () => {
      if (chats2.length === 0) {
        chatList = [];
      } else {
        chatList = chats2.map((chat) => ({ ...chat, time_range: getTimeRange(chat.updated_at) }));
        chatList.sort((a, b) => {
          {
            return a[orderBy] < b[orderBy] ? 1 : -1;
          }
        });
      }
    };
    let orderBy = "updated_at";
    if (chats2) {
      init();
    }
    if (chatList) {
      $$renderer2.push("<!--[0-->");
      if (chatList.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex text-xs font-medium mb-1 items-center -mr-0.5"><button class="px-1.5 py-1 cursor-pointer select-none basis-3/5"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Title"))} `);
        {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="invisible">`);
          ChevronUp($$renderer2, { className: "size-2" });
          $$renderer2.push(`<!----></span>`);
        }
        $$renderer2.push(`<!--]--></div></button> <button class="px-1.5 py-1 cursor-pointer select-none hidden sm:flex sm:basis-2/5 justify-end"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Updated at"))} `);
        {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="font-normal">`);
          {
            $$renderer2.push("<!--[-1-->");
            ChevronDown($$renderer2, { className: "size-2" });
          }
          $$renderer2.push(`<!--]--></span>`);
        }
        $$renderer2.push(`<!--]--></div></button></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="text-left text-sm w-full mb-3">`);
      if (chatList.length === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="text-xs text-gray-500 dark:text-gray-400 text-center px-5 min-h-20 w-full h-full flex justify-center items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No chats found"))}</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array = ensure_array_like(chatList);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let chat = each_array[idx];
        if ((idx === 0 || idx > 0 && chat.time_range !== chatList[idx - 1].time_range) && chat?.time_range) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div${attr_class(`w-full text-xs text-gray-500 dark:text-gray-500 font-medium ${stringify(idx === 0 ? "" : "pt-5")} pb-2 px-2`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(chat.time_range))}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <a class="w-full flex justify-between items-center rounded-lg text-sm py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-850" draggable="false"${attr("href", `/c/${chat.id}`)}><div class="text-ellipsis line-clamp-1 w-full sm:basis-3/5">${escape_html(chat?.title)}</div> <div class="hidden sm:flex sm:basis-2/5 items-center justify-end"><div class="text-gray-500 dark:text-gray-400 text-xs">${escape_html(dayjs(chat?.updated_at * 1e3).calendar())}</div></div></a>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (!allChatsLoaded && loadHandler) {
        $$renderer2.push("<!--[0-->");
        Loader($$renderer2, {
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
            Spinner($$renderer3, { className: " size-4" });
            $$renderer3.push(`<!----> <div>Loading...</div></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { chats: chats2, chatListLoading, allChatsLoaded, loadHandler });
  });
}
function FolderPlaceholder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let folder = fallback($$props["folder"], null);
    let page2 = 1;
    let chats2 = null;
    let chatListLoading = false;
    let allChatsLoaded = false;
    const loadChats = async () => {
      chatListLoading = true;
      page2 += 1;
      let newChatList = [];
      newChatList = await getChatListByFolderId(localStorage.token, folder.id, page2).catch((error) => {
        /* @__PURE__ */ console.error(error);
        return [];
      });
      allChatsLoaded = newChatList.length === 0;
      chats2 = [...chats2 || [], ...newChatList || []];
      chatListLoading = false;
    };
    const setChatList = async () => {
      chats2 = null;
      page2 = 1;
      allChatsLoaded = false;
      chatListLoading = false;
      if (folder && folder.id) {
        const res = await getChatListByFolderId(localStorage.token, folder.id, page2);
        if (res) {
          chats2 = res;
        } else {
          chats2 = [];
        }
      } else {
        chats2 = [];
      }
    };
    if (folder) {
      setChatList();
    }
    $$renderer2.push(`<div><div>`);
    {
      $$renderer2.push("<!--[1-->");
      if (chats2 !== null) {
        $$renderer2.push("<!--[0-->");
        ChatList($$renderer2, {
          chats: chats2,
          chatListLoading,
          allChatsLoaded,
          loadHandler: loadChats
        });
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="py-10">`);
        Spinner($$renderer2, {});
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { folder });
  });
}
function FolderTitle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    const { saveAs } = fileSaver;
    let folder = fallback($$props["folder"], null);
    let onUpdate = fallback($$props["onUpdate"], (folderId2) => {
    });
    let onDelete = fallback($$props["onDelete"], (folderId2) => {
    });
    let showFolderModal = false;
    let showDeleteConfirm = false;
    let deleteFolderContents = true;
    const updateHandler = async ({ name, meta, data }) => {
      if (name === "") {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name cannot be empty."));
        return;
      }
      const currentName = folder.name;
      name = name.trim();
      folder.name = name;
      const res = await updateFolderById(localStorage.token, folder.id, { name, ...meta ? { meta } : {}, ...data ? { data } : {} }).catch((error) => {
        toast.error(`${error}`);
        folder.name = currentName;
        return null;
      });
      if (res) {
        folder.name = name;
        if (data) {
          folder.data = data;
        }
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder updated successfully"));
        const _folder = await getFolderById(localStorage.token, folder.id).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        await selectedFolder.set(_folder);
        onUpdate(_folder);
      }
    };
    const updateIconHandler = async (iconName) => {
      const res = await updateFolderById(localStorage.token, folder.id, { meta: { icon: iconName ?? "" } }).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        folder.meta = { ...folder.meta, icon: iconName ?? "" };
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder updated successfully"));
        const _folder = await getFolderById(localStorage.token, folder.id).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        await selectedFolder.set(_folder);
        onUpdate(_folder);
      }
    };
    const exportHandler = async () => {
      const chats2 = await getChatsByFolderId(localStorage.token, folder.id).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (!chats2) {
        return;
      }
      const blob = new Blob([JSON.stringify(chats2)], { type: "application/json" });
      saveAs(blob, `folder-${folder.name}-export-${Date.now()}.json`);
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (folder) {
        $$renderer3.push("<!--[0-->");
        FolderModal($$renderer3, {
          edit: true,
          folderId: folder.id,
          onSubmit: updateHandler,
          get show() {
            return showFolderModal;
          },
          set show($$value) {
            showFolderModal = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> `);
        ConfirmDialog($$renderer3, {
          title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete folder?"),
          get show() {
            return showDeleteConfirm;
          },
          set show($$value) {
            showDeleteConfirm = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="text-sm text-gray-700 dark:text-gray-300 flex-1 line-clamp-3 mb-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Are you sure you want to delete "{{NAME}}"?`, { NAME: folders[folderId].name }))}</div> <div class="flex items-center gap-1.5"><input type="checkbox"${attr("checked", deleteFolderContents, true)}/> <div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete all contents inside this folder"))}</div></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> <div class="mb-3 px-6 @md:max-w-3xl justify-between w-full flex relative group items-center"><div class="text-center flex gap-3.5 items-center">`);
        EmojiPicker($$renderer3, {
          onClose: () => {
          },
          selected: folder?.meta?.icon ?? null,
          onSubmit: (name) => {
            /* @__PURE__ */ console.log(name);
            updateIconHandler(name);
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Change folder icon"))} class="rounded-full bg-gray-50 dark:bg-gray-800 size-11 flex justify-center items-center">`);
            if (folder?.meta?.icon) {
              $$renderer4.push("<!--[0-->");
              Emoji($$renderer4, { className: "size-6", shortCode: folder.meta.icon });
            } else {
              $$renderer4.push("<!--[-1-->");
              Folder($$renderer4, { className: "size-4.5", strokeWidth: "2" });
            }
            $$renderer4.push(`<!--]--></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> <div class="text-3xl line-clamp-1">${escape_html(folder.name)}</div></div> <div class="flex items-center translate-x-2.5">`);
        FolderMenu($$renderer3, {
          align: "end",
          onEdit: () => {
            showFolderModal = true;
          },
          onDelete: () => {
            showDeleteConfirm = true;
          },
          onExport: () => {
            exportHandler();
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="p-1.5 dark:hover:bg-gray-850 rounded-full touch-auto"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder options"))}>`);
            EllipsisHorizontal($$renderer4, { className: "size-4", strokeWidth: "2.5" });
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div>`);
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
    bind_props($$props, { folder, onUpdate, onDelete });
  });
}
function Placeholder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let createMessagePair = $$props["createMessagePair"];
    let stopResponse = $$props["stopResponse"];
    let autoScroll = fallback($$props["autoScroll"], false);
    let atSelectedModel = $$props["atSelectedModel"];
    let selectedModels = $$props["selectedModels"];
    let history = $$props["history"];
    let prompt = fallback($$props["prompt"], "");
    let files = fallback($$props["files"], () => [], true);
    let messageInput = fallback($$props["messageInput"], null);
    let selectedToolIds = fallback($$props["selectedToolIds"], () => [], true);
    let selectedFilterIds = fallback($$props["selectedFilterIds"], () => [], true);
    let pendingOAuthTools = fallback($$props["pendingOAuthTools"], () => [], true);
    let showCommands = fallback($$props["showCommands"], false);
    let imageGenerationEnabled = fallback($$props["imageGenerationEnabled"], false);
    let codeInterpreterEnabled = fallback($$props["codeInterpreterEnabled"], false);
    let webSearchEnabled = fallback($$props["webSearchEnabled"], false);
    let onUpload = fallback($$props["onUpload"], (e) => {
    });
    let onSelect = fallback($$props["onSelect"], (e) => {
    });
    let onChange = fallback($$props["onChange"], (e) => {
    });
    let toolServers2 = fallback($$props["toolServers"], () => [], true);
    let dragged = fallback($$props["dragged"], false);
    let models$1 = [];
    let selectedModelIdx = 0;
    models$1 = selectedModels.map((id) => store_get($$store_subs ??= {}, "$_models", models).find((m) => m.id === id));
    if (selectedModels.length > 0) {
      selectedModelIdx = models$1.length - 1;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="m-auto w-full max-w-6xl px-2 @2xl:px-20 translate-y-6 py-24 text-center">`);
      if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        $$renderer3.push("<!--[0-->");
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This chat won't appear in history and your messages will not be saved."),
          className: "w-full flex justify-center mb-0.5",
          placement: "top",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center gap-2 text-gray-500 text-base my-2 w-fit">`);
            EyeSlash($$renderer4, { strokeWidth: "2.5", className: "size-4" });
            $$renderer4.push(`<!---->${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Temporary Chat"))}</div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="w-full text-3xl text-gray-800 dark:text-gray-100 text-center flex items-center gap-4 font-primary"><div class="w-full flex flex-col justify-center items-center">`);
      if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)) {
        $$renderer3.push("<!--[0-->");
        FolderTitle($$renderer3, {
          folder: store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder),
          onUpdate: async (folder) => {
            await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
            currentChatPage.set(1);
          },
          onDelete: async () => {
            await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
            currentChatPage.set(1);
            selectedFolder.set(null);
          }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex flex-row justify-center gap-3 @sm:gap-3.5 w-fit px-5 max-w-xl"><div class="flex shrink-0 justify-center"><div class="flex -space-x-4 mb-0.5"><!--[-->`);
        const each_array = ensure_array_like(models$1);
        for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
          let model = each_array[modelIdx];
          Tooltip($$renderer3, {
            content: (models$1[modelIdx]?.info?.meta?.tags ?? []).map((tag) => tag.name.toUpperCase()).join(", "),
            placement: "top",
            children: ($$renderer4) => {
              $$renderer4.push(`<button${attr("aria-hidden", models$1.length <= 1)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Get information on {{name}} in the UI", { name: models$1[modelIdx]?.name }))}><img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model?.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`)} class="size-9 @sm:size-10 rounded-full border-[1px] border-gray-100 dark:border-none" aria-hidden="true" draggable="false"/></button>`);
            },
            $$slots: { default: true }
          });
        }
        $$renderer3.push(`<!--]--></div></div> <div class="text-3xl @sm:text-3xl line-clamp-1 flex items-center">`);
        if (models$1[selectedModelIdx]?.name) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            content: models$1[selectedModelIdx]?.name,
            placement: "top",
            className: " flex items-center ",
            children: ($$renderer4) => {
              $$renderer4.push(`<span class="line-clamp-1">${escape_html(models$1[selectedModelIdx]?.name)}</span>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hello, {{name}}", { name: store_get($$store_subs ??= {}, "$user", user)?.name }))}`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="flex mt-1 mb-2"><div>`);
        if (models$1[selectedModelIdx]?.info?.meta?.description ?? null) {
          $$renderer3.push("<!--[0-->");
          Tooltip($$renderer3, {
            className: " w-fit",
            content: marked.parse(sanitizeResponseContent(models$1[selectedModelIdx]?.info?.meta?.description ?? "").replaceAll("\n", "<br>")),
            placement: "top",
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="mt-0.5 px-2 text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xl markdown">${html(marked.parse(sanitizeResponseContent(models$1[selectedModelIdx]?.info?.meta?.description ?? "").replaceAll("\n", "<br>")))}</div>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          if (models$1[selectedModelIdx]?.info?.meta?.user) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="mt-0.5 text-sm font-normal text-gray-400 dark:text-gray-500">By `);
            if (models$1[selectedModelIdx]?.info?.meta?.user.community) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<a${attr("href", `https://openwebui.com/m/${stringify(models$1[selectedModelIdx]?.info?.meta?.user.username)}`)}>${escape_html(models$1[selectedModelIdx]?.info?.meta?.user.name ? models$1[selectedModelIdx]?.info?.meta?.user.name : `@${models$1[selectedModelIdx]?.info?.meta?.user.username}`)}</a>`);
            } else {
              $$renderer3.push("<!--[-1-->");
              $$renderer3.push(`${escape_html(models$1[selectedModelIdx]?.info?.meta?.user.name)}`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div>`);
      }
      $$renderer3.push(`<!--]--> <div${attr_class(`text-base font-normal @md:max-w-3xl w-full py-3 ${stringify(atSelectedModel ? "mt-2" : "")}`)}>`);
      MessageInput($$renderer3, {
        history,
        selectedModels,
        pendingOAuthTools,
        toolServers: toolServers2,
        stopResponse,
        createMessagePair,
        placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("How can I help you today?"),
        onChange,
        onUpload,
        get files() {
          return files;
        },
        set files($$value) {
          files = $$value;
          $$settled = false;
        },
        get prompt() {
          return prompt;
        },
        set prompt($$value) {
          prompt = $$value;
          $$settled = false;
        },
        get autoScroll() {
          return autoScroll;
        },
        set autoScroll($$value) {
          autoScroll = $$value;
          $$settled = false;
        },
        get selectedToolIds() {
          return selectedToolIds;
        },
        set selectedToolIds($$value) {
          selectedToolIds = $$value;
          $$settled = false;
        },
        get selectedFilterIds() {
          return selectedFilterIds;
        },
        set selectedFilterIds($$value) {
          selectedFilterIds = $$value;
          $$settled = false;
        },
        get imageGenerationEnabled() {
          return imageGenerationEnabled;
        },
        set imageGenerationEnabled($$value) {
          imageGenerationEnabled = $$value;
          $$settled = false;
        },
        get codeInterpreterEnabled() {
          return codeInterpreterEnabled;
        },
        set codeInterpreterEnabled($$value) {
          codeInterpreterEnabled = $$value;
          $$settled = false;
        },
        get webSearchEnabled() {
          return webSearchEnabled;
        },
        set webSearchEnabled($$value) {
          webSearchEnabled = $$value;
          $$settled = false;
        },
        get atSelectedModel() {
          return atSelectedModel;
        },
        set atSelectedModel($$value) {
          atSelectedModel = $$value;
          $$settled = false;
        },
        get showCommands() {
          return showCommands;
        },
        set showCommands($$value) {
          showCommands = $$value;
          $$settled = false;
        },
        get dragged() {
          return dragged;
        },
        set dragged($$value) {
          dragged = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div> `);
      if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="mx-auto px-4 md:max-w-3xl md:px-6 font-primary min-h-62">`);
        FolderPlaceholder($$renderer3, {
          folder: store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="mx-auto max-w-2xl font-primary mt-2"><div class="mx-5">`);
        Suggestions($$renderer3, {
          suggestionPrompts: atSelectedModel?.info?.meta?.suggestion_prompts ?? models$1[selectedModelIdx]?.info?.meta?.suggestion_prompts ?? store_get($$store_subs ??= {}, "$config", config)?.default_prompt_suggestions ?? [],
          inputValue: prompt,
          onSelect
        });
        $$renderer3.push(`<!----></div></div>`);
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
      createMessagePair,
      stopResponse,
      autoScroll,
      atSelectedModel,
      selectedModels,
      history,
      prompt,
      files,
      messageInput,
      selectedToolIds,
      selectedFilterIds,
      pendingOAuthTools,
      showCommands,
      imageGenerationEnabled,
      codeInterpreterEnabled,
      webSearchEnabled,
      onUpload,
      onSelect,
      onChange,
      toolServers: toolServers2,
      dragged
    });
  });
}
function Chat($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let chatIdProp = fallback($$props["chatIdProp"], "");
    let loading = true;
    const eventTarget = new EventTarget();
    let controlPane;
    let messageInput;
    let autoScroll = true;
    let showEventConfirmation = false;
    let eventConfirmationTitle = "";
    let eventConfirmationMessage = "";
    let eventConfirmationInput = false;
    let eventConfirmationInputPlaceholder = "";
    let eventConfirmationInputValue = "";
    let eventConfirmationInputType = "";
    let selectedModels = [""];
    let atSelectedModel;
    let selectedModelIds = [];
    let selectedToolIds = [];
    let selectedFilterIds = [];
    let pendingOAuthTools = [];
    let imageGenerationEnabled = false;
    let webSearchEnabled = false;
    let codeInterpreterEnabled = false;
    let showCommands = false;
    let generating = false;
    let dragged = false;
    let generationController = null;
    let chat = null;
    let history = { messages: {}, currentId: null };
    let taskIds = null;
    let prompt = "";
    let chatFiles = [];
    let files = [];
    let params = {};
    const navigateHandler = async () => {
      loading = true;
      prompt = "";
      messageInput?.setText("");
      files = [];
      selectedToolIds = [];
      selectedFilterIds = [];
      webSearchEnabled = false;
      imageGenerationEnabled = false;
      const storageChatInput = sessionStorage.getItem(`chat-input${chatIdProp ? `-${chatIdProp}` : ""}`);
      if (chatIdProp && await loadChat()) {
        await tick();
        loading = false;
        window.setTimeout(() => scrollToBottom(), 0);
        await tick();
        const lastMessage = history.currentId ? history.messages[history.currentId] : null;
        const isIdle = !lastMessage || lastMessage.role !== "assistant" || lastMessage.done;
        if (isIdle) {
          await processNextInQueue(chatIdProp);
        }
        if (storageChatInput) {
          try {
            const input = JSON.parse(storageChatInput);
            if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
              messageInput?.setText(input.prompt);
              files = input.files;
              selectedToolIds = input.selectedToolIds;
              selectedFilterIds = input.selectedFilterIds;
              webSearchEnabled = input.webSearchEnabled;
              imageGenerationEnabled = input.imageGenerationEnabled;
              codeInterpreterEnabled = input.codeInterpreterEnabled;
            }
          } catch (e) {
          }
        } else {
          await setDefaults();
        }
        const chatInput = document.getElementById("chat-input");
        chatInput?.focus();
      } else {
        await goto();
      }
    };
    const onSelect = async (e) => {
      const { type, data } = e;
      if (type === "prompt") {
        messageInput?.setText(data, async () => {
          if (!(store_get($$store_subs ??= {}, "$settings", settings)?.insertSuggestionPrompt ?? false)) {
            await tick();
            submitPrompt(prompt);
          }
        });
      }
    };
    const saveSessionSelectedModels = () => {
      const selectedModelsString = JSON.stringify(selectedModels);
      if (selectedModels.length === 0 || selectedModels.length === 1 && selectedModels[0] === "" || sessionStorage.selectedModels === selectedModelsString) {
        return;
      }
      sessionStorage.selectedModels = selectedModelsString;
      /* @__PURE__ */ console.log("saveSessionSelectedModels", selectedModels, sessionStorage.selectedModels);
    };
    let oldSelectedModelIds = [""];
    const onSelectedModelIdsChange = () => {
      resetInput();
      oldSelectedModelIds = structuredClone(selectedModelIds);
    };
    const resetInput = () => {
      selectedToolIds = [];
      selectedFilterIds = [];
      pendingOAuthTools = [];
      webSearchEnabled = false;
      imageGenerationEnabled = false;
      codeInterpreterEnabled = false;
      if (selectedModelIds.filter((id) => id).length > 0) {
        setDefaults();
      }
    };
    const setDefaults = async () => {
      if (!store_get($$store_subs ??= {}, "$tools", tools)) {
        tools.set(await getTools(localStorage.token));
      }
      if (!store_get($$store_subs ??= {}, "$functions", functions)) {
        functions.set(await getFunctions(localStorage.token));
      }
      if (selectedModels.length !== 1 && !atSelectedModel) {
        return;
      }
      const model = atSelectedModel ?? store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === selectedModels[0]);
      if (model) {
        if (model?.info?.meta?.toolIds) {
          const defaultIds = [
            ...new Set([...model?.info?.meta?.toolIds ?? []].filter((id) => store_get($$store_subs ??= {}, "$tools", tools).find((t) => t.id === id)))
          ];
          const unauthed = [];
          const authed = [];
          for (const id of defaultIds) {
            const tool = store_get($$store_subs ??= {}, "$tools", tools).find((t) => t.id === id);
            if (tool && tool.authenticated === false) {
              const parts = id.split(":");
              const serverId = parts.at(-1) ?? id;
              const authType = parts.length > 1 ? parts[0] === "server" ? parts[1] : parts[0] : null;
              unauthed.push({ id, name: tool.name ?? id, serverId, authType });
            } else {
              authed.push(id);
            }
          }
          selectedToolIds = authed;
          pendingOAuthTools = unauthed;
        } else if (store_get($$store_subs ??= {}, "$settings", settings)?.tools) {
          selectedToolIds = store_get($$store_subs ??= {}, "$settings", settings).tools;
        } else {
          selectedToolIds = selectedToolIds.filter((id) => !id.startsWith("direct_server:"));
        }
        if (model?.info?.meta?.defaultFilterIds) {
          selectedFilterIds = model.info.meta.defaultFilterIds.filter((id) => model?.filters?.find((f) => f.id === id));
        }
        if (model?.info?.meta?.defaultFeatureIds) {
          if (model.info?.meta?.capabilities?.["image_generation"] && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_image_generation && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.image_generation)) {
            imageGenerationEnabled = model.info.meta.defaultFeatureIds.includes("image_generation");
          }
          if (model.info?.meta?.capabilities?.["web_search"] && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_web_search && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.web_search)) {
            webSearchEnabled = model.info.meta.defaultFeatureIds.includes("web_search");
          }
          if (model.info?.meta?.capabilities?.["code_interpreter"] && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_code_interpreter && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.code_interpreter)) {
            codeInterpreterEnabled = model.info.meta.defaultFeatureIds.includes("code_interpreter");
          }
        }
      }
    };
    const showMessage = async (message, scroll = true) => {
      const _chatId = JSON.parse(JSON.stringify(store_get($$store_subs ??= {}, "$chatId", chatId)));
      let _messageId = JSON.parse(JSON.stringify(message.id));
      let messageChildrenIds = [];
      if (_messageId === null) {
        messageChildrenIds = Object.keys(history.messages).filter((id) => history.messages[id].parentId === null);
      } else {
        messageChildrenIds = history.messages[_messageId].childrenIds;
      }
      while (messageChildrenIds.length !== 0) {
        _messageId = messageChildrenIds.at(-1);
        messageChildrenIds = history.messages[_messageId].childrenIds;
      }
      history.currentId = _messageId;
      await tick();
      if ((store_get($$store_subs ??= {}, "$settings", settings)?.scrollOnBranchChange ?? true) && scroll) {
        const messageElement = document.getElementById(`message-${message.id}`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      await tick();
      await tick();
      await tick();
      saveChatHandler(_chatId, history);
    };
    const savedModelIds = async () => {
      if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder) && selectedModels.filter((modelId) => modelId !== "").length > 0 && JSON.stringify(store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.data?.model_ids) !== JSON.stringify(selectedModels)) {
        await updateFolderById(localStorage.token, store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder).id, { data: { model_ids: selectedModels } });
      }
    };
    const uploadGoogleDriveFile = async (fileData) => {
      /* @__PURE__ */ console.log("Starting uploadGoogleDriveFile with:", {
        id: fileData.id,
        name: fileData.name,
        url: fileData.url,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!fileData?.id || !fileData?.name || !fileData?.url || !fileData?.headers?.Authorization) {
        throw new Error("Invalid file data provided");
      }
      const tempItemId = v4();
      const fileItem = {
        type: "file",
        file: "",
        id: null,
        url: fileData.url,
        name: fileData.name,
        collection_name: "",
        status: "uploading",
        error: "",
        itemId: tempItemId,
        size: 0
      };
      try {
        files = [...files, fileItem];
        /* @__PURE__ */ console.log("Processing web file with URL:", fileData.url);
        const fetchOptions = {
          headers: { Authorization: fileData.headers.Authorization, Accept: "*/*" },
          method: "GET"
        };
        /* @__PURE__ */ console.log("Fetching file content from Google Drive...");
        const fileResponse = await fetch(fileData.url, fetchOptions);
        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          throw new Error(`Failed to fetch file (${fileResponse.status}): ${errorText}`);
        }
        const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
        /* @__PURE__ */ console.log("Response received with content-type:", contentType);
        /* @__PURE__ */ console.log("Converting response to blob...");
        const fileBlob = await fileResponse.blob();
        if (fileBlob.size === 0) {
          throw new Error("Retrieved file is empty");
        }
        /* @__PURE__ */ console.log("Blob created:", { size: fileBlob.size, type: fileBlob.type || contentType });
        const file = new File([fileBlob], fileData.name, { type: fileBlob.type || contentType });
        /* @__PURE__ */ console.log("File object created:", { name: file.name, size: file.size, type: file.type });
        if (file.size === 0) {
          throw new Error("Created file is empty");
        }
        let metadata = null;
        if ((file.type.startsWith("audio/") || file.type.startsWith("video/")) && store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language) {
          metadata = {
            language: store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language
          };
        }
        /* @__PURE__ */ console.log("Uploading file to server...");
        const uploadedFile = await uploadFile(localStorage.token, file, metadata);
        if (!uploadedFile) {
          throw new Error("Server returned null response for file upload");
        }
        /* @__PURE__ */ console.log("File uploaded successfully:", uploadedFile);
        fileItem.status = "uploaded";
        fileItem.file = uploadedFile;
        fileItem.id = uploadedFile.id;
        fileItem.size = file.size;
        fileItem.collection_name = uploadedFile?.meta?.collection_name;
        fileItem.url = `${uploadedFile.id}`;
        files = files;
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("File uploaded successfully"));
      } catch (e) {
        /* @__PURE__ */ console.error("Error uploading file:", e);
        files = files.filter((f) => f.itemId !== tempItemId);
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Error uploading file: {{error}}", { error: e.message || "Unknown error" }));
      }
    };
    const uploadWeb = async (urls) => {
      if (store_get($$store_subs ??= {}, "$user", user)?.role !== "admin" && !(store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.web_upload ?? true)) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("You do not have permission to upload web content."));
        return;
      }
      if (!Array.isArray(urls)) {
        urls = [urls];
      }
      const fileItems = urls.map((url2) => ({
        type: "text",
        name: url2,
        collection_name: "",
        status: "uploading",
        context: "full",
        url: url2,
        error: ""
      }));
      files = [...files, ...fileItems];
      for (const fileItem of fileItems) {
        try {
          const res = isYoutubeUrl(fileItem.url) ? await processYoutubeVideo(localStorage.token, fileItem.url) : await processWeb(localStorage.token, "", fileItem.url);
          if (res) {
            fileItem.status = "uploaded";
            fileItem.collection_name = res.collection_name;
            fileItem.file = { ...res.file, ...fileItem.file };
          }
          files = [...files];
        } catch (e) {
          files = files.filter((f) => f.name !== url);
          toast.error(`${e}`);
        }
      }
    };
    const onUpload = async (event) => {
      const { type, data } = event;
      if (type === "google-drive") {
        await uploadGoogleDriveFile(data);
      } else if (type === "web") {
        await uploadWeb(data);
      }
    };
    const onHistoryChange = (history2) => {
      if (history2) {
        clearTimeout(contentsRAF);
        contentsRAF = setTimeout(
          () => {
            getContents();
            contentsRAF = null;
          },
          0
        );
      } else {
        artifactContents.set([]);
      }
    };
    const getContents = () => {
      const messages = history ? createMessagesList(history, history.currentId) : [];
      let contents = [];
      messages.forEach((message) => {
        if (message?.role !== "user" && message?.content) {
          const { codeBlocks, htmlGroups } = getCodeBlockContents(message.content);
          if (htmlGroups && htmlGroups.length > 0) {
            htmlGroups.forEach((group) => {
              const renderedContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
							<${""}style>
								body {
									background-color: white; /* Ensure the iframe has a white background */
								}

								${group.css}
							</${""}style>
                        </head>
                        <body>
                            ${group.html}

							<${""}script>
                            	${group.js}
							</${""}script>
                        </body>
                        </html>
                    `;
              contents = [...contents, { type: "iframe", content: renderedContent }];
            });
          } else {
            for (const block of codeBlocks) {
              if (block.lang === "svg" || block.lang === "xml" && block.code.includes("<svg")) {
                contents = [...contents, { type: "svg", content: block.code }];
              }
            }
          }
        }
      });
      artifactContents.set(contents);
    };
    const initNewChat = async () => {
      /* @__PURE__ */ console.log("initNewChat");
      if (store_get($$store_subs ??= {}, "$user", user)?.role !== "admin" && store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.temporary_enforced) {
        await temporaryChatEnabled.set(true);
      }
      if (store_get($$store_subs ??= {}, "$settings", settings)?.temporaryChatByDefault ?? false) {
        if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) === false) {
          await temporaryChatEnabled.set(true);
        } else if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) === null) {
          await temporaryChatEnabled.set(false);
        }
      }
      if (store_get($$store_subs ??= {}, "$user", user)?.role !== "admin" && !store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.temporary) {
        await temporaryChatEnabled.set(false);
      }
      const availableModels = store_get($$store_subs ??= {}, "$models", models).filter((m) => !(m?.info?.meta?.hidden ?? false)).map((m) => m.id);
      const defaultModels = store_get($$store_subs ??= {}, "$config", config)?.default_models ? store_get($$store_subs ??= {}, "$config", config)?.default_models.split(",") : [];
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("models") || store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("model")) {
        const urlModels = (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("models") || store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("model") || "")?.split(",");
        if (urlModels.length === 1) {
          if (!store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === urlModels[0])) {
            const modelSelectorButton = document.getElementById("model-selector-0-button");
            if (modelSelectorButton) {
              modelSelectorButton.click();
              await tick();
              const modelSelectorInput = document.getElementById("model-search-input");
              if (modelSelectorInput) {
                modelSelectorInput.focus();
                modelSelectorInput.value = urlModels[0];
                modelSelectorInput.dispatchEvent(new Event("input"));
              }
            }
          } else {
            selectedModels = urlModels;
          }
        } else {
          selectedModels = urlModels;
        }
        selectedModels = selectedModels.filter((modelId) => store_get($$store_subs ??= {}, "$models", models).map((m) => m.id).includes(modelId));
      } else {
        if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.data?.model_ids) {
          selectedModels = store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.data?.model_ids;
        } else {
          if (sessionStorage.selectedModels) {
            selectedModels = JSON.parse(sessionStorage.selectedModels);
            sessionStorage.removeItem("selectedModels");
          } else {
            if (store_get($$store_subs ??= {}, "$settings", settings)?.models) {
              selectedModels = store_get($$store_subs ??= {}, "$settings", settings)?.models;
            } else if (defaultModels && defaultModels.length > 0) {
              selectedModels = defaultModels;
            }
          }
        }
        selectedModels = selectedModels.filter((modelId) => availableModels.includes(modelId));
      }
      if (selectedModels.length === 0 || selectedModels.length === 1 && selectedModels[0] === "") {
        if (availableModels.length > 0) {
          if (defaultModels && defaultModels.length > 0) {
            selectedModels = defaultModels.filter((modelId) => availableModels.includes(modelId));
          }
          if (selectedModels.length === 0 || selectedModels.length === 1 && selectedModels[0] === "") {
            selectedModels = [availableModels?.at(0) ?? ""];
          }
        } else {
          selectedModels = [""];
        }
      }
      if (store_get($$store_subs ??= {}, "$mobile", mobile)) {
        await showControls.set(false);
      }
      await showCallOverlay.set(false);
      await showArtifacts.set(false);
      if (store_get($$store_subs ??= {}, "$page", page).url.pathname.includes("/c/")) {
        window.history.replaceState(history.state, "", `/`);
      }
      autoScroll = true;
      resetInput();
      await chatId.set("");
      await chatTitle.set("");
      history = { messages: {}, currentId: null };
      chatFiles = [];
      params = {};
      taskIds = null;
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("youtube")) {
        await uploadWeb(`https://www.youtube.com/watch?v=${store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("youtube")}`);
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("load-url")) {
        await uploadWeb(store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("load-url"));
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("web-search") === "true") {
        webSearchEnabled = true;
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("image-generation") === "true") {
        imageGenerationEnabled = true;
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("code-interpreter") === "true") {
        codeInterpreterEnabled = true;
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("tools")) {
        selectedToolIds = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("tools")?.split(",").map((id) => id.trim()).filter((id) => id);
      } else if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("tool-ids")) {
        selectedToolIds = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("tool-ids")?.split(",").map((id) => id.trim()).filter((id) => id);
      }
      const pendingToolId = sessionStorage.getItem("pendingOAuthToolId");
      if (pendingToolId) {
        sessionStorage.removeItem("pendingOAuthToolId");
        if (!selectedToolIds.includes(pendingToolId)) {
          selectedToolIds = [...selectedToolIds, pendingToolId];
        }
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("call") === "true") {
        showCallOverlay.set(true);
        showControls.set(true);
      }
      if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("q")) {
        const q = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("q") ?? "";
        messageInput?.setText(q);
        if (q) {
          if ((store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("submit") ?? "true") === "true") {
            await tick();
            submitPrompt(q);
          }
        }
      }
      selectedModels = selectedModels.map((modelId) => store_get($$store_subs ??= {}, "$models", models).map((m) => m.id).includes(modelId) ? modelId : "");
      const chatInput = document.getElementById("chat-input");
      setTimeout(() => chatInput?.focus(), 0);
    };
    const loadChat = async () => {
      chatId.set(chatIdProp);
      if (store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        temporaryChatEnabled.set(false);
      }
      chat = await getChatById(localStorage.token, store_get($$store_subs ??= {}, "$chatId", chatId)).catch(async (error) => {
        await goto();
        return null;
      });
      if (chat) {
        await getTagsById(localStorage.token, store_get($$store_subs ??= {}, "$chatId", chatId)).catch(async (error) => {
          return [];
        });
        const chatContent = chat.chat;
        if (chatContent) {
          /* @__PURE__ */ console.log(chatContent);
          selectedModels = (chatContent?.models ?? void 0) !== void 0 ? chatContent.models : [chatContent.models ?? ""];
          if (!(store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.chat?.multiple_models ?? true))) {
            selectedModels = selectedModels.length > 0 ? [selectedModels[0]] : [""];
          }
          oldSelectedModelIds = structuredClone(selectedModels);
          history = (chatContent?.history ?? void 0) !== void 0 ? chatContent.history : convertMessagesToHistory(chatContent.messages);
          chatTitle.set(chatContent.title);
          params = chatContent?.params ?? {};
          chatFiles = chatContent?.files ?? [];
          autoScroll = true;
          await tick();
          if (history.currentId) {
            for (const message of Object.values(history.messages)) {
              if (message && message.role === "assistant" && message.done !== false) {
                message.done = true;
              }
            }
          }
          const taskRes = await getTaskIdsByChatId(localStorage.token, store_get($$store_subs ??= {}, "$chatId", chatId)).catch((error) => {
            return null;
          });
          if (taskRes) {
            taskIds = taskRes.task_ids;
          }
          await tick();
          return true;
        } else {
          return null;
        }
      }
    };
    const scrollToBottom = async (behavior = "auto") => {
      await tick();
    };
    let scrollRAF = null;
    let contentsRAF = null;
    const scheduleScrollToBottom = () => {
      if (!scrollRAF) {
        scrollRAF = requestAnimationFrame(async () => {
          scrollRAF = null;
          await scrollToBottom();
        });
      }
    };
    const processNextInQueue = async (targetChatId) => {
      const queue = store_get($$store_subs ??= {}, "$chatRequestQueues", chatRequestQueues)[targetChatId];
      if (!queue || queue.length === 0) return;
      const combinedPrompt = queue.map((m) => m.prompt).join("\n\n");
      const combinedFiles = queue.flatMap((m) => m.files);
      chatRequestQueues.update((q) => {
        const { [targetChatId]: _, ...rest } = q;
        return rest;
      });
      files = combinedFiles;
      await tick();
      await submitPrompt(combinedPrompt);
    };
    const chatActionHandler = async (_chatId, actionId, modelId, responseMessageId, event = null) => {
      const messages = createMessagesList(history, responseMessageId);
      const res = await chatAction(localStorage.token, actionId, {
        model: modelId,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          info: m.info ? m.info : void 0,
          timestamp: m.timestamp,
          ...m.sources ? { sources: m.sources } : {}
        })),
        ...event ? { event } : {},
        model_item: store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === modelId),
        chat_id: _chatId,
        session_id: store_get($$store_subs ??= {}, "$socket", socket)?.id,
        id: responseMessageId
      }).catch((error) => {
        toast.error(`${error}`);
        messages.at(-1).error = { content: error };
        return null;
      });
      if (res !== null && res.messages) {
        for (const message of res.messages) {
          history.messages[message.id] = {
            ...history.messages[message.id],
            ...history.messages[message.id].content !== message.content ? { originalContent: history.messages[message.id].content } : {},
            ...message
          };
        }
      }
      if (store_get($$store_subs ??= {}, "$chatId", chatId) == _chatId) {
        if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
          chat = await updateChatById(localStorage.token, _chatId, {
            models: selectedModels,
            messages,
            history,
            params,
            files: chatFiles
          });
          currentChatPage.set(1);
          await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
        }
      }
    };
    const getChatEventEmitter = async (modelId, chatId2 = "") => {
      return setInterval(
        () => {
          store_get($$store_subs ??= {}, "$socket", socket)?.emit("usage", { action: "chat", model: modelId, chat_id: chatId2 });
        },
        1e3
      );
    };
    const createMessagePair = async (userPrompt) => {
      messageInput?.setText("");
      if (selectedModels.length === 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model not selected"));
      } else {
        const modelId = selectedModels[0];
        const model = store_get($$store_subs ??= {}, "$models", models).filter((m) => m.id === modelId).at(0);
        if (!model) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model not found"));
          return;
        }
        const messages = createMessagesList(history, history.currentId);
        const parentMessage = messages.length !== 0 ? messages.at(-1) : null;
        const userMessageId = v4();
        const responseMessageId = v4();
        const userMessage = {
          id: userMessageId,
          parentId: parentMessage ? parentMessage.id : null,
          childrenIds: [responseMessageId],
          role: "user",
          content: userPrompt ? userPrompt : `[PROMPT] ${userMessageId}`,
          timestamp: Math.floor(Date.now() / 1e3)
        };
        const responseMessage = {
          id: responseMessageId,
          parentId: userMessageId,
          childrenIds: [],
          role: "assistant",
          content: `[RESPONSE] ${responseMessageId}`,
          done: true,
          model: modelId,
          modelName: model.name ?? model.id,
          modelIdx: 0,
          timestamp: Math.floor(Date.now() / 1e3)
        };
        if (parentMessage) {
          parentMessage.childrenIds.push(userMessageId);
          history.messages[parentMessage.id] = parentMessage;
        }
        history.messages[userMessageId] = userMessage;
        history.messages[responseMessageId] = responseMessage;
        history.currentId = responseMessageId;
        await tick();
        if (autoScroll) {
          scrollToBottom();
        }
        if (messages.length === 0) {
          await initChatHandler(history);
        } else {
          await saveChatHandler(store_get($$store_subs ??= {}, "$chatId", chatId), history);
        }
      }
    };
    const addMessages = async ({ modelId, parentId, messages }) => {
      const model = store_get($$store_subs ??= {}, "$models", models).filter((m) => m.id === modelId).at(0);
      let parentMessage = history.messages[parentId];
      let currentParentId = parentMessage ? parentMessage.id : null;
      for (const message of messages) {
        let messageId = v4();
        if (message.role === "user") {
          const userMessage = {
            id: messageId,
            parentId: currentParentId,
            childrenIds: [],
            timestamp: Math.floor(Date.now() / 1e3),
            ...message
          };
          if (parentMessage) {
            parentMessage.childrenIds.push(messageId);
            history.messages[parentMessage.id] = parentMessage;
          }
          history.messages[messageId] = userMessage;
          parentMessage = userMessage;
          currentParentId = messageId;
        } else {
          const responseMessage = {
            id: messageId,
            parentId: currentParentId,
            childrenIds: [],
            done: true,
            model: model.id,
            modelName: model.name ?? model.id,
            modelIdx: 0,
            timestamp: Math.floor(Date.now() / 1e3),
            ...message
          };
          if (parentMessage) {
            parentMessage.childrenIds.push(messageId);
            history.messages[parentMessage.id] = parentMessage;
          }
          history.messages[messageId] = responseMessage;
          parentMessage = responseMessage;
          currentParentId = messageId;
        }
      }
      history.currentId = currentParentId;
      await tick();
      if (autoScroll) {
        scrollToBottom();
      }
      if (messages.length === 0) {
        await initChatHandler(history);
      } else {
        await saveChatHandler(store_get($$store_subs ??= {}, "$chatId", chatId), history);
      }
    };
    const submitPrompt = async (userPrompt, { _raw = false } = {}) => {
      /* @__PURE__ */ console.log("submitPrompt", userPrompt, store_get($$store_subs ??= {}, "$chatId", chatId));
      const _selectedModels = selectedModels.map((modelId) => store_get($$store_subs ??= {}, "$models", models).map((m) => m.id).includes(modelId) ? modelId : "");
      if (JSON.stringify(selectedModels) !== JSON.stringify(_selectedModels)) {
        selectedModels = _selectedModels;
      }
      if (pendingOAuthTools.length > 0) {
        toast.warning(store_get($$store_subs ??= {}, "$i18n", i18n).t("Please connect all required integrations before sending a message"));
        return;
      }
      if (userPrompt === "" && files.length === 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Please enter a prompt"));
        return;
      }
      if (selectedModels.includes("")) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model not selected"));
        return;
      }
      if (files.length > 0 && files.filter((file) => file.type !== "image" && file.status === "uploading").length > 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Oops! There are files still uploading. Please wait for the upload to complete.`));
        return;
      }
      if ((store_get($$store_subs ??= {}, "$config", config)?.file?.max_count ?? null) !== null && files.length + chatFiles.length > store_get($$store_subs ??= {}, "$config", config)?.file?.max_count) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`You can only chat with a maximum of {{maxCount}} file(s) at a time.`, {
          maxCount: store_get($$store_subs ??= {}, "$config", config)?.file?.max_count
        }));
        return;
      }
      const lastMessage = history.currentId ? history.messages[history.currentId] : null;
      const isGenerating = lastMessage && lastMessage.role === "assistant" && !lastMessage.done;
      if (isGenerating) {
        if (store_get($$store_subs ??= {}, "$settings", settings)?.enableMessageQueue ?? true) {
          const _files2 = structuredClone(files);
          chatRequestQueues.update((q) => ({
            ...q,
            [store_get($$store_subs ??= {}, "$chatId", chatId)]: [
              ...q[store_get($$store_subs ??= {}, "$chatId", chatId)] ?? [],
              { id: v4(), prompt: userPrompt, files: _files2 }
            ]
          }));
          messageInput?.setText("");
          prompt = "";
          files = [];
          return;
        } else {
          await stopResponse();
          await tick();
        }
      }
      if (history?.currentId) {
        const currentMessage = history.messages[history.currentId];
        if (currentMessage.error && !currentMessage.content) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Oops! There was an error in the previous response.`));
          return;
        }
      }
      messageInput?.setText("");
      prompt = "";
      const messages = createMessagesList(history, history.currentId);
      const _files = structuredClone(files);
      chatFiles.push(..._files.filter((item) => ["doc", "text", "note", "chat", "folder", "collection"].includes(item.type) || item.type === "file" && !(item?.content_type ?? "").startsWith("image/")));
      chatFiles = chatFiles.filter(
        // Remove duplicates
        (item, index, array) => array.findIndex((i) => JSON.stringify(i) === JSON.stringify(item)) === index
      );
      files = [];
      messageInput?.setText("");
      let userMessageId = v4();
      let userMessage = {
        id: userMessageId,
        parentId: messages.length !== 0 ? messages.at(-1).id : null,
        childrenIds: [],
        role: "user",
        content: userPrompt,
        files: _files.length > 0 ? _files : void 0,
        timestamp: Math.floor(Date.now() / 1e3),
        // Unix epoch
        models: selectedModels
      };
      history.messages[userMessageId] = userMessage;
      history.currentId = userMessageId;
      if (messages.length !== 0) {
        history.messages[messages.at(-1).id].childrenIds.push(userMessageId);
      }
      const chatInput = document.getElementById("chat-input");
      chatInput?.focus();
      saveSessionSelectedModels();
      await sendMessage(history, userMessageId, { newChat: true });
    };
    const sendMessage = async (_history, parentId, {
      messages = null,
      modelId = null,
      modelIdx = null,
      newChat = false
    } = {}) => {
      if (autoScroll) {
        scrollToBottom();
      }
      let _chatId = JSON.parse(JSON.stringify(store_get($$store_subs ??= {}, "$chatId", chatId)));
      _history = structuredClone(_history);
      const responseMessageIds = {};
      let selectedModelIds2 = modelId ? [modelId] : atSelectedModel !== void 0 ? [atSelectedModel.id] : selectedModels;
      for (const [_modelIdx, modelId2] of selectedModelIds2.entries()) {
        const model = store_get($$store_subs ??= {}, "$models", models).filter((m) => m.id === modelId2).at(0);
        if (model) {
          let responseMessageId = v4();
          let responseMessage = {
            parentId,
            id: responseMessageId,
            childrenIds: [],
            role: "assistant",
            content: "",
            model: model.id,
            modelName: model.name ?? model.id,
            modelIdx: modelIdx ? modelIdx : _modelIdx,
            timestamp: Math.floor(Date.now() / 1e3)
            // Unix epoch
          };
          history.messages[responseMessageId] = responseMessage;
          history.currentId = responseMessageId;
          if (parentId !== null && history.messages[parentId]) {
            history.messages[parentId].childrenIds = [...history.messages[parentId].childrenIds, responseMessageId];
          }
          responseMessageIds[`${modelId2}-${modelIdx ? modelIdx : _modelIdx}`] = responseMessageId;
        }
      }
      history = history;
      if (newChat && _history.messages[_history.currentId].parentId === null) {
        _chatId = await initChatHandler(_history);
      }
      await tick();
      _history = structuredClone(history);
      await saveChatHandler(_chatId, _history);
      await Promise.all(selectedModelIds2.map(async (modelId2, _modelIdx) => {
        /* @__PURE__ */ console.log("modelId", modelId2);
        const model = store_get($$store_subs ??= {}, "$models", models).filter((m) => m.id === modelId2).at(0);
        if (model) {
          const hasImages = createMessagesList(_history, parentId).some((message) => message.files?.some((file) => file.type === "image" || (file?.content_type ?? "").startsWith("image/")));
          if (hasImages && !(model.info?.meta?.capabilities?.vision ?? true) && !imageGenerationEnabled) {
            toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model {{modelName}} is not vision capable", { modelName: model.name ?? model.id }));
          }
          let responseMessageId = responseMessageIds[`${modelId2}-${modelIdx ? modelIdx : _modelIdx}`];
          const chatEventEmitter = await getChatEventEmitter(model.id, _chatId);
          scrollToBottom();
          await sendMessageSocket(
            model,
            messages && messages.length > 0 ? messages : createMessagesList(_history, responseMessageId),
            _history,
            responseMessageId
          );
          if (chatEventEmitter) clearInterval(chatEventEmitter);
        } else {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Model {{modelId}} not found`, { modelId: modelId2 }));
        }
      }));
    };
    const getFeatures = () => {
      let features = {};
      if (store_get($$store_subs ??= {}, "$config", config)?.features) features = {
        voice: store_get($$store_subs ??= {}, "$showCallOverlay", showCallOverlay),
        image_generation: store_get($$store_subs ??= {}, "$config", config)?.features?.enable_image_generation && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.image_generation) ? imageGenerationEnabled : false,
        code_interpreter: store_get($$store_subs ??= {}, "$config", config)?.features?.enable_code_interpreter && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.code_interpreter) ? codeInterpreterEnabled : false,
        web_search: store_get($$store_subs ??= {}, "$config", config)?.features?.enable_web_search && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.web_search) ? webSearchEnabled : false
      };
      const currentModels = atSelectedModel?.id ? [atSelectedModel.id] : selectedModels;
      if (currentModels.filter((model) => store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model)?.info?.meta?.capabilities?.web_search ?? true).length === currentModels.length) {
        if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_web_search && (store_get($$store_subs ??= {}, "$settings", settings)?.webSearch ?? false) === "always") {
          features = { ...features, web_search: true };
        }
      }
      if (store_get($$store_subs ??= {}, "$settings", settings)?.memory ?? false) {
        features = { ...features, memory: true };
      }
      return features;
    };
    const getStopTokens = () => {
      const stop = params?.stop ?? store_get($$store_subs ??= {}, "$settings", settings)?.params?.stop;
      if (!stop) return void 0;
      const tokens = Array.isArray(stop) ? stop : stop.split(",").map((s) => s.trim());
      return tokens.filter(Boolean).map((token2) => decodeURIComponent(JSON.parse(`"${token2.replace(/"/g, '\\"')}"`)));
    };
    const sendMessageSocket = async (model, _messages, _history, responseMessageId, _chatId) => {
      const responseMessage = _history.messages[responseMessageId];
      const userMessage = _history.messages[responseMessage.parentId];
      const chatMessageFiles = _messages.filter((message) => message.files).flatMap((message) => message.files);
      chatFiles = chatFiles.filter((item) => {
        const fileExists = chatMessageFiles.some((messageFile) => messageFile.id === item.id);
        return fileExists;
      });
      let files2 = structuredClone(chatFiles);
      files2.push(...(userMessage?.files ?? []).filter((item) => ["doc", "text", "note", "chat", "collection"].includes(item.type) || item.type === "file" && !(item?.content_type ?? "").startsWith("image/")));
      files2 = files2.filter((item, index, array) => array.findIndex((i) => JSON.stringify(i) === JSON.stringify(item)) === index);
      scrollToBottom();
      eventTarget.dispatchEvent(new CustomEvent("chat:start", { detail: { id: responseMessageId } }));
      await tick();
      let userLocation;
      if (store_get($$store_subs ??= {}, "$settings", settings)?.userLocation) {
        userLocation = await getAndUpdateUserLocation(localStorage.token).catch((err) => {
          /* @__PURE__ */ console.error(err);
          return void 0;
        });
      }
      const stream = model?.info?.params?.stream_response ?? store_get($$store_subs ??= {}, "$settings", settings)?.params?.stream_response ?? params?.stream_response ?? true;
      let messages = [
        params?.system || store_get($$store_subs ??= {}, "$settings", settings).system ? {
          role: "system",
          content: `${params?.system ?? store_get($$store_subs ??= {}, "$settings", settings)?.system ?? ""}`
        } : void 0,
        ..._messages.map((message) => ({
          ...message,
          content: processDetails(message.content),
          // Include output for temp chats (backend will use it and strip before LLM)
          ...message.output ? { output: message.output } : {}
        }))
      ].filter((message) => message);
      messages = messages.map((message, idx, arr) => {
        const imageFiles = (message?.files ?? []).filter((file) => file.type === "image" || (file?.content_type ?? "").startsWith("image/"));
        return {
          role: message.role,
          // Preserve output items so backend can reconstruct tool_calls/tool-role messages (temp chats)
          ...message.output ? { output: message.output } : {},
          ...message.role === "user" && imageFiles.length > 0 ? {
            content: [
              {
                type: "text",
                text: message?.merged?.content ?? message.content
              },
              ...imageFiles.map((file) => ({ type: "image_url", image_url: { url: file.url } }))
            ]
          } : { content: message?.merged?.content ?? message.content }
        };
      }).filter((message) => message?.role === "user" || message?.content?.trim());
      const toolIds = [];
      const toolServerIds = [];
      for (const toolId of selectedToolIds) {
        if (toolId.startsWith("direct_server:")) {
          let serverId = toolId.replace("direct_server:", "");
          if (!isNaN(parseInt(serverId))) {
            toolServerIds.push(parseInt(serverId));
          } else {
            toolServerIds.push(serverId);
          }
        } else {
          toolIds.push(toolId);
        }
      }
      const skillMentionRegex = /<\$([^|>]+)\|?[^>]*>/g;
      const skillIds = [];
      for (const message of messages) {
        const content = typeof message.content === "string" ? message.content : message.content?.[0]?.text ?? "";
        for (const match of content.matchAll(skillMentionRegex)) {
          if (!skillIds.includes(match[1])) {
            skillIds.push(match[1]);
          }
        }
      }
      if (skillIds.length > 0) {
        messages = messages.map((message) => {
          if (typeof message.content === "string") {
            return {
              ...message,
              content: message.content.replace(/<\$[^>]+>/g, "").trim()
            };
          } else if (Array.isArray(message.content)) {
            return {
              ...message,
              content: message.content.map((part) => part.type === "text" ? { ...part, text: part.text.replace(/<\$[^>]+>/g, "").trim() } : part)
            };
          }
          return message;
        });
      }
      const activeTerminalId = store_get($$store_subs ??= {}, "$selectedTerminalId", selectedTerminalId) ?? null;
      const res = await generateOpenAIChatCompletion(
        localStorage.token,
        {
          stream,
          model: model.id,
          messages,
          params: {
            ...store_get($$store_subs ??= {}, "$settings", settings)?.params,
            ...params,
            stop: getStopTokens()
          },
          files: (files2?.length ?? 0) > 0 ? files2 : void 0,
          filter_ids: selectedFilterIds.length > 0 ? selectedFilterIds : void 0,
          tool_ids: toolIds.length > 0 ? toolIds : void 0,
          skill_ids: skillIds.length > 0 ? skillIds : void 0,
          terminal_id: activeTerminalId ?? void 0,
          tool_servers: [
            ...(store_get($$store_subs ??= {}, "$toolServers", toolServers) ?? []).filter((server, idx) => toolServerIds.includes(idx) || toolServerIds.includes(server?.id)),
            // Direct terminal servers — always included when enabled (not routed through selectedToolIds)
            ...(store_get($$store_subs ??= {}, "$terminalServers", terminalServers) ?? []).filter((t) => !t.id)
          ],
          features: getFeatures(),
          variables: {
            ...getPromptVariables(store_get($$store_subs ??= {}, "$user", user)?.name, store_get($$store_subs ??= {}, "$settings", settings)?.userLocation ? userLocation : void 0, store_get($$store_subs ??= {}, "$user", user)?.email)
          },
          model_item: store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === model.id),
          session_id: store_get($$store_subs ??= {}, "$socket", socket)?.id,
          chat_id: store_get($$store_subs ??= {}, "$chatId", chatId),
          folder_id: store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.id ?? void 0,
          id: responseMessageId,
          parent_id: userMessage?.id ?? null,
          parent_message: userMessage,
          background_tasks: {
            ...!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled) && (messages.length == 1 || messages.length == 2 && messages.at(0)?.role === "system" && messages.at(1)?.role === "user") && (selectedModels[0] === model.id || atSelectedModel !== void 0) ? {
              title_generation: store_get($$store_subs ??= {}, "$settings", settings)?.title?.auto ?? true,
              tags_generation: store_get($$store_subs ??= {}, "$settings", settings)?.autoTags ?? true
            } : {},
            follow_up_generation: store_get($$store_subs ??= {}, "$settings", settings)?.autoFollowUps ?? true
          },
          ...stream && (model.info?.meta?.capabilities?.usage ?? false) ? { stream_options: { include_usage: true } } : {}
        },
        `${WEBUI_BASE_URL}/api`
      ).catch(async (error) => {
        /* @__PURE__ */ console.log(error);
        let errorMessage = error;
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        if (typeof errorMessage === "object") {
          errorMessage = store_get($$store_subs ??= {}, "$i18n", i18n).t(`Uh-oh! There was an issue with the response.`);
        }
        toast.error(`${errorMessage}`);
        responseMessage.error = { content: error };
        responseMessage.done = true;
        history.messages[responseMessageId] = responseMessage;
        history.currentId = responseMessageId;
        return null;
      });
      if (res) {
        if (res.error) {
          await handleOpenAIError(res.error, responseMessage);
        } else {
          if (taskIds) {
            taskIds.push(res.task_id);
          } else {
            taskIds = [res.task_id];
          }
        }
      }
      await tick();
      scrollToBottom();
    };
    const handleOpenAIError = async (error, responseMessage) => {
      let errorMessage = "";
      let innerError;
      if (error) {
        innerError = error;
      }
      /* @__PURE__ */ console.error(innerError);
      if ("detail" in innerError) {
        toast.error(innerError.detail);
        errorMessage = innerError.detail;
      } else if ("error" in innerError) {
        if ("message" in innerError.error) {
          toast.error(innerError.error.message);
          errorMessage = innerError.error.message;
        } else {
          toast.error(innerError.error);
          errorMessage = innerError.error;
        }
      } else if ("message" in innerError) {
        toast.error(innerError.message);
        errorMessage = innerError.message;
      }
      responseMessage.error = {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Uh-oh! There was an issue with the response.`) + "\n" + errorMessage
      };
      responseMessage.done = true;
      if (responseMessage.statusHistory) {
        responseMessage.statusHistory = responseMessage.statusHistory.filter((status) => status.action !== "knowledge_search");
      }
      history.messages[responseMessage.id] = responseMessage;
    };
    const stopResponse = async () => {
      if (taskIds) {
        for (const taskId of taskIds) {
          await stopTask(localStorage.token, taskId).catch((error) => {
            toast.error(`${error}`);
            return null;
          });
        }
        taskIds = null;
        const responseMessage = history.messages[history.currentId];
        if (responseMessage.parentId && history.messages[responseMessage.parentId]) {
          for (const messageId of history.messages[responseMessage.parentId].childrenIds) {
            history.messages[messageId].done = true;
          }
        }
        history.messages[history.currentId] = responseMessage;
        if (autoScroll) {
          scrollToBottom();
        }
      }
      if (generating) {
        generating = false;
        generationController?.abort();
        generationController = null;
      }
      await processNextInQueue(store_get($$store_subs ??= {}, "$chatId", chatId));
    };
    const submitMessage = async (parentId, prompt2) => {
      let userPrompt = prompt2;
      let userMessageId = v4();
      let userMessage = {
        id: userMessageId,
        parentId,
        childrenIds: [],
        role: "user",
        content: userPrompt,
        models: selectedModels,
        timestamp: Math.floor(Date.now() / 1e3)
        // Unix epoch
      };
      if (parentId !== null) {
        history.messages[parentId].childrenIds = [...history.messages[parentId].childrenIds, userMessageId];
      }
      history.messages[userMessageId] = userMessage;
      history.currentId = userMessageId;
      await tick();
      if (autoScroll) {
        scrollToBottom();
      }
      await sendMessage(history, userMessageId);
    };
    const regenerateResponse = async (message, suggestionPrompt = null) => {
      /* @__PURE__ */ console.log("regenerateResponse");
      if (history.currentId) {
        let userMessage = history.messages[message.parentId];
        if (!userMessage) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Parent message not found"));
          return;
        }
        if (autoScroll) {
          scrollToBottom();
        }
        await sendMessage(history, userMessage.id, {
          ...suggestionPrompt ? {
            messages: [
              ...createMessagesList(history, message.id),
              { role: "user", content: suggestionPrompt }
            ]
          } : {},
          ...(userMessage?.models ?? [...selectedModels]).length > 1 ? {
            // If multiple models are selected, use the model from the message
            modelId: message.model,
            modelIdx: message.modelIdx
          } : {}
        });
      }
    };
    const continueResponse = async () => {
      /* @__PURE__ */ console.log("continueResponse");
      JSON.parse(JSON.stringify(store_get($$store_subs ??= {}, "$chatId", chatId)));
      if (history.currentId && history.messages[history.currentId].done == true) {
        const responseMessage = history.messages[history.currentId];
        responseMessage.done = false;
        await tick();
        const model = store_get($$store_subs ??= {}, "$models", models).filter((m) => m.id === (responseMessage?.selectedModelId ?? responseMessage.model)).at(0);
        if (model) {
          await sendMessageSocket(model, createMessagesList(history, responseMessage.id), history, responseMessage.id);
        }
      }
    };
    const mergeResponses = async (messageId, responses, _chatId) => {
      /* @__PURE__ */ console.log("mergeResponses", messageId, responses);
      const message = history.messages[messageId];
      const mergedResponse = { status: true, content: "" };
      message.merged = mergedResponse;
      history.messages[messageId] = message;
      try {
        generating = true;
        const [res, controller] = await generateMoACompletion(localStorage.token, message.model ?? "", message.parentId ? history.messages[message.parentId].content : "", responses);
        if (res && res.ok && res.body && generating) {
          generationController = controller;
          const textStream = await createOpenAITextStream(res.body, Boolean(store_get($$store_subs ??= {}, "$settings", settings)?.splitLargeChunks ?? false));
          for await (const update of textStream) {
            const { value, done, sources, error, usage } = update;
            if (error || done) {
              generating = false;
              generationController = null;
              break;
            }
            if (mergedResponse.content == "" && value == "\n") {
              continue;
            } else {
              mergedResponse.content += value;
              history.messages[messageId] = message;
            }
            if (autoScroll) {
              scheduleScrollToBottom();
            }
          }
          await saveChatHandler(_chatId, history);
        } else {
          /* @__PURE__ */ console.error(res);
        }
      } catch (e) {
        /* @__PURE__ */ console.error(e);
      }
    };
    const initChatHandler = async (history2) => {
      let _chatId = store_get($$store_subs ??= {}, "$chatId", chatId);
      if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
        chat = await createNewChat(
          localStorage.token,
          {
            id: _chatId,
            title: store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"),
            models: selectedModels,
            system: store_get($$store_subs ??= {}, "$settings", settings).system ?? void 0,
            params,
            history: history2,
            messages: createMessagesList(history2, history2.currentId),
            tags: [],
            timestamp: Date.now()
          },
          store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.id
        );
        _chatId = chat.id;
        await chatId.set(_chatId);
        window.history.replaceState(history2.state, "", `/c/${_chatId}`);
        await tick();
        await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
        currentChatPage.set(1);
        selectedFolder.set(null);
      } else {
        _chatId = `local:${store_get($$store_subs ??= {}, "$socket", socket)?.id}`;
        await chatId.set(_chatId);
      }
      await tick();
      return _chatId;
    };
    const saveChatHandler = async (_chatId, history2) => {
      if (store_get($$store_subs ??= {}, "$chatId", chatId) == _chatId) {
        if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
          chat = await updateChatById(localStorage.token, _chatId, {
            models: selectedModels,
            history: history2,
            messages: createMessagesList(history2, history2.currentId),
            params,
            files: chatFiles
          });
        }
      }
    };
    const MAX_DRAFT_LENGTH = 5e3;
    let saveDraftTimeout = null;
    const saveDraft = async (draft, chatId2 = null) => {
      if (saveDraftTimeout) {
        clearTimeout(saveDraftTimeout);
      }
      if (draft.prompt !== null && draft.prompt.length < MAX_DRAFT_LENGTH) {
        saveDraftTimeout = setTimeout(
          async () => {
            await sessionStorage.setItem(`chat-input${chatId2 ? `-${chatId2}` : ""}`, JSON.stringify(draft));
          },
          500
        );
      } else {
        sessionStorage.removeItem(`chat-input${chatId2 ? `-${chatId2}` : ""}`);
      }
    };
    const moveChatHandler = async (chatId2, folderId2) => {
      if (chatId2 && folderId2) {
        const res = await updateChatFolderIdById(localStorage.token, chatId2, folderId2).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        if (res) {
          currentChatPage.set(1);
          await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
          await pinnedChats.set(await getPinnedChatList(localStorage.token));
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat moved successfully"));
        }
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to move chat"));
      }
    };
    const archiveChatHandler = async (id) => {
      try {
        await archiveChatById(localStorage.token, id);
        currentChatPage.set(1);
        initNewChat();
        await goto("/");
        chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
        pinnedChats.set(await getPinnedChatList(localStorage.token));
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat archived."));
      } catch (error) {
        /* @__PURE__ */ console.error("Error archiving chat:", error);
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to archive chat."));
      }
    };
    if (atSelectedModel !== void 0) {
      selectedModelIds = [atSelectedModel.id];
    } else {
      selectedModelIds = selectedModels;
    }
    if (chatIdProp) {
      navigateHandler();
    }
    if (selectedModels && chatIdProp !== "") {
      saveSessionSelectedModels();
    }
    if (JSON.stringify(selectedModelIds) !== JSON.stringify(oldSelectedModelIds)) {
      onSelectedModelIdsChange();
    }
    if (selectedModels !== null) {
      savedModelIds();
    }
    onHistoryChange(history);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("vhdo11", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$settings", settings).showChatTitleInTab !== false && store_get($$store_subs ??= {}, "$chatTitle", chatTitle) ? `${store_get($$store_subs ??= {}, "$chatTitle", chatTitle).length > 30 ? `${store_get($$store_subs ??= {}, "$chatTitle", chatTitle).slice(0, 30)}...` : store_get($$store_subs ??= {}, "$chatTitle", chatTitle)} • ${store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME)}` : `${store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME)}`)}
	</title>`);
        });
      });
      $$renderer3.push(`<audio id="audioElement" src="" style="display: none;" class="svelte-vhdo11"></audio> `);
      ConfirmDialog($$renderer3, {
        title: eventConfirmationTitle,
        message: eventConfirmationMessage,
        input: eventConfirmationInput,
        inputPlaceholder: eventConfirmationInputPlaceholder,
        inputValue: eventConfirmationInputValue,
        inputType: eventConfirmationInputType,
        get show() {
          return showEventConfirmation;
        },
        set show($$value) {
          showEventConfirmation = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div${attr_class(`h-screen max-h-[100dvh] transition-width duration-200 ease-in-out ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "  md:max-w-[calc(100%-var(--sidebar-width))]" : " ")} w-full max-w-full flex flex-col`, "svelte-vhdo11")} id="chat-container">`);
      if (!loading) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="w-full h-full flex flex-col svelte-vhdo11">`);
        if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder) && store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.meta?.background_image_url) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat svelte-vhdo11"${attr_style(`background-image: url(${stringify(store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.meta?.background_image_url)}) `)}></div> <div class="absolute top-0 left-0 w-full h-full bg-linear-to-t from-white to-white/85 dark:from-gray-900 dark:to-gray-900/90 z-0 svelte-vhdo11"></div>`);
        } else if (store_get($$store_subs ??= {}, "$settings", settings)?.backgroundImageUrl ?? store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.background_image_url ?? null) {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<div class="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat svelte-vhdo11"${attr_style(`background-image: url(${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.backgroundImageUrl ?? store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.background_image_url)}) `)}></div> <div class="absolute top-0 left-0 w-full h-full bg-linear-to-t from-white to-white/85 dark:from-gray-900 dark:to-gray-900/90 z-0 svelte-vhdo11"></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        Pane_group($$renderer3, {
          direction: "horizontal",
          class: "w-full h-full",
          children: ($$renderer4) => {
            Pane$1($$renderer4, {
              defaultSize: 50,
              minSize: 30,
              class: "h-full flex relative max-w-full flex-col",
              children: ($$renderer5) => {
                FilesOverlay($$renderer5, { show: dragged });
                $$renderer5.push(`<!----> `);
                Navbar($$renderer5, {
                  chat: {
                    id: store_get($$store_subs ??= {}, "$chatId", chatId),
                    chat: {
                      title: store_get($$store_subs ??= {}, "$chatTitle", chatTitle),
                      models: selectedModels,
                      system: store_get($$store_subs ??= {}, "$settings", settings).system ?? void 0,
                      params,
                      history,
                      timestamp: Date.now()
                    }
                  },
                  history,
                  title: store_get($$store_subs ??= {}, "$chatTitle", chatTitle),
                  shareEnabled: !!history.currentId,
                  initNewChat,
                  archiveChatHandler,
                  moveChatHandler,
                  onSaveTempChat: async () => {
                    try {
                      if (!history?.currentId || !Object.keys(history.messages).length) {
                        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("No conversation to save"));
                        return;
                      }
                      const messages = createMessagesList(history, history.currentId);
                      const title = messages.find((m) => m.role === "user")?.content ?? store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat");
                      const savedChat = await createNewChat(
                        localStorage.token,
                        {
                          id: v4(),
                          title: title.length > 50 ? `${title.slice(0, 50)}...` : title,
                          models: selectedModels,
                          params,
                          history,
                          messages,
                          timestamp: Date.now()
                        },
                        null
                      );
                      if (savedChat) {
                        temporaryChatEnabled.set(false);
                        chatId.set(savedChat.id);
                        chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
                        await goto(`/c/${savedChat.id}`);
                        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Conversation saved successfully"));
                      }
                    } catch (error) {
                      /* @__PURE__ */ console.error("Error saving conversation:", error);
                      toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to save conversation"));
                    }
                  },
                  get selectedModels() {
                    return selectedModels;
                  },
                  set selectedModels($$value) {
                    selectedModels = $$value;
                    $$settled = false;
                  }
                });
                $$renderer5.push(`<!----> <div id="chat-pane" class="flex flex-col flex-auto z-10 w-full @container overflow-auto svelte-vhdo11">`);
                if (store_get($$store_subs ??= {}, "$settings", settings)?.landingPageMode === "chat" && !store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder) || createMessagesList(history, history.currentId).length > 0) {
                  $$renderer5.push("<!--[0-->");
                  $$renderer5.push(`<div class="pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden svelte-vhdo11" id="messages-container"><div class="h-full w-full flex flex-col svelte-vhdo11">`);
                  Messages($$renderer5, {
                    chatId: store_get($$store_subs ??= {}, "$chatId", chatId),
                    setInputText: (text) => {
                      messageInput?.setText(text);
                    },
                    selectedModels,
                    atSelectedModel,
                    sendMessage,
                    showMessage,
                    submitMessage,
                    continueResponse,
                    regenerateResponse,
                    mergeResponses,
                    chatActionHandler,
                    addMessages,
                    topPadding: true,
                    bottomPadding: files.length > 0,
                    onSelect,
                    get history() {
                      return history;
                    },
                    set history($$value) {
                      history = $$value;
                      $$settled = false;
                    },
                    get autoScroll() {
                      return autoScroll;
                    },
                    set autoScroll($$value) {
                      autoScroll = $$value;
                      $$settled = false;
                    },
                    get prompt() {
                      return prompt;
                    },
                    set prompt($$value) {
                      prompt = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div></div> <div${attr_class(` pb-2 ${stringify(dragged ? "z-0" : "z-10")}`, "svelte-vhdo11")}>`);
                  MessageInput($$renderer5, {
                    history,
                    taskIds,
                    selectedModels,
                    pendingOAuthTools,
                    toolServers: store_get($$store_subs ??= {}, "$toolServers", toolServers),
                    generating,
                    stopResponse,
                    createMessagePair,
                    onUpload,
                    messageQueue: store_get($$store_subs ??= {}, "$chatRequestQueues", chatRequestQueues)[store_get($$store_subs ??= {}, "$chatId", chatId)] ?? [],
                    onQueueSendNow: async (id) => {
                      const queue = store_get($$store_subs ??= {}, "$chatRequestQueues", chatRequestQueues)[store_get($$store_subs ??= {}, "$chatId", chatId)] ?? [];
                      const item = queue.find((m) => m.id === id);
                      if (item) {
                        chatRequestQueues.update((q) => ({
                          ...q,
                          [store_get($$store_subs ??= {}, "$chatId", chatId)]: queue.filter((m) => m.id !== id)
                        }));
                        await stopResponse();
                        await tick();
                        files = item.files;
                        await tick();
                        await submitPrompt(item.prompt);
                      }
                    },
                    onQueueEdit: (id) => {
                      const queue = store_get($$store_subs ??= {}, "$chatRequestQueues", chatRequestQueues)[store_get($$store_subs ??= {}, "$chatId", chatId)] ?? [];
                      const item = queue.find((m) => m.id === id);
                      if (item) {
                        chatRequestQueues.update((q) => ({
                          ...q,
                          [store_get($$store_subs ??= {}, "$chatId", chatId)]: queue.filter((m) => m.id !== id)
                        }));
                        files = item.files;
                        messageInput?.setText(item.prompt);
                      }
                    },
                    onQueueDelete: (id) => {
                      const queue = store_get($$store_subs ??= {}, "$chatRequestQueues", chatRequestQueues)[store_get($$store_subs ??= {}, "$chatId", chatId)] ?? [];
                      chatRequestQueues.update((q) => ({
                        ...q,
                        [store_get($$store_subs ??= {}, "$chatId", chatId)]: queue.filter((m) => m.id !== id)
                      }));
                    },
                    onChange: (data) => {
                      if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
                        saveDraft(data, store_get($$store_subs ??= {}, "$chatId", chatId));
                      }
                    },
                    get files() {
                      return files;
                    },
                    set files($$value) {
                      files = $$value;
                      $$settled = false;
                    },
                    get prompt() {
                      return prompt;
                    },
                    set prompt($$value) {
                      prompt = $$value;
                      $$settled = false;
                    },
                    get autoScroll() {
                      return autoScroll;
                    },
                    set autoScroll($$value) {
                      autoScroll = $$value;
                      $$settled = false;
                    },
                    get selectedToolIds() {
                      return selectedToolIds;
                    },
                    set selectedToolIds($$value) {
                      selectedToolIds = $$value;
                      $$settled = false;
                    },
                    get selectedFilterIds() {
                      return selectedFilterIds;
                    },
                    set selectedFilterIds($$value) {
                      selectedFilterIds = $$value;
                      $$settled = false;
                    },
                    get imageGenerationEnabled() {
                      return imageGenerationEnabled;
                    },
                    set imageGenerationEnabled($$value) {
                      imageGenerationEnabled = $$value;
                      $$settled = false;
                    },
                    get codeInterpreterEnabled() {
                      return codeInterpreterEnabled;
                    },
                    set codeInterpreterEnabled($$value) {
                      codeInterpreterEnabled = $$value;
                      $$settled = false;
                    },
                    get webSearchEnabled() {
                      return webSearchEnabled;
                    },
                    set webSearchEnabled($$value) {
                      webSearchEnabled = $$value;
                      $$settled = false;
                    },
                    get atSelectedModel() {
                      return atSelectedModel;
                    },
                    set atSelectedModel($$value) {
                      atSelectedModel = $$value;
                      $$settled = false;
                    },
                    get showCommands() {
                      return showCommands;
                    },
                    set showCommands($$value) {
                      showCommands = $$value;
                      $$settled = false;
                    },
                    get dragged() {
                      return dragged;
                    },
                    set dragged($$value) {
                      dragged = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----> <div class="absolute bottom-1 text-xs text-gray-500 text-center line-clamp-1 right-0 left-0 svelte-vhdo11"></div></div>`);
                } else {
                  $$renderer5.push("<!--[-1-->");
                  $$renderer5.push(`<div class="flex items-center h-full svelte-vhdo11">`);
                  Placeholder($$renderer5, {
                    history,
                    selectedModels,
                    pendingOAuthTools,
                    toolServers: store_get($$store_subs ??= {}, "$toolServers", toolServers),
                    stopResponse,
                    createMessagePair,
                    onSelect,
                    onUpload,
                    onChange: (data) => {
                      if (!store_get($$store_subs ??= {}, "$temporaryChatEnabled", temporaryChatEnabled)) {
                        saveDraft(data);
                      }
                    },
                    get messageInput() {
                      return messageInput;
                    },
                    set messageInput($$value) {
                      messageInput = $$value;
                      $$settled = false;
                    },
                    get files() {
                      return files;
                    },
                    set files($$value) {
                      files = $$value;
                      $$settled = false;
                    },
                    get prompt() {
                      return prompt;
                    },
                    set prompt($$value) {
                      prompt = $$value;
                      $$settled = false;
                    },
                    get autoScroll() {
                      return autoScroll;
                    },
                    set autoScroll($$value) {
                      autoScroll = $$value;
                      $$settled = false;
                    },
                    get selectedToolIds() {
                      return selectedToolIds;
                    },
                    set selectedToolIds($$value) {
                      selectedToolIds = $$value;
                      $$settled = false;
                    },
                    get selectedFilterIds() {
                      return selectedFilterIds;
                    },
                    set selectedFilterIds($$value) {
                      selectedFilterIds = $$value;
                      $$settled = false;
                    },
                    get imageGenerationEnabled() {
                      return imageGenerationEnabled;
                    },
                    set imageGenerationEnabled($$value) {
                      imageGenerationEnabled = $$value;
                      $$settled = false;
                    },
                    get codeInterpreterEnabled() {
                      return codeInterpreterEnabled;
                    },
                    set codeInterpreterEnabled($$value) {
                      codeInterpreterEnabled = $$value;
                      $$settled = false;
                    },
                    get webSearchEnabled() {
                      return webSearchEnabled;
                    },
                    set webSearchEnabled($$value) {
                      webSearchEnabled = $$value;
                      $$settled = false;
                    },
                    get atSelectedModel() {
                      return atSelectedModel;
                    },
                    set atSelectedModel($$value) {
                      atSelectedModel = $$value;
                      $$settled = false;
                    },
                    get showCommands() {
                      return showCommands;
                    },
                    set showCommands($$value) {
                      showCommands = $$value;
                      $$settled = false;
                    },
                    get dragged() {
                      return dragged;
                    },
                    set dragged($$value) {
                      dragged = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer5.push(`<!----></div>`);
                }
                $$renderer5.push(`<!--]--></div>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            ChatControls($$renderer4, {
              chatId: store_get($$store_subs ??= {}, "$chatId", chatId),
              modelId: selectedModelIds?.at(0) ?? null,
              models: selectedModelIds.reduce(
                (a, e, i, arr) => {
                  const model = store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === e);
                  if (model) {
                    return [...a, model];
                  }
                  return a;
                },
                []
              ),
              submitPrompt,
              stopResponse,
              showMessage,
              eventTarget,
              codeInterpreterEnabled,
              get history() {
                return history;
              },
              set history($$value) {
                history = $$value;
                $$settled = false;
              },
              get chatFiles() {
                return chatFiles;
              },
              set chatFiles($$value) {
                chatFiles = $$value;
                $$settled = false;
              },
              get params() {
                return params;
              },
              set params($$value) {
                params = $$value;
                $$settled = false;
              },
              get files() {
                return files;
              },
              set files($$value) {
                files = $$value;
                $$settled = false;
              },
              get pane() {
                return controlPane;
              },
              set pane($$value) {
                controlPane = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      } else if (loading) {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="flex items-center justify-center h-full w-full svelte-vhdo11"><div class="m-auto svelte-vhdo11">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div></div>`);
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
    bind_props($$props, { chatIdProp });
  });
}
export {
  Chat as C
};
//# sourceMappingURL=Chat.js.map
