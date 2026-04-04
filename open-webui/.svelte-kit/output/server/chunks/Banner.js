import { o as getContext, f as fallback, b as bind_props } from "./root.js";
import "dompurify";
import "marked";
function Banner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let banner = fallback(
      $$props["banner"],
      () => ({
        id: "",
        type: "info",
        title: "",
        content: "",
        url: "",
        dismissible: true,
        timestamp: Math.floor(Date.now() / 1e3)
      }),
      true
    );
    let className = fallback($$props["className"], "mx-2 px-2 rounded-lg");
    let dismissed = fallback($$props["dismissed"], false);
    if (!dismissed) {
      $$renderer2.push("<!--[0-->");
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { banner, className, dismissed });
  });
}
export {
  Banner as B
};
//# sourceMappingURL=Banner.js.map
