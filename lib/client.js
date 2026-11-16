window.__ModuleLoader__.load({
	id: "dsh-prompt-upgrade",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  NS: () => NS,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/EnhanceButton.tsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");

// src/shared/validate.ts
function isInvisibleCodePoint(cp) {
  return cp >= 8203 && cp <= 8205 || cp === 65279 || cp >= 8234 && cp <= 8238 || cp >= 8294 && cp <= 8297;
}
function scanText(text) {
  let count = 0;
  let visibleNonBlank = false;
  for (const ch of text) {
    count++;
    const code = ch.codePointAt(0) ?? 0;
    if (!isInvisibleCodePoint(code) && !/\s/.test(ch)) visibleNonBlank = true;
  }
  return { count, visibleNonBlank };
}
function checkInputText(text, maxChars) {
  const { count, visibleNonBlank } = scanText(text);
  if (!visibleNonBlank) {
    return { ok: false, code: "empty" };
  }
  if (count > maxChars) {
    return { ok: false, code: "too-long", count, max: maxChars };
  }
  return { ok: true };
}

// src/shared/protocol.ts
var ENHANCE_ENDPOINT = "/prompt-upgrade/enhance";
var ENHANCE_STREAM_ENDPOINT = "/prompt-upgrade/enhance-stream";
var PROMPT_ENHANCE_ROW_IDS = [
  "prompt-upgrade",
  "dsh-prompt-upgrade",
  "web-ui-prompt-upgrade"
];

// src/client/enhance-client.ts
var EnhanceClientError = class extends Error {
  constructor(detail) {
    super(detail.message);
    this.detail = detail;
  }
};
function jsonBody(body) {
  return new TextEncoder().encode(JSON.stringify(body));
}
var KNOWN_ERROR_CODES = /* @__PURE__ */ new Set([
  "rejected",
  "rate-limit",
  "concurrency-limit",
  "cooldown",
  "timeout",
  "upstream",
  "unconfigured",
  "internal"
]);
function parseError(value) {
  const record = value;
  if (record !== null && typeof record === "object") {
    const code = typeof record.code === "string" && KNOWN_ERROR_CODES.has(record.code) ? record.code : "internal";
    const message = typeof record.message === "string" && record.message !== "" ? record.message : void 0;
    const params = record.params !== null && typeof record.params === "object" ? record.params : void 0;
    return { code, ...message !== void 0 ? { message } : {}, ...params !== void 0 ? { params } : {} };
  }
  return { code: "internal", message: "\u5BBF\u4E3B\u670D\u52A1\u8FD4\u56DE\u5F02\u5E38\u3002" };
}
function parseResult(value) {
  const record = value;
  if (record !== null && typeof record === "object" && typeof record.text === "string" && record.text !== "" && typeof record.provider === "string" && record.provider !== "" && typeof record.model === "string" && record.model !== "" && typeof record.elapsedMs === "number" && Number.isFinite(record.elapsedMs)) {
    return { text: record.text, provider: record.provider, model: record.model, elapsedMs: record.elapsedMs };
  }
  throw new EnhanceClientError({ code: "internal", message: "\u5BBF\u4E3B\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u7ED3\u679C\u3002" });
}
async function readEnvelope(response) {
  let parsed;
  try {
    parsed = await response.json();
  } catch {
    throw new EnhanceClientError({ code: "internal", message: "\u5BBF\u4E3B\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u54CD\u5E94\u3002" });
  }
  const envelope = parsed;
  if (envelope !== null && typeof envelope === "object" && envelope.ok === true) {
    return parseResult(envelope.value);
  }
  if (envelope !== null && typeof envelope === "object" && envelope.error !== void 0) {
    throw new EnhanceClientError(parseError(envelope.error));
  }
  throw new EnhanceClientError({ code: "internal", message: `\u5BBF\u4E3B\u670D\u52A1\u8FD4\u56DE\u5F02\u5E38\uFF08HTTP ${response.status}\uFF09\u3002` });
}
async function rejectionOf(response) {
  try {
    const parsed = await response.json();
    if (parsed !== null && typeof parsed === "object" && parsed.error !== void 0) {
      return new EnhanceClientError(parseError(parsed.error));
    }
  } catch {
  }
  return new EnhanceClientError({ code: "internal", message: `\u5BBF\u4E3B\u670D\u52A1\u62D2\u7EDD\u4E86\u8BF7\u6C42\uFF08HTTP ${response.status}\uFF09\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002` });
}
function takeFrames(buffer) {
  const frames = [];
  let rest = buffer;
  for (let index = rest.indexOf("\n\n"); index !== -1; index = rest.indexOf("\n\n")) {
    const raw = rest.slice(0, index);
    rest = rest.slice(index + 2);
    let event = "message";
    const data = [];
    for (const line of raw.split("\n")) {
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trim());
    }
    if (data.length > 0) frames.push({ event, data: data.join("\n") });
  }
  return { frames, rest };
}
function parseFrame(frame) {
  if (frame.event !== "delta" && frame.event !== "done" && frame.event !== "error") return void 0;
  let parsed;
  try {
    parsed = JSON.parse(frame.data);
  } catch {
    return void 0;
  }
  const record = parsed;
  if (record === null || typeof record !== "object" || record.type !== frame.event) return void 0;
  return record;
}
async function requestEnhanceStream(body, options) {
  let response;
  try {
    response = await fetch(ENHANCE_STREAM_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: jsonBody(body),
      signal: options.signal
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw new EnhanceClientError({ code: "internal", message: "\u5DF2\u53D6\u6D88\u589E\u5F3A\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002" });
    }
    void error;
    throw new EnhanceClientError({ code: "internal", message: "\u65E0\u6CD5\u8FDE\u63A5\u5BBF\u4E3B\u670D\u52A1\uFF0C\u8BF7\u786E\u8BA4 dsh web \u6B63\u5728\u8FD0\u884C\u540E\u91CD\u8BD5\u3002" });
  }
  const contentType = String(response.headers.get("content-type") ?? "").toLowerCase();
  if (!response.ok) throw await rejectionOf(response);
  const stream = response.body;
  if (stream === null || stream === void 0 || !contentType.includes("event-stream")) {
    void Promise.resolve().then(() => stream?.cancel()).catch(() => {
    });
    return requestEnhance(body, options.signal);
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { frames, rest } = takeFrames(buffer);
      buffer = rest;
      for (const frame of frames) {
        const event = parseFrame(frame);
        if (event === void 0) continue;
        if (event.type === "delta") options.onDelta(event.text);
        else if (event.type === "done") return parseResult(event.value);
        else throw new EnhanceClientError(parseError(event.error));
      }
    }
  } finally {
    void Promise.resolve().then(() => reader.cancel()).catch(() => {
    });
  }
  throw new EnhanceClientError({ code: "internal", message: "\u5BBF\u4E3B\u670D\u52A1\u63D0\u524D\u5173\u95ED\u4E86\u589E\u5F3A\u6D41\uFF0C\u8BF7\u91CD\u8BD5\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002" });
}
async function requestEnhance(body, signal) {
  let response;
  try {
    response = await fetch(ENHANCE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: jsonBody(body),
      signal
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new EnhanceClientError({ code: "internal", message: "\u5DF2\u53D6\u6D88\u589E\u5F3A\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002" });
    }
    void error;
    throw new EnhanceClientError({ code: "internal", message: "\u65E0\u6CD5\u8FDE\u63A5\u5BBF\u4E3B\u670D\u52A1\uFF0C\u8BF7\u786E\u8BA4 dsh web \u6B63\u5728\u8FD0\u884C\u540E\u91CD\u8BD5\u3002" });
  }
  return readEnvelope(response);
}

// src/client/ResultPanel.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var retryable = (code) => code === "upstream" || code === "timeout" || code === "internal";
var UPSTREAM_ERROR_KEYS = {
  auth: "error.upstream.auth",
  "invalid-credential": "error.upstream.invalidCredential",
  "rate-limit": "error.upstream.rateLimit",
  quota: "error.upstream.quota",
  empty: "error.upstream.empty",
  "context-window": "error.upstream.contextWindow",
  "tool-call": "error.upstream.toolCall",
  "max-tokens": "error.upstream.maxTokens"
};
function localizedErrorMessage(t, code, params) {
  if (code === "rejected" && typeof params?.count === "number" && typeof params?.max === "number") {
    return t("error.tooLong", { count: params.count, max: params.max });
  }
  if (code === "upstream" && typeof params?.reason === "string") {
    const specific = UPSTREAM_ERROR_KEYS[params.reason];
    if (specific !== void 0) return t(specific);
  }
  switch (code) {
    case "rejected":
      return t("error.rejected");
    case "rate-limit":
      return t("error.rateLimit", params);
    case "concurrency-limit":
      return t("error.concurrencyLimit", params);
    case "cooldown":
      return t("error.cooldown", params);
    case "timeout":
      return t("error.timeout", params);
    case "unconfigured":
      return t("error.unconfigured");
    case "upstream":
      return t("error.upstream");
    default:
      return t("error.internal");
  }
}
function fallbackCopy(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}
function ResultPanel(props) {
  const { state, t, onApply, onCancel, onRetry } = props;
  const [copied, setCopied] = (0, import_react.useState)("idle");
  const panelRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const onKeyDown = (event) => {
      if (event.isComposing) return;
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (panel === null) return;
        const focusables = panel.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (first === void 0 || last === void 0) return;
        const active = document.activeElement;
        const atRoot = active === panel;
        if (event.shiftKey && (active === first || atRoot)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);
  const openerRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener === null || !opener.isConnected) return;
      const active = document.activeElement;
      if (active === null || active === document.body) opener.focus();
    };
  }, []);
  const copy = (0, import_react.useCallback)(() => {
    if (state.result === void 0) return;
    const text = state.result.text;
    const done = (ok) => setCopied(ok ? "ok" : "failed");
    if (navigator.clipboard !== void 0) {
      navigator.clipboard.writeText(text).then(() => done(true), () => done(fallbackCopy(text)));
      return;
    }
    done(fallbackCopy(text));
  }, [state.result]);
  const formatMs = (ms) => ms < 1e3 ? `${ms}ms` : `${(ms / 1e3).toFixed(1)}s`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-overlay", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onCancel();
  }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "section",
    {
      ref: panelRef,
      className: "dsh-pe-panel",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t("panel.title"),
      tabIndex: -1,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "dsh-pe-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2728 ",
            t("panel.title")
          ] }),
          state.phase === "result" && state.result !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-pe-meta", children: [
            t("panel.model", { provider: state.result.provider, model: state.result.model }),
            " \xB7 ",
            t("panel.elapsed", { ms: formatMs(state.result.elapsedMs) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pe-close", "aria-label": t("panel.close"), onClick: onCancel, children: "\u2715" })
        ] }),
        state.phase === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-loading", children: state.streaming === void 0 || state.streaming === "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-spin", "aria-hidden": true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t("panel.loading") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-hint", children: t("panel.loading.hint") })
        ] }) : (
          // Incremental view: the text already generated, replaced by the
          // normalized full body the moment the call settles.
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-stream", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-col-title", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pe-spin small", "aria-hidden": true }),
              t("panel.streaming")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsh-pe-col-text", children: state.streaming })
          ] })
        ) }),
        state.phase === "error" && state.error !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-error", children: state.error.localized !== void 0 ? (
          // Client-side guard failures carry their own pre-localized copy.
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: state.error.localized })
        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: localizedErrorMessage(t, state.error.code, state.error.params) }),
          state.error.message !== void 0 && state.error.message !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-error-detail", children: state.error.message })
        ] }) }),
        state.phase === "result" && state.result !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-col", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-col-title", children: t("panel.original") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsh-pe-col-text", children: state.original })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-col", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-pe-col-title", children: t("panel.enhanced") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsh-pe-col-text", children: state.result.text })
          ] })
        ] }),
        state.phase === "result" && state.stale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-pe-stale", children: [
          "\u26A0 ",
          t("panel.stale.warn")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "dsh-pe-foot", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-pe-grow" }),
          state.phase === "error" && retryable(state.error?.code) && onRetry !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pe-btn-action plain", onClick: onRetry, children: t("panel.retry") }),
          state.phase === "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pe-btn-action plain", onClick: copy, children: copied === "ok" ? t("panel.copied") : copied === "failed" ? t("panel.copyFailed") : t("panel.copy") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pe-btn-action primary", onClick: onApply, children: t("panel.apply") })
          ] }),
          state.phase !== "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-pe-btn-action plain", onClick: onCancel, children: state.phase === "loading" ? t("panel.cancel") : t("panel.close") })
        ] })
      ]
    }
  ) });
}

