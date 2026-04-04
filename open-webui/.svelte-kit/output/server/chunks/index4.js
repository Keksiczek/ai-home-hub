import i18next from "i18next";
import "i18next-resources-to-backend";
import "i18next-browser-languagedetector";
import { w as writable } from "./index.js";
const createI18nStore = (i18n2) => {
  const i18nWritable = writable(i18n2);
  i18n2.on("initialized", () => {
    i18nWritable.set(i18n2);
  });
  i18n2.on("loaded", () => {
    i18nWritable.set(i18n2);
  });
  i18n2.on("added", () => i18nWritable.set(i18n2));
  i18n2.on("languageChanged", (lang) => {
    i18nWritable.set(i18n2);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  });
  return i18nWritable;
};
const createIsLoadingStore = (i18n2) => {
  const isLoading2 = writable(false);
  i18n2.on("loaded", (resources) => {
    isLoading2.set(Object.keys(resources).length === 0);
  });
  i18n2.on("failedLoading", () => {
    isLoading2.set(true);
  });
  return isLoading2;
};
const i18n = createI18nStore(i18next);
createIsLoadingStore(i18next);
export {
  i18n as i
};
//# sourceMappingURL=index4.js.map
