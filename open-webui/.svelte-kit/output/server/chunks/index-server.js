import { E as ssr_context, n as noop, F as lifecycle_function_unavailable } from "./root.js";
import "clsx";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
  return noop;
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
export {
  createEventDispatcher as c,
  mount as m,
  onDestroy as o,
  tick as t,
  unmount as u
};
//# sourceMappingURL=index-server.js.map
