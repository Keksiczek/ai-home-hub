import { o as getContext, c as store_get, u as unsubscribe_stores, q as head, k as escape_html, d as attr_class, t as stringify, a as attr } from "../../../../chunks/root.js";
import { t as tick } from "../../../../chunks/index-server.js";
import { g as goto } from "../../../../chunks/client.js";
import { p as page } from "../../../../chunks/stores.js";
import dayjs from "dayjs";
import { h as settings, m as models, c as config, a as chatId, W as WEBUI_NAME } from "../../../../chunks/index2.js";
import { c as createMessagesList, t as convertMessagesToHistory } from "../../../../chunks/index3.js";
import { p as getChatByShareId } from "../../../../chunks/index5.js";
import { M as Messages } from "../../../../chunks/Messages.js";
import { f as getUserSettings, e as getUserInfoById } from "../../../../chunks/Badge.js";
import { g as getModels } from "../../../../chunks/index6.js";
import "../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(localizedFormat);
    let loaded = false;
    let autoScroll = true;
    let processing = "";
    let selectedModels = [""];
    let chat = null;
    let user = null;
    let title = "";
    let files = [];
    let messages = [];
    let history = { messages: {}, currentId: null };
    const loadSharedChat = async () => {
      const userSettings = await getUserSettings(localStorage.token).catch((error) => {
        /* @__PURE__ */ console.error(error);
        return null;
      });
      if (userSettings) {
        settings.set(userSettings.ui);
      } else {
        let localStorageSettings = {};
        try {
          localStorageSettings = JSON.parse(localStorage.getItem("settings") ?? "{}");
        } catch (e) {
          /* @__PURE__ */ console.error("Failed to parse settings from localStorage", e);
        }
        settings.set(localStorageSettings);
      }
      await models.set(await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null)));
      await chatId.set(store_get($$store_subs ??= {}, "$page", page).params.id);
      chat = await getChatByShareId(localStorage.token, store_get($$store_subs ??= {}, "$chatId", chatId)).catch(async (error) => {
        await goto();
        return null;
      });
      if (chat) {
        user = await getUserInfoById(localStorage.token, chat.user_id).catch((error) => {
          /* @__PURE__ */ console.error(error);
          return null;
        });
        const chatContent = chat.chat;
        if (chatContent) {
          /* @__PURE__ */ console.log(chatContent);
          selectedModels = (chatContent?.models ?? void 0) !== void 0 ? chatContent.models : [chatContent.models ?? ""];
          history = (chatContent?.history ?? void 0) !== void 0 ? chatContent.history : convertMessagesToHistory(chatContent.messages);
          title = chatContent.title;
          autoScroll = true;
          await tick();
          if (messages.length > 0 && messages.at(-1)?.id && messages.at(-1)?.id in history.messages) {
            history.messages[messages.at(-1)?.id].done = true;
          }
          await tick();
          return true;
        } else {
          return null;
        }
      }
    };
    messages = createMessagesList(history, history.currentId);
    if (store_get($$store_subs ??= {}, "$page", page).params.id) {
      (async () => {
        if (await loadSharedChat()) {
          await tick();
          loaded = true;
        } else {
          await goto();
        }
      })();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("hrl0ku", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(title ? `${title.length > 30 ? `${title.slice(0, 30)}...` : title} • ${store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME)}` : `${store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME)}`)}
	</title>`);
        });
      });
      if (loaded) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="h-screen max-h-[100dvh] w-full flex flex-col text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900"><div class="flex flex-col flex-auto justify-center relative"><div class="flex flex-col w-full flex-auto overflow-auto h-0" id="messages-container"><div${attr_class(`pt-5 px-2 w-full ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.widescreenMode ?? null ? "max-w-full" : "max-w-5xl")} mx-auto`)}><div class="px-3"><h1 class="text-2xl font-medium line-clamp-1 m-0">${escape_html(title)}</h1> <div class="flex text-sm justify-between items-center mt-1"><time class="text-gray-400"${attr("datetime", new Date(chat?.chat?.timestamp || Date.now()).toISOString())}>${escape_html(dayjs(chat.chat.timestamp).format("LLL"))}</time></div></div></div> <div class="h-full w-full flex flex-col py-2" role="main"><div class="w-full">`);
        Messages($$renderer3, {
          className: "h-full flex pt-4 pb-8 ",
          user,
          chatId: store_get($$store_subs ??= {}, "$chatId", chatId),
          readOnly: true,
          selectedModels,
          processing,
          bottomPadding: files.length > 0,
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
          },
          get autoScroll() {
            return autoScroll;
          },
          set autoScroll($$value) {
            autoScroll = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div></div></div> <div class="absolute bottom-0 right-0 left-0 flex justify-center w-full bg-linear-to-b from-transparent to-white dark:to-gray-900"><div class="pb-5"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Clone Chat"))}</button></div></div></div></div>`);
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
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
