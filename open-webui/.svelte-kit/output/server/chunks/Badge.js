import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { b as getUserPosition } from "./index3.js";
import { H as on, y as derived, b as bind_props, z as props_id, m as attributes, o as getContext, f as fallback, d as attr_class, k as escape_html, t as stringify } from "./root.js";
import { w as watch, g as getDocument, i as isElement, C as Context, D as DOMContext, P as PresenceManager, e as boxWith, a as attachRef, f as isTouch, h as isFocusVisible, c as createBitsAttrs, j as getTabbableCandidates, k as getDataOpenClosed, l as boolToStr, o as afterSleep, n as noop, F as Floating_layer, d as createId, p as Floating_layer_anchor, m as mergeProps } from "./floating-layer-anchor.js";
import "clsx";
import "./index2.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import "dompurify";
const getUsers = async (token, query, orderBy, direction, page = 1) => {
  let error = null;
  let res = null;
  const searchParams = new URLSearchParams();
  searchParams.set("page", `${page}`);
  {
    searchParams.set("order_by", orderBy);
  }
  {
    searchParams.set("direction", direction);
  }
  res = await fetch(`${WEBUI_API_BASE_URL}/users/?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
const searchUsers = async (token, query, orderBy, direction, page = 1) => {
  let error = null;
  let res = null;
  const searchParams = new URLSearchParams();
  searchParams.set("page", `${page}`);
  {
    searchParams.set("order_by", orderBy);
  }
  {
    searchParams.set("direction", direction);
  }
  res = await fetch(`${WEBUI_API_BASE_URL}/users/search?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
const getUserSettings = async (token) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
const updateUserSettings = async (token, settings) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/settings/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...settings
    })
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
const getUserInfoById = async (token, userId) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/${userId}/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
const updateUserInfo = async (token, info) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/user/info/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...info
    })
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
const getAndUpdateUserLocation = async (token) => {
  const location = await getUserPosition().catch((err) => {
    return null;
  });
  if (location) {
    await updateUserInfo(token, { location });
    return location;
  } else {
    console.info("Failed to get user location");
    return null;
  }
};
const getUserGroupsById = async (token, userId) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/users/${userId}/groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let isInside = false;
  const length = polygon.length;
  for (let i = 0, j = length - 1; i < length; j = i++) {
    const [xi, yi] = polygon[i] ?? [0, 0];
    const [xj, yj] = polygon[j] ?? [0, 0];
    const intersect = yi >= y !== yj >= y && x <= (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
}
function isInsideRect(point, rect) {
  return point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom;
}
function getSide(triggerRect, contentRect) {
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  const contentCenterX = contentRect.left + contentRect.width / 2;
  const contentCenterY = contentRect.top + contentRect.height / 2;
  const deltaX = contentCenterX - triggerCenterX;
  const deltaY = contentCenterY - triggerCenterY;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  }
  return deltaY > 0 ? "bottom" : "top";
}
class SafePolygon {
  #opts;
  #buffer;
  #transitIntentTimeout;
  // tracks the cursor position when leaving trigger or content
  #exitPoint = null;
  // tracks what we're moving toward: "content" when leaving trigger, "trigger" when leaving content
  #exitTarget = null;
  #transitTargets = [];
  #trackedTriggerNode = null;
  #leaveFallbackRafId = null;
  #transitIntentTimeoutId = null;
  #cancelLeaveFallback() {
    if (this.#leaveFallbackRafId !== null) {
      cancelAnimationFrame(this.#leaveFallbackRafId);
      this.#leaveFallbackRafId = null;
    }
  }
  #scheduleLeaveFallback() {
    this.#cancelLeaveFallback();
    this.#leaveFallbackRafId = requestAnimationFrame(() => {
      this.#leaveFallbackRafId = null;
      if (!this.#exitPoint || !this.#exitTarget) return;
      this.#clearTracking();
      this.#opts.onPointerExit();
    });
  }
  #cancelTransitIntentTimeout() {
    if (this.#transitIntentTimeoutId !== null) {
      clearTimeout(this.#transitIntentTimeoutId);
      this.#transitIntentTimeoutId = null;
    }
  }
  #scheduleTransitIntentTimeout() {
    if (this.#transitIntentTimeout === null) return;
    this.#cancelTransitIntentTimeout();
    this.#transitIntentTimeoutId = window.setTimeout(
      () => {
        this.#transitIntentTimeoutId = null;
        if (!this.#exitPoint || !this.#exitTarget) return;
        this.#clearTracking();
        this.#opts.onPointerExit();
      },
      this.#transitIntentTimeout
    );
  }
  constructor(opts) {
    this.#opts = opts;
    this.#buffer = opts.buffer ?? 1;
    const transitIntentTimeout = opts.transitIntentTimeout;
    this.#transitIntentTimeout = typeof transitIntentTimeout === "number" && transitIntentTimeout > 0 ? transitIntentTimeout : null;
    watch([opts.triggerNode, opts.contentNode, opts.enabled], ([triggerNode, contentNode, enabled]) => {
      if (!triggerNode || !contentNode || !enabled) {
        this.#trackedTriggerNode = null;
        this.#clearTracking();
        return;
      }
      if (this.#trackedTriggerNode && this.#trackedTriggerNode !== triggerNode) {
        this.#clearTracking();
      }
      this.#trackedTriggerNode = triggerNode;
      const doc = getDocument(triggerNode);
      const handlePointerMove = (e) => {
        this.#onPointerMove([e.clientX, e.clientY], triggerNode, contentNode);
      };
      const handleTriggerLeave = (e) => {
        const target = e.relatedTarget;
        if (isElement(target) && contentNode.contains(target)) {
          return;
        }
        const ignoredTargets = this.#opts.ignoredTargets?.() ?? [];
        if (isElement(target) && ignoredTargets.some((n) => n === target || n.contains(target))) {
          return;
        }
        this.#transitTargets = isElement(target) && ignoredTargets.length > 0 ? ignoredTargets.filter((n) => target.contains(n)) : [];
        this.#exitPoint = [e.clientX, e.clientY];
        this.#exitTarget = "content";
        this.#scheduleLeaveFallback();
      };
      const handleTriggerEnter = () => {
        this.#clearTracking();
      };
      const handleContentEnter = () => {
        this.#clearTracking();
      };
      const handleContentLeave = (e) => {
        const target = e.relatedTarget;
        if (isElement(target) && triggerNode.contains(target)) {
          return;
        }
        this.#exitPoint = [e.clientX, e.clientY];
        this.#exitTarget = "trigger";
        this.#scheduleLeaveFallback();
      };
      return [
        on(doc, "pointermove", handlePointerMove),
        on(triggerNode, "pointerleave", handleTriggerLeave),
        on(triggerNode, "pointerenter", handleTriggerEnter),
        on(contentNode, "pointerenter", handleContentEnter),
        on(contentNode, "pointerleave", handleContentLeave)
      ].reduce(
        (acc, cleanup) => () => {
          acc();
          cleanup();
        },
        () => {
        }
      );
    });
  }
  #onPointerMove(clientPoint, triggerNode, contentNode) {
    if (!this.#exitPoint || !this.#exitTarget) return;
    this.#cancelLeaveFallback();
    this.#scheduleTransitIntentTimeout();
    const triggerRect = triggerNode.getBoundingClientRect();
    const contentRect = contentNode.getBoundingClientRect();
    if (this.#exitTarget === "content" && isInsideRect(clientPoint, contentRect)) {
      this.#clearTracking();
      return;
    }
    if (this.#exitTarget === "trigger" && isInsideRect(clientPoint, triggerRect)) {
      this.#clearTracking();
      return;
    }
    if (this.#exitTarget === "content" && this.#transitTargets.length > 0) {
      for (const transitTarget of this.#transitTargets) {
        const transitRect = transitTarget.getBoundingClientRect();
        if (isInsideRect(clientPoint, transitRect)) return;
        const transitSide = getSide(triggerRect, transitRect);
        const transitCorridor = this.#getCorridorPolygon(triggerRect, transitRect, transitSide);
        if (transitCorridor && isPointInPolygon(clientPoint, transitCorridor)) return;
      }
    }
    const side = getSide(triggerRect, contentRect);
    const corridorPoly = this.#getCorridorPolygon(triggerRect, contentRect, side);
    if (corridorPoly && isPointInPolygon(clientPoint, corridorPoly)) {
      return;
    }
    const targetRect = this.#exitTarget === "content" ? contentRect : triggerRect;
    const safePoly = this.#getSafePolygon(this.#exitPoint, targetRect, side, this.#exitTarget);
    if (isPointInPolygon(clientPoint, safePoly)) {
      return;
    }
    this.#clearTracking();
    this.#opts.onPointerExit();
  }
  #clearTracking() {
    this.#exitPoint = null;
    this.#exitTarget = null;
    this.#transitTargets = [];
    this.#cancelLeaveFallback();
    this.#cancelTransitIntentTimeout();
  }
  /**
   * Creates a rectangular corridor between trigger and content
   * This prevents closing when cursor is in the gap between them
   */
  #getCorridorPolygon(triggerRect, contentRect, side) {
    const buffer = this.#buffer;
    switch (side) {
      case "top":
        return [
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            triggerRect.top
          ],
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            contentRect.bottom
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            contentRect.bottom
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            triggerRect.top
          ]
        ];
      case "bottom":
        return [
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            triggerRect.bottom
          ],
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            contentRect.top
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            contentRect.top
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            triggerRect.bottom
          ]
        ];
      case "left":
        return [
          [
            triggerRect.left,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.right,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.right,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ],
          [
            triggerRect.left,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ]
        ];
      case "right":
        return [
          [
            triggerRect.right,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.left,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.left,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ],
          [
            triggerRect.right,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ]
        ];
    }
  }
  /**
   * Creates a triangular/trapezoidal safe zone from the exit point to the target
   */
  #getSafePolygon(exitPoint, targetRect, side, exitTarget) {
    const buffer = this.#buffer * 4;
    const [x, y] = exitPoint;
    const effectiveSide = exitTarget === "trigger" ? this.#flipSide(side) : side;
    switch (effectiveSide) {
      case "top":
        return [
          [x - buffer, y + buffer],
          [x + buffer, y + buffer],
          [targetRect.right + buffer, targetRect.bottom],
          [targetRect.right + buffer, targetRect.top],
          [targetRect.left - buffer, targetRect.top],
          [targetRect.left - buffer, targetRect.bottom]
        ];
      case "bottom":
        return [
          [x - buffer, y - buffer],
          [x + buffer, y - buffer],
          [targetRect.right + buffer, targetRect.top],
          [targetRect.right + buffer, targetRect.bottom],
          [targetRect.left - buffer, targetRect.bottom],
          [targetRect.left - buffer, targetRect.top]
        ];
      case "left":
        return [
          [x + buffer, y - buffer],
          [x + buffer, y + buffer],
          [targetRect.right, targetRect.bottom + buffer],
          [targetRect.left, targetRect.bottom + buffer],
          [targetRect.left, targetRect.top - buffer],
          [targetRect.right, targetRect.top - buffer]
        ];
      case "right":
        return [
          [x - buffer, y - buffer],
          [x - buffer, y + buffer],
          [targetRect.left, targetRect.bottom + buffer],
          [targetRect.right, targetRect.bottom + buffer],
          [targetRect.right, targetRect.top - buffer],
          [targetRect.left, targetRect.top - buffer]
        ];
    }
  }
  #flipSide(side) {
    switch (side) {
      case "top":
        return "bottom";
      case "bottom":
        return "top";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  }
}
const linkPreviewAttrs = createBitsAttrs({ component: "link-preview", parts: ["content", "trigger"] });
const LinkPreviewRootContext = new Context("LinkPreview.Root");
class LinkPreviewRootState {
  static create(opts) {
    return LinkPreviewRootContext.set(new LinkPreviewRootState(opts));
  }
  opts;
  hasSelection = false;
  isPointerDownOnContent = false;
  containsSelection = false;
  timeout = null;
  contentNode = null;
  contentMounted = false;
  contentPresence;
  triggerNode = null;
  isOpening = false;
  domContext = new DOMContext(() => null);
  constructor(opts) {
    this.opts = opts;
    this.contentPresence = new PresenceManager({
      ref: boxWith(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
    watch(() => this.opts.open.current, (isOpen) => {
      if (!isOpen) {
        this.hasSelection = false;
        return;
      }
      if (!this.domContext) return;
      const handlePointerUp = () => {
        this.containsSelection = false;
        this.isPointerDownOnContent = false;
        afterSleep(1, () => {
          const isSelection = this.domContext.getDocument().getSelection()?.toString() !== "";
          if (isSelection) {
            this.hasSelection = true;
          } else {
            this.hasSelection = false;
          }
        });
      };
      const unsubListener = on(this.domContext.getDocument(), "pointerup", handlePointerUp);
      if (!this.contentNode) return;
      const tabCandidates = getTabbableCandidates(this.contentNode);
      for (const candidate of tabCandidates) {
        candidate.setAttribute("tabindex", "-1");
      }
      return () => {
        unsubListener();
        this.hasSelection = false;
        this.isPointerDownOnContent = false;
      };
    });
  }
  clearTimeout() {
    if (this.timeout) {
      this.domContext.clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
  handleOpen() {
    this.clearTimeout();
    if (this.opts.open.current || this.opts.disabled.current) return;
    this.isOpening = true;
    this.timeout = this.domContext.setTimeout(
      () => {
        if (this.isOpening) {
          this.opts.open.current = true;
          this.isOpening = false;
        }
      },
      this.opts.openDelay.current
    );
  }
  immediateClose() {
    this.clearTimeout();
    this.isOpening = false;
    this.opts.open.current = false;
  }
  handleClose() {
    this.isOpening = false;
    this.clearTimeout();
    if (!this.isPointerDownOnContent && !this.hasSelection) {
      this.timeout = this.domContext.setTimeout(
        () => {
          this.opts.open.current = false;
        },
        this.opts.closeDelay.current
      );
    }
  }
}
class LinkPreviewTriggerState {
  static create(opts) {
    return new LinkPreviewTriggerState(opts, LinkPreviewRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.triggerNode = v);
    this.root.domContext = new DOMContext(opts.ref);
    this.onpointerenter = this.onpointerenter.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
    this.onfocus = this.onfocus.bind(this);
    this.onblur = this.onblur.bind(this);
  }
  onpointerenter(e) {
    if (isTouch(e)) return;
    this.root.handleOpen();
  }
  onpointerleave(e) {
    if (isTouch(e)) return;
    if (!this.root.contentMounted || !this.root.opts.open.current) {
      this.root.immediateClose();
    }
  }
  onfocus(e) {
    if (!isFocusVisible(e.currentTarget)) return;
    this.root.handleOpen();
  }
  onblur(_) {
    this.root.handleClose();
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-haspopup": "dialog",
    "aria-expanded": boolToStr(this.root.opts.open.current),
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "aria-controls": this.root.contentNode?.id,
    role: "button",
    [linkPreviewAttrs.trigger]: "",
    onpointerenter: this.onpointerenter,
    onfocus: this.onfocus,
    onblur: this.onblur,
    onpointerleave: this.onpointerleave,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class LinkPreviewContentState {
  static create(opts) {
    return new LinkPreviewContentState(opts, LinkPreviewRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    this.root.domContext = new DOMContext(opts.ref);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerenter = this.onpointerenter.bind(this);
    this.onfocusout = this.onfocusout.bind(this);
    new SafePolygon({
      triggerNode: () => this.root.triggerNode,
      contentNode: () => this.opts.ref.current,
      enabled: () => this.root.opts.open.current,
      onPointerExit: () => {
        this.root.handleClose();
      }
    });
  }
  onpointerdown(e) {
    const target = e.target;
    if (!isElement(target)) return;
    if (e.currentTarget.contains(target)) {
      this.root.containsSelection = true;
    }
    this.root.hasSelection = true;
    this.root.isPointerDownOnContent = true;
  }
  onpointerenter(e) {
    if (isTouch(e)) return;
    this.root.handleOpen();
  }
  onfocusout(e) {
    e.preventDefault();
  }
  onInteractOutside = (e) => {
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current?.(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  get shouldRender() {
    return this.root.contentPresence.shouldRender;
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    tabindex: -1,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    [linkPreviewAttrs.content]: "",
    onpointerdown: this.onpointerdown,
    onpointerenter: this.onpointerenter,
    onfocusout: this.onfocusout,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus
  };
}
function Link_preview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      disabled = false,
      open = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      openDelay = 700,
      closeDelay = 300,
      children
    } = $$props;
    LinkPreviewRootState.create({
      disabled: boxWith(() => disabled),
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      openDelay: boxWith(() => openDelay),
      closeDelay: boxWith(() => closeDelay),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    if (Floating_layer) {
      $$renderer2.push("<!--[-->");
      Floating_layer($$renderer2, {
        children: ($$renderer3) => {
          children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        }
      });
      $$renderer2.push("<!--]-->");
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push("<!--]-->");
    }
    bind_props($$props, { open });
  });
}
function Link_preview_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      ref = null,
      id = createId(uid),
      child,
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const triggerState = LinkPreviewTriggerState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = derived(() => mergeProps(restProps, triggerState.props));
    if (Floating_layer_anchor) {
      $$renderer2.push("<!--[-->");
      Floating_layer_anchor($$renderer2, {
        id,
        ref: triggerState.opts.ref,
        children: ($$renderer3) => {
          if (child) {
            $$renderer3.push("<!--[0-->");
            child($$renderer3, { props: mergedProps() });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[-1-->");
            $$renderer3.push(`<a${attributes({ ...mergedProps() })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></a>`);
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push("<!--]-->");
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push("<!--]-->");
    }
    bind_props($$props, { ref });
  });
}
function UserStatusLinkPreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let id = fallback($$props["id"], null);
    let side = fallback($$props["side"], "top");
    let align = fallback($$props["align"], "start");
    let sideOffset = fallback($$props["sideOffset"], 6);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { id, side, align, sideOffset });
  });
}
function Badge($$renderer, $$props) {
  let type = fallback($$props["type"], "info");
  let content = fallback($$props["content"], "");
  const classNames = {
    info: "bg-blue-500/20 text-blue-700 dark:text-blue-200 ",
    success: "bg-green-500/20 text-green-700 dark:text-green-200",
    warning: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-200",
    error: "bg-red-500/20 text-red-700 dark:text-red-200",
    muted: "bg-gray-500/20 text-gray-700 dark:text-gray-200"
  };
  $$renderer.push(`<div${attr_class(` text-xs font-medium ${stringify(classNames[type] ?? classNames["info"])} w-fit px-[5px] rounded-lg uppercase line-clamp-1 mr-0.5`)}>${escape_html(content)}</div>`);
  bind_props($$props, { type, content });
}
export {
  Badge as B,
  LinkPreviewContentState as L,
  UserStatusLinkPreview as U,
  getUsers as a,
  getAndUpdateUserLocation as b,
  Link_preview as c,
  Link_preview_trigger as d,
  getUserInfoById as e,
  getUserSettings as f,
  getUserGroupsById as g,
  searchUsers as s,
  updateUserSettings as u
};
//# sourceMappingURL=Badge.js.map