// src/client/undo-stack.ts
function totalOf(stacks) {
  let n = 0;
  for (const stack of stacks.values()) n += stack.length;
  return n;
}
function createUndoStack(maxDepth = 3, maxTotalEntries = 60) {
  const stacks = /* @__PURE__ */ new Map();
  return {
    push(sessionId, entry) {
      const stack = stacks.get(sessionId) ?? [];
      stack.push(entry);
      while (stack.length > maxDepth) stack.shift();
      stacks.delete(sessionId);
      stacks.set(sessionId, stack);
      while (totalOf(stacks) > maxTotalEntries) {
        const oldest = stacks.keys().next().value;
        if (oldest === void 0) break;
        stacks.delete(oldest);
      }
    },
    peek(sessionId) {
      const stack = stacks.get(sessionId);
      return stack === void 0 || stack.length === 0 ? void 0 : stack[stack.length - 1];
    },
    pop(sessionId) {
      const stack = stacks.get(sessionId);
      const entry = stack?.pop();
      if (stack !== void 0 && stack.length === 0) stacks.delete(sessionId);
      return entry;
    },
    clear(sessionId) {
      stacks.delete(sessionId);
    },
    depth(sessionId) {
      return stacks.get(sessionId)?.length ?? 0;
    }
  };
}

// src/client/ui-state.ts
var listeners = /* @__PURE__ */ new Set();
var panelState;
var version = 0;
function notify() {
  version++;
  for (const listener of listeners) listener();
}
var pendingDeltaText = "";
var pendingDeltaSession;
var pendingDeltaScheduled = false;
function flushPendingDelta() {
  pendingDeltaScheduled = false;
  if (pendingDeltaText === "" || pendingDeltaSession === void 0) return;
  const sessionId = pendingDeltaSession;
  const text = pendingDeltaText;
  pendingDeltaText = "";
  pendingDeltaSession = void 0;
  if (panelState === void 0 || panelState.sessionId !== sessionId || panelState.phase !== "loading") return;
  panelState = { ...panelState, streaming: (panelState.streaming ?? "") + text };
  notify();
}
function scheduleDeltaFlush() {
  if (pendingDeltaScheduled) return;
  pendingDeltaScheduled = true;
  queueMicrotask(flushPendingDelta);
}
var undoStore = createUndoStack(3);
function pushUndo(sessionId, entry) {
  undoStore.push(sessionId, entry);
  notify();
}
function peekUndo(sessionId) {
  return undoStore.peek(sessionId);
}
function popUndo(sessionId) {
  const entry = undoStore.pop(sessionId);
  notify();
  return entry;
}
var sessions = /* @__PURE__ */ new Map();
var lastMountedSession;
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getVersion() {
  return version;
}
function getPanel() {
  return panelState;
}
function abortOf(state) {
  try {
    state?.abort?.();
  } catch {
  }
}
function openLoading(state) {
  abortOf(panelState);
  panelState = { ...state, phase: "loading" };
  notify();
}
function settleResult(sessionId, result) {
  if (panelState?.sessionId !== sessionId || panelState.phase !== "loading") return;
  panelState = { sessionId, phase: "result", original: panelState.original, result };
  notify();
}
function settleError(sessionId, error) {
  if (panelState?.sessionId !== sessionId || panelState.phase !== "loading") return;
  panelState = { sessionId, phase: "error", original: panelState.original, error };
  notify();
}
function appendDelta(sessionId, text) {
  if (text === "") return;
  if (panelState === void 0 || panelState.sessionId !== sessionId || panelState.phase !== "loading") return;
  pendingDeltaText += text;
  pendingDeltaSession = sessionId;
  scheduleDeltaFlush();
}
function openError(sessionId, original, error) {
  abortOf(panelState);
  panelState = { sessionId, phase: "error", original, error };
  notify();
}
function setStale(sessionId, stale) {
  if (panelState?.sessionId !== sessionId || panelState.phase !== "result" || panelState.stale === stale) return;
  panelState = { ...panelState, stale };
  notify();
}
function closePanel() {
  abortOf(panelState);
  if (panelState === void 0) return;
  panelState = void 0;
  notify();
}
function registerSession(sessionId, entry) {
  sessions.set(sessionId, entry);
  lastMountedSession = sessionId;
  notify();
  return () => {
    if (sessions.get(sessionId) === entry) sessions.delete(sessionId);
    if (lastMountedSession === sessionId) {
      const keys = [...sessions.keys()];
      lastMountedSession = keys[keys.length - 1];
    }
    if (panelState?.sessionId === sessionId) closePanel();
    undoStore.clear(sessionId);
    notify();
  };
}
function shortcutTarget() {
  const active = document.activeElement;
  if (active !== null && active instanceof Element) {
    let node = active;
    for (let depth = 0; depth < 8 && node !== null; depth++) {
      if (node === document.body || node === document.documentElement) break;
      for (const entry of sessions.values()) {
        if (entry.root !== null && (node === entry.root || node.contains(entry.root))) {
          const found = entry;
          return () => found.run();
        }
      }
      node = node.parentElement;
    }
  }
  const fallback = lastMountedSession !== void 0 ? sessions.get(lastMountedSession) : void 0;
  return fallback === void 0 ? void 0 : () => fallback.run();
}

// src/client/settings.ts
var DEFAULT_CLIENT_SETTINGS = {
  enabled: true,
  maxInputChars: 12e3,
  shortcut: "ctrl+alt+e",
  streaming: true
};
var listeners2 = /* @__PURE__ */ new Set();
var current = DEFAULT_CLIENT_SETTINGS;
function setClientSettings(next) {
  current = next;
  for (const listener of listeners2) listener();
}
function getClientSettings() {
  return current;
}
function subscribeClientSettings(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}
function decodeClientSettings(section) {
  const record = section;
  if (record === null || typeof record !== "object") return DEFAULT_CLIENT_SETTINGS;
  return {
    enabled: typeof record.enabled === "boolean" ? record.enabled : DEFAULT_CLIENT_SETTINGS.enabled,
    maxInputChars: typeof record.maxInputChars === "number" && Number.isFinite(record.maxInputChars) && record.maxInputChars > 0 ? Math.floor(record.maxInputChars) : DEFAULT_CLIENT_SETTINGS.maxInputChars,
    shortcut: typeof record.shortcut === "string" ? record.shortcut : DEFAULT_CLIENT_SETTINGS.shortcut,
    streaming: typeof record.streaming === "boolean" ? record.streaming : DEFAULT_CLIENT_SETTINGS.streaming
  };
}

// src/client/session-key.ts
var import_react2 = require("react");
var fallbackSeq = 0;
var zoneKeys = /* @__PURE__ */ new WeakMap();
function fallbackKeyOf(share) {
  if (share === void 0) return `pe:mount:${++fallbackSeq}`;
  const known = zoneKeys.get(share);
  if (known !== void 0) return known;
  const minted = `pe:zone:${++fallbackSeq}`;
  zoneKeys.set(share, minted);
  return minted;
}
function useSessionKey(maybeSessionId, share) {
  const fallback = (0, import_react2.useRef)(void 0);
  if (maybeSessionId !== void 0 && maybeSessionId !== "") return maybeSessionId;
  if (fallback.current === void 0) fallback.current = fallbackKeyOf(share);
  return fallback.current;
}
function serverSessionId(maybeSessionId) {
  return maybeSessionId !== void 0 && maybeSessionId !== "" ? maybeSessionId : void 0;
}

// src/client/EnhanceButton.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function countOf(value) {
  return Array.isArray(value) ? value.length : 0;
}
function stringOf(value) {
  return typeof value === "string" ? value : "";
}
function EnhanceButton(props) {
  const { t, sessionId, useInput, inputActions } = props;
  const uiKey = useSessionKey(sessionId, inputActions);
  const wireId = serverSessionId(sessionId);
  const draft = useInput((state) => stringOf(state.draft));
  const phase = useInput((state) => state.phase);
  const occurrenceCount = useInput((state) => countOf(state.occurrences));
  const attachmentCount = useInput((state) => {
    const record = state;
    return countOf(record.attachmentIds) + countOf(record.imageIds);
  });
  const settings = (0, import_react3.useSyncExternalStore)(subscribeClientSettings, getClientSettings);
  const panel = (0, import_react3.useSyncExternalStore)(subscribe, getPanel);
  const rootRef = (0, import_react3.useRef)(null);
  const busy = panel !== void 0 && panel.sessionId === uiKey && panel.phase === "loading";
  const anyBusy = panel !== void 0 && panel.phase === "loading";
  const otherBusy = anyBusy && !busy;
  const start = (0, import_react3.useCallback)(() => {
    if (anyBusy) return;
    if (!settings.enabled) {
      const disabled = t("error.disabled");
      openError(uiKey, draft, { code: "rejected", localized: disabled });
      return;
    }
    if (attachmentCount > 0 && draft.trim() === "") {
      const attachmentsOnly = t("error.attachmentsOnly");
      openError(uiKey, draft, { code: "rejected", localized: attachmentsOnly });
      return;
    }
    const check = checkInputText(draft, settings.maxInputChars);
    if (!check.ok) {
      const message = check.code === "empty" ? t("error.empty") : t("error.tooLong", { count: check.count, max: check.max });
      openError(uiKey, draft, { code: "rejected", localized: message });
      return;
    }
    if (occurrenceCount > 0) {
      const occurrences = t("error.occurrences");
      openError(uiKey, draft, { code: "rejected", localized: occurrences });
      return;
    }
    if (phase !== "plain") {
      const busyPhase = t("error.phase");
      openError(uiKey, draft, { code: "rejected", localized: busyPhase });
      return;
    }
    const controller = new AbortController();
    openLoading({ sessionId: uiKey, original: draft, abort: () => controller.abort() });
    const settle = (result) => settleResult(uiKey, result);
    const fail = (error) => {
      const detail = error instanceof EnhanceClientError ? error.detail : { code: "internal", message: error instanceof Error ? error.message : String(error) };
      settleError(uiKey, detail);
    };
    if (settings.streaming) {
      requestEnhanceStream({ sessionId: wireId, text: draft }, {
        signal: controller.signal,
        onDelta: (delta) => appendDelta(uiKey, delta)
      }).then(settle, fail);
      return;
    }
    requestEnhance({ sessionId: wireId, text: draft }, controller.signal).then(settle, fail);
  }, [anyBusy, draft, attachmentCount, occurrenceCount, phase, settings, uiKey, wireId, t]);
  const runRef = (0, import_react3.useRef)(start);
  (0, import_react3.useEffect)(() => {
    runRef.current = start;
  });
  (0, import_react3.useEffect)(() => {
    const entry = {
      root: rootRef.current,
      run: () => runRef.current()
    };
    return registerSession(uiKey, entry);
  }, [uiKey]);
  (0, import_react3.useEffect)(() => {
    if (panel !== void 0 && panel.sessionId === uiKey && panel.phase === "result") {
      setStale(uiKey, draft !== panel.original);
    }
  }, [draft, panel, uiKey]);
  const apply2 = (0, import_react3.useCallback)(() => {
    if (panel === void 0 || panel.phase !== "result" || panel.result === void 0) return;
    pushUndo(uiKey, { original: draft, applied: panel.result.text });
    inputActions.setDraft(panel.result.text);
    closePanel();
  }, [draft, inputActions, panel, uiKey]);
  if (!settings.enabled) return null;
  const owned = panel !== void 0 && panel.sessionId === uiKey ? panel : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        ref: rootRef,
        type: "button",
        className: `dsh-pe-btn${busy ? " is-busy" : ""}`,
        title: busy ? t("button.busy") : otherBusy ? t("button.otherBusy") : t("button.title"),
        "aria-label": otherBusy ? t("button.otherBusy") : t("button.title"),
        "aria-disabled": otherBusy || void 0,
        onClick: start,
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-pe-btn-icon", "aria-hidden": true, children: busy ? "\u25CC" : "\u2728" })
      }
    ),
    owned !== void 0 && (0, import_react_dom.createPortal)(
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        ResultPanel,
        {
          state: owned,
          t,
          onApply: apply2,
          onCancel: () => closePanel(),
          onRetry: owned.phase === "error" ? start : void 0
        }
      ),
      document.body
    )
  ] });
}

