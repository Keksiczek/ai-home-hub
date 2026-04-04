import { o as getContext, f as fallback, b as bind_props, k as escape_html, c as store_get, u as unsubscribe_stores, e as ensure_array_like, a as attr } from "./root.js";
import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { e as getUserInfoById, B as Badge } from "./Badge.js";
import { M as Modal, X as XMark } from "./Modal.js";
import { P as Plus } from "./Plus.js";
import { M as MemberSelector } from "./MemberSelector.js";
import { T as Tooltip } from "./Tooltip.js";
import { S as Switch_1 } from "./Switch.js";
const getGroupInfoById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/groups/id/${id}/info`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function AddAccessModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let shareUsers = fallback($$props["shareUsers"], true);
    let onAdd = fallback($$props["onAdd"], (payload) => {
    });
    let userIds = [];
    let groupIds = [];
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 mb-1.5"><div class="self-center text-base"><div class="flex items-center gap-0.5 shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Access"))}</div></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-3 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="flex flex-col w-full h-full pb-2">`);
          MemberSelector($$renderer4, {
            includeGroups: true,
            includeUsers: shareUsers,
            includeSessionUser: true,
            get userIds() {
              return userIds;
            },
            set userIds($$value) {
              userIds = $$value;
              $$settled = false;
            },
            get groupIds() {
              return groupIds;
            },
            set groupIds($$value) {
              groupIds = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}</button></div></form></div></div></div>`);
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
    bind_props($$props, { show, shareUsers, onAdd });
  });
}
function AccessControl($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let readGroupIds, writeGroupIds, readUserIds, writeUserIds, selectedUserIds, selectedUsers, accessGroups;
    const i18n = getContext("i18n");
    let onChange = fallback($$props["onChange"], () => {
    });
    let accessRoles = fallback($$props["accessRoles"], () => ["read"], true);
    let accessGrants = fallback($$props["accessGrants"], () => [], true);
    let accessControl = fallback($$props["accessControl"], void 0);
    let share = fallback($$props["share"], true);
    let sharePublic = fallback($$props["sharePublic"], true);
    let shareUsers = fallback($$props["shareUsers"], true);
    let groups = [];
    const resolvingGroupIds = /* @__PURE__ */ new Set();
    let userById = {};
    const resolvingUserIds = /* @__PURE__ */ new Set();
    let showAddAccessModal = false;
    const dedupeAccessGrants = (grants) => {
      if (!Array.isArray(grants)) return [];
      const map = /* @__PURE__ */ new Map();
      for (const grant of grants) {
        if (!grant) continue;
        const key = `${grant.principal_type}:${grant.principal_id}:${grant.permission}`;
        if (!grant.principal_type || !grant.principal_id || !grant.permission) continue;
        map.set(key, {
          id: grant.id,
          principal_type: grant.principal_type,
          principal_id: grant.principal_id,
          permission: grant.permission
        });
      }
      return Array.from(map.values());
    };
    const legacyAccessControlToGrants = (accessControl2) => {
      if (accessControl2 === null) {
        return [
          {
            principal_type: "user",
            principal_id: "*",
            permission: "read"
          }
        ];
      }
      if (!accessControl2 || typeof accessControl2 !== "object") {
        return [];
      }
      const grants = [];
      for (const permission of ["read", "write"]) {
        const entry = accessControl2?.[permission] ?? {};
        for (const groupId of entry?.group_ids ?? []) {
          grants.push({ principal_type: "group", principal_id: groupId, permission });
        }
        for (const userId of entry?.user_ids ?? []) {
          grants.push({ principal_type: "user", principal_id: userId, permission });
        }
      }
      return dedupeAccessGrants(grants);
    };
    const grantsToLegacyAccessControl = (grants) => {
      const normalized = dedupeAccessGrants(grants);
      if (hasPublicReadGrant(normalized)) {
        return null;
      }
      const result = {
        read: { group_ids: [], user_ids: [] },
        write: { group_ids: [], user_ids: [] }
      };
      for (const grant of normalized) {
        if (!["read", "write"].includes(grant.permission)) {
          continue;
        }
        if (grant.principal_type === "group") {
          if (!result[grant.permission].group_ids.includes(grant.principal_id)) {
            result[grant.permission].group_ids = [...result[grant.permission].group_ids, grant.principal_id];
          }
        } else if (grant.principal_type === "user" && grant.principal_id !== "*") {
          if (!result[grant.permission].user_ids.includes(grant.principal_id)) {
            result[grant.permission].user_ids = [...result[grant.permission].user_ids, grant.principal_id];
          }
        }
      }
      return result;
    };
    const normalizeInputToGrants = (value) => {
      if (value === null) {
        return legacyAccessControlToGrants(null);
      }
      if (Array.isArray(value)) {
        return dedupeAccessGrants(value);
      }
      if (value && typeof value === "object" && ("read" in value || "write" in value)) {
        return legacyAccessControlToGrants(value);
      }
      return [];
    };
    const stableStringify = (value) => {
      try {
        return JSON.stringify(value ?? null);
      } catch {
        return "";
      }
    };
    const hasPublicReadGrant = (grants) => grants.some((grant) => grant.principal_type === "user" && grant.principal_id === "*" && grant.permission === "read");
    const hasPublicWriteGrant = (grants) => grants.some((grant) => grant.principal_type === "user" && grant.principal_id === "*" && grant.permission === "write");
    const currentGrants = () => Array.isArray(accessGrants) ? accessGrants : [];
    const getPrincipalIdsByPermission = (principalType, permission) => Array.from(new Set(currentGrants().filter((grant) => grant.principal_type === principalType && grant.permission === permission).map((grant) => grant.principal_id)));
    const commitAccessGrants = (nextGrants) => {
      accessGrants = dedupeAccessGrants(nextGrants);
      onChange(accessGrants);
    };
    const upsertPrincipalGrant = (principalType, principalId, permission, grants) => {
      if (grants.some((grant) => grant.principal_type === principalType && grant.principal_id === principalId && grant.permission === permission)) {
        return grants;
      }
      return [
        ...grants,
        {
          principal_type: principalType,
          principal_id: principalId,
          permission
        }
      ];
    };
    const ensureUsersByIds = async (userIds) => {
      const pendingIds = userIds.filter((id) => !userById[id] && !resolvingUserIds.has(id));
      if (!pendingIds.length) return;
      for (const id of pendingIds) {
        resolvingUserIds.add(id);
      }
      const fetched = await Promise.all(pendingIds.map(async (id) => {
        const user = await getUserInfoById(localStorage.token, id).catch((error) => {
          /* @__PURE__ */ console.error(error);
          return null;
        });
        return { id, user };
      }));
      const nextUserById = { ...userById };
      for (const item of fetched) {
        if (item.user?.id) {
          nextUserById[item.id] = item.user;
        }
        resolvingUserIds.delete(item.id);
      }
      userById = nextUserById;
    };
    const handleAddAccess = ({ userIds, groupIds }) => {
      let next = [...currentGrants()];
      for (const groupId of groupIds) {
        next = upsertPrincipalGrant("group", groupId, "read", next);
      }
      for (const userId of userIds) {
        next = upsertPrincipalGrant("user", userId, "read", next);
      }
      commitAccessGrants(next);
    };
    const ensureGroupsByIds = async (groupIds) => {
      const pendingIds = groupIds.filter((id) => !groups.find((g) => g.id === id) && !resolvingGroupIds.has(id));
      if (!pendingIds.length) return;
      for (const id of pendingIds) {
        resolvingGroupIds.add(id);
      }
      const fetched = await Promise.all(pendingIds.map(async (id) => {
        const group = await getGroupInfoById(localStorage.token, id).catch((error) => {
          /* @__PURE__ */ console.error(error);
          return null;
        });
        return group;
      }));
      const newGroups = fetched.filter((g) => g);
      if (newGroups.length > 0) {
        groups = [...groups, ...newGroups].filter((g, index, self) => index === self.findIndex((t) => t.id === g.id));
      }
      for (const id of pendingIds) {
        resolvingGroupIds.delete(id);
      }
    };
    {
      const normalizedGrants = normalizeInputToGrants(accessGrants);
      if (stableStringify(normalizedGrants) !== stableStringify(accessGrants)) {
        accessGrants = normalizedGrants;
      }
      if (accessControl !== void 0) {
        const nextAccessControl = grantsToLegacyAccessControl(normalizedGrants);
        if (stableStringify(nextAccessControl) !== stableStringify(accessControl)) {
          accessControl = nextAccessControl;
        }
      }
    }
    {
      if (accessControl !== void 0) {
        const normalizedGrants = normalizeInputToGrants(accessControl);
        if (stableStringify(normalizedGrants) !== stableStringify(accessGrants)) {
          accessGrants = normalizedGrants;
        }
      }
    }
    readGroupIds = getPrincipalIdsByPermission("group", "read");
    writeGroupIds = getPrincipalIdsByPermission("group", "write");
    if (readGroupIds.length > 0 || writeGroupIds.length > 0) {
      void ensureGroupsByIds([...readGroupIds, ...writeGroupIds]);
    }
    readUserIds = getPrincipalIdsByPermission("user", "read").filter((id) => id !== "*");
    writeUserIds = getPrincipalIdsByPermission("user", "write").filter((id) => id !== "*");
    selectedUserIds = Array.from(/* @__PURE__ */ new Set([...readUserIds, ...writeUserIds]));
    selectedUsers = selectedUserIds.map((id) => {
      return userById[id] ?? { id, name: id, email: "" };
    }).sort((a, b) => a.name.localeCompare(b.name));
    accessGroups = groups.filter((group) => readGroupIds.includes(group.id) || writeGroupIds.includes(group.id)).sort((a, b) => a.name.localeCompare(b.name));
    if (selectedUserIds.length > 0) {
      void ensureUsersByIds(selectedUserIds);
    }
    /* @__PURE__ */ console.log("AccessControl state", {
      accessGrants,
      readGroupIds,
      writeGroupIds,
      selectedUserIds,
      groups,
      accessGroups,
      selectedUsers
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddAccessModal($$renderer3, {
        shareUsers,
        onAdd: handleAddAccess,
        get show() {
          return showAddAccessModal;
        },
        set show($$value) {
          showAddAccessModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="rounded-lg flex flex-col gap-1"><div class="py-2"><div class="flex gap-2.5 items-center"><div><div class="p-2 bg-black/5 dark:bg-white/5 rounded-full">`);
      if (!hasPublicReadGrant(accessGrants ?? [])) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"></path></svg>`);
      }
      $$renderer3.push(`<!--]--></div></div> <div>`);
      Tooltip($$renderer3, {
        content: !(share && sharePublic) && !hasPublicReadGrant(accessGrants ?? []) ? store_get($$store_subs ??= {}, "$i18n", i18n).t("You do not have permission to make this public") : "",
        children: ($$renderer4) => {
          $$renderer4.select(
            {
              id: "models",
              class: "outline-none bg-transparent text-sm font-medium block w-fit pr-10 max-w-full placeholder-gray-400",
              value: !hasPublicReadGrant(accessGrants ?? []) ? "private" : "public"
            },
            ($$renderer5) => {
              $$renderer5.option({ class: "text-gray-700", value: "private" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Private"))}`);
              });
              if (share && sharePublic || hasPublicReadGrant(accessGrants ?? [])) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.option({ class: "text-gray-700", value: "public" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Public"))}`);
                });
              } else {
                $$renderer5.push("<!--[-1-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> <div class="text-xs text-gray-400 font-medium">`);
      if (!hasPublicReadGrant(accessGrants ?? [])) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Only select users and groups with permission can access"))}`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Accessible to all users"))}`);
      }
      $$renderer3.push(`<!--]--></div></div></div> `);
      if (hasPublicReadGrant(accessGrants ?? []) && accessRoles.includes("write")) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex w-full justify-between mt-2 ml-0.5"><div class="self-center text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Allow public write access"))}</div> `);
        Switch_1($$renderer3, { state: hasPublicWriteGrant(accessGrants ?? []) });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      if (share) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex items-center justify-between text-xs font-medium text-gray-500 my-1"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access List"))}</div> <div class="flex gap-1"><button class="px-2 py-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-xs font-medium flex items-center gap-1" type="button">`);
        Plus($$renderer3, { className: "size-3" });
        $$renderer3.push(`<!----> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Access"))}</button></div></div> <div class="flex flex-col gap-2"><!--[-->`);
        const each_array = ensure_array_like(accessGroups);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let group = each_array[$$index];
          $$renderer3.push(`<div class="flex items-center gap-3 justify-between text-sm w-full transition pb-1"><div class="flex items-center gap-2 w-full flex-1"><div class="size-5 rounded-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center text-xs">${escape_html(group.name.charAt(0).toUpperCase())}</div> <div class="truncate text-sm flex items-center gap-2">${escape_html(group.name)} <span class="text-xs text-gray-400 font-normal">${escape_html(group?.member_count)} ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("members"))}</span></div></div> <div class="w-full flex justify-end items-center gap-2"><button type="button">`);
          if (writeGroupIds.includes(group.id)) {
            $$renderer3.push("<!--[0-->");
            Badge($$renderer3, {
              type: "success",
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write")
            });
          } else {
            $$renderer3.push("<!--[-1-->");
            Badge($$renderer3, {
              type: "info",
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Read")
            });
          }
          $$renderer3.push(`<!--]--></button> <button class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-850 transition" type="button">`);
          XMark($$renderer3, { className: "size-4" });
          $$renderer3.push(`<!----></button></div></div>`);
        }
        $$renderer3.push(`<!--]--> `);
        if (shareUsers) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(selectedUsers);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let user = each_array_1[$$index_1];
            $$renderer3.push(`<div class="flex items-center gap-3 justify-between text-sm w-full transition border-b border-gray-50 dark:border-gray-850 pb-2 last:border-0"><div class="flex items-center gap-2 w-full flex-1"><img class="rounded-full size-5 object-cover"${attr("src", `${WEBUI_API_BASE_URL}/users/${user.id}/profile/image`)}${attr("alt", user.name ?? user.id)}/> <div class="w-full">`);
            Tooltip($$renderer3, {
              content: user.email,
              placement: "top-start",
              children: ($$renderer4) => {
                $$renderer4.push(`<div class="truncate text-sm">${escape_html(user.name ?? user.id)}</div>`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div></div> <div class="w-full flex justify-end items-center gap-2"><button type="button">`);
            if (writeUserIds.includes(user.id)) {
              $$renderer3.push("<!--[0-->");
              Badge($$renderer3, {
                type: "success",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write")
              });
            } else {
              $$renderer3.push("<!--[-1-->");
              Badge($$renderer3, {
                type: "info",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Read")
              });
            }
            $$renderer3.push(`<!--]--></button> <button class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-850 transition" type="button">`);
            XMark($$renderer3, { className: "size-4" });
            $$renderer3.push(`<!----></button></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (!hasPublicReadGrant(accessGrants ?? []) && accessGroups.length === 0 && selectedUsers.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="text-xs text-gray-500 text-center py-4">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No access grants. Private to you."))}</div>`);
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
    bind_props($$props, {
      onChange,
      accessRoles,
      accessGrants,
      accessControl,
      share,
      sharePublic,
      shareUsers
    });
  });
}
export {
  AccessControl as A
};
//# sourceMappingURL=AccessControl.js.map
