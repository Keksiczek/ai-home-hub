import "clsx";
import { f as fallback, a as attr, d as attr_class, g as clsx, b as bind_props, o as getContext, k as escape_html, c as store_get, u as unsubscribe_stores, t as stringify, e as ensure_array_like } from "../../../../../../chunks/root.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import { u as user, c as config } from "../../../../../../chunks/index2.js";
import { p as page } from "../../../../../../chunks/stores.js";
import { a as WEBUI_API_BASE_URL } from "../../../../../../chunks/constants.js";
import { o as onDestroy } from "../../../../../../chunks/index-server.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import { g as getUserGroupsById, a as getUsers, B as Badge } from "../../../../../../chunks/Badge.js";
import { P as Pagination_1 } from "../../../../../../chunks/Pagination.js";
import { T as Tooltip } from "../../../../../../chunks/Tooltip.js";
import { M as Modal, X as XMark } from "../../../../../../chunks/Modal.js";
import { S as SensitiveInput, C as ConfirmDialog } from "../../../../../../chunks/ConfirmDialog.js";
import { g as generateInitialsImage } from "../../../../../../chunks/index3.js";
/* empty css                                                           */
import { S as Spinner } from "../../../../../../chunks/Spinner.js";
import "dayjs/plugin/calendar.js";
import { C as ChevronUp } from "../../../../../../chunks/Collapsible.js";
import { P as Plus } from "../../../../../../chunks/Plus.js";
import { B as Banner } from "../../../../../../chunks/Banner.js";
import { M as Markdown } from "../../../../../../chunks/Markdown.js";
import { P as ProfilePreview } from "../../../../../../chunks/ProfilePreview.js";
import "dompurify";
import "marked";
/* empty css                                                                   */
function ChatBubbles($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function UserProfileImage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let profileImageUrl = $$props["profileImageUrl"];
    let user2 = fallback($$props["user"], null);
    let imageClassName = fallback($$props["imageClassName"], "size-14 md:size-18");
    $$renderer2.push(`<input id="profile-image-input" type="file" hidden="" accept="image/*"/> <div class="flex flex-col self-start group"><div class="self-center flex"><button class="relative rounded-full dark:bg-gray-700" type="button"><img${attr(
      "src",
      // Calculate the aspect ratio of the image
      // Calculate the new width and height to fit within 250x250
      // Set the canvas size
      // Calculate the position to center the image
      // Draw the image on the canvas
      // Get the base64 representation of the compressed image
      // Display the compressed image
      profileImageUrl !== "" ? profileImageUrl : generateInitialsImage(user2?.name)
    )} alt="profile"${attr_class(` rounded-full ${stringify(imageClassName)} object-cover`)}/> <div class="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition"><div class="p-1 rounded-full bg-white text-black border-gray-100 shadow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-3"><path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z"></path></svg></div></div></button></div> <div class="flex flex-col w-full justify-center mt-2"><button class="text-xs text-center text-gray-500 rounded-lg py-0.5 opacity-0 group-hover:opacity-100 transition-all" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove"))}</button> <button class="text-xs text-center text-gray-800 dark:text-gray-400 rounded-lg py-0.5 opacity-0 group-hover:opacity-100 transition-all" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Initials"))}</button> <button class="text-xs text-center text-gray-800 dark:text-gray-400 rounded-lg py-0.5 opacity-0 group-hover:opacity-100 transition-all" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Gravatar"))}</button></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { profileImageUrl, user: user2, imageClassName });
  });
}
function EditUserModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(localizedFormat);
    let show = fallback($$props["show"], false);
    let selectedUser = $$props["selectedUser"];
    let sessionUser = $$props["sessionUser"];
    const init = () => {
      if (selectedUser) {
        _user = selectedUser;
        _user.password = "";
        loadUserGroups();
      }
    };
    let _user = {
      profile_image_url: "",
      role: "pending",
      name: "",
      email: "",
      password: ""
    };
    let userGroups = null;
    const loadUserGroups = async () => {
      if (!selectedUser?.id) return;
      userGroups = null;
      userGroups = await getUserGroupsById(localStorage.token, selectedUser.id).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
    };
    if (show) {
      init();
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit User"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-5 pt-3 pb-5 w-full"><div class="flex self-center w-full"><div class="self-start h-full mr-6">`);
          UserProfileImage($$renderer4, {
            imageClassName: "size-14",
            user: _user,
            get profileImageUrl() {
              return _user.profile_image_url;
            },
            set profileImageUrl($$value) {
              _user.profile_image_url = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="flex-1"><div class="overflow-hidden w-ful mb-2"><div class="self-center capitalize font-medium truncate">${escape_html(selectedUser.name)}</div> <div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Created at"))}
										${escape_html(dayjs(selectedUser.created_at * 1e3).format("LL"))}</div></div> <div class="flex flex-col space-y-1.5">`);
          if ((userGroups ?? []).length > 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col w-full text-sm"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("User Groups"))}</div> <div class="flex flex-wrap gap-1 my-0.5 -mx-1"><!--[-->`);
            const each_array = ensure_array_like(userGroups);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let userGroup = each_array[$$index];
              $$renderer4.push(`<span class="px-1.5 py-0.5 rounded-xl bg-gray-100 dark:bg-gray-850 text-xs"><a${attr("href", "/admin/users/groups?id=" + userGroup.id)}>${escape_html(userGroup.name)}</a></span>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Role"))}</div> <div class="flex-1">`);
          $$renderer4.select(
            {
              class: "w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden",
              value: _user.role,
              "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Role"),
              disabled: _user.id == sessionUser.id,
              required: true
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "admin" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Admin"))}`);
              });
              $$renderer5.option({ value: "user" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("User"))}`);
              });
              $$renderer5.option({ value: "pending" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Pending"))}`);
              });
            }
          );
          $$renderer4.push(`</div></div> <div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent outline-hidden svelte-zhsfcf" type="text"${attr("value", _user.name)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Name"))} autocomplete="off" required=""/></div></div> <div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Email"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden svelte-zhsfcf" type="email"${attr("value", _user.email)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Email"))}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Email"))} autocomplete="off" required=""/></div></div> `);
          if (_user?.oauth) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth ID"))}</div> <div class="flex-1 text-sm break-all mb-1 flex flex-col space-y-1"><!--[-->`);
            const each_array_1 = ensure_array_like(Object.keys(_user.oauth));
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let key = each_array_1[$$index_1];
              $$renderer4.push(`<div><span class="text-gray-500">${escape_html(key)}</span> <span>${escape_html(_user.oauth[key]?.sub)}</span></div>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("New Password"))}</div> <div class="flex-1">`);
          SensitiveInput($$renderer4, {
            class: "w-full text-sm bg-transparent outline-hidden",
            type: "password",
            "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("New Password"),
            placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter New Password"),
            autocomplete: "new-password",
            required: false,
            get value() {
              return _user.password;
            },
            set value($$value) {
              _user.password = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div></div></div></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></div></form></div></div></div>`);
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
    bind_props($$props, { show, selectedUser, sessionUser });
  });
}
function AddUserModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let loading = false;
    let _user = { name: "", email: "", password: "", role: "user" };
    if (show) {
      _user = { name: "", email: "", password: "", role: "user" };
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add User"))}</div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-3 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="flex -mt-2 mb-1.5 gap-1 scrollbar-none overflow-x-auto w-fit text-center text-sm font-medium rounded-full bg-transparent dark:text-gray-200"><button${attr_class(`min-w-fit p-1.5 ${stringify(
            ""
          )} transition`)} type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Form"))}</button> <button${attr_class(`min-w-fit p-1.5 ${stringify("text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")} transition`)} type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("CSV Import"))}</button></div> <div class="px-1">`);
          {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="flex flex-col w-full mb-3"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Role"))}</div> <div class="flex-1">`);
            $$renderer4.select(
              {
                class: "w-full capitalize rounded-lg text-sm bg-transparent dark:disabled:text-gray-500 outline-hidden",
                value: _user.role,
                "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Role"),
                placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Role"),
                required: true
              },
              ($$renderer5) => {
                $$renderer5.option({ value: "pending" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("pending"))}`);
                });
                $$renderer5.option({ value: "user" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("user"))}`);
                });
                $$renderer5.option({ value: "admin" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("admin"))}`);
                });
              }
            );
            $$renderer4.push(`</div></div> <div class="flex flex-col w-full mt-1"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden svelte-1ga5uvq" type="text"${attr("value", _user.name)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Full Name"))} autocomplete="off" required=""/></div></div> <hr class="border-gray-100/30 dark:border-gray-850/30 my-2.5 w-full"/> <div class="flex flex-col w-full"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Email"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden svelte-1ga5uvq" type="email"${attr("value", _user.email)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Email"))}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Email"))} required=""/></div></div> <div class="flex flex-col w-full mt-1"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Password"))}</div> <div class="flex-1">`);
            SensitiveInput($$renderer4, {
              class: "w-full text-sm bg-transparent disabled:text-gray-500 dark:disabled:text-gray-500 outline-hidden",
              type: "password",
              "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Password"),
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter Your Password"),
              autocomplete: "off",
              required: true,
              get value() {
                return _user.password;
              },
              set value($$value) {
                _user.password = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          }
          $$renderer4.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex items-center gap-2 whitespace-nowrap ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
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
    bind_props($$props, { show });
  });
}
function UserList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    dayjs.extend(localizedFormat);
    const i18n = getContext("i18n");
    let page2 = 1;
    let users = null;
    let total = null;
    let query = "";
    let searchDebounceTimer;
    let orderBy = "created_at";
    let direction = "asc";
    let selectedUser = null;
    let showDeleteConfirmDialog = false;
    let showAddUserModal = false;
    let showEditUserModal = false;
    const getUserList = async () => {
      try {
        const res = await getUsers(localStorage.token, query, orderBy, direction, page2).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        if (res) {
          users = res.users;
          total = res.total;
        }
      } catch (err) {
        /* @__PURE__ */ console.error(err);
      }
    };
    onDestroy(() => {
      clearTimeout(searchDebounceTimer);
    });
    {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(
        () => {
          page2 = 1;
          getUserList();
        },
        300
      );
    }
    if (page2 !== null && orderBy !== null && direction !== null) {
      getUserList();
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
      AddUserModal($$renderer3, {
        get show() {
          return showAddUserModal;
        },
        set show($$value) {
          showAddUserModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      EditUserModal($$renderer3, {
        selectedUser,
        sessionUser: store_get($$store_subs ??= {}, "$user", user),
        get show() {
          return showEditUserModal;
        },
        set show($$value) {
          showEditUserModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if ((store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats ?? null) !== null && total && total > store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="mt-1 mb-2 text-xs text-red-500">`);
        Banner($$renderer3, {
          className: "mx-0",
          banner: {
            type: "error",
            title: "License Error",
            content: "Exceeded the number of seats in your license. Please contact support to increase the number of seats."
          }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (users === null || total === null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="my-10">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="pt-0.5 pb-1 gap-1 flex flex-col md:flex-row justify-between sticky top-0 z-10 bg-white dark:bg-gray-900"><div class="flex md:self-center text-lg font-medium px-0.5 gap-2"><div class="flex-shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Users"))}</div> <div>`);
        if ((store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats ?? null) !== null) {
          $$renderer3.push("<!--[0-->");
          if (total > store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<span class="text-lg font-medium text-red-500">${escape_html(total)} of ${escape_html(store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats)} <span class="text-sm font-normal">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("available users"))}</span></span>`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<span class="text-lg font-medium text-gray-500 dark:text-gray-300">${escape_html(total)} of ${escape_html(store_get($$store_subs ??= {}, "$config", config)?.license_metadata?.seats)} <span class="text-sm font-normal">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("available users"))}</span></span>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="text-lg font-medium text-gray-500 dark:text-gray-300">${escape_html(total)}</span>`);
        }
        $$renderer3.push(`<!--]--></div></div> <div class="flex gap-1"><div class="flex w-full space-x-2"><div class="flex flex-1"><div class="self-center ml-1 mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"></path></svg></div> <input class="w-full text-sm pr-4 py-1 rounded-r-xl outline-hidden bg-transparent"${attr("value", query)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search"))}/></div> <div>`);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Add User"),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 transition font-medium text-sm flex items-center space-x-1">`);
            Plus($$renderer4, { className: "size-3.5" });
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div></div></div> <div class="scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full"><thead class="text-xs text-gray-800 uppercase bg-transparent dark:text-gray-200"><tr class="border-b-[1.5px] border-gray-50 dark:border-gray-850/30"><th scope="col" class="px-2.5 py-2 cursor-pointer select-none"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Role"))} `);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="invisible">`);
          ChevronUp($$renderer3, { className: "size-2" });
          $$renderer3.push(`<!----></span>`);
        }
        $$renderer3.push(`<!--]--></div></th><th scope="col" class="px-2.5 py-2 cursor-pointer select-none"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))} `);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="invisible">`);
          ChevronUp($$renderer3, { className: "size-2" });
          $$renderer3.push(`<!----></span>`);
        }
        $$renderer3.push(`<!--]--></div></th><th scope="col" class="px-2.5 py-2 cursor-pointer select-none"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Email"))} `);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="invisible">`);
          ChevronUp($$renderer3, { className: "size-2" });
          $$renderer3.push(`<!----></span>`);
        }
        $$renderer3.push(`<!--]--></div></th><th scope="col" class="px-2.5 py-2 cursor-pointer select-none"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Last Active"))} `);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<span class="invisible">`);
          ChevronUp($$renderer3, { className: "size-2" });
          $$renderer3.push(`<!----></span>`);
        }
        $$renderer3.push(`<!--]--></div></th><th scope="col" class="px-2.5 py-2 cursor-pointer select-none"><div class="flex gap-1.5 items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Created at"))} `);
        {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<span class="font-normal">`);
          {
            $$renderer3.push("<!--[0-->");
            ChevronUp($$renderer3, { className: "size-2" });
          }
          $$renderer3.push(`<!--]--></span>`);
        }
        $$renderer3.push(`<!--]--></div></th><th scope="col" class="px-2.5 py-2 text-right"></th></tr></thead><tbody><!--[-->`);
        const each_array = ensure_array_like(users);
        for (let userIdx = 0, $$length = each_array.length; userIdx < $$length; userIdx++) {
          let user2 = each_array[userIdx];
          $$renderer3.push(`<tr class="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs"><td class="px-3 py-1 min-w-[7rem] w-28"><button class="translate-y-0.5"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Change User Role"))}>`);
          Badge($$renderer3, {
            type: user2.role === "admin" ? "info" : user2.role === "user" ? "success" : "muted",
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t(user2.role)
          });
          $$renderer3.push(`<!----></button></td><td class="px-3 py-1 font-medium text-gray-900 dark:text-white max-w-48"><div class="flex items-center gap-2">`);
          ProfilePreview($$renderer3, {
            user: user2,
            side: "right",
            align: "center",
            sideOffset: 6,
            children: ($$renderer4) => {
              $$renderer4.push(`<img class="rounded-full w-6 min-w-6 h-6 object-cover mr-0.5 flex-shrink-0"${attr("src", `${WEBUI_API_BASE_URL}/users/${user2.id}/profile/image`)} alt="user"/>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> <div class="font-medium truncate">${escape_html(user2.name)}</div> `);
          if (user2?.last_active_at && Date.now() / 1e3 - user2.last_active_at < 180) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div><span class="relative flex size-1.5"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex size-1.5 rounded-full bg-green-500"></span></span></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div></td><td class="px-3 py-1">${escape_html(user2.email)}</td><td class="px-3 py-1">${escape_html(dayjs(user2.last_active_at * 1e3).fromNow())}</td><td class="px-3 py-1">${escape_html(dayjs(user2.created_at * 1e3).format("LL"))}</td><td class="px-3 py-1 text-right"><div class="flex justify-end w-full">`);
          if (store_get($$store_subs ??= {}, "$config", config).features.enable_admin_chat_access && user2.role !== "admin") {
            $$renderer3.push("<!--[0-->");
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Chats"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button class="self-center w-fit text-sm px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Chats"))}>`);
                ChatBubbles($$renderer4, {});
                $$renderer4.push(`<!----></button>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> `);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit User"),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="self-center w-fit text-sm px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit User"))}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          if (user2.role !== "admin") {
            $$renderer3.push("<!--[0-->");
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete User"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button class="self-center w-fit text-sm px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete User"))}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg></button>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--></div></td></tr>`);
        }
        $$renderer3.push(`<!--]--></tbody></table></div> <div class="text-gray-500 text-xs mt-1.5 text-right">ⓘ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Click on the user role button to change a user's role."))}</div> `);
        if (total > 30) {
          $$renderer3.push("<!--[0-->");
          Pagination_1($$renderer3, {
            count: total,
            perPage: 30,
            get page() {
              return page2;
            },
            set page($$value) {
              page2 = $$value;
              $$settled = false;
            }
          });
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--> `);
      if (!store_get($$store_subs ??= {}, "$config", config)?.license_metadata) {
        $$renderer3.push("<!--[0-->");
        if (total > 50) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="text-sm">`);
          Markdown($$renderer3, {
            content: `
> [!NOTE]
> # **Hey there! 👋**
>
> It looks like you have over 50 users, that usually falls under organizational usage.
> 
> Open WebUI is completely free to use as-is, with no restrictions or hidden limits, and we'd love to keep it that way. 🌱  
>
> By supporting the project through sponsorship or an enterprise license, you’re not only helping us stay independent, you’re also helping us ship new features faster, improve stability, and grow the project for the long haul. With an *enterprise license*, you also get additional perks like dedicated support, customization options, and more, all at a fraction of what it would cost to build and maintain internally.  
> 
> Your support helps us stay independent and continue building great tools for everyone. 💛
> 
> - 👉 **[Click here to learn more about enterprise licensing](https://docs.openwebui.com/enterprise)**
> - 👉 *[Click here to sponsor the project on GitHub](https://github.com/sponsors/tjbck)*
`
          });
          $$renderer3.push(`<!----></div>`);
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
function Groups($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    const i18n = getContext("i18n");
    let groups = [];
    [
      {
        value: "name",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Name")
      },
      {
        value: "members",
        label: store_get($$store_subs ??= {}, "$i18n", i18n).t("Members")
      }
    ];
    groups.filter((group) => {
      {
        return true;
      }
    }).sort((a, b) => {
      {
        return (b.member_count ?? 0) - (a.member_count ?? 0);
      }
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
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
  });
}
function Users($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let selectedTab;
    const scrollToTab = (tabId) => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    };
    {
      const pathParts = store_get($$store_subs ??= {}, "$page", page).url.pathname.split("/");
      const tabFromPath = pathParts[pathParts.length - 1];
      selectedTab = ["overview", "groups"].includes(tabFromPath) ? tabFromPath : "overview";
    }
    if (selectedTab) {
      scrollToTab(selectedTab);
    }
    $$renderer2.push(`<div class="flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4"><div id="users-tabs-container" class="mx-[16px] lg:mx-0 lg:px-[16px] flex flex-row overflow-x-auto gap-2.5 max-w-full lg:gap-1 lg:flex-col lg:flex-none lg:w-50 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"><a id="overview" href="/admin/users/overview" draggable="false"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition select-none ${stringify(
      // Adjust horizontal scroll position based on vertical scroll
      // Scroll to the selected tab on mount
      selectedTab === "overview" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"
    )}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path d="M8.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10.9 12.006c.11.542-.348.994-.9.994H2c-.553 0-1.01-.452-.902-.994a5.002 5.002 0 0 1 9.803 0ZM14.002 12h-1.59a2.556 2.556 0 0 0-.04-.29 6.476 6.476 0 0 0-1.167-2.603 3.002 3.002 0 0 1 3.633 1.911c.18.522-.283.982-.836.982ZM12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Overview"))}</div></a> <a id="groups" href="/admin/users/groups" draggable="false"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition select-none ${stringify(selectedTab === "groups" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path d="M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.156 11.763c.16-.629.44-1.21.813-1.72a2.5 2.5 0 0 0-2.725 1.377c-.136.287.102.58.418.58h1.449c.01-.077.025-.156.045-.237ZM12.847 11.763c.02.08.036.16.046.237h1.446c.316 0 .554-.293.417-.579a2.5 2.5 0 0 0-2.722-1.378c.374.51.653 1.09.813 1.72ZM14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM3.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 13c-.552 0-1.013-.455-.876-.99a4.002 4.002 0 0 1 7.753 0c.136.535-.324.99-.877.99H5Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Groups"))}</div></a></div> <div class="flex-1 mt-1 lg:mt-0 px-[16px] lg:pr-[16px] lg:pl-0 overflow-y-scroll">`);
    if (selectedTab === "overview") {
      $$renderer2.push("<!--[0-->");
      UserList($$renderer2);
    } else if (selectedTab === "groups") {
      $$renderer2.push("<!--[1-->");
      Groups($$renderer2);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer) {
  Users($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