// src/client/UndoBar.tsx
var import_react4 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function UndoBar(props) {
  const { t, sessionId, useInput, inputActions } = props;
  const uiKey = useSessionKey(sessionId, inputActions);
  const draft = useInput((state) => {
    const value = state.draft;
    return typeof value === "string" ? value : "";
  });
  (0, import_react4.useSyncExternalStore)(subscribe, getVersion);
  const entry = peekUndo(uiKey);
  (0, import_react4.useEffect)(() => {
    if (entry !== void 0 && entry.applied !== draft) popUndo(uiKey);
  }, [draft, entry, uiKey]);
  if (entry === void 0 || entry.applied !== draft) return null;
  const undo = () => {
    inputActions.setDraft(entry.original);
    popUndo(uiKey);
  };
  const dismiss = () => {
    popUndo(uiKey);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-pe-undo", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-pe-undo-check", "aria-hidden": true, children: "\u2713" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("undo.applied") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsh-pe-undo-link", onClick: undo, children: t("undo.undo") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsh-pe-undo-x", "aria-label": t("undo.dismiss"), onClick: dismiss, children: "\u2715" })
  ] });
}

// src/client/locales.ts
var zh = {
  "button.title": "\u63D0\u793A\u8BCD\u589E\u5F3A\uFF08\u91CD\u5199\u4E3A\u7ED3\u6784\u5316\u63D0\u793A\u8BCD\uFF09",
  "button.busy": "\u6B63\u5728\u589E\u5F3A\u2026",
  "button.otherBusy": "\u53E6\u4E00\u4E2A\u4F1A\u8BDD\u6B63\u5728\u589E\u5F3A\u4E2D\uFF1B\u8BF7\u7B49\u5B83\u5B8C\u6210\u6216\u5148\u5173\u95ED\u5176\u7ED3\u679C\u9762\u677F\u3002",
  "panel.title": "\u63D0\u793A\u8BCD\u589E\u5F3A",
  "panel.loading": "\u6B63\u5728\u589E\u5F3A\uFF0C\u7A0D\u5019\u2026",
  "panel.streaming": "\u6B63\u5728\u751F\u6210\uFF08\u8FB9\u5199\u8FB9\u663E\u793A\uFF09\u2026",
  "panel.loading.hint": "\u539F\u6587\u4FDD\u7559\u5728\u8F93\u5165\u6846\u4E2D\uFF0C\u4E0D\u4F1A\u88AB\u52A8\u4FEE\u6539\u3002",
  "panel.cancel": "\u53D6\u6D88",
  "panel.original": "\u539F\u59CB\u63D0\u793A\u8BCD",
  "panel.enhanced": "\u589E\u5F3A\u7ED3\u679C",
  "panel.apply": "\u56DE\u586B\u5230\u8F93\u5165\u6846",
  "panel.copy": "\u590D\u5236\u7ED3\u679C",
  "panel.copied": "\u5DF2\u590D\u5236",
  "panel.copyFailed": "\u590D\u5236\u5931\u8D25",
  "panel.close": "\u5173\u95ED",
  "panel.retry": "\u91CD\u8BD5",
  "panel.stale.warn": "\u8349\u7A3F\u5728\u589E\u5F3A\u671F\u95F4\u6709\u6539\u52A8\u2014\u2014\u589E\u5F3A\u7ED3\u679C\u57FA\u4E8E\u589E\u5F3A\u524D\u7684\u6587\u672C\u3002\u56DE\u586B\u5C06\u8986\u76D6\u4F60\u7684\u6700\u65B0\u7F16\u8F91(\u64A4\u9500\u53EF\u6062\u590D\u56DE\u586B\u524D\u7684\u8349\u7A3F)\u3002",
  "panel.model": "\u6A21\u578B\uFF1A{provider} / {model}",
  "panel.elapsed": "\u8017\u65F6 {ms}",
  "undo.applied": "\u5DF2\u7528\u589E\u5F3A\u7ED3\u679C\u66FF\u6362\u539F\u63D0\u793A\u8BCD",
  "undo.undo": "\u64A4\u9500",
  "undo.dismiss": "\u5173\u95ED\u63D0\u793A",
  "error.empty": "\u8F93\u5165\u6846\u4E3A\u7A7A\uFF0C\u8BF7\u5148\u8F93\u5165\u8981\u589E\u5F3A\u7684\u63D0\u793A\u8BCD\u3002",
  "error.tooLong": "\u5185\u5BB9\u5171 {count} \u4E2A\u5B57\u7B26\uFF0C\u8D85\u8FC7 {max} \u4E2A\u5B57\u7B26\u4E0A\u9650\uFF08\u6309 Unicode \u5B57\u7B26\u6570\u7EDF\u8BA1\uFF0C\u4E0D\u662F token \u6570\uFF09\u3002\u4E3A\u907F\u514D\u6539\u53D8\u539F\u610F\u4E0D\u4F1A\u81EA\u52A8\u622A\u65AD\uFF0C\u8BF7\u7CBE\u7B80\u540E\u518D\u8BD5\u3002",
  "error.attachmentsOnly": "\u8F93\u5165\u6846\u53EA\u9644\u52A0\u4E86\u9644\u4EF6\uFF08\u56FE\u7247\u6216\u6587\u4EF6\uFF09\uFF0C\u8BF7\u8865\u5145\u8981\u589E\u5F3A\u7684\u6587\u672C\u3002",
  "error.occurrences": "\u8F93\u5165\u5185\u5BB9\u5305\u542B\u547D\u4EE4\u6216\u6587\u4EF6\u5F15\u7528\uFF0C\u6682\u4E0D\u652F\u6301\u589E\u5F3A\uFF1B\u8BF7\u5148\u79FB\u9664\u540E\u518D\u8BD5\u3002",
  "error.phase": "\u5F53\u524D\u8F93\u5165\u6B63\u88AB\u5360\u7528\uFF08\u63D0\u4EA4\u4E2D\uFF09\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",
  "error.disabled": "\u63D0\u793A\u8BCD\u589E\u5F3A\u5DF2\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u5173\u95ED\u3002",
  "error.rejected": "\u589E\u5F3A\u8BF7\u6C42\u88AB\u62D2\u7EDD\u3002",
  "error.timeout": "\u589E\u5F3A\u8D85\u65F6\uFF08{seconds} \u79D2\uFF09\uFF0C\u8BF7\u91CD\u8BD5\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002",
  "error.unconfigured": "\u5C1A\u672A\u786E\u5B9A\u589E\u5F3A\u7528\u7684\u6A21\u578B\uFF1A\u8BF7\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u6210\u5BF9\u586B\u5199 provider/model\uFF0C\u6216\u5148\u5728\u5F53\u524D\u4F1A\u8BDD\u53D1\u9001\u4E00\u6761\u6D88\u606F\uFF08\u5C06\u8DDF\u968F\u4F1A\u8BDD\u6A21\u578B\uFF09\u3002",
  "error.upstream": "\u6A21\u578B\u670D\u52A1\u8FD4\u56DE\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002",
  "error.internal": "\u589E\u5F3A\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\uFF1B\u539F\u8F93\u5165\u672A\u6539\u52A8\u3002",
  "error.rateLimit": "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF1A\u6BCF\u5206\u949F\u6700\u591A {limit} \u6B21\u589E\u5F3A\uFF0C\u8BF7\u5728 {retryAfterSeconds} \u79D2\u540E\u518D\u8BD5\u3002",
  "error.concurrencyLimit": "\u5DF2\u6709 {max} \u4E2A\u589E\u5F3A\u6B63\u5728\u8FDB\u884C\uFF0C\u8BF7\u7B49\u5176\u4E2D\u4E00\u4E2A\u5B8C\u6210\u540E\u518D\u8BD5\u3002",
  "error.cooldown": "\u8FDE\u7EED {failures} \u6B21\u589E\u5F3A\u5931\u8D25\uFF0C\u5DF2\u6682\u505C\u8C03\u7528\u4EE5\u514D\u6301\u7EED\u51B2\u51FB\u6A21\u578B\u670D\u52A1\uFF1B\u8BF7 {retryAfterSeconds} \u79D2\u540E\u91CD\u8BD5\uFF0C\u6216\u5148\u68C0\u67E5\u8BBE\u7F6E\u91CC\u7684\u6A21\u578B\u914D\u7F6E\u3002",
  "error.upstream.auth": "\u9274\u6743\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5\u8BE5 provider \u7684 API Key \u914D\u7F6E\u3002",
  "error.upstream.invalidCredential": "\u9274\u6743\u5931\u8D25\uFF1A\u5B58\u50A8\u7684 API Key \u4E0D\u53EF\u7528\uFF0C\u8BF7\u4FEE\u6B63\u540E\u91CD\u8BD5\u3002",
  "error.upstream.rateLimit": "\u6A21\u578B\u670D\u52A1\u9650\u6D41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",
  "error.upstream.quota": "\u6A21\u578B\u670D\u52A1\u914D\u989D/\u4F59\u989D\u4E0D\u8DB3\uFF0C\u8BF7\u68C0\u67E5\u8D26\u6237\u3002",
  "error.upstream.empty": "\u6A21\u578B\u8FD4\u56DE\u4E86\u7A7A\u54CD\u5E94\uFF0C\u8BF7\u91CD\u8BD5\u3002",
  "error.upstream.contextWindow": "\u8F93\u5165\u8D85\u51FA\u6A21\u578B\u4E0A\u4E0B\u6587\u7A97\u53E3\uFF0C\u8BF7\u7CBE\u7B80\u539F\u6587\u6216\u66F4\u6362\u6A21\u578B\u3002",
  "error.upstream.toolCall": "\u6A21\u578B\u8BF7\u6C42\u4E86\u5DE5\u5177\u8C03\u7528\uFF0C\u63D0\u793A\u8BCD\u589E\u5F3A\u53EA\u9700\u8981\u7EAF\u6587\u672C\uFF1B\u8BF7\u66F4\u6362\u6A21\u578B\u540E\u91CD\u8BD5\u3002",
  "error.upstream.maxTokens": "\u91CD\u5199\u7ED3\u679C\u8FBE\u5230\u8F93\u51FA\u4E0A\u9650\uFF08maxOutputTokens\uFF09\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u8C03\u5927\u4E0A\u9650\u6216\u7CBE\u7B80\u539F\u6587\u540E\u91CD\u8BD5\u3002",
  "settings.unavailable": "\u5F53\u524D\u90E8\u7F72\u6CA1\u6709\u5411\u672C\u754C\u9762\u63D0\u4F9B\u8BE5\u63D2\u4EF6\u7684\u8BBE\u7F6E\u9879\u3002",
  "settings.readOnly": "\u5F53\u524D\u90E8\u7F72\u628A\u8BBE\u7F6E\u6587\u6863\u8BBE\u4E3A\u53EA\u8BFB\uFF0C\u4FEE\u6539\u4E0D\u4F1A\u4FDD\u5B58\u3002",
  "settings.saveFailed": "\u4FDD\u5B58\u672A\u88AB\u63A5\u53D7\uFF1A\u8BF7\u68C0\u67E5\u6807\u7EA2\u7684\u5B57\u6BB5\uFF08\u5BBF\u4E3B\u4F1A\u518D\u6B21\u6821\u9A8C\u5E76\u53EF\u80FD\u62D2\u7EDD\u8D8A\u754C\u503C\uFF09\u3002",
  "settings.save": "\u4FDD\u5B58",
  "settings.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "settings.overridden": "\u5DF2\u81EA\u5B9A\u4E49",
  "settings.reset": "\u6062\u590D\u9ED8\u8BA4",
  "settings.invalid": "\u8FD9\u4E2A\u503C\u4E0D\u88AB\u63A5\u53D7\uFF0C\u8BF7\u4FEE\u6B63\u540E\u518D\u4FDD\u5B58\u3002",
  "settings.group.basic": "\u57FA\u7840",
  "settings.group.cost": "\u6210\u672C\u4E0E\u6027\u80FD",
  "settings.group.context": "\u6A21\u578B\u8DEF\u7531\u4E0E\u4E0A\u4E0B\u6587",
  "field.enabled.label": "\u542F\u7528\u63D0\u793A\u8BCD\u589E\u5F3A",
  "field.enabled.hint": "\u5173\u95ED\u540E\u9690\u85CF\u8F93\u5165\u6846\u65C1\u7684\u589E\u5F3A\u6309\u94AE\uFF0C\u5E76\u505C\u7528\u5FEB\u6377\u952E\u4E0E\u5168\u90E8\u89E6\u53D1\u65B9\u5F0F\u3002",
  "field.shortcut.label": "\u5FEB\u6377\u952E",
  "field.shortcut.hint": "\u4F8B\u5982 ctrl+alt+e\uFF1B\u5FC5\u987B\u542B ctrl/alt/meta \u4E2D\u81F3\u5C11\u4E00\u4E2A\u4FEE\u9970\u952E\uFF08shift \u53EA\u80FD\u4F5C\u9644\u52A0\uFF09\u3002\u7559\u7A7A\u8868\u793A\u7981\u7528\u3002",
  "field.streaming.label": "\u589E\u91CF\u663E\u793A",
  "field.streaming.hint": "\u6A21\u578B\u8FB9\u5199\u8FB9\u5728\u9762\u677F\u663E\u793A\u3002\u53EA\u5F71\u54CD\u663E\u793A\u8282\u594F\uFF0C\u6700\u7EC8\u56DE\u586B\u7684\u6B63\u6587\u4E0D\u53D8\u3002",
  "field.contextAware.label": "\u4E0A\u4E0B\u6587\u611F\u77E5",
  "field.contextAware.hint": "\u8BFB\u53D6\u5F53\u524D\u4F1A\u8BDD\u8FD1\u671F\u5BF9\u8BDD\uFF0C\u7528\u4E8E\u6D88\u89E3\u6307\u4EE3\u4E0E\u8865\u5168\u7701\u7565\u3002\u65E0\u5386\u53F2\u6216\u5386\u53F2\u4E0D\u8DB3\u65F6\u81EA\u52A8\u56DE\u9000\u4E3A\u5355\u6761\u589E\u5F3A\u3002",
  "field.strategyMode.label": "\u81EA\u5B9A\u4E49\u63D0\u793A\u8BCD\u7684\u7EC4\u5408\u65B9\u5F0F",
  "field.strategyMode.hint": "replace-default\uFF1A\u6574\u4F53\u66FF\u6362\u5185\u7F6E\u7B56\u7565\uFF08\u5185\u7F6E\u7684\u300C\u4E0D\u7F16\u9020\u3001\u53EA\u8F93\u51FA\u6B63\u6587\u300D\u7B49\u786C\u6027\u7EA6\u675F\u4E0D\u518D\u4FDD\u7559\uFF09\uFF1Bextend-default\uFF1A\u8FFD\u52A0\u5728\u5185\u7F6E\u7B56\u7565\u4E4B\u540E\uFF0C\u786C\u6027\u7EA6\u675F\u7EE7\u7EED\u751F\u6548\u3002",
  "field.systemPrompt.label": "\u81EA\u5B9A\u4E49\u7CFB\u7EDF\u63D0\u793A\u8BCD",
  "field.systemPrompt.hint": "\u7559\u7A7A\u4F7F\u7528\u5185\u7F6E\u589E\u5F3A\u7B56\u7565\u3002\u591A\u884C\u6587\u672C\uFF1B\u5982\u4F55\u4E0E\u5185\u7F6E\u7B56\u7565\u7EC4\u5408\u7531\u4E0A\u4E00\u9879\u51B3\u5B9A\u3002",
  "field.reasoningEffort.label": "\u63A8\u7406\u9884\u7B97",
  "field.reasoningEffort.hint": "off / low / high / inherit\u3002\u6539\u5199\u662F\u77ED\u800C\u660E\u786E\u7684\u4EFB\u52A1\uFF0Coff \u6700\u7701\uFF08\u540C\u4E00\u53E5\u8BDD\u5B9E\u6D4B\uFF1Aoff \u7EA6 252 \u8F93\u51FA token\uFF0Chigh \u7EA6 2897\uFF09\uFF1Binherit \u8868\u793A\u4E0D\u4F20\u8BE5\u5B57\u6BB5\u3001\u5B8C\u5168\u8DDF\u968F\u6A21\u578B\u9ED8\u8BA4\u6863\u3002",
  "field.temperature.label": "\u91C7\u6837\u6E29\u5EA6",
  "field.temperature.hint": "0\u20131 \u4E4B\u95F4\u7684\u6570\u5B57\uFF08\u53EF\u586B\u5C0F\u6570\uFF09\uFF1B\u4F4E\u6E29\u6539\u5199\u66F4\u5FE0\u5B9E\u4E8E\u539F\u610F\u3002",
  "field.maxOutputTokens.label": "\u8F93\u51FA token \u4E0A\u9650",
  "field.maxOutputTokens.hint": "\u5355\u6B21\u589E\u5F3A\u7684\u8F93\u51FA\u4E0A\u9650\uFF0C256\u201332768 \u7684\u6574\u6570\u3002",
  "field.maxInputChars.label": "\u8F93\u5165\u5B57\u6570\u4E0A\u9650",
  "field.maxInputChars.hint": "\u8D85\u9650\u62D2\u7EDD\u800C\u4E0D\u622A\u65AD\uFF08\u907F\u514D\u6539\u53D8\u539F\u610F\uFF09\uFF0C200\u2013200000 \u7684\u6574\u6570\u3002",
  "field.timeoutMs.label": "\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
  "field.timeoutMs.hint": "\u5355\u6B21\u589E\u5F3A\u7684\u7AEF\u5230\u7AEF\u65F6\u9650\uFF0C5000\u2013600000 \u7684\u6574\u6570\u3002",
  "field.maxConcurrent.label": "\u5E76\u53D1\u4E0A\u9650",
  "field.maxConcurrent.hint": "\u540C\u65F6\u8FDB\u884C\u7684\u589E\u5F3A\u8C03\u7528\u6570\uFF0C1\u201316 \u7684\u6574\u6570\uFF1B\u8D85\u51FA\u7684\u8BF7\u6C42\u8FD4\u56DE 429\u3002",
  "field.rateLimitPerMinute.label": "\u6BCF\u5206\u949F\u6B21\u6570\u4E0A\u9650",
  "field.rateLimitPerMinute.hint": "\u6ED1\u52A8\u7A97\u53E3\u9650\u6D41\uFF0C1\u2013600 \u7684\u6574\u6570\uFF1B\u8D85\u51FA\u8FD4\u56DE 429 \u5E76\u7ED9\u51FA Retry-After\u3002",
  "field.provider.label": "\u6A21\u578B provider\uFF08\u8986\u76D6\uFF09",
  "field.provider.hint": "\u7559\u7A7A\u8DDF\u968F\u5F53\u524D\u4F1A\u8BDD\u6A21\u578B\u3002\u4E00\u65E6\u586B\u5199\u5C31\u5FC5\u987B\u4E0E\u4E0B\u4E00\u9879\u300Cmodel\u300D\u6210\u5BF9\uFF0C\u5426\u5219\u4FDD\u5B58\u4F1A\u88AB\u62D2\u7EDD\u3002",
  "field.model.label": "\u6A21\u578B model\uFF08\u8986\u76D6\uFF09",
  "field.model.hint": "\u7559\u7A7A\u8DDF\u968F\u5F53\u524D\u4F1A\u8BDD\u6A21\u578B\u3002\u4E00\u65E6\u586B\u5199\u5C31\u5FC5\u987B\u4E0E\u4E0A\u4E00\u9879\u300Cprovider\u300D\u6210\u5BF9\u3002",
  "field.contextMaxMessages.label": "\u4E0A\u4E0B\u6587\u7A97\u53E3\uFF08\u6761\u6570\uFF09",
  "field.contextMaxMessages.hint": "\u6700\u591A\u53C2\u8003\u6700\u8FD1\u591A\u5C11\u6761 user/assistant \u8F6E\u6B21\uFF0C0\u201350 \u7684\u6574\u6570\uFF1B0 \u8868\u793A\u4E0D\u53C2\u8003\u3002",
  "field.contextMaxChars.label": "\u4E0A\u4E0B\u6587\u7A97\u53E3\uFF08\u5B57\u6570\uFF09",
  "field.contextMaxChars.hint": "\u5386\u53F2\u7247\u6BB5\u7684\u5B57\u7B26\u9884\u7B97\uFF0C\u4ECE\u6700\u65B0\u4E00\u6761\u5411\u524D\u88C5\u914D\uFF0C0\u2013100000 \u7684\u6574\u6570\uFF1B0 \u8868\u793A\u4E0D\u53C2\u8003\u3002"
};
var en = {
  "button.title": "Enhance prompt (rewrite into a structured prompt)",
  "button.busy": "Enhancing\u2026",
  "button.otherBusy": "Another session is enhancing right now \u2014 wait for it, or close its result panel first.",
  "panel.title": "Prompt Enhance",
  "panel.loading": "Enhancing, please wait\u2026",
  "panel.streaming": "Generating (shown as it is written)\u2026",
  "panel.loading.hint": "Your draft stays untouched until you apply the result.",
  "panel.cancel": "Cancel",
  "panel.original": "Original prompt",
  "panel.enhanced": "Enhanced result",
  "panel.apply": "Fill into input box",
  "panel.copy": "Copy result",
  "panel.copied": "Copied",
  "panel.copyFailed": "Copy failed",
  "panel.close": "Close",
  "panel.retry": "Retry",
  "panel.stale.warn": "The draft changed while enhancing \u2014 the result is based on the pre-enhance text. Applying will overwrite your latest edits (undo restores the draft as it was before applying).",
  "panel.model": "Model: {provider} / {model}",
  "panel.elapsed": "{ms} elapsed",
  "undo.applied": "Original prompt replaced by the enhanced version",
  "undo.undo": "Undo",
  "undo.dismiss": "Dismiss",
  "error.empty": "The input box is empty \u2014 type a prompt to enhance first.",
  "error.tooLong": "The draft is {count} characters, above the {max} cap (Unicode characters, not tokens). It is never auto-truncated (that would change your meaning) \u2014 please shorten it.",
  "error.attachmentsOnly": "The composer only has attachments; add the text you want enhanced.",
  "error.occurrences": "The draft contains commands or file references, which are not supported yet \u2014 remove them first.",
  "error.phase": "The input box is busy (submitting) \u2014 try again in a moment.",
  "error.disabled": "Prompt enhance is disabled in the plugin settings.",
  "error.rejected": "The enhance request was rejected.",
  "error.timeout": "The enhancement timed out ({seconds}s). Retry; your draft is untouched.",
  "error.unconfigured": "No model resolved for the enhancement: pair provider/model in the plugin settings, or send a message in the current session first (the enhancement will follow the session model).",
  "error.upstream": "The model provider returned an error. Retry; your draft is untouched.",
  "error.internal": "Enhancement failed. Retry; your draft is untouched.",
  "error.rateLimit": "Too many requests \u2014 at most {limit} enhancements per minute; retry in {retryAfterSeconds} seconds.",
  "error.concurrencyLimit": "{max} enhancements are already running \u2014 wait for one to finish, then retry.",
  "error.cooldown": "{failures} enhancements failed in a row; calls are paused to stop hammering the model service. Retry in {retryAfterSeconds}s, or check the model settings first.",
  "error.upstream.auth": "Authentication failed \u2014 check the API key configured for this provider.",
  "error.upstream.invalidCredential": "Authentication failed \u2014 the stored API key is invalid; fix it and retry.",
  "error.upstream.rateLimit": "The model provider is rate-limiting; retry later.",
  "error.upstream.quota": "The model provider reports a quota/balance issue \u2014 check your account.",
  "error.upstream.empty": "The model returned an empty response; retry.",
  "error.upstream.contextWindow": "The input exceeds the model context window \u2014 shorten it or switch models.",
  "error.upstream.toolCall": "The model requested tool calls, but prompt enhance needs plain text \u2014 switch models and retry.",
  "error.upstream.maxTokens": "The rewrite hit the output cap (maxOutputTokens) \u2014 raise it in settings or shorten the draft.",
  "settings.unavailable": "This deployment does not expose this plugin's settings to this client.",
  "settings.readOnly": "This deployment stores its settings document read-only, so edits are not saved.",
  "settings.saveFailed": "The save was not accepted \u2014 check the fields marked invalid (the host validates again and may refuse an out-of-range value).",
  "settings.save": "Save",
  "settings.saving": "Saving\u2026",
  "settings.overridden": "Overridden",
  "settings.reset": "Reset",
  "settings.invalid": "This value is not accepted \u2014 fix it before saving.",
  "settings.group.basic": "Basics",
  "settings.group.cost": "Cost and performance",
  "settings.group.context": "Model route and context",
  "field.enabled.label": "Enable prompt upgrade",
  "field.enabled.hint": "Off hides the composer button and disables the shortcut and every other trigger.",
  "field.shortcut.label": "Shortcut",
  "field.shortcut.hint": "For example ctrl+alt+e; it must include at least one of ctrl/alt/meta (shift may only be added). Empty disables it.",
  "field.streaming.label": "Stream the result",
  "field.streaming.hint": "Show the model output as it is written. Display only: the text finally filled back never changes.",
  "field.contextAware.label": "Context aware",
  "field.contextAware.hint": "Read the current conversation to resolve references and supply omitted context. With no history it falls back to a single-prompt enhancement.",
  "field.strategyMode.label": "How the custom prompt combines",
  "field.strategyMode.hint": "replace-default swaps the built-in strategy out entirely (its hard rules are not retained); extend-default appends the custom text after it, so those rules stay in force.",
  "field.systemPrompt.label": "Custom system prompt",
  "field.systemPrompt.hint": "Empty uses the built-in strategy. Multi-line; the mode above decides how it combines.",
  "field.reasoningEffort.label": "Reasoning budget",
  "field.reasoningEffort.hint": "off / low / high / inherit. A rewrite is short and well specified, so off is cheapest (measured on one draft: ~252 output tokens at off vs ~2897 at high); inherit sends no effort field and follows the model default.",
  "field.temperature.label": "Temperature",
  "field.temperature.hint": "A number between 0 and 1 (decimals allowed); low keeps the rewrite faithful to the original.",
  "field.maxOutputTokens.label": "Max output tokens",
  "field.maxOutputTokens.hint": "Output cap of one enhancement, an integer from 256 to 32768.",
  "field.maxInputChars.label": "Max input characters",
  "field.maxInputChars.hint": "Over-length drafts are refused, never truncated (that would change the meaning). Integer from 200 to 200000.",
  "field.timeoutMs.label": "Timeout (ms)",
  "field.timeoutMs.hint": "End-to-end deadline of one enhancement, an integer from 5000 to 600000.",
  "field.maxConcurrent.label": "Concurrency cap",
  "field.maxConcurrent.hint": "Enhancements running at once, an integer from 1 to 16; extra requests get 429.",
  "field.rateLimitPerMinute.label": "Cap per minute",
  "field.rateLimitPerMinute.hint": "Sliding-window limit, an integer from 1 to 600; extra requests get 429 with Retry-After.",
  "field.provider.label": "Provider override",
  "field.provider.hint": "Empty follows the session model. Once set it must be paired with the next field (model), or the save is refused.",
  "field.model.label": "Model override",
  "field.model.hint": "Empty follows the session model. Once set it must be paired with the previous field (provider).",
  "field.contextMaxMessages.label": "Context window (messages)",
  "field.contextMaxMessages.hint": "How many recent user/assistant turns may ground the rewrite, an integer from 0 to 50; 0 admits none.",
  "field.contextMaxChars.label": "Context window (characters)",
  "field.contextMaxChars.hint": "Character budget of the history snippet, assembled backwards from the newest turn; an integer from 0 to 100000; 0 admits none."
};
var dictionaries = { zh, en };
var NS = "prompt-upgrade";

