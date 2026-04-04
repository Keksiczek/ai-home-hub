import { f as fallback, d as attr_class, g as clsx, k as escape_html, b as bind_props, e as ensure_array_like, h as attr_style, t as stringify, o as getContext, a as attr, c as store_get, u as unsubscribe_stores, q as head } from "../../../chunks/root.js";
import "dompurify";
import "marked";
import "../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "../../../chunks/index3.js";
import { c as config, W as WEBUI_NAME } from "../../../chunks/index2.js";
import { W as WEBUI_BASE_URL } from "../../../chunks/constants.js";
import { A as ArrowRightCircle } from "../../../chunks/ArrowRightCircle.js";
import "@sveltejs/kit";
function Marquee($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let idx = 0;
    let className = fallback($$props["className"], "");
    let words = fallback($$props["words"], () => ["lorem", "ipsum"], true);
    let duration = fallback($$props["duration"], 4e3);
    $$renderer2.push(`<div${attr_class(clsx(className))}><div><!---->`);
    {
      $$renderer2.push(`<div class="marquee-item">${escape_html(words.at(idx))}</div>`);
    }
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { className, words, duration });
  });
}
function SlideShow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let imageUrls = fallback(
      $$props["imageUrls"],
      () => [
        `${WEBUI_BASE_URL}/assets/images/adam.jpg`,
        `${WEBUI_BASE_URL}/assets/images/galaxy.jpg`,
        `${WEBUI_BASE_URL}/assets/images/earth.jpg`,
        `${WEBUI_BASE_URL}/assets/images/space.jpg`
      ],
      true
    );
    let duration = fallback($$props["duration"], 5e3);
    let selectedImageIdx = 0;
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(imageUrls);
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let imageUrl = each_array[idx];
      $$renderer2.push(`<div class="image w-full h-full absolute top-0 left-0 bg-cover bg-center transition-opacity duration-1000 svelte-14ofdb6"${attr_style(`opacity: ${stringify(selectedImageIdx === idx ? 1 : 0)}; background-image: url('${stringify(imageUrl)}')`)}></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { imageUrls, duration });
  });
}
function OnBoarding($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], true);
    let getStartedHandler = fallback($$props["getStartedHandler"], () => {
    });
    function setLogoImage() {
      const logo = document.getElementById("logo");
      if (logo) {
        const isDarkMode = document.documentElement.classList.contains("dark");
        if (isDarkMode) {
          const darkImage = new Image();
          darkImage.src = `${WEBUI_BASE_URL}/static/favicon-dark.png`;
          darkImage.onload = () => {
            logo.src = `${WEBUI_BASE_URL}/static/favicon-dark.png`;
            logo.style.filter = "";
          };
          darkImage.onerror = () => {
            logo.style.filter = "invert(1)";
          };
        }
      }
    }
    if (show) {
      setLogoImage();
    }
    if (show) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="w-full h-screen max-h-[100dvh] text-white relative"><div class="fixed m-10 z-50"><div class="flex space-x-2"><div class="self-center"><img id="logo" crossorigin="anonymous"${attr("src", `${stringify(WEBUI_BASE_URL)}/static/favicon.png`)} class="w-6 rounded-full" alt="logo"/></div></div></div> `);
      SlideShow($$renderer2, { duration: 5e3 });
      $$renderer2.push(`<!----> <div class="w-full h-full absolute top-0 left-0 bg-linear-to-t from-20% from-black to-transparent"></div> <div class="w-full h-full absolute top-0 left-0 backdrop-blur-xs bg-black/50"></div> <div class="relative bg-transparent w-full h-screen max-h-[100dvh] flex z-10"><div class="flex flex-col justify-end w-full items-center pb-10 text-center"><div class="text-5xl lg:text-7xl font-secondary">`);
      Marquee($$renderer2, {
        duration: 5e3,
        words: [
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Explore the cosmos"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Unlock mysteries"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Chart new frontiers"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Dive into knowledge"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Discover wonders"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Ignite curiosity"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Forge new paths"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Unravel secrets"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Pioneer insights"),
          store_get($$store_subs ??= {}, "$i18n", i18n).t("Embark on adventures")
        ]
      });
      $$renderer2.push(`<!----> <div class="mt-0.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`wherever you are`))}</div></div> <div class="flex justify-center mt-8"><div class="flex flex-col justify-center items-center"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Get started"))} class="relative z-20 flex p-1 rounded-full bg-white/5 hover:bg-white/10 transition font-medium text-sm">`);
      ArrowRightCircle($$renderer2, { className: "size-6", "aria-hidden": "true" });
      $$renderer2.push(`<!----></button> <div class="mt-1.5 font-primary text-base font-medium" aria-hidden="true">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Get started`))}</div></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, getStartedHandler });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    store_get($$store_subs ??= {}, "$config", config)?.features.enable_ldap ? "ldap" : "signin";
    let onboarding = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("1s728sz", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(`${store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME)}`)}
	</title>`);
        });
      });
      OnBoarding($$renderer3, {
        getStartedHandler: () => {
          onboarding = false;
          store_get($$store_subs ??= {}, "$config", config)?.features.enable_ldap ? "ldap" : "signup";
        },
        get show() {
          return onboarding;
        },
        set show($$value) {
          onboarding = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="w-full h-screen max-h-[100dvh] text-white relative" id="auth-page"><div class="w-full h-full absolute top-0 left-0 bg-white dark:bg-black"></div> <div class="w-full absolute top-0 left-0 right-0 h-8 drag-region"></div> `);
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
