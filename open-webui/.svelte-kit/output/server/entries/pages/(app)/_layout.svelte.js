import { d as attr_class, h as attr_style, e as ensure_array_like, t as stringify, f as fallback, a as attr, g as clsx, b as bind_props, o as getContext, k as escape_html, c as store_get, j as slot, u as unsubscribe_stores, v as store_set } from "../../../chunks/root.js";
import { a as toast } from "../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "idb";
import fileSaver from "file-saver";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { c as createMessagesList } from "../../../chunks/index3.js";
import { u as user, f as folders, a as chatId, b as activeChatIds, d as currentChatPage, e as chats, p as pinnedChats, s as selectedFolder, g as tags, m as models, h as settings, i as mobile, j as showSidebar, c as config, k as showArchivedChats, l as socket, n as isApp, o as showSearch, W as WEBUI_NAME, q as channels, r as scrollPaginationEnabled, v as showSettings, w as showChangelog } from "../../../chunks/index2.js";
import { o as onDestroy, t as tick, c as createEventDispatcher } from "../../../chunks/index-server.js";
import { v4 } from "uuid";
import { g as goto } from "../../../chunks/client.js";
import { g as getArchivedChatList, a as archiveChatById, b as getChatPinnedStatusById, u as updateChatFolderIdById, c as getChatList, d as getPinnedChatList, f as cloneChatById, h as getChatListByFolderId, i as getChatsByFolderId, j as getChatListBySearchText, k as getChatById, l as getAllTags } from "../../../chunks/index5.js";
import { S as Share, a as ShareChatModal, F as FolderModal, b as FolderMenu, u as updateFolderById, g as getFolderById, c as createNewFolder, d as getFolders } from "../../../chunks/FolderModal.js";
import { a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL, b as WEBUI_VERSION } from "../../../chunks/constants.js";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import calendar from "dayjs/plugin/calendar.js";
import { M as Modal, X as XMark } from "../../../chunks/Modal.js";
import { T as Tooltip } from "../../../chunks/Tooltip.js";
import { C as ConfirmDialog, h as html } from "../../../chunks/ConfirmDialog.js";
import { S as Spinner } from "../../../chunks/Spinner.js";
import { L as Loader, F as Folder$1 } from "../../../chunks/FileItem.js";
import { C as ChevronUp, a as Collapsible } from "../../../chunks/Collapsible.js";
import { C as ChevronDown } from "../../../chunks/ChevronDown.js";
import { C as Clipboard } from "../../../chunks/Clipboard.js";
import { A as ArchiveBox, G as GarbageBin, E as Emoji, U as UserMenu } from "../../../chunks/GarbageBin.js";
import { D as Dropdown } from "../../../chunks/Dropdown.js";
import { D as DropdownSub } from "../../../chunks/DropdownSub.js";
import { P as Pencil } from "../../../chunks/Pencil.js";
import { D as DocumentDuplicate, C as ChevronRight } from "../../../chunks/CheckCircle.js";
import { D as Download } from "../../../chunks/Download.js";
/* empty css                                                     */
import "panzoom";
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
import DOMPurify from "dompurify";
import { marked } from "marked";
/* empty css                                                          */
/* empty css                                                  */
/* empty css                              */
import "../../../chunks/codemirror.js";
import { M as Messages } from "../../../chunks/Messages.js";
/* empty css                                                          */
import "i18next";
import { S as Sparkles } from "../../../chunks/Markdown.js";
import { E as EllipsisHorizontal } from "../../../chunks/EllipsisHorizontal.js";
import { g as getChannelWebhooks, u as updateChannelById, U as Users, H as Hashtag, L as Lock, c as createNewChannel, a as getChannels } from "../../../chunks/Users.js";
import { A as AccessControl } from "../../../chunks/AccessControl.js";
import { M as MemberSelector } from "../../../chunks/MemberSelector.js";
import { P as Plus } from "../../../chunks/Plus.js";
import { p as page } from "../../../chunks/stores.js";
import { C as Cog6, W as WrenchAlt } from "../../../chunks/WrenchAlt.js";
import { S as Search } from "../../../chunks/Check.js";
import { S as Sidebar } from "../../../chunks/Sidebar.js";
import "sortablejs";
import { u as updateUserSettings } from "../../../chunks/Badge.js";
import { g as getModels, a as getChangelog } from "../../../chunks/index6.js";
import "../../../chunks/index4.js";
import { T as Textarea } from "../../../chunks/Textarea.js";
import { L as Link } from "../../../chunks/Link.js";
/* empty css                                                     */
function Confetti($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const {
      size = 10,
      x = [-0.5, 0.5],
      y = [0.25, 1],
      duration = 2e3,
      infinite = false,
      delay = [0, 50],
      colorRange = [0, 360],
      colorArray = [],
      amount = 50,
      iterationCount = 1,
      fallDistance = "100px",
      rounded = false,
      cone = false,
      noGravity = false,
      xSpread = 0.15,
      disableForReducedMotion = false
    } = $$props;
    function randomBetween(min, max) {
      return Math.random() * (max - min) + min;
    }
    function getColor() {
      if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))];
      else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%)`;
    }
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class("confetti-holder svelte-rtt661", void 0, {
        "rounded": rounded,
        "cone": cone,
        "no-gravity": noGravity,
        "reduced-motion": disableForReducedMotion
      })}${attr_style(` --fall-distance: ${stringify(fallDistance)}; --size: ${stringify(size)}px; --x-spread: ${stringify(1 - xSpread)}; --transition-iteration-count: ${stringify(infinite ? "infinite" : iterationCount)};`)}><!--[-->`);
      const each_array = ensure_array_like({ length: amount });
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        $$renderer2.push(`<div class="confetti svelte-rtt661"${attr_style(` --color: ${stringify(getColor())}; --skew: ${stringify(randomBetween(-45, 45))}deg,${stringify(randomBetween(-45, 45))}deg; --rotation-xyz: ${stringify(randomBetween(-10, 10))}, ${stringify(randomBetween(-10, 10))}, ${stringify(randomBetween(-10, 10))}; --rotation-deg: ${stringify(randomBetween(0, 360))}deg; --translate-y-multiplier: ${stringify(randomBetween(y[0], y[1]))}; --translate-x-multiplier: ${stringify(randomBetween(x[0], x[1]))}; --scale: ${stringify(0.1 * randomBetween(2, 10))}; --transition-delay: ${stringify(randomBetween(delay[0], delay[1]))}ms; --transition-duration: ${stringify(infinite ? `calc(${duration}ms * var(--scale))` : `${duration}ms`)};`)}></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function LinkSlash($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M7.14286 16.9953C6.75006 16.9953 6.36756 16.9525 6 16.8715C3.70973 16.3665 2 14.3761 2 11.9977C2 9.284 4.22573 7.07548 7 7.00195" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.3184 9.63429C12.7858 8.73635 11.9737 7.96977 11 7.4989" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.8571 6.99999C17.2499 6.99999 17.6324 7.04278 18 7.12383C20.2903 7.62884 22 9.6192 22 11.9976C22 14.7577 19.6975 16.9952 16.8571 16.9952C16.581 16.9952 15.4776 16.9952 15.1429 16.9952C12.317 16.9952 10 14.4893 10 11.9976C10 11.9976 10 11 10.5 10.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 3L21 21" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ChatsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(localizedFormat);
    dayjs.extend(calendar);
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let title = fallback($$props["title"], "Chats");
    let emptyPlaceholder = fallback($$props["emptyPlaceholder"], "");
    let shareUrl = fallback($$props["shareUrl"], false);
    let showUserInfo = fallback($$props["showUserInfo"], false);
    let showSearch2 = fallback($$props["showSearch"], true);
    let readOnly = fallback($$props["readOnly"], false);
    let query = fallback($$props["query"], "");
    let orderBy = fallback($$props["orderBy"], "updated_at");
    let direction = fallback(
      $$props["direction"],
      "desc"
      // 'asc' or 'desc'
    );
    let chatList = fallback($$props["chatList"], null);
    let allChatsLoaded = fallback($$props["allChatsLoaded"], false);
    let chatListLoading = fallback($$props["chatListLoading"], false);
    let showDeleteConfirmDialog = false;
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let loadHandler = fallback($$props["loadHandler"], null);
    let unarchiveHandler = fallback($$props["unarchiveHandler"], null);
    let unshareHandler = fallback($$props["unshareHandler"], null);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-1"><div class="text-lg font-medium self-center">${escape_html(title)}</div> <button class="self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" clip-rule="evenodd"></path></svg></button></div> <div class="flex flex-col w-full px-5 pb-4 dark:text-gray-200">`);
          if (showSearch2) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex w-full space-x-2 mt-0.5 mb-1.5"><div class="flex flex-1"><div class="self-center ml-1 mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"></path></svg></div> <input class="w-full text-sm pr-4 py-1 rounded-r-xl outline-hidden bg-transparent"${attr("value", query)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search Chats"))} maxlength="500"/> `);
            if (query) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="self-center pl-1.5 pr-1 translate-y-[0.5px] rounded-l-xl bg-transparent"><button class="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">`);
              XMark($$renderer4, { className: "size-3", strokeWidth: "2" });
              $$renderer4.push(`<!----></button></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">`);
          if (chatList) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="w-full">`);
            if (chatList.length > 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex text-xs font-medium mb-1.5">`);
              if (showUserInfo) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="px-1.5 py-1 w-32">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("User"))}</div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <button${attr_class(`px-1.5 py-1 cursor-pointer select-none ${stringify(showUserInfo ? "flex-1" : "basis-3/5")}`)}><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Title"))} `);
              if (orderBy === "title") {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<span class="font-normal">`);
                if (direction === "asc") {
                  $$renderer4.push("<!--[0-->");
                  ChevronUp($$renderer4, { className: "size-2" });
                } else {
                  $$renderer4.push("<!--[-1-->");
                  ChevronDown($$renderer4, { className: "size-2" });
                }
                $$renderer4.push(`<!--]--></span>`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<span class="invisible">`);
                ChevronUp($$renderer4, { className: "size-2" });
                $$renderer4.push(`<!----></span>`);
              }
              $$renderer4.push(`<!--]--></div></button> <button${attr_class(`px-1.5 py-1 cursor-pointer select-none hidden sm:flex ${stringify(showUserInfo ? "w-28" : "sm:basis-2/5")} justify-end`)}><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Updated at"))} `);
              if (orderBy === "updated_at") {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<span class="font-normal">`);
                if (direction === "asc") {
                  $$renderer4.push("<!--[0-->");
                  ChevronUp($$renderer4, { className: "size-2" });
                } else {
                  $$renderer4.push("<!--[-1-->");
                  ChevronDown($$renderer4, { className: "size-2" });
                }
                $$renderer4.push(`<!--]--></span>`);
              } else {
                $$renderer4.push("<!--[-1-->");
                $$renderer4.push(`<span class="invisible">`);
                ChevronUp($$renderer4, { className: "size-2" });
                $$renderer4.push(`<!----></span>`);
              }
              $$renderer4.push(`<!--]--></div></button></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <div class="text-left text-sm w-full mb-3 max-h-[22rem] overflow-y-scroll">`);
            if (chatList.length === 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="text-xs text-gray-500 dark:text-gray-400 text-center px-5 min-h-20 w-full h-full flex justify-center items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No results found"))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <!--[-->`);
            const each_array = ensure_array_like(chatList);
            for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
              let chat = each_array[idx];
              if ((idx === 0 || idx > 0 && chat.time_range !== chatList[idx - 1].time_range) && chat?.time_range) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div${attr_class(`w-full text-xs text-gray-500 dark:text-gray-500 font-medium ${stringify(idx === 0 ? "" : "pt-5")} pb-2 px-2`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(chat.time_range))}</div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <div class="w-full flex items-center rounded-lg text-sm py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-850" draggable="false">`);
              if (showUserInfo && chat.user_id) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="w-32 shrink-0 flex items-center gap-2"><img${attr("src", `${stringify(WEBUI_API_BASE_URL)}/users/${stringify(chat.user_id)}/profile/image`)}${attr("alt", chat.user_name || "User")} class="size-5 rounded-full object-cover shrink-0"/> <span class="text-xs text-gray-600 dark:text-gray-400 truncate">${escape_html(chat.user_name || "Unknown")}</span></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <a${attr_class(clsx(showUserInfo ? "flex-1" : "basis-3/5"))}${attr("href", shareUrl ? `/s/${chat.id}` : `/c/${chat.id}`)}><div class="text-ellipsis line-clamp-1 w-full">${escape_html(chat?.title)}</div></a> <div${attr_class(`${stringify(showUserInfo ? "w-28" : "basis-2/5")} flex items-center justify-end`)}><div class="hidden sm:flex text-gray-500 dark:text-gray-400 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(dayjs(chat?.updated_at * 1e3).calendar(null, {
                sameDay: "[Today]",
                nextDay: "[Tomorrow]",
                nextWeek: "dddd",
                lastDay: "[Yesterday]",
                lastWeek: "[Last] dddd",
                sameElse: "L"
              })))}</div> `);
              if (!readOnly) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="flex justify-end pl-2.5 text-gray-600 dark:text-gray-300">`);
                if (unarchiveHandler) {
                  $$renderer4.push("<!--[0-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Unarchive Chat"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="self-center w-fit px-1 text-sm rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"></path></svg></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                if (unshareHandler && chat.share_id) {
                  $$renderer4.push("<!--[0-->");
                  Tooltip($$renderer4, {
                    content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Share Link"),
                    children: ($$renderer5) => {
                      $$renderer5.push(`<button class="self-center w-fit px-1 text-sm rounded-xl">`);
                      Clipboard($$renderer5, { class: "size-4", strokeWidth: "1.5" });
                      $$renderer5.push(`<!----></button>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                Tooltip($$renderer4, {
                  content: unshareHandler ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Unshare Chat") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete Chat"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<button class="self-center w-fit px-1 text-sm rounded-xl">`);
                    if (unshareHandler) {
                      $$renderer5.push("<!--[0-->");
                      LinkSlash($$renderer5, {});
                    } else {
                      $$renderer5.push("<!--[-1-->");
                      $$renderer5.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg>`);
                    }
                    $$renderer5.push(`<!--]--></button>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push(`<!----></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div></div>`);
            }
            $$renderer4.push(`<!--]--> `);
            if (!allChatsLoaded && loadHandler) {
              $$renderer4.push("<!--[0-->");
              Loader($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
                  Spinner($$renderer5, { className: " size-4" });
                  $$renderer5.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Loading..."))}</div></div>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div> `);
            if (query === "") {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<!--[-->`);
              slot($$renderer4, $$props, "footer", {}, null);
              $$renderer4.push(`<!--]-->`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="w-full h-full flex justify-center items-center min-h-20">`);
            Spinner($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
        },
        $$slots: { default: true }
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
    bind_props($$props, {
      show,
      title,
      emptyPlaceholder,
      shareUrl,
      showUserInfo,
      showSearch: showSearch2,
      readOnly,
      query,
      orderBy,
      direction,
      chatList,
      allChatsLoaded,
      chatListLoading,
      onUpdate,
      onDelete,
      loadHandler,
      unarchiveHandler,
      unshareHandler
    });
  });
}
function ArchivedChatsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let loading = false;
    let chatList = null;
    let page2 = 1;
    let query = "";
    let orderBy = "updated_at";
    let direction = "desc";
    let allChatsLoaded = false;
    let chatListLoading = false;
    let searchDebounceTimeout;
    let showUnarchiveAllConfirmDialog = false;
    let filter = {};
    const searchHandler = async () => {
      if (!show) {
        return;
      }
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
      page2 = 1;
      chatList = null;
      if (query === "") {
        chatList = await getArchivedChatList(localStorage.token, page2, filter);
      } else {
        searchDebounceTimeout = setTimeout(
          async () => {
            chatList = await getArchivedChatList(localStorage.token, page2, filter);
          },
          500
        );
      }
      if ((chatList ?? []).length === 0) {
        allChatsLoaded = true;
      } else {
        allChatsLoaded = false;
      }
    };
    const loadMoreChats = async () => {
      chatListLoading = true;
      page2 += 1;
      let newChatList = [];
      if (query) {
        newChatList = await getArchivedChatList(localStorage.token, page2, filter);
      } else {
        newChatList = await getArchivedChatList(localStorage.token, page2, filter);
      }
      allChatsLoaded = newChatList.length === 0;
      if (newChatList.length > 0) {
        chatList = [...chatList || [], ...newChatList];
      }
      chatListLoading = false;
    };
    const unarchiveHandler = async (chatId2) => {
      await archiveChatById(localStorage.token, chatId2).catch((error) => {
        toast.error(`${error}`);
      });
      onUpdate();
      init();
    };
    const init = async () => {
      chatList = await getArchivedChatList(localStorage.token);
    };
    filter = {
      ...query ? { query } : {},
      ...orderBy ? { order_by: orderBy } : {},
      ...direction ? { direction } : {}
    };
    if (filter !== null) {
      searchHandler();
    }
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to unarchive all archived chats?"),
        confirmLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Unarchive All"),
        get show() {
          return showUnarchiveAllConfirmDialog;
        },
        set show($$value) {
          showUnarchiveAllConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ChatsModal($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Archived Chats"),
        emptyPlaceholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("You have no archived conversations."),
        chatList,
        allChatsLoaded,
        chatListLoading,
        onUpdate: () => {
          init();
        },
        onDelete: (id) => {
          onDelete(id);
        },
        loadHandler: loadMoreChats,
        unarchiveHandler,
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        get query() {
          return query;
        },
        set query($$value) {
          query = $$value;
          $$settled = false;
        },
        get orderBy() {
          return orderBy;
        },
        set orderBy($$value) {
          orderBy = $$value;
          $$settled = false;
        },
        get direction() {
          return direction;
        },
        set direction($$value) {
          direction = $$value;
          $$settled = false;
        },
        $$slots: {
          footer: ($$renderer4) => {
            $$renderer4.push(`<div slot="footer"><div class="flex flex-wrap text-sm font-medium gap-1.5 mt-2 m-1 justify-end w-full"><button class="px-3.5 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 outline outline-1 outline-gray-100 dark:outline-gray-800 rounded-3xl"${attr("disabled", loading, true)}>`);
            {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Unarchive All Archived Chats"))}`);
            }
            $$renderer4.push(`<!--]--></button> <button class="px-3.5 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 outline outline-1 outline-gray-100 dark:outline-gray-800 rounded-3xl"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export All Archived Chats"))}</button></div></div>`);
          }
        }
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
    bind_props($$props, { show, onUpdate, onDelete });
  });
}
function Bookmark($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function BookmarkSlash($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ChatMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let shareHandler = $$props["shareHandler"];
    let moveChatHandler = $$props["moveChatHandler"];
    let cloneChatHandler = $$props["cloneChatHandler"];
    let archiveChatHandler = $$props["archiveChatHandler"];
    let renameHandler = $$props["renameHandler"];
    let deleteHandler = $$props["deleteHandler"];
    let onClose = $$props["onClose"];
    let chatId2 = fallback($$props["chatId"], "");
    let show = false;
    let pinned = false;
    let onPinChange = fallback($$props["onPinChange"], () => {
    });
    const checkPinned = async () => {
      pinned = await getChatPinnedStatusById(localStorage.token, chatId2);
    };
    if (show) {
      checkPinned();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      Dropdown($$renderer3, {
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
            $$renderer4.push(`<div slot="content"><div class="select-none min-w-[200px] rounded-2xl px-1 py-1 border border-gray-100 dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg transition">`);
            if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user).permissions?.chat?.share ?? true)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
              Share($$renderer4, { strokeWidth: "1.5" });
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share"))}</div></button>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            DropdownSub($$renderer4, {
              contentClass: "select-none rounded-2xl p-1 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg border border-gray-100 dark:border-gray-800",
              children: ($$renderer5) => {
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user).permissions?.chat?.export ?? true)) {
                  $$renderer5.push("<!--[0-->");
                  $$renderer5.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export chat (.json)"))}</div></button>`);
                } else {
                  $$renderer5.push("<!--[-1-->");
                }
                $$renderer5.push(`<!--]--> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Plain text (.txt)"))}</div></button> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"><div class="flex items-center line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("PDF document (.pdf)"))}</div></button>`);
              },
              $$slots: {
                default: true,
                trigger: ($$renderer5) => {
                  $$renderer5.push(`<button slot="trigger" draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
                  Download($$renderer5, { strokeWidth: "1.5" });
                  $$renderer5.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download"))}</div></button>`);
                }
              }
            });
            $$renderer4.push(`<!----> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            Pencil($$renderer4, { strokeWidth: "1.5" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Rename"))}</div></button> <hr class="border-gray-50/30 dark:border-gray-800/30 my-1"/> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            if (pinned) {
              $$renderer4.push("<!--[0-->");
              BookmarkSlash($$renderer4, { strokeWidth: "1.5" });
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Unpin"))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              Bookmark($$renderer4, { strokeWidth: "1.5" });
              $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Pin"))}</div>`);
            }
            $$renderer4.push(`<!--]--></button> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            DocumentDuplicate($$renderer4, { strokeWidth: "1.5" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Clone"))}</div></button> `);
            if (chatId2 && store_get($$store_subs ??= {}, "$folders", folders).length > 0) {
              $$renderer4.push("<!--[0-->");
              DropdownSub($$renderer4, {
                contentClass: "select-none rounded-2xl p-1 z-50 bg-white dark:bg-gray-850 dark:text-white border border-gray-100 dark:border-gray-800 shadow-lg max-h-52 overflow-y-auto scrollbar-hidden",
                children: ($$renderer5) => {
                  $$renderer5.push(`<!--[-->`);
                  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$folders", folders).sort((a, b) => b.updated_at - a.updated_at));
                  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                    let folder = each_array[$$index];
                    $$renderer5.push(`<button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl overflow-hidden w-full"><div class="shrink-0">`);
                    Folder$1($$renderer5, {});
                    $$renderer5.push(`<!----></div> <div class="truncate">${escape_html(folder?.name ?? "Folder")}</div></button>`);
                  }
                  $$renderer5.push(`<!--]-->`);
                },
                $$slots: {
                  default: true,
                  trigger: ($$renderer5) => {
                    $$renderer5.push(`<button slot="trigger" draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full">`);
                    Folder$1($$renderer5, {});
                    $$renderer5.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Move"))}</div></button>`);
                  }
                }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            ArchiveBox($$renderer4, { strokeWidth: "1.5" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Archive"))}</div></button> <button draggable="false" class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl w-full">`);
            GarbageBin($$renderer4, { strokeWidth: "1.5" });
            $$renderer4.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</div></button></div></div>`);
          }
        }
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
    bind_props($$props, {
      shareHandler,
      moveChatHandler,
      cloneChatHandler,
      archiveChatHandler,
      renameHandler,
      deleteHandler,
      onClose,
      chatId: chatId2,
      onPinChange
    });
  });
}
function ChatItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    const dispatch = createEventDispatcher();
    let className = fallback($$props["className"], "");
    let id = $$props["id"];
    let title = $$props["title"];
    let createdAt = fallback($$props["createdAt"], null);
    let selected = fallback($$props["selected"], false);
    let shiftKey = fallback($$props["shiftKey"], false);
    let onDragEnd = fallback($$props["onDragEnd"], () => {
    });
    function formatTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp * 1e3;
      const seconds = Math.floor(diff / 1e3);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const years = Math.floor(days / 365);
      if (years > 0) return store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}}y", { COUNT: years, context: "time_ago" });
      if (weeks > 0) return store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}}w", { COUNT: weeks, context: "time_ago" });
      if (days > 0) return store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}}d", { COUNT: days, context: "time_ago" });
      if (hours > 0) return store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}}h", { COUNT: hours, context: "time_ago" });
      if (minutes > 0) return store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}}m", { COUNT: minutes, context: "time_ago" });
      return store_get($$store_subs ??= {}, "$i18n", i18n).t("1m", { context: "time_ago" });
    }
    let showShareChatModal = false;
    let confirmEdit = false;
    let chatTitle$1 = title;
    const cloneChatHandler = async (id2) => {
      const res = await cloneChatById(localStorage.token, id2, store_get($$store_subs ??= {}, "$i18n", i18n).t("Clone of {{TITLE}}", { TITLE: title })).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        goto(`/c/${res.id}`);
        currentChatPage.set(1);
        await chats.set(await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage)));
        await pinnedChats.set(await getPinnedChatList(localStorage.token));
      }
    };
    const archiveChatHandler = async (id2) => {
      try {
        await archiveChatById(localStorage.token, id2);
        if (store_get($$store_subs ??= {}, "$chatId", chatId) === id2) {
          await goto("/");
          chatId.set("");
        }
        dispatch("change");
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat archived."));
      } catch (error) {
        /* @__PURE__ */ console.error("Error archiving chat:", error);
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to archive chat."));
      }
    };
    const moveChatHandler = async (chatId2, folderId) => {
      if (chatId2 && folderId) {
        const res = await updateChatFolderIdById(localStorage.token, chatId2, folderId).catch((error) => {
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
    let generating = false;
    const dragImage = new Image();
    dragImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    onDestroy(() => {
    });
    let showDeleteConfirm = false;
    const renameHandler = async () => {
      chatTitle$1 = title;
      confirmEdit = true;
      await tick();
      setTimeout(
        () => {
          const input = document.getElementById(`chat-title-input-${id}`);
          if (input) {
            input.focus();
            input.select();
          }
        },
        0
      );
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ShareChatModal($$renderer3, {
        chatId: id,
        get show() {
          return showShareChatModal;
        },
        set show($$value) {
          showShareChatModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete chat?"),
        get show() {
          return showDeleteConfirm;
        },
        set show($$value) {
          showDeleteConfirm = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="text-sm text-gray-500 flex-1 line-clamp-3">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("This will delete"))} <span class="font-semibold">${escape_html(title)}</span>.</div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div id="sidebar-chat-group"${attr_class(` w-full ${stringify(className)} relative group`)}${attr("draggable", !confirmEdit)}>`);
      if (confirmEdit) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div id="sidebar-chat-item"${attr_class(` w-full flex justify-between rounded-xl px-[11px] py-[6px] ${stringify(id === store_get($$store_subs ??= {}, "$chatId", chatId) || confirmEdit ? "bg-gray-100 dark:bg-gray-900 selected" : selected ? "bg-gray-100 dark:bg-gray-950 selected" : "group-hover:bg-gray-100 dark:group-hover:bg-gray-950")} whitespace-nowrap text-ellipsis relative ${stringify("")}`)}><input${attr("id", `chat-title-input-${stringify(id)}`)}${attr("value", chatTitle$1)} class="bg-transparent w-full outline-hidden mr-10"${attr("placeholder", "")}${attr("disabled", generating, true)}/></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<a id="sidebar-chat-item"${attr_class(` w-full flex justify-between rounded-xl px-[11px] py-[6px] ${stringify(id === store_get($$store_subs ??= {}, "$chatId", chatId) || confirmEdit ? "bg-gray-100 dark:bg-gray-900 selected" : selected ? "bg-gray-100 dark:bg-gray-950 selected" : " group-hover:bg-gray-100 dark:group-hover:bg-gray-950")} whitespace-nowrap text-ellipsis`)}${attr("href", `/c/${stringify(id)}`)} draggable="false">`);
        if (store_get($$store_subs ??= {}, "$activeChatIds", activeChatIds).has(id)) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="shrink-0 self-center pr-2">`);
          Spinner($$renderer3, { className: "size-3" });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="flex self-center flex-1 w-full min-w-0"><div dir="auto" class="text-left self-center overflow-hidden w-full h-[20px] truncate">${escape_html(title)}</div></div> `);
        if (createdAt && true) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="shrink-0 self-center text-[10px] text-gray-400 dark:text-gray-500 pl-2">${escape_html(formatTimeAgo(createdAt))}</div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></a>`);
      }
      $$renderer3.push(`<!--]--> <div id="sidebar-chat-item-menu"${attr_class(` ${stringify(id === store_get($$store_subs ??= {}, "$chatId", chatId) || confirmEdit ? "from-gray-100 dark:from-gray-900 selected" : selected ? "from-gray-100 dark:from-gray-950 selected" : "invisible group-hover:visible from-gray-100 dark:from-gray-950")} absolute ${stringify(className === "pr-2" ? "right-[8px]" : "right-1")} top-[4px] py-1 pr-0.5 mr-1.5 pl-5 bg-linear-to-l from-80% to-transparent`)}>`);
      if (confirmEdit) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex self-center items-center space-x-1.5 z-10 translate-y-[0.5px] -translate-x-[0.5px]">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Generate"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="self-center dark:hover:text-white transition disabled:cursor-not-allowed" id="generate-title-button"${attr("disabled", generating, true)}>`);
            Sparkles($$renderer4, { strokeWidth: "2" });
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="flex self-center z-10 items-end">`);
        ChatMenu($$renderer3, {
          chatId: id,
          cloneChatHandler: () => {
            cloneChatHandler(id);
          },
          shareHandler: () => {
            showShareChatModal = true;
          },
          moveChatHandler,
          archiveChatHandler: () => {
            archiveChatHandler(id);
          },
          renameHandler,
          deleteHandler: () => {
            showDeleteConfirm = true;
          },
          onClose: () => {
          },
          onPinChange: async () => {
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<button aria-label="Chat Menu" class="self-center dark:hover:text-white transition m-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"></path></svg></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if (id === store_get($$store_subs ??= {}, "$chatId", chatId)) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<button id="delete-chat-button" class="hidden"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"></path></svg></button>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
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
    bind_props($$props, {
      className,
      id,
      title,
      createdAt,
      selected,
      shiftKey,
      onDragEnd
    });
  });
}
function Folder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    const dispatch = createEventDispatcher();
    let open = fallback($$props["open"], true);
    let id = fallback($$props["id"], "");
    let name = fallback($$props["name"], "");
    let collapsible = fallback($$props["collapsible"], true);
    let className = fallback($$props["className"], "");
    let buttonClassName = fallback($$props["buttonClassName"], "text-gray-600 dark:text-gray-400");
    let chevron = fallback($$props["chevron"], true);
    let onAddLabel = fallback($$props["onAddLabel"], "");
    let onAdd = fallback($$props["onAdd"], null);
    let dragAndDrop = fallback($$props["dragAndDrop"], true);
    let folderElement;
    const onDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (folderElement.contains(e.target)) {
        /* @__PURE__ */ console.log("Dropped on the Button");
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          for (const item of Array.from(e.dataTransfer.items)) {
            if (item.kind === "file") {
              const file = item.getAsFile();
              if (file && file.type === "application/json") {
                /* @__PURE__ */ console.log("Dropped file is a JSON file!");
                const reader = new FileReader();
                reader.onload = async function(event) {
                  try {
                    const fileContent = JSON.parse(event.target.result);
                    /* @__PURE__ */ console.log("Parsed JSON Content: ", fileContent);
                    open = true;
                    dispatch("import", fileContent);
                  } catch (error) {
                    /* @__PURE__ */ console.error("Error parsing JSON file:", error);
                  }
                };
                reader.readAsText(file);
              } else {
                /* @__PURE__ */ console.error("Only JSON file types are supported.");
              }
            } else {
              open = true;
              try {
                const dataTransfer = e.dataTransfer.getData("text/plain");
                if (dataTransfer) {
                  const data = JSON.parse(dataTransfer);
                  /* @__PURE__ */ console.log(data);
                  dispatch("drop", data);
                } else {
                  /* @__PURE__ */ console.log("Dropped text data is empty or not text/plain.");
                }
              } catch (error) {
                /* @__PURE__ */ console.log("Dropped data is not valid JSON text or is empty. Ignoring drop event for this type of data.");
              } finally {
              }
            }
          }
        }
      }
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    onDestroy(() => {
      if (!dragAndDrop) {
        return;
      }
      folderElement.removeEventListener("dragover", onDragOver);
      folderElement.removeEventListener("drop", onDrop);
      folderElement.removeEventListener("dragleave", onDragLeave);
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div${attr_class(`relative ${stringify(className)}`)}>`);
      {
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
    bind_props($$props, {
      open,
      id,
      name,
      collapsible,
      className,
      buttonClassName,
      chevron,
      onAddLabel,
      onAdd,
      dragAndDrop
    });
  });
}
function RecursiveFolder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    const { saveAs } = fileSaver;
    let folderRegistry = fallback($$props["folderRegistry"], () => ({}), true);
    let open = fallback($$props["open"], false);
    let folders2 = $$props["folders"];
    let folderId = $$props["folderId"];
    let shiftKey = fallback($$props["shiftKey"], false);
    let className = fallback($$props["className"], "");
    let deleteFolderContents = fallback($$props["deleteFolderContents"], true);
    let parentDragged = fallback($$props["parentDragged"], false);
    let onDelete = fallback($$props["onDelete"], (e) => {
    });
    let onItemMove = fallback($$props["onItemMove"], (e) => {
    });
    let showFolderModal = false;
    let showCreateSubFolderModal = false;
    let createSubFolderParentId = null;
    let dragged = false;
    const dragImage = new Image();
    dragImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    onDestroy(() => {
    });
    let showDeleteConfirm = false;
    const updateHandler = async ({ name, meta, data }) => {
      if (name === "") {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name cannot be empty."));
        return;
      }
      const currentName = folders2[folderId].name;
      name = name.trim();
      folders2[folderId].name = name;
      const res = await updateFolderById(localStorage.token, folderId, { name, ...meta ? { meta } : {}, ...data ? { data } : {} }).catch((error) => {
        toast.error(`${error}`);
        folders2[folderId].name = currentName;
        return null;
      });
      if (res) {
        folders2[folderId].name = name;
        if (data) {
          folders2[folderId].data = data;
        }
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder updated successfully"));
        if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.id === folderId) {
          const folder = await getFolderById(localStorage.token, folderId).catch((error) => {
            toast.error(`${error}`);
            return null;
          });
          if (folder) {
            await selectedFolder.set(folder);
          }
        }
      }
    };
    let chats2 = null;
    const setFolderItems = async () => {
      await tick();
      if (open) {
        chats2 = await getChatListByFolderId(localStorage.token, folderId).catch((error) => {
          toast.error(`${error}`);
          return [];
        });
      } else {
        chats2 = null;
      }
    };
    const exportHandler = async () => {
      const chats3 = await getChatsByFolderId(localStorage.token, folderId).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (!chats3) {
        return;
      }
      const blob = new Blob([JSON.stringify(chats3)], { type: "application/json" });
      saveAs(blob, `folder-${folders2[folderId].name}-export-${Date.now()}.json`);
    };
    const createSubFolderHandler = async ({ name, meta, data, parent_id }) => {
      if (name === "") {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name cannot be empty."));
        return;
      }
      name = name.trim();
      const res = await createNewFolder(localStorage.token, { name, data, meta, parent_id }).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder created successfully"));
      }
    };
    if (open) {
      setFolderItems();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
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
          $$renderer4.push(`<div class="text-sm text-gray-700 dark:text-gray-300 flex-1 line-clamp-3 mb-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Are you sure you want to delete "{{NAME}}"?`, { NAME: folders2[folderId].name }))}</div> <div class="flex items-center gap-1.5"><input type="checkbox"${attr("checked", deleteFolderContents, true)}/> <div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete all contents inside this folder"))}</div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      FolderModal($$renderer3, {
        edit: true,
        folderId,
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
      FolderModal($$renderer3, {
        parentId: createSubFolderParentId,
        onSubmit: createSubFolderHandler,
        get show() {
          return showCreateSubFolderModal;
        },
        set show($$value) {
          showCreateSubFolderModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div${attr_class(`relative ${stringify(className)}`)} draggable="true">`);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      Collapsible($$renderer3, {
        className: "w-full",
        buttonClassName: "w-full",
        onChange: (state) => {
        },
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="w-full group"><div${attr("id", `folder-${stringify(folderId)}-button`)}${attr_class(`relative w-full py-1 px-1.5 rounded-xl flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 transition ${stringify(store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)?.id === folderId ? "bg-gray-100 dark:bg-gray-900 selected" : "")}`)}><button class="text-gray-500 dark:text-gray-500 transition-all p-1 hover:bg-gray-200 dark:hover:bg-gray-850 rounded-lg">`);
          if (folders2[folderId]?.meta?.icon) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex group-hover:hidden transition-all">`);
            Emoji($$renderer4, {
              className: "size-3.5",
              shortCode: folders2[folderId].meta.icon
            });
            $$renderer4.push(`<!----></div> <div class="hidden group-hover:flex transition-all p-[1px]">`);
            if (open) {
              $$renderer4.push("<!--[0-->");
              ChevronDown($$renderer4, { className: " size-3", strokeWidth: "2.5" });
            } else {
              $$renderer4.push("<!--[-1-->");
              ChevronRight($$renderer4, { className: " size-3", strokeWidth: "2.5" });
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="p-[1px]">`);
            if (open) {
              $$renderer4.push("<!--[0-->");
              ChevronDown($$renderer4, { className: " size-3", strokeWidth: "2.5" });
            } else {
              $$renderer4.push("<!--[-1-->");
              ChevronRight($$renderer4, { className: " size-3", strokeWidth: "2.5" });
            }
            $$renderer4.push(`<!--]--></div>`);
          }
          $$renderer4.push(`<!--]--></button> <div class="translate-y-[0.5px] flex-1 justify-start text-start line-clamp-1">`);
          {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(folders2[folderId].name)}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="absolute z-10 right-2 invisible group-hover:visible self-center flex items-center dark:text-gray-300">`);
          FolderMenu($$renderer4, {
            onEdit: () => {
              showFolderModal = true;
            },
            onDelete: () => {
              showDeleteConfirm = true;
            },
            onExport: () => {
              exportHandler();
            },
            onCreateSub: () => {
              createSubFolderParentId = folderId;
              showCreateSubFolderModal = true;
            },
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="p-1 dark:hover:bg-gray-850 rounded-lg touch-auto">`);
              EllipsisHorizontal($$renderer5, { className: "size-4", strokeWidth: "2.5" });
              $$renderer5.push(`<!----></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></button></div></div>`);
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content" class="w-full">`);
            if ((folders2[folderId]?.childrenIds ?? []).length > 0 || (chats2 ?? []).length > 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="ml-3 pl-1 mt-[1px] flex flex-col overflow-y-auto scrollbar-hidden border-s border-gray-100 dark:border-gray-900">`);
              if (folders2[folderId]?.childrenIds) {
                $$renderer4.push("<!--[0-->");
                const children = folders2[folderId]?.childrenIds.map((id) => folders2[id]).sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" }));
                $$renderer4.push(`<!--[-->`);
                const each_array = ensure_array_like(children);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let childFolder = each_array[$$index];
                  RecursiveFolder($$renderer4, {
                    folders: folders2,
                    folderId: childFolder.id,
                    shiftKey,
                    parentDragged: dragged,
                    onItemMove,
                    onDelete,
                    get folderRegistry() {
                      return folderRegistry;
                    },
                    set folderRegistry($$value) {
                      folderRegistry = $$value;
                      $$settled = false;
                    }
                  });
                  $$renderer4.push(`<!---->`);
                }
                $$renderer4.push(`<!--]-->`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <!--[-->`);
              const each_array_1 = ensure_array_like(chats2 ?? []);
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let chat = each_array_1[$$index_1];
                ChatItem($$renderer4, {
                  id: chat.id,
                  title: chat.title,
                  createdAt: chat.created_at,
                  shiftKey
                });
              }
              $$renderer4.push(`<!--]--></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> `);
            if (chats2 === null) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex justify-center items-center p-2">`);
              Spinner($$renderer4, { className: "size-4 text-gray-500" });
              $$renderer4.push(`<!----></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          }
        }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      folderRegistry,
      open,
      folders: folders2,
      folderId,
      shiftKey,
      className,
      deleteFolderContents,
      parentDragged,
      onDelete,
      onItemMove,
      setFolderItems
    });
  });
}
function Folders($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let folderRegistry = fallback($$props["folderRegistry"], () => ({}), true);
    let folders2 = fallback($$props["folders"], () => ({}), true);
    let shiftKey = fallback($$props["shiftKey"], false);
    let onDelete = fallback($$props["onDelete"], (folderId) => {
    });
    let folderList = [];
    const onItemMove = (e) => {
      if (e.originFolderId) {
        folderRegistry[e.originFolderId]?.setFolderItems();
      }
    };
    const loadFolderItems = () => {
      for (const folderId of Object.keys(folders2)) {
        folderRegistry[folderId]?.setFolderItems();
      }
    };
    folderList = Object.keys(folders2).filter((key) => folders2[key].parent_id === null).sort((a, b) => folders2[a].name.localeCompare(folders2[b].name, void 0, { numeric: true, sensitivity: "base" }));
    if (folders2 || store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder) && store_get($$store_subs ??= {}, "$chatId", chatId)) {
      loadFolderItems();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(folderList);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let folderId = each_array[$$index];
        RecursiveFolder($$renderer3, {
          className: "",
          folders: folders2,
          folderId,
          shiftKey,
          onDelete,
          onItemMove,
          get folderRegistry() {
            return folderRegistry;
          },
          set folderRegistry($$value) {
            folderRegistry = $$value;
            $$settled = false;
          }
        });
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
    bind_props($$props, { folderRegistry, folders: folders2, shiftKey, onDelete });
  });
}
function Visibility($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onChange = fallback($$props["onChange"], () => {
    });
    let state = fallback($$props["state"], "private");
    $$renderer2.push(`<div class="rounded-lg flex flex-col gap-2"><div><div class="text-xs font-medium mb-2.5 text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Visibility"))}</div> <div class="flex gap-2.5 items-center mb-1"><div><div class="p-2 bg-black/5 dark:bg-white/5 rounded-full">`);
    if (state === "private") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div>`);
    $$renderer2.select(
      {
        id: "models",
        class: "outline-hidden bg-transparent text-sm font-medium block w-fit pr-10 max-w-full placeholder-gray-400",
        value: state === "private" ? "private" : "public"
      },
      ($$renderer3) => {
        $$renderer3.option({ class: "text-gray-700", value: "public", selected: true }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Public"))}`);
        });
        $$renderer3.option({ class: "text-gray-700", value: "private", selected: true }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Private"))}`);
        });
      }
    );
    $$renderer2.push(` <div class="text-xs text-gray-400 font-medium">`);
    if (state === "private") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Only invited users can access"))}`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Visible to all users"))}`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onChange, state });
  });
}
function WebhookItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let webhook = $$props["webhook"];
    let expanded = fallback($$props["expanded"], false);
    let onClick = fallback($$props["onClick"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onUpdate = fallback($$props["onUpdate"], (changes) => {
    });
    let name = webhook.name;
    let image = webhook.profile_image_url || "";
    if (name !== webhook.name || image !== (webhook.profile_image_url || "")) {
      onUpdate({ name: name.trim() || webhook.name, profile_image_url: image });
    }
    $$renderer2.push(`<input type="file" hidden="" accept="image/*"/> <div class="text-xs -mx-1"><button type="button" class="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition"><img${attr("src", image || `${WEBUI_BASE_URL}/static/favicon.png`)} class="rounded-full size-8 object-cover flex-shrink-0" alt=""/> <div class="flex-1 text-left min-w-0"><div class="font-medium text-gray-900 dark:text-white truncate">${escape_html(name)}</div> <div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Created on {{date}}", {
      date: dayjs(webhook.created_at / 1e6).format("MMM D, YYYY")
    }))} `);
    if (webhook.user?.name) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("by {{name}}", { name: webhook.user.name }))}`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    ChevronDown($$renderer2, {
      className: `size-3.5 text-gray-400 transition-transform duration-200 ${stringify(expanded ? "rotate-180" : "")}`
    });
    $$renderer2.push(`<!----></button> `);
    if (expanded) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mt-1 mb-3 px-3.5 py-3 border border-gray-100 dark:border-gray-850 rounded-2xl"><div class="flex items-center gap-3"><button type="button" class="shrink-0 rounded-xl overflow-hidden hover:opacity-80 transition"><img${attr("src", image || `${WEBUI_BASE_URL}/static/favicon.png`)} class="size-8 object-cover" alt=""/></button> <div class="flex-1"><div class="text-gray-500 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</div> <input type="text" class="w-full text-sm bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Webhook Name"))}/></div> <div class="flex items-center gap-1">`);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy URL"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button type="button" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">`);
          Clipboard($$renderer3, { className: "size-4 text-gray-500" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button type="button" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">`);
          GarbageBin($$renderer3, { className: "size-4 text-gray-500" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { webhook, expanded, onClick, onDelete, onUpdate });
  });
}
function WebhooksModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let channel = fallback($$props["channel"], null);
    let webhooks = [];
    let isLoading = false;
    let isSaving = false;
    let showDeleteConfirmDialog = false;
    let selectedWebhookId = null;
    let pendingChanges = {};
    const loadWebhooks = async () => {
      isLoading = true;
      try {
        webhooks = await getChannelWebhooks(localStorage.token, channel.id);
      } catch {
        webhooks = [];
      }
      isLoading = false;
    };
    if (show && channel) {
      loadWebhooks();
      selectedWebhookId = null;
      pendingChanges = {};
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (channel) {
        $$renderer3.push("<!--[0-->");
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
            $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 mb-1.5"><div class="flex w-full justify-between items-center mr-3"><div class="self-center text-base flex gap-1.5 items-center"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Webhooks"))}</div> <span class="text-sm text-gray-500">${escape_html(webhooks.length)}</span></div> <button type="button" class="px-3 py-1.5 gap-1 rounded-xl bg-gray-100/50 dark:bg-gray-850/50 text-black dark:text-white transition font-medium text-xs flex items-center justify-center"${attr("disabled", isSaving, true)}>`);
            Plus($$renderer4, { className: "size-3.5" });
            $$renderer4.push(`<!----> <span>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("New Webhook"))}</span></button></div> <button class="self-center">`);
            XMark($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></button></div> <div class="flex flex-col w-full px-4 pb-4 dark:text-gray-200"><form class="flex flex-col w-full">`);
            if (isLoading) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="flex justify-center py-10">`);
              Spinner($$renderer4, { className: "size-5" });
              $$renderer4.push(`<!----></div>`);
            } else if (webhooks.length > 0) {
              $$renderer4.push("<!--[1-->");
              $$renderer4.push(`<div class="w-full py-2"><!--[-->`);
              const each_array = ensure_array_like(webhooks);
              for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                let webhook = each_array[$$index];
                WebhookItem($$renderer4, {
                  webhook,
                  expanded: selectedWebhookId === webhook.id,
                  onClick: () => {
                    selectedWebhookId = selectedWebhookId === webhook.id ? null : webhook.id;
                  },
                  onDelete: () => {
                    showDeleteConfirmDialog = true;
                  },
                  onUpdate: (changes) => {
                    pendingChanges[webhook.id] = changes;
                  }
                });
              }
              $$renderer4.push(`<!--]--></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<div class="text-gray-500 text-xs text-center py-8 px-10">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No webhooks yet"))}</div>`);
            }
            $$renderer4.push(`<!--]--> <div class="flex justify-end text-sm font-medium gap-1.5"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", isSaving, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
            {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></button></div></form></div></div>`);
          },
          $$slots: { default: true }
        });
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
    bind_props($$props, { show, channel });
  });
}
function ChannelModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let channel = fallback($$props["channel"], null);
    let edit = fallback($$props["edit"], false);
    let channelTypes = ["group", "dm"];
    let type = "";
    let name = "";
    let isPrivate = null;
    let accessGrants = [];
    let userIds = [];
    let loading = false;
    const onTypeChange = (type2) => {
      if (type2 === "group") {
        if (isPrivate === null) {
          isPrivate = true;
        }
      } else {
        isPrivate = null;
      }
    };
    const init = () => {
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
        channelTypes = ["", "group", "dm"];
      } else {
        channelTypes = ["group", "dm"];
      }
      type = channel?.type ?? channelTypes[0];
      if (channel) {
        name = channel?.name ?? "";
        if (type === "group") {
          isPrivate = typeof channel?.is_private === "boolean" ? channel.is_private : true;
        } else {
          isPrivate = null;
        }
        accessGrants = channel?.access_grants ?? [];
        userIds = channel?.user_ids ?? [];
      }
    };
    let showDeleteConfirmDialog = false;
    let showWebhooksModal = false;
    const resetHandler = () => {
      type = "";
      name = "";
      accessGrants = [];
      userIds = [];
      loading = false;
    };
    if (name) {
      name = name.replace(/\s/g, "-").toLocaleLowerCase();
    }
    onTypeChange(type);
    if (show) {
      init();
    } else {
      resetHandler();
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-1"><div class="text-lg font-medium self-center">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Channel"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Channel"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full">`);
          if (!edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col w-full mt-2 mb-1"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Channel Type"))}</div> <div class="flex-1">`);
            Tooltip($$renderer4, {
              content: type === "dm" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("A private conversation between you and selected users") : type === "group" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("A collaboration channel where people join as members") : store_get($$store_subs ??= {}, "$i18n", i18n).t("A discussion channel where access is controlled by groups and permissions"),
              placement: "top-start",
              children: ($$renderer5) => {
                $$renderer5.select(
                  {
                    class: "w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden",
                    value: type
                  },
                  ($$renderer6) => {
                    $$renderer6.push(`<!--[-->`);
                    const each_array = ensure_array_like(channelTypes);
                    for (let channelTypeIdx = 0, $$length = each_array.length; channelTypeIdx < $$length; channelTypeIdx++) {
                      let channelType = each_array[channelTypeIdx];
                      $$renderer6.option({ value: channelType, selected: channelTypeIdx === 0 }, ($$renderer7) => {
                        if (channelType === "group") {
                          $$renderer7.push("<!--[0-->");
                          $$renderer7.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Group Channel"))}`);
                        } else if (channelType === "dm") {
                          $$renderer7.push("<!--[1-->");
                          $$renderer7.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Direct Message"))}`);
                        } else if (channelType === "") {
                          $$renderer7.push("<!--[2-->");
                          $$renderer7.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Channel"))}`);
                        } else {
                          $$renderer7.push("<!--[-1-->");
                        }
                        $$renderer7.push(`<!--]-->`);
                      });
                    }
                    $$renderer6.push(`<!--]-->`);
                  }
                );
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="text-gray-300 dark:text-gray-700 text-xs">`);
          if (type === "") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Discussion channel where access is based on groups and permissions"))}`);
          } else if (type === "group") {
            $$renderer4.push("<!--[1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Collaboration channel where people join as members"))}`);
          } else if (type === "dm") {
            $$renderer4.push("<!--[2-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Private conversation between selected users"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex flex-col w-full mt-2"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Channel Name"))} <span class="text-xs text-gray-200 dark:text-gray-800 ml-0.5">${escape_html(type === "dm" ? `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Optional")}` : "")}</span></div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", `${store_get($$store_subs ??= {}, "$i18n", i18n).t("new-channel")}`)} autocomplete="off"${attr("required", type !== "dm", true)} max="100"/></div></div> `);
          if (type !== "dm") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="-mx-2 mb-1 mt-2.5 px-2">`);
            if (type === "") {
              $$renderer4.push("<!--[0-->");
              AccessControl($$renderer4, {
                accessRoles: ["read", "write"],
                get accessGrants() {
                  return accessGrants;
                },
                set accessGrants($$value) {
                  accessGrants = $$value;
                  $$settled = false;
                }
              });
            } else if (type === "group") {
              $$renderer4.push("<!--[1-->");
              Visibility($$renderer4, {
                state: isPrivate ? "private" : "public",
                onChange: (value) => {
                  if (value === "private") {
                    isPrivate = true;
                  } else {
                    isPrivate = false;
                  }
                  /* @__PURE__ */ console.log(value, isPrivate);
                }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (["dm"].includes(type)) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div>`);
            MemberSelector($$renderer4, {
              includeGroups: false,
              get userIds() {
                return userIds;
              },
              set userIds($$value) {
                userIds = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex w-full mt-2 items-center justify-between"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Webhooks"))}</div> <button class="text-xs bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden text-left" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage"))}</button></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5">`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-black/90 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify(loading ? " cursor-not-allowed" : "")}`)} type="submit"${attr("disabled", loading, true)}>`);
          if (edit) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Update"))}`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create"))}`);
          }
          $$renderer4.push(`<!--]--> `);
          if (loading) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="ml-2 self-center">`);
            Spinner($$renderer4, {});
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("Are you sure you want to delete this channel?"),
        confirmLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"),
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      WebhooksModal($$renderer3, {
        channel,
        get show() {
          return showWebhooksModal;
        },
        set show($$value) {
          showWebhooksModal = $$value;
          $$settled = false;
        }
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
    bind_props($$props, { show, onSubmit, onUpdate, channel, edit });
  });
}
function ChannelItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let className = fallback($$props["className"], "");
    let channel = $$props["channel"];
    let showEditChannelModal = false;
    const hasPublicReadGrant = (grants) => Array.isArray(grants) && grants.some((grant) => grant?.principal_type === "user" && grant?.principal_id === "*" && grant?.permission === "read");
    const isPublicChannel = (channel2) => {
      if (channel2?.type === "group") {
        if (typeof channel2?.is_private === "boolean") {
          return !channel2.is_private;
        }
        return hasPublicReadGrant(channel2?.access_grants);
      }
      return hasPublicReadGrant(channel2?.access_grants);
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ChannelModal($$renderer3, {
        channel,
        edit: true,
        onUpdate,
        onSubmit: async (payload) => {
          const { name, is_private, access_grants, group_ids, user_ids } = payload ?? {};
          const res = await updateChannelById(localStorage.token, channel.id, { name, is_private, access_grants, group_ids, user_ids }).catch((error) => {
            toast.error(error.message);
          });
          if (res) {
            toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Channel updated successfully"));
          }
          onUpdate();
        },
        get show() {
          return showEditChannelModal;
        },
        set show($$value) {
          showEditChannelModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div id="sidebar-channel-item"${attr_class(` w-full ${stringify(className)} rounded-xl flex relative group hover:bg-gray-100 dark:hover:bg-gray-900 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === `/channels/${channel.id}` ? "bg-gray-100 dark:bg-gray-900 selected" : "")} ${stringify(channel?.type === "dm" ? "px-1 py-[3px]" : "p-1")} ${stringify(channel?.unread_count > 0 ? "font-medium dark:text-white text-black" : " dark:text-gray-400 text-gray-600")} cursor-pointer select-none`)}><a class="w-full flex justify-between"${attr("href", `/channels/${stringify(channel.id)}`)} draggable="false"><div class="flex items-center gap-1"><div>`);
      if (channel?.type === "dm") {
        $$renderer3.push("<!--[0-->");
        if (channel?.users) {
          $$renderer3.push("<!--[0-->");
          const channelMembers = channel.users.filter((u) => u.id !== store_get($$store_subs ??= {}, "$user", user)?.id);
          $$renderer3.push(`<div class="flex ml-[1px] mr-0.5 relative"><!--[-->`);
          const each_array = ensure_array_like(channelMembers.slice(0, 2));
          for (let index = 0, $$length = each_array.length; index < $$length; index++) {
            let u = each_array[index];
            $$renderer3.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/users/${u.id}/profile/image`)}${attr("alt", u.name)}${attr_class(` size-5.5 rounded-full border-2 border-white dark:border-gray-900 ${stringify(index === 1 ? "-ml-2.5" : "")}`)}/>`);
          }
          $$renderer3.push(`<!--]--> `);
          if (channelMembers.length === 1) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="absolute bottom-0 right-0"><span class="relative flex size-2">`);
            if (channelMembers[0]?.is_active) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <span${attr_class(`relative inline-flex size-2 rounded-full ${stringify(channelMembers[0]?.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700")} border-[1.5px] border-white dark:border-gray-900`)}></span></span></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          Users($$renderer3, { className: "size-4 ml-1 mr-0.5", strokeWidth: "2" });
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="size-4 justify-center flex items-center ml-1">`);
        if (isPublicChannel(channel)) {
          $$renderer3.push("<!--[0-->");
          Hashtag($$renderer3, { className: "size-3.5", strokeWidth: "2.5" });
        } else {
          $$renderer3.push("<!--[-1-->");
          Lock($$renderer3, { className: "size-[15px]", strokeWidth: "2" });
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="text-left self-center overflow-hidden w-full line-clamp-1 flex-1 pr-1 flex items-center gap-2.5">`);
      if (channel?.name) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<span class="line-clamp-1">${escape_html(channel.name)}</span>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<span class="shrink-0 line-clamp-1">${escape_html(channel?.users?.filter((u) => u.id !== store_get($$store_subs ??= {}, "$user", user)?.id).map((u) => u.name).join(", "))}</span> `);
        if (channel?.users?.length === 2) {
          $$renderer3.push("<!--[0-->");
          const dmUser = channel.users.find((u) => u.id !== store_get($$store_subs ??= {}, "$user", user)?.id);
          if (dmUser?.status_emoji || dmUser?.status_message) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<span class="flex gap-1.5 line-clamp-1">`);
            if (dmUser?.status_emoji) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="self-center shrink-0">`);
              Emoji($$renderer3, { className: "size-3.5", shortCode: dmUser?.status_emoji });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <div class="line-clamp-1 italic">${escape_html(dmUser?.status_message)}</div></span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></div></div> <div class="flex items-center">`);
      if (channel?.unread_count > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="text-xs py-[1px] px-2 rounded-xl bg-gray-100 text-black dark:bg-gray-800 dark:text-white font-medium whitespace-nowrap">${escape_html(new Intl.NumberFormat(store_get($$store_subs ??= {}, "$i18n", i18n).locale, { notation: "compact", compactDisplay: "short" }).format(channel.unread_count))}</div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></a> `);
      if (["dm"].includes(channel?.type)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="ml-0.5 mr-1 invisible group-hover:visible self-center flex items-center dark:text-gray-300"><button type="button" class="p-0.5 dark:hover:bg-gray-850 rounded-lg touch-auto">`);
        XMark($$renderer3, { className: "size-3.5" });
        $$renderer3.push(`<!----></button></div>`);
      } else if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || channel.user_id === store_get($$store_subs ??= {}, "$user", user)?.id) {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<div class="ml-0.5 mr-1 invisible group-hover:visible self-center flex items-center dark:text-gray-300"><button type="button" class="p-0.5 dark:hover:bg-gray-850 rounded-lg touch-auto">`);
        Cog6($$renderer3, { className: "size-3.5" });
        $$renderer3.push(`<!----></button></div>`);
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
    bind_props($$props, { onUpdate, className, channel });
  });
}
function PencilSquare($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SearchInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let placeholder = fallback($$props["placeholder"], "");
    let value = fallback($$props["value"], "");
    let showClearButton = fallback($$props["showClearButton"], false);
    let onFocus = fallback($$props["onFocus"], () => {
    });
    let onKeydown = fallback($$props["onKeydown"], (e) => {
    });
    let lastWord = "";
    let options = [
      {
        name: "tag:",
        description: store_get($$store_subs ??= {}, "$i18n", i18n).t("search for tags")
      },
      {
        name: "folder:",
        description: store_get($$store_subs ??= {}, "$i18n", i18n).t("search for folders")
      },
      {
        name: "pinned:",
        description: store_get($$store_subs ??= {}, "$i18n", i18n).t("search for pinned chats")
      },
      {
        name: "shared:",
        description: store_get($$store_subs ??= {}, "$i18n", i18n).t("search for shared chats")
      },
      {
        name: "archived:",
        description: store_get($$store_subs ??= {}, "$i18n", i18n).t("search for archived chats")
      }
    ];
    const initItems = async () => {
      /* @__PURE__ */ console.log("initItems", lastWord);
      await tick();
      if (lastWord.startsWith("tag:")) {
        [
          ...store_get($$store_subs ??= {}, "$tags", tags),
          {
            id: "none",
            name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Untagged")
          }
        ].filter((tag) => {
          const tagName = lastWord.slice(4);
          if (tagName) {
            const tagId = tagName.replaceAll(" ", "_").toLowerCase();
            if (tag.id !== tagId) {
              return tag.id.startsWith(tagId);
            } else {
              return false;
            }
          } else {
            return true;
          }
        }).map((tag) => {
          return { id: tag.id, name: tag.name, type: "tag" };
        });
      } else if (lastWord.startsWith("folder:")) {
        [...store_get($$store_subs ??= {}, "$folders", folders)].filter((folder) => {
          const folderName = lastWord.slice(7);
          if (folderName) {
            const id = folder.name.replaceAll(" ", "_").toLowerCase();
            const folderId = folderName.replaceAll(" ", "_").toLowerCase();
            if (id !== folderId) {
              return id.startsWith(folderId);
            } else {
              return false;
            }
          } else {
            return true;
          }
        }).map((folder) => {
          return {
            id: folder.name.replaceAll(" ", "_").toLowerCase(),
            name: folder.name,
            type: "folder"
          };
        });
      } else if (lastWord.startsWith("pinned:")) {
        [
          { id: "true", name: "true", type: "pinned" },
          { id: "false", name: "false", type: "pinned" }
        ].filter((item) => {
          const pinnedValue = lastWord.slice(7);
          if (pinnedValue) {
            return item.id.startsWith(pinnedValue) && item.id !== pinnedValue;
          } else {
            return true;
          }
        });
      } else if (lastWord.startsWith("shared:")) {
        [
          { id: "true", name: "true", type: "shared" },
          { id: "false", name: "false", type: "shared" }
        ].filter((item) => {
          const sharedValue = lastWord.slice(7);
          if (sharedValue) {
            return item.id.startsWith(sharedValue) && item.id !== sharedValue;
          } else {
            return true;
          }
        });
      } else if (lastWord.startsWith("archived:")) {
        [
          { id: "true", name: "true", type: "archived" },
          { id: "false", name: "false", type: "archived" }
        ].filter((item) => {
          const archivedValue = lastWord.slice(9);
          if (archivedValue) {
            return item.id.startsWith(archivedValue) && item.id !== archivedValue;
          } else {
            return true;
          }
        });
      } else ;
    };
    lastWord = value ? value.split(" ").at(-1) : value;
    options.filter((option) => {
      return option.name.startsWith(lastWord);
    });
    if (lastWord && lastWord !== null) {
      initItems();
    }
    $$renderer2.push(`<div class="px-1 mb-1 flex justify-center space-x-2 relative z-10" id="search-container"><div class="flex w-full rounded-xl" id="chat-search"><div class="self-center py-2 rounded-l-xl bg-transparent dark:text-gray-300">`);
    Search($$renderer2, {});
    $$renderer2.push(`<!----></div> <input id="search-input" class="w-full rounded-r-xl py-1.5 pl-2.5 text-sm bg-transparent dark:text-gray-300 outline-hidden"${attr("placeholder", placeholder ? placeholder : store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))} autocomplete="off" maxlength="500"${attr("value", value)}/> `);
    if (
      // if the user types something, reset to the top selection.
      showClearButton && value
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="self-center pl-1.5 translate-y-[0.5px] rounded-l-xl bg-transparent"><button class="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">`);
      XMark($$renderer2, { className: "size-3", strokeWidth: "2" });
      $$renderer2.push(`<!----></button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { placeholder, value, showClearButton, onFocus, onKeydown });
  });
}
function SearchModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(calendar);
    dayjs.extend(localizedFormat);
    let show = fallback($$props["show"], false);
    let onClose = fallback($$props["onClose"], () => {
    });
    let actions = [
      {
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Start a new conversation"),
        onClick: async () => {
          await goto(`/${query ? `?q=${query}` : ""}`);
          show = false;
          onClose();
        },
        icon: PencilSquare
      }
    ];
    let query = "";
    let page2 = 1;
    let chatList = null;
    let allChatsLoaded = false;
    let searchDebounceTimeout;
    let selectedIdx = null;
    let selectedChat = null;
    let selectedModels = [""];
    let history = null;
    let messages = null;
    const loadChatPreview = async (selectedIdx2) => {
      if (!chatList || chatList.length === 0 || selectedIdx2 === null) {
        selectedChat = null;
        messages = null;
        history = null;
        selectedModels = [""];
        return;
      }
      const selectedChatIdx = selectedIdx2 - actions.length;
      if (selectedChatIdx < 0 || selectedChatIdx >= chatList.length) {
        selectedChat = null;
        messages = null;
        history = null;
        selectedModels = [""];
        return;
      }
      const chatId2 = chatList[selectedChatIdx].id;
      const chat = await getChatById(localStorage.token, chatId2).catch(async (error) => {
        return null;
      });
      if (chat) {
        if (chat?.chat?.history) {
          selectedModels = (chat?.chat?.models ?? void 0) !== void 0 ? chat?.chat?.models : [chat?.chat?.models ?? ""];
          history = chat?.chat?.history;
          messages = createMessagesList(chat?.chat?.history, chat?.chat?.history?.currentId);
          await tick();
          const messagesContainerElement = document.getElementById("chat-preview");
          if (messagesContainerElement) {
            messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight;
          }
        } else {
          messages = [];
        }
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to load chat preview"));
        selectedChat = null;
        messages = null;
        history = null;
        selectedModels = [""];
        return;
      }
    };
    const searchHandler = async () => {
      if (!show) {
        return;
      }
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
      page2 = 1;
      chatList = null;
      if (query === "") {
        chatList = await getChatList(localStorage.token, page2);
      } else {
        searchDebounceTimeout = setTimeout(
          async () => {
            chatList = await getChatListBySearchText(localStorage.token, query, page2);
            if ((chatList ?? []).length === 0) {
              allChatsLoaded = true;
            } else {
              allChatsLoaded = false;
            }
          },
          500
        );
      }
      selectedChat = null;
      messages = null;
      history = null;
      selectedModels = [""];
      if ((chatList ?? []).length === 0) {
        allChatsLoaded = true;
      } else {
        allChatsLoaded = false;
      }
    };
    const onKeyDown = (e) => {
      const searchOptions = document.getElementById("search-options-container");
      if (searchOptions || !show) {
        return;
      }
      if (e.code === "Escape") {
        show = false;
        onClose();
      } else if (e.code === "Enter") {
        const item2 = document.querySelector(`[data-arrow-selected="true"]`);
        if (item2) {
          item2?.click();
          show = false;
        }
        return;
      } else if (e.code === "ArrowDown") {
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          if (document.activeElement === searchInput) {
            searchInput.blur();
            selectedIdx = 0;
            return;
          }
        }
        selectedIdx = Math.min(selectedIdx + 1, (chatList ?? []).length - 1 + actions.length);
      } else if (e.code === "ArrowUp") {
        if (selectedIdx === 0) {
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            if (document.activeElement !== searchInput) {
              searchInput.focus();
              selectedIdx = 0;
              return;
            }
          }
        }
        selectedIdx = Math.max(selectedIdx - 1, 0);
      }
      const item = document.querySelector(`[data-arrow-selected="true"]`);
      item?.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    };
    onDestroy(() => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
      document.removeEventListener("keydown", onKeyDown);
    });
    if (chatList) {
      loadChatPreview(selectedIdx);
    }
    if (show) {
      searchHandler();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "xl",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="py-3 dark:text-gray-300 text-gray-700"><div class="px-4 pb-1.5">`);
          SearchInput($$renderer4, {
            placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"),
            showClearButton: true,
            onFocus: () => {
              selectedIdx = null;
              messages = null;
            },
            onKeydown: (e) => {
              /* @__PURE__ */ console.log("e", e);
              if (e.code === "Enter" && (chatList ?? []).length > 0) {
                const item2 = document.querySelector(`[data-arrow-selected="true"]`);
                if (item2) {
                  item2?.click();
                }
                show = false;
                return;
              } else if (e.code === "ArrowDown") {
                selectedIdx = Math.min(selectedIdx + 1, (chatList ?? []).length - 1 + actions.length);
              } else if (e.code === "ArrowUp") {
                selectedIdx = Math.max(selectedIdx - 1, 0);
              } else {
                selectedIdx = 0;
              }
              const item = document.querySelector(`[data-arrow-selected="true"]`);
              item?.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
            },
            get value() {
              return query;
            },
            set value($$value) {
              query = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="flex px-4 pb-1"><div class="flex flex-col overflow-y-auto h-96 md:h-[40rem] max-h-full scrollbar-hidden w-full flex-1 pr-2"><div class="w-full text-xs text-gray-500 dark:text-gray-500 font-medium pb-2 px-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Actions"))}</div> <!--[-->`);
          const each_array = ensure_array_like(actions);
          for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
            let action = each_array[idx];
            $$renderer4.push(`<button${attr_class(` w-full flex items-center rounded-xl text-sm py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-850 ${stringify(selectedIdx === idx ? "bg-gray-50 dark:bg-gray-850" : "")}`)}${attr("data-arrow-selected", selectedIdx === idx ? "true" : void 0)} dragabble="false"><div class="pr-2">`);
            if (action.icon) {
              $$renderer4.push("<!--[-->");
              action.icon($$renderer4, {});
              $$renderer4.push("<!--]-->");
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push("<!--]-->");
            }
            $$renderer4.push(`</div> <div class="flex-1 text-left"><div class="text-ellipsis line-clamp-1 w-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(action.label))}</div></div></button>`);
          }
          $$renderer4.push(`<!--]--> `);
          if (chatList) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<hr class="border-gray-50 dark:border-gray-850/30 my-3"/> `);
            if (chatList.length === 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="text-xs text-gray-500 dark:text-gray-400 text-center px-5 py-4">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No results found"))}</div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <!--[-->`);
            const each_array_1 = ensure_array_like(chatList);
            for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
              let chat = each_array_1[idx];
              if (idx === 0 || idx > 0 && chat.time_range !== chatList[idx - 1].time_range) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div${attr_class(`w-full text-xs text-gray-500 dark:text-gray-500 font-medium ${stringify(idx === 0 ? "" : "pt-5")} pb-2 px-2`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(chat.time_range))}</div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--> <a${attr_class(` w-full flex justify-between items-center rounded-xl text-sm py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-850 ${stringify(selectedIdx === idx + actions.length ? "bg-gray-50 dark:bg-gray-850" : "")}`)}${attr("href", `/c/${stringify(chat.id)}`)} draggable="false"${attr("data-arrow-selected", selectedIdx === idx + actions.length ? "true" : void 0)}><div class="flex-1"><div class="text-ellipsis line-clamp-1 w-full">${escape_html(chat?.title)}</div></div> <div class="pl-3 shrink-0 text-gray-500 dark:text-gray-400 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(dayjs(chat?.updated_at * 1e3).calendar(null, {
                sameDay: "[Today]",
                nextDay: "[Tomorrow]",
                nextWeek: "dddd",
                lastDay: "[Yesterday]",
                lastWeek: "[Last] dddd",
                sameElse: "L"
              })))}</div></a>`);
            }
            $$renderer4.push(`<!--]--> `);
            if (!allChatsLoaded) {
              $$renderer4.push("<!--[0-->");
              Loader($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<div class="w-full flex justify-center py-4 text-xs animate-pulse items-center gap-2">`);
                  Spinner($$renderer5, { className: " size-4" });
                  $$renderer5.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Loading..."))}</div></div>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="w-full h-full flex justify-center items-center">`);
            Spinner($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div> <div id="chat-preview" class="hidden md:flex md:flex-1 w-full overflow-y-auto h-96 md:h-[40rem] scrollbar-hidden @container">`);
          if (messages === null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="w-full h-full flex justify-center items-center text-gray-500 dark:text-gray-400 text-sm">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a conversation to preview"))}</div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="w-full h-full flex flex-col">`);
            Messages($$renderer4, {
              className: "h-full flex pt-4 pb-8 w-full",
              chatId: `chat-preview-${selectedChat?.id ?? ""}`,
              user: store_get($$store_subs ??= {}, "$user", user),
              readOnly: true,
              selectedModels,
              autoScroll: true,
              sendMessage: () => {
              },
              continueResponse: () => {
              },
              regenerateResponse: () => {
              },
              get history() {
                return history;
              },
              set history($$value) {
                history = $$value;
                $$settled = false;
              },
              get messages() {
                return messages;
              },
              set messages($$value) {
                messages = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div>`);
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
    bind_props($$props, { show, onClose });
  });
}
function PinnedModelItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let model = fallback($$props["model"], null);
    let shiftKey = fallback($$props["shiftKey"], false);
    let onClick = fallback($$props["onClick"], () => {
    });
    let onUnpin = fallback($$props["onUnpin"], () => {
    });
    if (model) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex justify-center text-gray-800 dark:text-gray-200 cursor-grab relative group"${attr("data-id", model?.id)}><a class="grow flex items-center space-x-2.5 rounded-xl px-2.5 py-[7px] group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition"${attr("href", `/?model=${stringify(model?.id)}`)} draggable="false"><div class="self-center shrink-0"><img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`)} class="size-5 rounded-full -translate-x-[0.5px]" alt="logo"/></div> <div class="flex self-center translate-y-[0.5px]"><div class="self-center text-sm font-primary line-clamp-1">${escape_html(model?.name ?? model.id)}</div></div></a> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { model, shiftKey, onClick, onUnpin });
  });
}
function PinnedModelList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedChatId = fallback($$props["selectedChatId"], null);
    let shiftKey = fallback($$props["shiftKey"], false);
    let pinnedModels = [];
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="mt-0.5 pb-1.5" id="pinned-models-list"><!--[-->`);
    const each_array = ensure_array_like(pinnedModels);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let modelId = each_array[$$index];
      const model = store_get($$store_subs ??= {}, "$models", models).find((model2) => model2.id === modelId);
      if (model) {
        $$renderer2.push("<!--[0-->");
        PinnedModelItem($$renderer2, {
          model,
          shiftKey,
          onClick: () => {
            selectedChatId = null;
            chatId.set("");
            if (store_get($$store_subs ??= {}, "$mobile", mobile)) {
              showSidebar.set(false);
            }
          },
          onUnpin: (store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).includes(modelId) ? () => {
            const pinnedModels2 = store_get($$store_subs ??= {}, "$settings", settings).pinnedModels.filter((id) => id !== modelId);
            settings.set({
              ...store_get($$store_subs ??= {}, "$settings", settings),
              pinnedModels: pinnedModels2
            });
            updateUserSettings(localStorage.token, { ui: store_get($$store_subs ??= {}, "$settings", settings) });
          } : null
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { selectedChatId, shiftKey });
  });
}
function Note($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M10 3v4a1 1 0 0 1-1 1H5m4 8h6m-6-4h6m4-8v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function HotkeyHint($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = $$props["name"];
    let className = fallback($$props["className"], "");
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { name, className });
  });
}
function Sidebar_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let shiftKey = false;
    let selectedChatId = null;
    let showCreateChannel = false;
    let allChatsLoaded = false;
    let showCreateFolderModal = false;
    let showPinnedModels = false;
    let showChannels = false;
    let showFolders = false;
    let folders$1 = {};
    let folderRegistry = {};
    const initFolders = async () => {
      if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_folders === false) {
        return;
      }
      const folderList = await getFolders(localStorage.token).catch((error) => {
        return [];
      });
      folders.set(folderList.sort((a, b) => b.updated_at - a.updated_at));
      folders$1 = {};
      for (const folder of folderList) {
        folders$1[folder.id] = { ...folders$1[folder.id] || {}, ...folder };
      }
      for (const folder of folderList) {
        if (folder.parent_id) {
          if (!folders$1[folder.parent_id]) {
            folders$1[folder.parent_id] = {};
          }
          folders$1[folder.parent_id].childrenIds = folders$1[folder.parent_id].childrenIds ? [...folders$1[folder.parent_id].childrenIds, folder.id] : [folder.id];
          folders$1[folder.parent_id].childrenIds.sort((a, b) => {
            return folders$1[b].updated_at - folders$1[a].updated_at;
          });
        }
      }
    };
    const createFolder = async ({ name, data, parent_id }) => {
      name = name?.trim();
      if (!name) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder name cannot be empty."));
        return;
      }
      const siblings = Object.values(folders$1).filter((folder) => folder.parent_id === parent_id);
      if (siblings.find((folder) => folder.name.toLowerCase() === name.toLowerCase())) {
        let i = 1;
        while (siblings.find((folder) => folder.name.toLowerCase() === `${name} ${i}`.toLowerCase())) {
          i++;
        }
        name = `${name} ${i}`;
      }
      const tempId = v4();
      folders$1 = {
        ...folders$1,
        [tempId]: {
          id: tempId,
          name,
          parent_id,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      };
      const res = await createNewFolder(localStorage.token, { name, data, parent_id }).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        await initFolders();
        showFolders = true;
      }
    };
    const initChannels = async () => {
      const res = await getChannels(localStorage.token).catch((error) => {
        return null;
      });
      if (res) {
        await channels.set(res.sort((a, b) => ["", null, "group", "dm"].indexOf(a.type) - ["", null, "group", "dm"].indexOf(b.type)));
      }
    };
    const initChatList = async () => {
      /* @__PURE__ */ console.log("initChatList");
      currentChatPage.set(1);
      allChatsLoaded = false;
      scrollPaginationEnabled.set(false);
      initFolders();
      await Promise.all([
        await (async () => {
          /* @__PURE__ */ console.log("Init tags");
          const _tags = await getAllTags(localStorage.token);
          tags.set(_tags);
        })(),
        await (async () => {
          /* @__PURE__ */ console.log("Init pinned chats");
          const _pinnedChats = await getPinnedChatList(localStorage.token);
          pinnedChats.set(_pinnedChats);
        })(),
        await (async () => {
          /* @__PURE__ */ console.log("Init chat list");
          const _chats = await getChatList(localStorage.token, store_get($$store_subs ??= {}, "$currentChatPage", currentChatPage));
          await chats.set(_chats);
        })()
      ]);
      scrollPaginationEnabled.set(true);
    };
    const isWindows = /Windows/i.test(navigator.userAgent);
    if (store_get($$store_subs ??= {}, "$selectedFolder", selectedFolder)) {
      initFolders();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ArchivedChatsModal($$renderer3, {
        onUpdate: async () => {
          await initChatList();
        },
        onDelete: (id) => {
          if (store_get($$store_subs ??= {}, "$chatId", chatId) === id) {
            goto();
            chatId.set("");
          }
        },
        get show() {
          return store_get($$store_subs ??= {}, "$showArchivedChats", showArchivedChats);
        },
        set show($$value) {
          store_set(showArchivedChats, $$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ChannelModal($$renderer3, {
        onSubmit: async (payload) => {
          let { type, name, is_private, access_grants, group_ids, user_ids } = payload ?? {};
          name = name?.trim();
          if (type === "dm") {
            if (!user_ids || user_ids.length === 0) {
              toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Please select at least one user for Direct Message channel."));
              return;
            }
          } else {
            if (!name) {
              toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Channel name cannot be empty."));
              return;
            }
          }
          const res = await createNewChannel(localStorage.token, { type, name, is_private, access_grants, group_ids, user_ids }).catch((error) => {
            toast.error(`${error}`);
            return null;
          });
          if (res) {
            store_get($$store_subs ??= {}, "$socket", socket).emit("join-channels", {
              auth: {
                token: store_get($$store_subs ??= {}, "$user", user)?.token
              }
            });
            await initChannels();
            showCreateChannel = false;
            showChannels = true;
            goto(`/channels/${res.id}`);
          }
        },
        get show() {
          return showCreateChannel;
        },
        set show($$value) {
          showCreateChannel = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      FolderModal($$renderer3, {
        onSubmit: async (folder) => {
          await createFolder(folder);
          showCreateFolderModal = false;
        },
        get show() {
          return showCreateFolderModal;
        },
        set show($$value) {
          showCreateFolderModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (store_get($$store_subs ??= {}, "$showSidebar", showSidebar)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div${attr_class(` ${stringify(store_get($$store_subs ??= {}, "$isApp", isApp) ? " ml-[4.5rem] md:ml-0" : "")} fixed md:hidden z-40 top-0 right-0 left-0 bottom-0 bg-black/60 w-full min-h-screen h-screen flex justify-center overflow-hidden overscroll-contain`)}></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      SearchModal($$renderer3, {
        onClose: () => {
          if (store_get($$store_subs ??= {}, "$mobile", mobile)) {
            showSidebar.set(false);
          }
        },
        get show() {
          return store_get($$store_subs ??= {}, "$showSearch", showSearch);
        },
        set show($$value) {
          store_set(showSearch, $$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <button id="sidebar-new-chat-button" class="hidden"></button> `);
      if (!store_get($$store_subs ??= {}, "$mobile", mobile) && !store_get($$store_subs ??= {}, "$showSidebar", showSidebar)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="pt-[7px] pb-2 px-2 flex flex-col justify-between text-black dark:text-white hover:bg-gray-50/30 dark:hover:bg-gray-950/30 h-full z-10 transition-all border-e-[0.5px] border-gray-50 dark:border-gray-850/30" id="sidebar"><button${attr_class(`flex flex-col flex-1 ${stringify(isWindows ? "cursor-pointer" : "cursor-[e-resize]")}`)}><div class="pb-1.5">`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"),
          placement: "right",
          children: ($$renderer4) => {
            $$renderer4.push(`<button${attr_class(`flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group ${stringify(isWindows ? "cursor-pointer" : "cursor-[e-resize]")}`)}${attr("aria-label", store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"))}><div class="self-center flex items-center justify-center size-9"><img${attr("src", `${stringify(WEBUI_BASE_URL)}/static/favicon.png`)} class="sidebar-new-chat-icon size-6 rounded-full group-hover:hidden" alt=""/> `);
            Sidebar($$renderer4, { className: "size-5 hidden group-hover:flex" });
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="-mt-[0.5px]"><div>`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"),
          placement: "right",
          children: ($$renderer4) => {
            $$renderer4.push(`<a class="cursor-pointer flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group" href="/" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"))}><div class="self-center flex items-center justify-center size-9">`);
            PencilSquare($$renderer4, { className: "size-4.5" });
            $$renderer4.push(`<!----></div></a>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div>`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"),
          placement: "right",
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="cursor-pointer flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}><div class="self-center flex items-center justify-center size-9">`);
            Search($$renderer4, { className: "size-4.5" });
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> `);
        if ((store_get($$store_subs ??= {}, "$config", config)?.features?.enable_notes ?? false) && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.notes ?? true))) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div>`);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"),
            placement: "right",
            children: ($$renderer4) => {
              $$renderer4.push(`<a class="cursor-pointer flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group" href="/notes" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"))}><div class="self-center flex items-center justify-center size-9">`);
              Note($$renderer4, { className: "size-4.5" });
              $$renderer4.push(`<!----></div></a>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.models || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.knowledge || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.prompts || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.tools) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div>`);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Workspace"),
            placement: "right",
            children: ($$renderer4) => {
              $$renderer4.push(`<a class="cursor-pointer flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group" href="/workspace"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Workspace"))} draggable="false"><div class="self-center flex items-center justify-center size-9"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"></path></svg></div></a>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></button> <div><div><div class="py-2 flex justify-center items-center">`);
        if (store_get($$store_subs ??= {}, "$user", user) !== void 0 && store_get($$store_subs ??= {}, "$user", user) !== null) {
          $$renderer3.push("<!--[0-->");
          UserMenu($$renderer3, {
            role: store_get($$store_subs ??= {}, "$user", user)?.role,
            profile: store_get($$store_subs ??= {}, "$config", config)?.features?.enable_user_status ?? true,
            showActiveUsers: false,
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="cursor-pointer flex rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition group"><div class="self-center relative"><img${attr("src", `${WEBUI_API_BASE_URL}/users/${store_get($$store_subs ??= {}, "$user", user)?.id}/profile/image`)} class="size-7 object-cover rounded-full"${attr("alt", store_get($$store_subs ??= {}, "$i18n", i18n).t("Open User Profile Menu"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Open User Profile Menu"))}/> `);
              if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_user_status) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="absolute -bottom-0.5 -right-0.5"><span class="relative flex size-2.5"><span${attr_class(`relative inline-flex size-2.5 rounded-full ${stringify("bg-green-500")} border-2 border-white dark:border-gray-900`)}></span></span></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div></div>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->  `);
      if (store_get($$store_subs ??= {}, "$showSidebar", showSidebar)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div id="sidebar"${attr_class(`h-screen max-h-[100dvh] min-h-screen select-none ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? `${store_get($$store_subs ??= {}, "$mobile", mobile) ? "bg-gray-50 dark:bg-gray-950" : "bg-gray-50/70 dark:bg-gray-950/70"} z-50` : " bg-transparent z-0 ")} ${stringify(store_get($$store_subs ??= {}, "$isApp", isApp) ? `ml-[4.5rem] md:ml-0 ` : " transition-all duration-300 ")} shrink-0 text-gray-900 dark:text-gray-200 text-sm fixed top-0 left-0 overflow-x-hidden `)}${attr("data-state", store_get($$store_subs ??= {}, "$showSidebar", showSidebar))}><div${attr_class(` my-auto flex flex-col justify-between h-screen max-h-[100dvh] w-[var(--sidebar-width)] overflow-x-hidden scrollbar-hidden z-50 ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "" : "invisible")}`)}><div class="sidebar px-[0.5625rem] pt-2 pb-1.5 flex justify-between space-x-1 text-gray-600 dark:text-gray-400 sticky top-0 z-10 -mb-3"><a class="flex items-center rounded-xl size-8.5 h-full justify-center hover:bg-gray-100/50 dark:hover:bg-gray-850/50 transition no-drag-region" href="/" draggable="false"><img crossorigin="anonymous"${attr("src", `${stringify(WEBUI_BASE_URL)}/static/favicon.png`)} class="sidebar-new-chat-icon size-6 rounded-full" alt=""/></a> <a href="/" class="flex flex-1 px-1.5"><div id="sidebar-webui-name" class="self-center font-medium text-gray-850 dark:text-white font-primary">${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}</div></a> `);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"),
          placement: "bottom",
          children: ($$renderer4) => {
            $$renderer4.push(`<button${attr_class(`flex rounded-xl size-8.5 justify-center items-center hover:bg-gray-100/50 dark:hover:bg-gray-850/50 transition ${stringify(isWindows ? "cursor-pointer" : "cursor-[w-resize]")}`)}${attr("aria-label", store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Open Sidebar"))}><div class="self-center p-1.5">`);
            Sidebar($$renderer4, {});
            $$renderer4.push(`<!----></div></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> <div${attr_class(`${stringify("invisible")} sidebar-bg-gradient-to-b bg-linear-to-b from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mb-6`)}></div></div> <div class="relative flex flex-col flex-1 overflow-y-auto scrollbar-hidden pt-3 pb-3"><div class="pb-1.5"><div class="px-[0.4375rem] flex justify-center text-gray-800 dark:text-gray-200"><a id="sidebar-new-chat-button" class="group grow flex items-center space-x-3 rounded-2xl px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition outline-none" href="/" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"))}><div class="self-center">`);
        PencilSquare($$renderer3, { className: " size-4.5", strokeWidth: "2" });
        $$renderer3.push(`<!----></div> <div class="flex flex-1 self-center translate-y-[0.5px]"><div class="self-center text-sm font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("New Chat"))}</div></div> `);
        HotkeyHint($$renderer3, { name: "newChat", className: " group-hover:visible invisible" });
        $$renderer3.push(`<!----></a></div> <div class="px-[0.4375rem] flex justify-center text-gray-800 dark:text-gray-200"><button id="sidebar-search-button" class="group grow flex items-center space-x-3 rounded-2xl px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition outline-none" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}><div class="self-center">`);
        Search($$renderer3, { strokeWidth: "2", className: "size-4.5" });
        $$renderer3.push(`<!----></div> <div class="flex flex-1 self-center translate-y-[0.5px]"><div class="self-center text-sm font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}</div></div> `);
        HotkeyHint($$renderer3, { name: "search", className: " group-hover:visible invisible" });
        $$renderer3.push(`<!----></button></div> `);
        if ((store_get($$store_subs ??= {}, "$config", config)?.features?.enable_notes ?? false) && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.notes ?? true))) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="px-[0.4375rem] flex justify-center text-gray-800 dark:text-gray-200"><a id="sidebar-notes-button" class="grow flex items-center space-x-3 rounded-2xl px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition" href="/notes" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"))}><div class="self-center">`);
          Note($$renderer3, { className: "size-4.5", strokeWidth: "2" });
          $$renderer3.push(`<!----></div> <div class="flex self-center translate-y-[0.5px]"><div class="self-center text-sm font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"))}</div></div></a></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.models || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.knowledge || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.prompts || store_get($$store_subs ??= {}, "$user", user)?.permissions?.workspace?.tools) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="px-[0.4375rem] flex justify-center text-gray-800 dark:text-gray-200"><a id="sidebar-workspace-button" class="grow flex items-center space-x-3 rounded-2xl px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition" href="/workspace" draggable="false"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Workspace"))}><div class="self-center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"></path></svg></div> <div class="flex self-center translate-y-[0.5px]"><div class="self-center text-sm font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Workspace"))}</div></div></a></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> `);
        if ((store_get($$store_subs ??= {}, "$models", models) ?? []).length > 0 && ((store_get($$store_subs ??= {}, "$settings", settings)?.pinnedModels ?? []).length > 0 || store_get($$store_subs ??= {}, "$config", config)?.default_pinned_models)) {
          $$renderer3.push("<!--[0-->");
          Folder($$renderer3, {
            id: "sidebar-models",
            className: "px-2 mt-0.5",
            name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"),
            chevron: false,
            dragAndDrop: false,
            get open() {
              return showPinnedModels;
            },
            set open($$value) {
              showPinnedModels = $$value;
              $$settled = false;
            },
            children: ($$renderer4) => {
              PinnedModelList($$renderer4, {
                shiftKey,
                get selectedChatId() {
                  return selectedChatId;
                },
                set selectedChatId($$value) {
                  selectedChatId = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_channels && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.channels ?? true))) {
          $$renderer3.push("<!--[0-->");
          Folder($$renderer3, {
            id: "sidebar-channels",
            className: "px-2 mt-0.5",
            name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Channels"),
            chevron: false,
            dragAndDrop: false,
            onAdd: store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.channels ?? true) ? async () => {
              await tick();
              setTimeout(
                () => {
                  showCreateChannel = true;
                },
                0
              );
            } : null,
            onAddLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Channel"),
            get open() {
              return showChannels;
            },
            set open($$value) {
              showChannels = $$value;
              $$settled = false;
            },
            children: ($$renderer4) => {
              $$renderer4.push(`<!--[-->`);
              const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$channels", channels));
              for (let channelIdx = 0, $$length = each_array.length; channelIdx < $$length; channelIdx++) {
                let channel = each_array[channelIdx];
                ChannelItem($$renderer4, {
                  channel,
                  onUpdate: async () => {
                    await initChannels();
                  }
                });
                $$renderer4.push(`<!----> `);
                if (channelIdx < store_get($$store_subs ??= {}, "$channels", channels).length - 1 && channel.type !== store_get($$store_subs ??= {}, "$channels", channels)[channelIdx + 1]?.type) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<hr class="border-gray-100/40 dark:border-gray-800/10 my-1.5 w-full"/>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]-->`);
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_folders && (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.folders ?? true))) {
          $$renderer3.push("<!--[0-->");
          Folder($$renderer3, {
            id: "sidebar-folders",
            className: "px-2 mt-0.5",
            name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Folders"),
            chevron: false,
            onAdd: () => {
              showCreateFolderModal = true;
            },
            onAddLabel: store_get($$store_subs ??= {}, "$i18n", i18n).t("New Folder"),
            get open() {
              return showFolders;
            },
            set open($$value) {
              showFolders = $$value;
              $$settled = false;
            },
            children: ($$renderer4) => {
              Folders($$renderer4, {
                folders: folders$1,
                shiftKey,
                onDelete: (folderId) => {
                  selectedFolder.set(null);
                  initChatList();
                },
                get folderRegistry() {
                  return folderRegistry;
                },
                set folderRegistry($$value) {
                  folderRegistry = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        Folder($$renderer3, {
          id: "sidebar-chats",
          className: "px-2 mt-0.5",
          name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Chats"),
          chevron: false,
          children: ($$renderer4) => {
            if (store_get($$store_subs ??= {}, "$pinnedChats", pinnedChats).length > 0) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<div class="mb-1"><div class="flex flex-col space-y-1 rounded-xl">`);
              Folder($$renderer4, {
                id: "sidebar-pinned-chats",
                buttonClassName: " text-gray-500",
                name: store_get($$store_subs ??= {}, "$i18n", i18n).t("Pinned"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<div class="ml-3 pl-1 mt-[1px] flex flex-col overflow-y-auto scrollbar-hidden border-s border-gray-100 dark:border-gray-900 text-gray-900 dark:text-gray-200"><!--[-->`);
                  const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$pinnedChats", pinnedChats));
                  for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
                    let chat = each_array_1[idx];
                    ChatItem($$renderer5, {
                      className: "",
                      id: chat.id,
                      title: chat.title,
                      createdAt: chat.created_at,
                      shiftKey,
                      selected: selectedChatId === chat.id
                    });
                  }
                  $$renderer5.push(`<!--]--></div>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!----></div></div>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--> <div class="flex-1 flex flex-col overflow-y-auto scrollbar-hidden"><div class="pt-1.5">`);
            if (store_get($$store_subs ??= {}, "$chats", chats)) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<!--[-->`);
              const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$chats", chats));
              for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
                let chat = each_array_2[idx];
                if (idx === 0 || idx > 0 && chat.time_range !== store_get($$store_subs ??= {}, "$chats", chats)[idx - 1].time_range) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<div${attr_class(`w-full pl-2.5 text-xs text-gray-500 dark:text-gray-500 font-medium ${stringify(idx === 0 ? "" : "pt-5")} pb-1.5`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(chat.time_range))}</div>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]--> `);
                ChatItem($$renderer4, {
                  className: "",
                  id: chat.id,
                  title: chat.title,
                  createdAt: chat.created_at,
                  shiftKey,
                  selected: selectedChatId === chat.id
                });
                $$renderer4.push(`<!---->`);
              }
              $$renderer4.push(`<!--]--> `);
              if (store_get($$store_subs ??= {}, "$scrollPaginationEnabled", scrollPaginationEnabled) && !allChatsLoaded) {
                $$renderer4.push("<!--[0-->");
                Loader($$renderer4, {
                  children: ($$renderer5) => {
                    $$renderer5.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
                    Spinner($$renderer5, { className: " size-4" });
                    $$renderer5.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Loading..."))}</div></div>`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]-->`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
              Spinner($$renderer4, { className: " size-4" });
              $$renderer4.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Loading..."))}</div></div>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="px-1.5 pt-1.5 pb-2 sticky bottom-0 z-10 -mt-3 sidebar"><div class="sidebar-bg-gradient-to-t bg-linear-to-t from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mt-6"></div> <div class="flex flex-col font-primary">`);
        if (store_get($$store_subs ??= {}, "$user", user) !== void 0 && store_get($$store_subs ??= {}, "$user", user) !== null) {
          $$renderer3.push("<!--[0-->");
          UserMenu($$renderer3, {
            role: store_get($$store_subs ??= {}, "$user", user)?.role,
            profile: store_get($$store_subs ??= {}, "$config", config)?.features?.enable_user_status ?? true,
            showActiveUsers: false,
            className: "w-[calc(var(--sidebar-width)-1rem)]",
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="flex items-center rounded-2xl py-2 px-1.5 w-full hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition"><div class="self-center mr-3 relative"><img${attr("src", `${WEBUI_API_BASE_URL}/users/${store_get($$store_subs ??= {}, "$user", user)?.id}/profile/image`)} class="size-7 object-cover rounded-full"${attr("alt", store_get($$store_subs ??= {}, "$i18n", i18n).t("Open User Profile Menu"))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Open User Profile Menu"))}/> `);
              if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_user_status) {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<div class="absolute -bottom-0.5 -right-0.5"><span class="relative flex size-2.5"><span${attr_class(`relative inline-flex size-2.5 rounded-full ${stringify("bg-green-500")} border-2 border-white dark:border-gray-900`)}></span></span></div>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]--></div> <div class="self-center font-medium">${escape_html(store_get($$store_subs ??= {}, "$user", user)?.name)}</div></div>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div></div></div> `);
        if (!store_get($$store_subs ??= {}, "$mobile", mobile)) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="relative flex items-center justify-center group border-l border-gray-50 dark:border-gray-850/30 hover:border-gray-200 dark:hover:border-gray-800 transition z-20" id="sidebar-resizer" role="separator"><div class="absolute -left-1.5 -right-1.5 -top-0 -bottom-0 z-20 cursor-col-resize bg-transparent"></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
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
  });
}
function General($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveSettings = $$props["saveSettings"];
    let getModels2 = $$props["getModels"];
    let selectedTheme = "system";
    let languages = [];
    let lang = store_get($$store_subs ??= {}, "$i18n", i18n).language;
    let notificationEnabled = false;
    let system = "";
    let showAdvanced = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col h-full justify-between text-sm" id="tab-general"><div class="overflow-y-scroll max-h-[28rem] md:max-h-full"><div><div class="mb-1 text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("WebUI Settings"))}</div> <div class="flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Theme"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: `w-fit pr-8 rounded-sm py-2 px-2 text-xs bg-transparent text-right ${stringify(store_get($$store_subs ??= {}, "$settings", settings).highContrastMode ? "" : "outline-hidden")}`,
          value: selectedTheme,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a theme")
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "system" }, ($$renderer5) => {
            $$renderer5.push(`⚙️ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("System"))}`);
          });
          $$renderer4.option({ value: "dark" }, ($$renderer5) => {
            $$renderer5.push(`🌑 ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Dark"))}`);
          });
          $$renderer4.option({ value: "oled-dark" }, ($$renderer5) => {
            $$renderer5.push(`🌃 ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OLED Dark"))}`);
          });
          $$renderer4.option({ value: "light" }, ($$renderer5) => {
            $$renderer5.push(`☀️ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Light"))}`);
          });
          if (store_get($$store_subs ??= {}, "$config", config)?.features?.enable_easter_eggs) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.option({ value: "her" }, ($$renderer5) => {
              $$renderer5.push(`🌷 Her`);
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div></div> <div class="flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Language"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: `w-fit pr-8 rounded-sm py-2 px-2 text-xs bg-transparent text-right ${stringify(store_get($$store_subs ??= {}, "$settings", settings).highContrastMode ? "" : "outline-hidden")}`,
          value: lang,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a language")
        },
        ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(languages);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let language = each_array[$$index];
            $$renderer4.option({ value: language["code"] }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(language["title"])}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div></div> `);
      if (store_get($$store_subs ??= {}, "$i18n", i18n).language === "en-US" && !(store_get($$store_subs ??= {}, "$config", config)?.license_metadata ?? false)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div${attr_class(`mb-2 text-xs ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}`)}>Couldn't find your language? <a${attr_class(`font-medium underline ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-700 dark:text-gray-200" : "text-gray-300")}`)} href="https://github.com/open-webui/open-webui/blob/main/docs/CONTRIBUTING.md#-translations-and-internationalization" target="_blank">Help us translate Open WebUI!</a></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div><div class="py-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Notifications"))}</div> <button class="p-1 px-3 text-xs flex rounded-sm transition" type="button" role="switch"${attr("aria-checked", notificationEnabled)}>`);
      {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<span class="ml-2 self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Off"))}</span>`);
      }
      $$renderer3.push(`<!--]--></button></div></div></div> `);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.controls ?? true) && (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.system_prompt ?? true)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<hr class="border-gray-100/30 dark:border-gray-850/30 my-3"/> <div><div class="my-2.5 text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("System Prompt"))}</div> `);
        Textarea($$renderer3, {
          className: "w-full text-sm outline-hidden resize-vertical" + (store_get($$store_subs ??= {}, "$settings", settings).highContrastMode ? " p-2.5 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 overflow-y-hidden" : "  dark:text-gray-300 "),
          rows: "4",
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter system prompt here"),
          get value() {
            return system;
          },
          set value($$value) {
            system = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.controls ?? true) && (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.params ?? true)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="mt-2 space-y-3 pr-1.5"><div class="flex justify-between items-center text-sm"><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Advanced Parameters"))}</div> <button${attr_class(` text-xs font-medium ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}`)} type="button"${attr("aria-expanded", showAdvanced)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Show"))}</button></div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveSettings, getModels: getModels2 });
  });
}
function DatabaseSettings($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6V12C4 12 4 15 11 15C18 15 18 12 18 12V6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 3C18 3 18 6 18 6C18 6 18 9 11 9C4 9 4 6 4 6C4 6 4 3 11 3Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 21C4 21 4 18 4 18V12" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 21C20.1046 21 21 20.1046 21 19C21 17.8954 20.1046 17 19 17C18.6357 17 18.2942 17.0974 18 17.2676C17.4022 17.6134 17 18.2597 17 19C17 19.7403 17.4022 20.3866 18 20.7324C18.2942 20.9026 18.6357 21 19 21Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 22C20.6569 22 22 20.6569 22 19C22 17.3431 20.6569 16 19 16C17.3431 16 16 17.3431 16 19C16 20.6569 17.3431 22 19 22Z" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0.3 2"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SettingsAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function UserCircle($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SoundHigh($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 13.8571V10.1429C1 9.03829 1.89543 8.14286 3 8.14286H5.9C6.09569 8.14286 6.28708 8.08544 6.45046 7.97772L12.4495 4.02228C13.1144 3.5839 14 4.06075 14 4.85714V19.1429C14 19.9392 13.1144 20.4161 12.4495 19.9777L6.45046 16.0223C6.28708 15.9146 6.09569 15.8571 5.9 15.8571H3C1.89543 15.8571 1 14.9617 1 13.8571Z"></path><path d="M17.5 7.5C17.5 7.5 19 9 19 11.5C19 14 17.5 15.5 17.5 15.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20.5 4.5C20.5 4.5 23 7 23 11.5C23 16 20.5 18.5 20.5 18.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function InfoCircle($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11.5V16.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 7.51L12.01 7.49889" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Face($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 8L16 10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 8L8 10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 8L12 13L11 13" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AppNotification($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 8C20.6569 8 22 6.65685 22 5C22 3.34315 20.6569 2 19 2C17.3431 2 16 3.34315 16 5C16 6.65685 17.3431 8 19 8Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 12V15C21 18.3137 18.3137 21 15 21H9C5.68629 21 3 18.3137 3 15V9C3 5.68629 5.68629 3 9 3H12" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function UserBadgeCheck($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2 20V19C2 15.134 5.13401 12 9 12V12" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.8038 12.3135C16.4456 11.6088 17.5544 11.6088 18.1962 12.3135V12.3135C18.5206 12.6697 18.9868 12.8628 19.468 12.8403V12.8403C20.4201 12.7958 21.2042 13.5799 21.1597 14.532V14.532C21.1372 15.0132 21.3303 15.4794 21.6865 15.8038V15.8038C22.3912 16.4456 22.3912 17.5544 21.6865 18.1962V18.1962C21.3303 18.5206 21.1372 18.9868 21.1597 19.468V19.468C21.2042 20.4201 20.4201 21.2042 19.468 21.1597V21.1597C18.9868 21.1372 18.5206 21.3303 18.1962 21.6865V21.6865C17.5544 22.3912 16.4456 22.3912 15.8038 21.6865V21.6865C15.4794 21.3303 15.0132 21.1372 14.532 21.1597V21.1597C13.5799 21.2042 12.7958 20.4201 12.8403 19.468V19.468C12.8628 18.9868 12.6697 18.5206 12.3135 18.1962V18.1962C11.6088 17.5544 11.6088 16.4456 12.3135 15.8038V15.8038C12.6697 15.4794 12.8628 15.0132 12.8403 14.532V14.532C12.7958 13.5799 13.5799 12.7958 14.532 12.8403V12.8403C15.0132 12.8628 15.4794 12.6697 15.8038 12.3135V12.3135Z"></path><path d="M15.3636 17L16.4546 18.0909L18.6364 15.9091" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 12C11.2091 12 13 10.2091 13 8C13 5.79086 11.2091 4 9 4C6.79086 4 5 5.79086 5 8C5 10.2091 6.79086 12 9 12Z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SettingsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let filteredSettings = [];
    let search = "";
    const saveSettings = async (updated) => {
      /* @__PURE__ */ console.log(updated);
      await settings.set({
        ...store_get($$store_subs ??= {}, "$settings", settings),
        ...updated
      });
      await models.set(await getModels$1());
      await updateUserSettings(localStorage.token, { ui: store_get($$store_subs ??= {}, "$settings", settings) });
    };
    const getModels$1 = async () => {
      return await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null));
    };
    let selectedTab = "general";
    const scrollHandler = (event) => {
      const settingsTabsContainer = document.getElementById("settings-tabs-container");
      if (settingsTabsContainer) {
        event.preventDefault();
        settingsTabsContainer.scrollLeft += event.deltaY;
      }
    };
    const addScrollListener = async () => {
      await tick();
      const settingsTabsContainer = document.getElementById("settings-tabs-container");
      if (settingsTabsContainer) {
        settingsTabsContainer.addEventListener("wheel", scrollHandler);
      }
    };
    const removeScrollListener = async () => {
      await tick();
      const settingsTabsContainer = document.getElementById("settings-tabs-container");
      if (settingsTabsContainer) {
        settingsTabsContainer.removeEventListener("wheel", scrollHandler);
      }
    };
    if (show) {
      addScrollListener();
    } else {
      removeScrollListener();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "2xl",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="text-gray-700 dark:text-gray-100 mx-1"><div class="flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))}</div> <button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close settings modal"))} class="self-center">`);
          XMark($$renderer4, { className: "w-5 h-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full pt-1 pb-4"><div role="tablist" id="settings-tabs-container" class="tabs flex flex-row overflow-x-auto gap-2.5 mx-3 md:pr-4 md:gap-1 md:flex-col flex-1 md:flex-none md:w-50 md:min-h-[42rem] md:max-h-[42rem] dark:text-gray-200 text-sm text-left mb-1 md:mb-0 -translate-y-1 svelte-12km1ip"><div class="hidden md:flex w-full rounded-full px-2.5 gap-2 bg-gray-100/80 dark:bg-gray-850/80 backdrop-blur-2xl my-1 mb-1.5" id="settings-search"><div class="self-center rounded-l-xl bg-transparent">`);
          Search($$renderer4, {
            className: "size-3.5",
            strokeWidth: store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "3" : "1.5"
          });
          $$renderer4.push(`<!----></div> <label class="sr-only" for="search-input-settings-modal">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}</label> <input${attr_class(
            `w-full py-1 text-sm bg-transparent dark:text-gray-300 outline-hidden
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder-gray-800" : ""}`,
            "svelte-12km1ip"
          )}${attr("value", search)} id="search-input-settings-modal"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}/></div> `);
          if (filteredSettings.length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(filteredSettings);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let tabId = each_array[$$index];
              if (tabId === "general") {
                $$renderer4.push("<!--[0-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-general"${attr("aria-selected", selectedTab === "general")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:bg-gray-800 bg-gray-200" : ""}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                SettingsAlt($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("General"))}</div></button>`);
              } else if (tabId === "interface") {
                $$renderer4.push("<!--[1-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-interface"${attr("aria-selected", selectedTab === "interface")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                AppNotification($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Interface"))}</div></button>`);
              } else if (tabId === "connections") {
                $$renderer4.push("<!--[2-->");
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.role === "user" && store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button role="tab" aria-controls="tab-connections"${attr("aria-selected", selectedTab === "connections")}${attr_class(
                    `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                    "svelte-12km1ip"
                  )}><div class="self-center mr-2">`);
                  Link($$renderer4, { strokeWidth: "2" });
                  $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connections"))}</div></button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]-->`);
              } else if (tabId === "tools") {
                $$renderer4.push("<!--[3-->");
                if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || store_get($$store_subs ??= {}, "$user", user)?.role === "user" && store_get($$store_subs ??= {}, "$user", user)?.permissions?.features?.direct_tool_servers) {
                  $$renderer4.push("<!--[0-->");
                  $$renderer4.push(`<button role="tab" aria-controls="tab-tools"${attr("aria-selected", selectedTab === "tools")}${attr_class(
                    `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                    "svelte-12km1ip"
                  )}><div class="self-center mr-2">`);
                  WrenchAlt($$renderer4, { strokeWidth: "2" });
                  $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Integrations"))}</div></button>`);
                } else {
                  $$renderer4.push("<!--[-1-->");
                }
                $$renderer4.push(`<!--]-->`);
              } else if (tabId === "personalization") {
                $$renderer4.push("<!--[4-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-personalization"${attr("aria-selected", selectedTab === "personalization")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                Face($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Personalization"))}</div></button>`);
              } else if (tabId === "audio") {
                $$renderer4.push("<!--[5-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-audio"${attr("aria-selected", selectedTab === "audio")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                SoundHigh($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Audio"))}</div></button>`);
              } else if (tabId === "data_controls") {
                $$renderer4.push("<!--[6-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-data-controls"${attr("aria-selected", selectedTab === "data_controls")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                DatabaseSettings($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Data Controls"))}</div></button>`);
              } else if (tabId === "account") {
                $$renderer4.push("<!--[7-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-account"${attr("aria-selected", selectedTab === "account")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                UserCircle($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Account"))}</div></button>`);
              } else if (tabId === "about") {
                $$renderer4.push("<!--[8-->");
                $$renderer4.push(`<button role="tab" aria-controls="tab-about"${attr("aria-selected", selectedTab === "about")}${attr_class(
                  `px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"}`,
                  "svelte-12km1ip"
                )}><div class="self-center mr-2">`);
                InfoCircle($$renderer4, { strokeWidth: "2" });
                $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("About"))}</div></button>`);
              } else {
                $$renderer4.push("<!--[-1-->");
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<div class="text-center text-gray-500 mt-4">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No results found"))}</div>`);
          }
          $$renderer4.push(`<!--]--> `);
          if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<a href="/admin/settings" draggable="false"${attr_class(`px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none md:mt-auto flex select-none text-left transition ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ? "hover:bg-gray-200 dark:hover:bg-gray-800" : "text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2">`);
            UserBadgeCheck($$renderer4, { strokeWidth: "2" });
            $$renderer4.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Admin Settings"))}</div></a>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex-1 px-3.5 md:pl-0 md:pr-4.5 md:min-h-[42rem] max-h-[42rem]">`);
          {
            $$renderer4.push("<!--[0-->");
            General($$renderer4, { getModels: getModels$1, saveSettings });
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
    bind_props($$props, { show });
  });
}
function ChangelogModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let changelog = null;
    const init = async () => {
      changelog = await getChangelog();
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "xl",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="px-6 pt-5 dark:text-white text-black"><div class="flex justify-between items-start"><h2 class="text-xl font-medium m-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("What's New in"))}
				${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))} `);
          Confetti($$renderer4, { x: [-1, -0.25], y: [0, 0.5] });
          $$renderer4.push(`<!----></h2> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex items-center mt-1"><div class="text-sm dark:text-gray-200">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Release Notes"))}</div> <div class="flex self-center w-[1px] h-6 mx-2.5 bg-gray-50/50 dark:bg-gray-850/50"></div> <div class="text-sm dark:text-gray-200">v${escape_html(WEBUI_VERSION)}</div></div></div> <div class="w-full p-4 px-5 text-gray-700 dark:text-gray-100"><div class="overflow-y-scroll max-h-[30rem] scrollbar-hidden"><div class="mb-3">`);
          if (changelog) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(Object.keys(changelog));
            for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
              let version = each_array[$$index_2];
              $$renderer4.push(`<div class="mb-3 pr-2"><h3 class="font-semibold text-xl mb-1 dark:text-white m-0">v${escape_html(version)} - ${escape_html(changelog[version].date)}</h3> <hr class="border-gray-50/50 dark:border-gray-850/50 my-2"/> <!--[-->`);
              const each_array_1 = ensure_array_like(Object.keys(changelog[version]).filter((section) => section !== "date"));
              for (let $$index_1 = 0, $$length2 = each_array_1.length; $$index_1 < $$length2; $$index_1++) {
                let section = each_array_1[$$index_1];
                $$renderer4.push(`<div class="w-full"><div${attr_class(`font-semibold uppercase text-xs ${stringify(section === "added" ? "bg-blue-500/20 text-blue-700 dark:text-blue-200" : section === "fixed" ? "bg-green-500/20 text-green-700 dark:text-green-200" : section === "changed" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-200" : section === "removed" ? "bg-red-500/20 text-red-700 dark:text-red-200" : "")} w-fit rounded-xl px-2 my-2.5`)}>${escape_html(section)}</div> <div class="my-2.5 px-1.5 markdown-prose-sm !list-none !w-full !max-w-none"><!--[-->`);
                const each_array_2 = ensure_array_like(changelog[version][section]);
                for (let $$index = 0, $$length3 = each_array_2.length; $$index < $$length3; $$index++) {
                  let entry = each_array_2[$$index];
                  $$renderer4.push(`<div class="my-2">${html(DOMPurify.sanitize(entry?.raw))}</div>`);
                }
                $$renderer4.push(`<!--]--></div></div>`);
              }
              $$renderer4.push(`<!--]--></div>`);
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--></div></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full"><span class="relative">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Okay, Let's Go!"))}</span></button></div></div>`);
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
    bind_props($$props, { show });
  });
}
function AccountPending($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    $$renderer2.push(`<div class="fixed w-full h-full flex z-999"><div class="absolute w-full h-full backdrop-blur-lg bg-white/10 dark:bg-gray-900/50 flex justify-center"><div class="m-auto pb-10 flex flex-col justify-center"><div class="max-w-md"><div class="text-center dark:text-white text-2xl font-medium z-50" style="white-space: pre-wrap;">`);
    if ((store_get($$store_subs ??= {}, "$config", config)?.ui?.pending_user_overlay_title ?? "").trim() !== "") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$config", config).ui.pending_user_overlay_title)}`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Account Activation Pending"))}<br/> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Contact Admin for WebUI Access"))}`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-4 text-center text-sm dark:text-gray-200 w-full" style="white-space: pre-wrap;">`);
    if ((store_get($$store_subs ??= {}, "$config", config)?.ui?.pending_user_overlay_content ?? "").trim() !== "") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${html(marked.parse(DOMPurify.sanitize((store_get($$store_subs ??= {}, "$config", config)?.ui?.pending_user_overlay_content ?? "").replace(/\n/g, "<br>"))))}`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Your account status is currently pending activation."))}
${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("To access the WebUI, please reach out to the administrator. Admins can manage user statuses from the Admin Panel."))}`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="mt-6 mx-auto relative group w-fit"><button class="relative z-20 flex px-5 py-2 rounded-full bg-white border border-gray-100 dark:border-none hover:bg-gray-100 text-gray-700 transition font-medium text-sm">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Check Again"))}</button> <button class="text-xs text-center w-full mt-2 text-gray-400 underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Sign Out"))}</button></div></div></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let localDBChats = [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SettingsModal($$renderer3, {
        get show() {
          return store_get($$store_subs ??= {}, "$showSettings", showSettings);
        },
        set show($$value) {
          store_set(showSettings, $$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ChangelogModal($$renderer3, {
        get show() {
          return store_get($$store_subs ??= {}, "$showChangelog", showChangelog);
        },
        set show($$value) {
          store_set(showChangelog, $$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$user", user)) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="app relative"><div class="text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 h-screen max-h-[100dvh] overflow-auto flex flex-row justify-end">`);
        if (!["user", "admin"].includes(store_get($$store_subs ??= {}, "$user", user)?.role)) {
          $$renderer3.push("<!--[0-->");
          AccountPending($$renderer3);
        } else {
          $$renderer3.push("<!--[-1-->");
          if (localDBChats.length > 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="fixed w-full h-full flex z-50"><div class="absolute w-full h-full backdrop-blur-md bg-white/20 dark:bg-gray-900/50 flex justify-center"><div class="m-auto pb-44 flex flex-col justify-center"><div class="max-w-md"><div class="text-center dark:text-white text-2xl font-medium z-50">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Important Update"))}<br/> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Action Required for Chat Log Storage"))}</div> <div class="mt-4 text-center text-sm dark:text-gray-200 w-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Saving chat logs directly to your browser's storage is no longer supported. Please take a moment to download and delete your chat logs by clicking the button below. Don't worry, you can easily re-import your chat logs to the backend through"))} <span class="font-medium dark:text-white">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))} > ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Chats"))} > ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import Chats"))}</span>. ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("This ensures that your valuable conversations are securely saved to your backend database. Thank you!"))}</div> <div class="mt-6 mx-auto relative group w-fit"><button class="relative z-20 flex px-5 py-2 rounded-full bg-white border border-gray-100 dark:border-none hover:bg-gray-100 transition font-medium text-sm">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download & Delete"))}</button> <button class="text-xs text-center w-full mt-2 text-gray-400 underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}</button></div></div></div></div></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          Sidebar_1($$renderer3);
          $$renderer3.push(`<!----> `);
          {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<div${attr_class(`w-full flex-1 h-full flex items-center justify-center ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "  md:max-w-[calc(100%-var(--sidebar-width))]" : " ")}`)}>`);
            Spinner($$renderer3, { className: "size-5" });
            $$renderer3.push(`<!----></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div></div>`);
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
  });
}
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