// src/client/styles.ts
var STYLE_ID = "dsh-prompt-upgrade-styles";
var CSS = `
.dsh-pe-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--dsh-pe-z-index, 1000);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.32);
  padding: 24px 16px;
}
.dsh-pe-panel {
  --pe-bg: #1f2127;
  --pe-fg: #e6e8ee;
  --pe-fg-dim: rgba(230, 232, 238, 0.55);
  --pe-border: rgba(127, 127, 127, 0.35);
  --pe-separator: rgba(127, 127, 127, 0.25);
  --pe-hover: rgba(127, 127, 127, 0.18);
  --pe-danger: #ffb4a8;
  --pe-warn-fg: #e8c07d;
  --pe-warn-border: rgba(230, 158, 60, 0.35);
  --pe-warn-bg: rgba(230, 158, 60, 0.12);
  display: flex;
  flex-direction: column;
  width: min(880px, 100%);
  max-height: min(70vh, 640px);
  border-radius: 12px;
  border: 1px solid var(--pe-border);
  background: var(--pe-bg);
  color: var(--pe-fg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  outline: none;
}
@media (prefers-color-scheme: light) {
  .dsh-pe-panel {
    --pe-bg: #ffffff;
    --pe-fg: #1c1e24;
    --pe-fg-dim: rgba(28, 30, 36, 0.55);
    --pe-border: rgba(0, 0, 0, 0.18);
    --pe-separator: rgba(0, 0, 0, 0.12);
    --pe-hover: rgba(0, 0, 0, 0.08);
    --pe-danger: #a63a2e;
    --pe-warn-fg: #8a5a00;
    --pe-warn-border: rgba(176, 122, 0, 0.4);
    --pe-warn-bg: rgba(230, 158, 60, 0.15);
  }
}
.dsh-pe-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--pe-separator);
  font-size: 13px;
  font-weight: 600;
}
.dsh-pe-head .dsh-pe-meta { margin-left: auto; font-weight: 400; font-size: 11px; opacity: 0.6; }
.dsh-pe-close {
  border: none; background: transparent; color: inherit; opacity: 0.6;
  font-size: 15px; cursor: pointer; padding: 2px 6px; border-radius: 4px;
}
.dsh-pe-close:hover { opacity: 1; background: var(--pe-hover); }
.dsh-pe-body { display: flex; flex: 1; min-height: 0; }
.dsh-pe-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.dsh-pe-col + .dsh-pe-col { border-left: 1px solid var(--pe-separator); }
.dsh-pe-col-title {
  padding: 8px 14px 6px;
  font-size: 11px;
  letter-spacing: 0.04em;
  opacity: 0.55;
}
.dsh-pe-col-text {
  flex: 1;
  margin: 0;
  padding: 0 14px 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
}
.dsh-pe-error {
  padding: 20px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--pe-danger);
  white-space: pre-wrap;
}
.dsh-pe-error .dsh-pe-error-detail {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.75;
  color: inherit;
}
.dsh-pe-loading {
  display: flex; flex-direction: column; gap: 8px;
  align-items: center; justify-content: center;
  flex: 1; padding: 28px 16px; font-size: 13px;
}
.dsh-pe-loading .dsh-pe-hint { font-size: 11px; opacity: 0.55; }
/* Incremental view: the streamed text takes the whole body, left-aligned. */
.dsh-pe-stream {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0; width: 100%;
}
.dsh-pe-stream .dsh-pe-col-title {
  display: flex; align-items: center; gap: 6px;
  padding-left: 0;
}
.dsh-pe-spin.small { width: 11px; height: 11px; border-width: 1px; }
.dsh-pe-spin {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--pe-separator); border-top-color: #6ea8ff;
  animation: dsh-pe-spin 0.9s linear infinite;
}
.dsh-pe-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--pe-separator);
}
.dsh-pe-foot .dsh-pe-grow { flex: 1; }
.dsh-pe-btn-action {
  border: none; border-radius: 6px; padding: 6px 14px;
  font-size: 12px; cursor: pointer; line-height: 1;
}
.dsh-pe-btn-action.primary { background: #3f76e1; color: #fff; }
.dsh-pe-btn-action.primary:hover { background: #4d82ec; }
.dsh-pe-btn-action.plain { background: var(--pe-hover); color: inherit; }
.dsh-pe-btn-action.plain:hover { background: rgba(127, 127, 127, 0.3); }

.dsh-pe-stale {
  padding: 8px 14px;
  font-size: 12px;
  line-height: 1.5;
  border-top: 1px solid var(--pe-warn-border);
  background: var(--pe-warn-bg);
  color: var(--pe-warn-fg);
}

.dsh-pe-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  opacity: 0.75;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
}
.dsh-pe-btn:hover:not(:disabled) { opacity: 1; background: var(--pe-hover); }
.dsh-pe-btn:disabled { opacity: 0.45; cursor: default; }
.dsh-pe-btn .dsh-pe-btn-icon { font-size: 14px; }
.dsh-pe-btn.is-busy .dsh-pe-btn-icon { animation: dsh-pe-spin 1s linear infinite; }
@keyframes dsh-pe-spin { to { transform: rotate(360deg); } }

.dsh-pe-undo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px;
  font-size: 12px;
  color: inherit;
  opacity: 0.85;
}
.dsh-pe-undo .dsh-pe-undo-check { color: #7ed491; }
.dsh-pe-undo-link {
  border: none; background: var(--pe-hover); color: inherit;
  border-radius: 5px; padding: 3px 10px; font-size: 12px; cursor: pointer;
}
.dsh-pe-undo-link:hover { background: rgba(127,127,127,0.3); }
.dsh-pe-undo-x {
  border: none; background: transparent; color: inherit; opacity: 0.55;
  cursor: pointer; padding: 0 4px; font-size: 12px;
}
.dsh-pe-undo-x:hover { opacity: 1; }

/* \u2500\u2500 \u8BBE\u7F6E\u9762\u677F\uFF08\u8BBE\u7F6E \u2192 ANB \u5DE5\u5177 \u2192 \u63D0\u793A\u8BCD\u5347\u7EA7\uFF09\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u9762\u677F\u6E32\u67D3\u5728\u8BBE\u7F6E\u9875\u91CC\uFF0C\u4E0D\u5728 .dsh-pe-panel \u5185\u90E8\uFF0C\u6240\u4EE5\u62FF\u4E0D\u5230\u90A3\u5957 --pe-* \u53D8\u91CF\uFF1B
   \u8FD9\u91CC\u4E00\u5F8B\u7528\u4E2D\u6027\u7070 + color: inherit\uFF0C\u6DF1\u6D45\u4E24\u5957\u4E3B\u9898\u4E0B\u90FD\u53EF\u8BFB\u3002 */
.dsh-pe-group {
  margin: 0 0 12px;
  padding: 10px 12px 12px;
  border: 1px solid rgba(127, 127, 127, 0.35);
  border-radius: 8px;
}
.dsh-pe-legend {
  padding: 0 6px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.85;
}
.dsh-pe-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}
.dsh-pe-row + .dsh-pe-row {
  border-top: 1px solid rgba(127, 127, 127, 0.25);
}
.dsh-pe-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsh-pe-row-label {
  font-size: 12px;
  font-weight: 500;
}
.dsh-pe-row-hint {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  opacity: 0.62;
}
.dsh-pe-row-invalid {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #d9534f;
}
.dsh-pe-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.dsh-pe-badge-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.18);
  font-size: 10px;
  opacity: 0.85;
}
.dsh-pe-badge-reset {
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 11px;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.7;
}
.dsh-pe-badge-reset:hover:not(:disabled) { opacity: 1; }
.dsh-pe-badge-reset:disabled { opacity: 0.4; cursor: default; }
.dsh-pe-checkbox {
  width: 16px;
  height: 16px;
  align-self: flex-start;
  cursor: pointer;
}
.dsh-pe-checkbox:disabled { cursor: default; }
.dsh-pe-textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(127, 127, 127, 0.35);
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.1);
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
}
.dsh-pe-textarea:disabled { opacity: 0.6; }
.dsh-pe-form { display: flex; flex-direction: column; }
.dsh-pe-input {
  box-sizing: border-box;
  width: 100%;
  padding: 5px 8px;
  border: 1px solid rgba(127, 127, 127, 0.35);
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.1);
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
}
.dsh-pe-input:disabled { opacity: 0.6; }
.dsh-pe-input[aria-invalid='true'] { border-color: #d9534f; }
.dsh-pe-textarea[aria-invalid='true'] { border-color: #d9534f; }
.dsh-pe-notice {
  margin: 0 0 10px;
  padding: 8px 10px;
  border: 1px solid rgba(127, 127, 127, 0.3);
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.08);
  font-size: 12px;
  line-height: 1.5;
}
.dsh-pe-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}
.dsh-pe-save-failed {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #d9534f;
}
.dsh-pe-save {
  margin-left: auto;
  padding: 5px 16px;
  border: none;
  border-radius: 6px;
  background: #3f76e1;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
}
.dsh-pe-save:hover:not(:disabled) { background: #4d82ec; }
.dsh-pe-save:disabled { opacity: 0.45; cursor: default; }
`;
function ensureStyles() {
  if (document.getElementById(STYLE_ID) !== null) return false;
  const element = document.createElement("style");
  element.id = STYLE_ID;
  element.textContent = CSS;
  document.head.appendChild(element);
  return true;
}

// src/client/shortcut.ts
var MODIFIER_ALIASES = /* @__PURE__ */ new Map([
  ["ctrl", "ctrl"],
  ["control", "ctrl"],
  ["alt", "alt"],
  ["option", "alt"],
  ["shift", "shift"],
  ["meta", "meta"],
  ["cmd", "meta"],
  ["command", "meta"],
  ["win", "meta"],
  ["super", "meta"]
]);
var isKeyToken = (token) => /^[a-z0-9]$/.test(token) || /^f([1-9]|1[0-2])$/.test(token);
function codeFor(token) {
  if (/^[a-z]$/.test(token)) return `Key${token.toUpperCase()}`;
  if (/^[0-9]$/.test(token)) return `Digit${token}`;
  return `F${token.slice(1)}`;
}
function parseShortcut(spec) {
  if (spec === void 0) return null;
  const tokens = spec.trim().toLowerCase().split("+").map((token) => token.trim()).filter((token) => token !== "");
  if (tokens.length === 0 || tokens.length > 5) return null;
  const modifiers = { ctrl: false, alt: false, shift: false, meta: false };
  const last = tokens[tokens.length - 1] ?? "";
  if (!isKeyToken(last)) return null;
  for (const token of tokens.slice(0, -1)) {
    const modifier = MODIFIER_ALIASES.get(token);
    if (modifier === void 0) return null;
    modifiers[modifier] = true;
  }
  if (!modifiers.ctrl && !modifiers.alt && !modifiers.meta) return null;
  return { ...modifiers, key: last, code: codeFor(last) };
}
function matchesShortcut(event, combo) {
  if (combo === null) return false;
  return event.ctrlKey === combo.ctrl && event.altKey === combo.alt && event.shiftKey === combo.shift && event.metaKey === combo.meta && (event.code === combo.code || event.key.toLowerCase() === combo.key);
}

// src/client/settings-source.ts
var RANK = {
  none: 0,
  legacyScope: 1,
  binder: 2,
  configForms: 3
};
function sectionOf(snapshot) {
  if (snapshot === null || typeof snapshot !== "object") return void 0;
  const record = snapshot;
  if (record.status === "unavailable") return void 0;
  return record.value;
}
function servedNamespaces(forms) {
  try {
    const namespaces = forms.describe?.()?.getSnapshot?.()?.view?.namespaces;
    return Array.isArray(namespaces) ? namespaces.map((entry) => String(entry?.ns ?? "")) : [];
  } catch {
    return [];
  }
}
function installClientSettingsSource(ctx, options) {
  let rank = RANK.none;
  const adopt = (next, section) => {
    if (section === void 0 || next < rank) return;
    rank = next;
    options.onSection(section);
  };
  const adoptSnapshot = (next, form) => {
    try {
      const section = sectionOf(form.getSnapshot?.());
      if (section !== void 0) adopt(next, section);
    } catch {
    }
  };
  ctx.inject(["configForms"], (formsCtx) => {
    const forms = formsCtx.configForms;
    if (forms === void 0 || typeof forms.get !== "function") return;
    let boundId;
    let unsubscribeForm;
    const resolveEntryId = () => {
      const served = servedNamespaces(forms);
      return options.rowIds.find((id) => served.includes(id)) ?? served.find((ns) => ns.includes("prompt-upgrade")) ?? options.rowIds[0];
    };
    const bind = () => {
      const entryId = resolveEntryId();
      if (entryId === void 0 || entryId === boundId) return;
      let form;
      try {
        form = forms.get?.(entryId);
      } catch {
        return;
      }
      if (form === void 0) return;
      try {
        unsubscribeForm?.();
      } catch {
      }
      unsubscribeForm = void 0;
      boundId = entryId;
      adoptSnapshot(RANK.configForms, form);
      try {
        unsubscribeForm = form.subscribe?.(() => adoptSnapshot(RANK.configForms, form));
      } catch {
        unsubscribeForm = void 0;
      }
    };
    bind();
    ctx.effect(() => () => {
      try {
        unsubscribeForm?.();
      } catch {
      }
    }, "prompt-upgrade: settings form mirror");
    try {
      const watch = forms.describe?.()?.subscribe?.(() => bind());
      if (typeof watch === "function") {
        ctx.effect(() => () => {
          try {
            watch();
          } catch {
          }
        }, "prompt-upgrade: settings namespace watch");
      }
    } catch {
    }
  });
  ctx.inject(["webUiSettings"], (binderCtx) => {
    const binder = binderCtx.webUiSettings;
    if (binder === void 0 || typeof binder.bind !== "function") return;
    let bound;
    for (const namespace of options.rowIds) {
      try {
        bound = binder.bind({ namespace });
      } catch {
        bound = void 0;
      }
      if (bound !== void 0) break;
    }
    if (bound === void 0) return;
    adoptSnapshot(RANK.binder, bound);
    let unsubscribe;
    try {
      unsubscribe = bound.subscribe?.(() => adoptSnapshot(RANK.binder, bound));
    } catch {
      unsubscribe = void 0;
    }
    ctx.effect(() => () => {
      try {
        unsubscribe?.();
      } catch {
      }
    }, "prompt-upgrade: settings binder mirror");
  });
  ctx.inject(["settingsScope"], (scopeCtx) => {
    const scopeCtxLike = scopeCtx;
    const scope = scopeCtxLike.settingsScope;
    if (scope === void 0 || typeof scope.bind !== "function") return;
    let bound;
    try {
      bound = scope.bind({ namespace: options.rowIds[0] ?? "prompt-upgrade", decode: (value) => value });
    } catch {
      return;
    }
    adoptSnapshot(RANK.legacyScope, bound);
    let unsubscribe;
    try {
      unsubscribe = bound.subscribe?.(() => adoptSnapshot(RANK.legacyScope, bound));
    } catch {
      unsubscribe = void 0;
    }
    ctx.effect(() => () => {
      try {
        unsubscribe?.();
      } catch {
      }
    }, "prompt-upgrade: settings scope mirror");
  });
}

// src/client/anb-shell.mjs
var import_react5 = __toESM(require("react"), 1);
var h = import_react5.default.createElement;
var SHELL_ID = "anb-toolbox";
var SHELL_SLOT = "anb.tool.tab";
var SHELL_TITLE = "ANB \u5DE5\u5177";
var SHELL_ORDER = 16;
var SHELL_HOME = "https://github.com/yiyunet";
var SHELL_TAGLINE = "AI\u539F\u751F\u7A81\u56F4";
var SHELL_INTRO_LEAD = "ANB\u5DE5\u5177\u7BB1\u805A\u7126\u3010AI\u539F\u751F\u7A81\u56F4\u3011\uFF0C\u66F4\u591A\u597D\u7528\u5DE5\u5177\uFF0C\u8BF7";
var SHELL_INTRO_LINK = "\u70B9\u51FB";
var SHELL_INTRO_TAIL = "\uFF01";
function shellHref(url) {
  return /^https?:\/\/[^\s]+$/i.test(url) ? url : void 0;
}
var SH = {
  wrap: { padding: "4px 2px" },
  head: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", margin: "0 0 4px" },
  title: { fontSize: 15, fontWeight: 600, margin: 0 },
  subtitle: { fontSize: 12, opacity: 0.72, color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 },
  intro: { opacity: 0.72, fontSize: 12, margin: "0 0 14px" },
  link: { color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 },
  empty: { opacity: 0.72, fontSize: 13 },
  // 文件夹式标签栏：`flex-wrap` 让一排放不下时自动折成多排，每排都坐在自己的基线上。
  tabs: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 4,
    padding: "0 6px",
    borderBottom: "1px solid var(--dsh-border, #e3e5e8)",
    marginBottom: 12
  },
  tab: {
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
    background: "rgba(127, 127, 127, 0.10)",
    border: "1px solid var(--dsh-border, #e3e5e8)",
    borderBottom: "none",
    borderRadius: "8px 8px 0 0",
    color: "inherit",
    opacity: 0.72
  },
  tabActive: {
    opacity: 1,
    fontWeight: 600,
    // 与内容区同色并下压 1px，盖住栏底那条分隔线 —— 这就是"文件夹的当前页"。
    background: "var(--dsh-bg, Canvas)",
    borderBottom: "1px solid var(--dsh-bg, Canvas)",
    marginBottom: -1
  },
  panel: {}
};
function AnbShell(props) {
  const rows = props.useTabs((value) => value);
  const [activeId, setActiveId] = import_react5.default.useState();
  const [visited, setVisited] = import_react5.default.useState(() => /* @__PURE__ */ new Set());
  const active = rows.find((row) => row.id === activeId)?.id ?? (rows[0] ? rows[0].id : void 0);
  import_react5.default.useEffect(() => {
    if (active === void 0) return;
    setVisited((previous) => previous.has(active) ? previous : /* @__PURE__ */ new Set([...previous, active]));
  }, [active]);
  const href = shellHref(SHELL_HOME);
  const head = [
    h(
      "div",
      { key: "head", style: SH.head },
      h("h2", { style: SH.title }, SHELL_TITLE),
      h("a", {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        style: SH.subtitle
      }, SHELL_TAGLINE)
    ),
    h(
      "p",
      { key: "intro", style: SH.intro },
      SHELL_INTRO_LEAD,
      h("a", {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        style: SH.link
      }, SHELL_INTRO_LINK),
      SHELL_INTRO_TAIL
    )
  ];
  if (rows.length === 0) {
    return h(
      "div",
      { style: SH.wrap },
      head,
      h("p", { style: SH.empty }, "\u8FD8\u6CA1\u6709\u53EF\u663E\u793A\u7684\u63D2\u4EF6\u9762\u677F\u3002")
    );
  }
  const move = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % rows.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + rows.length) % rows.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = rows.length - 1;
    else return;
    event.preventDefault();
    setActiveId(rows[next].id);
  };
  return h(
    "div",
    { style: SH.wrap },
    head,
    h(
      "div",
      { role: "tablist", "aria-label": SHELL_TITLE, style: SH.tabs },
      rows.map((row, index) => h("button", {
        key: row.id,
        type: "button",
        role: "tab",
        id: `anb-tab-${row.id}`,
        "aria-selected": row.id === active,
        "aria-controls": `anb-panel-${row.id}`,
        tabIndex: row.id === active ? 0 : -1,
        style: row.id === active ? { ...SH.tab, ...SH.tabActive } : SH.tab,
        onClick: () => {
          setActiveId(row.id);
        },
        onKeyDown: (event) => move(event, index)
      }, row.label))
    ),
    rows.filter((row) => row.id === active || visited.has(row.id)).map((row) => h("div", {
      key: row.id,
      role: "tabpanel",
      id: `anb-panel-${row.id}`,
      "aria-labelledby": `anb-tab-${row.id}`,
      hidden: row.id !== active,
      style: SH.panel
    }, props.renderSlot(SHELL_SLOT, {}, { only: row.id })))
  );
}
function shellTabs(ctx) {
  let version2 = -1;
  let rows = [];
  const read = (label) => typeof label === "function" ? label() : label;
  const winners = (key) => typeof ctx.slots.entriesOfSlot === "function" ? ctx.slots.entriesOfSlot(key) : ctx.slots.entries(key);
  return {
    tabs: {
      getSnapshot: () => {
        const next = ctx.slots.getVersion(SHELL_SLOT);
        if (next !== version2) {
          version2 = next;
          rows = winners(SHELL_SLOT).map((entry) => ({
            id: entry.options.id || "",
            order: entry.options.order || 0,
            label: String(read(entry.options.label) || "")
          })).sort((left, right) => left.order - right.order);
        }
        return rows;
      },
      subscribe: (listener) => ctx.slots.subscribe(SHELL_SLOT, listener)
    }
  };
}
function mountShell(ctx) {
  return ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: SHELL_ID,
    order: SHELL_ORDER,
    label: () => SHELL_TITLE,
    inject: () => ({ hooks: shellTabs(ctx) }),
    children: { [SHELL_SLOT]: { kind: "list", scope: "root" } }
  }, AnbShell));
}
function guardShell(ctx) {
  let owned;
  const winners = () => typeof ctx.slots.entriesOfSlot === "function" ? ctx.slots.entriesOfSlot("settings.section") : ctx.slots.entries("settings.section");
  const holds = () => winners().some((entry) => entry.options.id === SHELL_ID);
  const mine = () => winners().some((entry) => entry.options.id === SHELL_ID && entry.component === AnbShell);
  const ensure = () => {
    if (mine()) return;
    if (owned !== void 0) {
      owned();
      owned = void 0;
    }
    if (holds()) return;
    owned = mountShell(ctx);
  };
  ensure();
  ctx.effect(() => ctx.slots.subscribe("settings.section", ensure), "anb shell guard");
}

// src/client/settings-form.ts
var FIELDS = [
  "enabled",
  "provider",
  "model",
  "temperature",
  "reasoningEffort",
  "maxOutputTokens",
  "maxInputChars",
  "timeoutMs",
  "systemPrompt",
  "strategyMode",
  "shortcut",
  "maxConcurrent",
  "rateLimitPerMinute",
  "streaming",
  "contextAware",
  "contextMaxMessages",
  "contextMaxChars"
];
function boolField(field) {
  return {
    field,
    format: (value) => value === true ? "true" : value === false ? "false" : "",
    parse: (text) => {
      const trimmed = text.trim().toLowerCase();
      if (trimmed === "") return { kind: "clear" };
      if (trimmed === "true") return { kind: "set", value: true };
      if (trimmed === "false") return { kind: "set", value: false };
      return void 0;
    }
  };
}
function enumField(field, allowed) {
  return {
    field,
    format: (value) => typeof value === "string" ? value : "",
    parse: (text) => {
      const trimmed = text.trim();
      if (trimmed === "") return { kind: "clear" };
      return allowed.includes(trimmed) ? { kind: "set", value: trimmed } : void 0;
    }
  };
}
function textField(field) {
  return {
    field,
    format: (value) => typeof value === "string" ? value : "",
    parse: (text) => {
      const trimmed = text.trim();
      return trimmed === "" ? { kind: "clear" } : { kind: "set", value: trimmed };
    }
  };
}
function boundedNumberField(field, min, max, integer = true) {
  return {
    field,
    format: (value) => typeof value === "number" ? String(value) : "",
    parse: (text) => {
      const trimmed = text.trim();
      if (trimmed === "") return { kind: "clear" };
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < min || parsed > max) return void 0;
      if (integer && !Number.isInteger(parsed)) return void 0;
      return { kind: "set", value: parsed };
    }
  };
}
var SPECS = [
  boolField("enabled"),
  textField("provider"),
  textField("model"),
  boundedNumberField("temperature", 0, 1, false),
  enumField("reasoningEffort", ["off", "low", "high", "inherit"]),
  boundedNumberField("maxOutputTokens", 256, 32768),
  boundedNumberField("maxInputChars", 200, 2e5),
  boundedNumberField("timeoutMs", 5e3, 6e5),
  textField("systemPrompt"),
  enumField("strategyMode", ["replace-default", "extend-default"]),
  textField("shortcut"),
  boundedNumberField("maxConcurrent", 1, 16),
  boundedNumberField("rateLimitPerMinute", 1, 600),
  boolField("streaming"),
  boolField("contextAware"),
  boundedNumberField("contextMaxMessages", 0, 50),
  boundedNumberField("contextMaxChars", 0, 1e5)
];
var StagedForm = class {
  /** @param scope - the shared configuration form for this panel's namespace. */
  constructor(scope, specs) {
    this.scope = scope;
    __publicField(this, "specs");
    __publicField(this, "staged", /* @__PURE__ */ new Map());
    __publicField(this, "listeners", /* @__PURE__ */ new Set());
    __publicField(this, "unsubscribe");
    __publicField(this, "saving", false);
    __publicField(this, "failed", false);
    this.specs = new Map(specs.map((spec) => [spec.field, spec]));
    this.unsubscribe = scope.subscribe(() => {
      this.publish();
    });
  }
  /**
   * Publish a projection of this form, rebuilt when a draft or the scope changes.
   * @param project - builds the panel state from the form's current reads.
   * @returns the observable the panel reads through its bound selector.
   */
  bind(project) {
    let current2 = project();
    const listeners3 = /* @__PURE__ */ new Set();
    this.listeners.add(() => {
      current2 = project();
      for (const listener of listeners3) listener();
    });
    return {
      getSnapshot: () => current2,
      subscribe: (listener) => {
        listeners3.add(listener);
        return () => {
          listeners3.delete(listener);
        };
      }
    };
  }
  /** @returns the panel-level state: what the host serves and what a save would do. */
  shell() {
    const snapshot = this.scope.getSnapshot();
    const plan = this.plan();
    return {
      available: snapshot.status === "ready",
      writable: snapshot.writable,
      dirty: plan.length > 0,
      invalid: plan.some((item) => item.op === void 0),
      saving: this.saving,
      failed: this.failed
    };
  }
  /**
   * @param field - field name of a section field.
   * @returns the draft text, whether a save would leave an override, and whether it is invalid.
   */
  field(field) {
    const spec = this.spec(field);
    const staged = this.staged.get(field);
    if (staged === void 0) {
      return { text: spec.format(this.sectionValue(field)), overridden: this.stored(field), invalid: false };
    }
    const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
    return { text: staged.text, overridden: write?.kind === "set", invalid: write === void 0 };
  }
  /** @returns the edit, reset, save, and discard actions bound to this form. */
  actions() {
    return {
      edit: (field, text) => {
        this.stage(field, { text, clear: false });
      },
      resetField: (field) => {
        this.stage(field, { text: this.spec(field).format(this.baseValue(field)), clear: true });
      },
      save: () => {
        void this.save();
      },
      discard: () => {
        if (this.staged.size === 0 && !this.failed) return;
        this.staged.clear();
        this.failed = false;
        this.publish();
      }
    };
  }
  /**
   * Write every staged edit, then re-seed from what the host accepted.
   *
   * The host is the only authority on whether a value was accepted, so the outcome
   * is read back from the section rather than predicted here. A save that did not
   * land keeps its drafts, so the user can correct them instead of retyping.
   */
  async save() {
    const plan = this.plan();
    if (plan.length === 0 || this.saving) return;
    if (!this.scope.getSnapshot().writable) return;
    if (plan.some((item) => item.op === void 0)) return;
    this.saving = true;
    this.failed = false;
    this.publish();
    try {
      const ops = plan.flatMap((item) => item.op === void 0 ? [] : [item.op]);
      const landed = ops.length === 0 || await this.scope.mutate(ops);
      if (landed) {
        this.staged.clear();
        this.failed = false;
      } else {
        this.failed = true;
      }
    } catch {
      this.failed = true;
    } finally {
      this.saving = false;
      this.publish();
    }
  }
  /** Release the scope subscription. */
  dispose() {
    try {
      this.unsubscribe();
    } catch {
    }
    this.listeners.clear();
  }
  /** Stage one edit and republish. */
  stage(field, edit) {
    this.staged.set(field, edit);
    this.publish();
  }
  /** Notify every projection listener. */
  publish() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
      }
    }
  }
  /** The field's spec, or a pass-through spec for an unexpected field name. */
  spec(field) {
    return this.specs.get(field) ?? { field, format: () => "", parse: (text) => ({ kind: "set", value: text }) };
  }
  /** The accepted value of one field. */
  sectionValue(field) {
    const value = this.scope.getSnapshot().value;
    if (value === void 0) return void 0;
    return value[field];
  }
  /** The composition-layer value of one field, which a clear reverts to. */
  baseValue(field) {
    const base = this.scope.getSnapshot().base;
    return base === null || typeof base !== "object" ? void 0 : base[field];
  }
  /** Whether the stored user layer carries this field (presence, not value equality). */
  stored(field) {
    const user = this.scope.getSnapshot().user;
    return user !== null && typeof user === "object" && Object.prototype.hasOwnProperty.call(user, field);
  }
  /** The op for every staged edit; `op: undefined` marks an invalid draft that blocks the save. */
  plan() {
    return [...this.staged.entries()].map(([field, edit]) => {
      if (edit.clear) return { field, op: { op: "unset", path: [field] } };
      const write = this.spec(field).parse(edit.text);
      if (write === void 0) return { field, op: void 0 };
      return {
        field,
        op: write.kind === "set" ? { op: "set", path: [field], value: write.value } : { op: "unset", path: [field] }
      };
    });
  }
};
var PromptUpgradeForm = class {
  /** @param scope - the shared configuration form for this plugin's namespace. */
  constructor(scope) {
    __publicField(this, "form");
    __publicField(this, "state");
    this.form = new StagedForm(scope, SPECS);
    this.state = this.form.bind(() => {
      const shell = this.form.shell();
      const projected = { ...shell };
      for (const field of FIELDS) projected[field] = this.form.field(field);
      return projected;
    });
  }
  /**
   * Build the registration face the panel component consumes.
   * @returns the staged state observable and the shared edit/save actions.
   */
  inject() {
    return { hooks: { upgradeForm: this.state }, ...this.form.actions() };
  }
  /** Release the scope subscription held by the staged model. */
  dispose() {
    this.form.dispose();
  }
};

// src/client/PromptUpgradeSettings.tsx
var import_react6 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function fieldLabel(t, field) {
  return t(`field.${field}.label`);
}
function fieldHint(t, field) {
  return t(`field.${field}.hint`);
}
function OverrideBadge({ field, state, disabled, copy, onReset }) {
  if (!state[field].overridden) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "dsh-pe-badge", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsh-pe-badge-tag", children: copy.overridden }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsh-pe-badge-reset", disabled, onClick: onReset, children: copy.reset })
  ] });
}
function RowHead({ field, shared }) {
  const id = `dsh-pe-field-${field}`;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-row-head", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "dsh-pe-row-label", htmlFor: id, children: fieldLabel(shared.t, field) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      OverrideBadge,
      {
        field,
        state: shared.state,
        disabled: shared.disabled,
        copy: shared.copy,
        onReset: shared.onReset
      }
    )
  ] });
}
function RowMessage({ field, shared }) {
  const staged = shared.state[field];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: staged.invalid ? "dsh-pe-row-invalid" : "dsh-pe-row-hint", children: staged.invalid ? shared.copy.invalid : fieldHint(shared.t, field) });
}
function ValueRow({ field, numeric = false, shared }) {
  const id = `dsh-pe-field-${field}`;
  const staged = shared.state[field];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowHead, { field, shared }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        id,
        className: "dsh-pe-input",
        type: "text",
        value: staged.text,
        disabled: shared.disabled,
        "aria-invalid": staged.invalid || void 0,
        ...numeric ? { inputMode: "numeric" } : {},
        onChange: (event) => {
          shared.onEdit(event.target.value);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowMessage, { field, shared })
  ] });
}
function BoolRow({ field, shared }) {
  const generated = (0, import_react6.useId)();
  const id = `dsh-pe-field-${field}-${generated}`;
  const staged = shared.state[field];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowHead, { field, shared }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        id,
        type: "checkbox",
        className: "dsh-pe-checkbox",
        checked: staged.text === "true",
        disabled: shared.disabled,
        onChange: (event) => {
          shared.onEdit(event.target.checked ? "true" : "false");
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowMessage, { field, shared })
  ] });
}
function AreaRow({ field, shared }) {
  const id = `dsh-pe-field-${field}`;
  const staged = shared.state[field];
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowHead, { field, shared }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "textarea",
      {
        id,
        className: "dsh-pe-textarea",
        rows: 6,
        value: staged.text,
        disabled: shared.disabled,
        "aria-invalid": staged.invalid || void 0,
        onChange: (event) => {
          shared.onEdit(event.target.value);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RowMessage, { field, shared })
  ] });
}
function PromptUpgradeSettings(props) {
  const { t } = props;
  const state = props.useUpgradeForm((value) => value);
  const discard = (0, import_react6.useRef)(props.discard);
  discard.current = props.discard;
  (0, import_react6.useEffect)(() => () => {
    discard.current();
  }, []);
  if (!state.available) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dsh-pe-notice", role: "status", children: t("settings.unavailable") });
  }
  const disabled = !state.writable || state.saving;
  const copy = {
    overridden: t("settings.overridden"),
    reset: t("settings.reset"),
    invalid: t("settings.invalid")
  };
  const sharedFor = (field) => ({
    state,
    disabled,
    t,
    copy,
    onEdit: (text) => {
      props.edit(field, text);
    },
    onReset: () => {
      props.resetField(field);
    }
  });
  const valueRow = (field, numeric = false) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ValueRow, { field, numeric, shared: sharedFor(field) }, field);
  const boolRow = (field) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(BoolRow, { field, shared: sharedFor(field) }, field);
  const areaRow = (field) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(AreaRow, { field, shared: sharedFor(field) }, field);
  const blocked = !state.dirty || state.invalid || state.saving;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-form", children: [
    !state.writable ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dsh-pe-notice", role: "status", children: t("settings.readOnly") }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("fieldset", { className: "dsh-pe-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("legend", { className: "dsh-pe-legend", children: t("settings.group.basic") }),
      boolRow("enabled"),
      valueRow("shortcut"),
      boolRow("streaming"),
      boolRow("contextAware"),
      valueRow("strategyMode"),
      areaRow("systemPrompt")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("fieldset", { className: "dsh-pe-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("legend", { className: "dsh-pe-legend", children: t("settings.group.cost") }),
      valueRow("reasoningEffort"),
      valueRow("temperature"),
      valueRow("maxOutputTokens", true),
      valueRow("maxInputChars", true),
      valueRow("timeoutMs", true),
      valueRow("maxConcurrent", true),
      valueRow("rateLimitPerMinute", true)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("fieldset", { className: "dsh-pe-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("legend", { className: "dsh-pe-legend", children: t("settings.group.context") }),
      valueRow("provider"),
      valueRow("model"),
      valueRow("contextMaxMessages", true),
      valueRow("contextMaxChars", true)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-pe-footer", children: [
      state.failed ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dsh-pe-save-failed", role: "status", children: t("settings.saveFailed") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsh-pe-save", disabled: blocked, onClick: () => {
        props.save();
      }, children: state.saving ? t("settings.saving") : t("settings.save") })
    ] })
  ] });
}

// src/client/index.tsx
var inject = [];
function report(step, error) {
  try {
    console.warn(`[prompt-upgrade] ${step} failed; that feature stays off.`, error);
  } catch {
  }
  return () => {
  };
}
function apply(ctx) {
  ensureStyles();
  ctx.inject(["locale"], (localeCtx) => {
    ctx.effect(() => {
      try {
        return localeCtx.locale.register(NS, dictionaries);
      } catch (error) {
        return report("dictionary registration", error);
      }
    }, "dsh-prompt-upgrade: dictionaries");
  });
  setClientSettings(decodeClientSettings(void 0));
  installClientSettingsSource(ctx, {
    rowIds: PROMPT_ENHANCE_ROW_IDS,
    onSection: (section) => setClientSettings(decodeClientSettings(section))
  });
  ctx.inject(["slots"], (slotsCtx) => {
    const slots = slotsCtx.slots;
    if (slots === void 0) return;
    return slots.inject("conversation.input.right", () => {
      try {
        return slots.register(
          { name: "conversation.input.right", id: "prompt-upgrade", order: 60, locale: NS },
          EnhanceButton
        );
      } catch (error) {
        return report("composer enhance button slot", error);
      }
    });
  });
  ctx.inject(["slots"], (slotsCtx) => {
    const slots = slotsCtx.slots;
    if (slots === void 0) return;
    return slots.inject("conversation.input.dock", () => {
      try {
        return slots.register(
          { name: "conversation.input.dock", id: "prompt-upgrade-undo", order: 90, locale: NS },
          UndoBar
        );
      } catch (error) {
        return report("undo bar slot", error);
      }
    });
  });
  ctx.effect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.isComposing) return;
      const settings = getClientSettings();
      if (!settings.enabled) return;
      const combo = parseShortcut(settings.shortcut);
      if (!matchesShortcut(event, combo)) return;
      const target = shortcutTarget();
      if (target === void 0) return;
      event.preventDefault();
      event.stopPropagation();
      target();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, "dsh-prompt-upgrade: shortcut");
  ctx.inject(["slots", "configForms"], (wired) => {
    const face = wired;
    const slots = face.slots;
    const forms = face.configForms;
    if (slots === void 0 || forms === void 0) return;
    if (typeof forms.get !== "function" || typeof forms.whileServed !== "function") return;
    const namespace = PROMPT_ENHANCE_ROW_IDS[0];
    if (namespace === void 0) return;
    return ctx.effect(() => {
      try {
        guardShell(wired);
      } catch (error) {
        return report("anb tool shell", error);
      }
      const stopServing = forms.whileServed?.([namespace], () => {
        const scope = forms.get?.(namespace);
        if (scope === void 0) return () => {
        };
        const form = new PromptUpgradeForm(scope);
        const off = slots.inject(SHELL_SLOT, () => {
          try {
            return slots.register({
              name: SHELL_SLOT,
              id: "anb.tool.prompt-upgrade",
              order: 50,
              locale: NS,
              // 标签由壳渲染成一行 tab。与壳自己的固定标题（SHELL_TITLE）同策略，
              // 这里给静态文案：locale 服务在本半是可选依赖，缺了也不该空一行。
              label: () => "\u63D0\u793A\u8BCD\u5347\u7EA7",
              inject: () => form.inject()
            }, PromptUpgradeSettings);
          } catch (error) {
            return report("settings panel slot", error);
          }
        });
        return () => {
          try {
            off?.();
          } catch {
          }
          form.dispose();
        };
      });
      return () => {
        try {
          stopServing?.();
        } catch {
        }
      };
    }, "dsh-prompt-upgrade: anb tool tab");
  });
}

		return module.exports;
	}
});

