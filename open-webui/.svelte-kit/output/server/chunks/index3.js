import { v4 } from "uuid";
import "js-sha256";
import { W as WEBUI_BASE_URL } from "./constants.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import { marked } from "marked";
const pdfWorkerUrl = "/_app/immutable/assets/pdf.worker.CliDBb4N.mjs";
function findMatchingClosingTag(src, openTag, closeTag) {
  let depth = 1;
  let index = openTag.length;
  while (depth > 0 && index < src.length) {
    if (src.startsWith(openTag, index)) {
      depth++;
    } else if (src.startsWith(closeTag, index)) {
      depth--;
    }
    if (depth > 0) {
      index++;
    }
  }
  return depth === 0 ? index + closeTag.length : -1;
}
function parseAttributes(tag) {
  const attributes = {};
  const attrRegex = /(\w+)="(.*?)"/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}
function detailsTokenizer(src) {
  const detailsRegex = /^<details(\s+[^>]*)?>\n/;
  const summaryRegex = /^<summary>(.*?)<\/summary>\n/;
  const detailsMatch = detailsRegex.exec(src);
  if (detailsMatch) {
    const endIndex = findMatchingClosingTag(src, "<details", "</details>");
    if (endIndex === -1) return;
    const fullMatch = src.slice(0, endIndex);
    const detailsTag = detailsMatch[0];
    const attributes = parseAttributes(detailsTag);
    let content = fullMatch.slice(detailsTag.length, -10).trim();
    let summary = "";
    const summaryMatch = summaryRegex.exec(content);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
      content = content.slice(summaryMatch[0].length).trim();
    }
    return {
      type: "details",
      raw: fullMatch,
      summary,
      text: content,
      attributes
      // Include extracted attributes from <details>
    };
  }
}
function detailsStart(src) {
  return src.match(/^<details>/) ? 0 : -1;
}
function detailsRenderer(token) {
  const attributesString = token.attributes ? Object.entries(token.attributes).map(([key, value]) => `${key}="${value}"`).join(" ") : "";
  return `<details ${attributesString}>
  ${token.summary ? `<summary>${token.summary}</summary>` : ""}
  ${token.text}
  </details>`;
}
function detailsExtension() {
  return {
    name: "details",
    level: "block",
    start: detailsStart,
    tokenizer: detailsTokenizer,
    renderer: detailsRenderer
  };
}
function markedExtension(options = {}) {
  return {
    extensions: [detailsExtension()]
  };
}
const DELIMITER_LIST = [
  { left: "$$", right: "$$", display: true },
  { left: "$", right: "$", display: false },
  { left: "\\pu{", right: "}", display: false },
  { left: "\\ce{", right: "}", display: false },
  { left: "\\(", right: "\\)", display: false },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\begin{equation}", right: "\\end{equation}", display: true }
];
const ALLOWED_SURROUNDING_CHARS = "\\s。，、､;；„“‘’“”（）「」『』［］《》【】‹›«»…⋯:：？！～⇒?!-\\/:-@\\[-`{-~\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}";
const ALLOWED_SURROUNDING_CHARS_REGEX = new RegExp(`[${ALLOWED_SURROUNDING_CHARS}]`, "u");
const inlinePatterns = [];
const blockPatterns = [];
function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
function generateRegexRules(delimiters) {
  delimiters.forEach((delimiter) => {
    const { left, right, display } = delimiter;
    const escapedLeft = escapeRegex(left);
    const escapedRight = escapeRegex(right);
    if (!display) {
      inlinePatterns.push(`${escapedLeft}((?:\\\\[^]|[^\\\\])+?)${escapedRight}`);
    } else {
      inlinePatterns.push(`${escapedLeft}(?!\\n)((?:\\\\[^]|[^\\\\])+?)(?!\\n)${escapedRight}`);
      blockPatterns.push(`${escapedLeft}\\n((?:\\\\[^]|[^\\\\])+?)\\n${escapedRight}`);
    }
  });
  const inlineRule2 = new RegExp(
    `^(${inlinePatterns.join("|")})(?=[${ALLOWED_SURROUNDING_CHARS}]|$)`,
    "u"
  );
  const blockRule2 = new RegExp(
    `^(${blockPatterns.join("|")})(?=[${ALLOWED_SURROUNDING_CHARS}]|$)`,
    "u"
  );
  return { inlineRule: inlineRule2, blockRule: blockRule2 };
}
const { inlineRule, blockRule } = generateRegexRules(DELIMITER_LIST);
function markedKatexExtension(options = {}) {
  return {
    extensions: [inlineKatex(), blockKatex()]
  };
}
function katexStart(src, displayMode) {
  for (let i = 0; i < src.length; i++) {
    const ch = src.charCodeAt(i);
    if (ch === 36) {
      if (displayMode && src.charAt(i + 1) !== "$") {
        continue;
      }
      if (i === 0 || ALLOWED_SURROUNDING_CHARS_REGEX.test(src.charAt(i - 1))) {
        return i;
      }
    } else if (ch === 92) {
      const next = src.charAt(i + 1);
      if (displayMode) {
        if (next !== "[" && next !== "b") continue;
      } else {
        if (next !== "(" && next !== "c" && next !== "p") continue;
      }
      if (i === 0 || ALLOWED_SURROUNDING_CHARS_REGEX.test(src.charAt(i - 1))) {
        return i;
      }
    }
  }
}
function katexTokenizer(src, tokens, displayMode) {
  const ruleReg = displayMode ? blockRule : inlineRule;
  const type = displayMode ? "blockKatex" : "inlineKatex";
  const match = src.match(ruleReg);
  if (match) {
    const text = match.slice(2).filter((item) => item).find((item) => item.trim());
    return {
      type,
      raw: match[0],
      text,
      displayMode
    };
  }
}
function inlineKatex(options) {
  return {
    name: "inlineKatex",
    level: "inline",
    start(src) {
      return katexStart(src, false);
    },
    tokenizer(src, tokens) {
      return katexTokenizer(src, tokens, false);
    },
    renderer(token) {
      return `${token?.text ?? ""}`;
    }
  };
}
function blockKatex(options) {
  return {
    name: "blockKatex",
    level: "block",
    start(src) {
      return katexStart(src, true);
    },
    tokenizer(src, tokens) {
      return katexTokenizer(src, tokens, true);
    },
    renderer(token) {
      return `${token?.text ?? ""}`;
    }
  };
}
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const replaceOutsideCode = (content, replacer) => {
  return content.split(/(```[\s\S]*?```|`[\s\S]*?`)/).map((segment) => {
    return segment.startsWith("```") || segment.startsWith("`") ? segment : replacer(segment);
  }).join("");
};
const replaceTokens = (content, char, user) => {
  const tokens = [
    { regex: /{{char}}/gi, replacement: char },
    { regex: /{{user}}/gi, replacement: user },
    {
      regex: /{{VIDEO_FILE_ID_([a-f0-9-]+)}}/gi,
      replacement: (_, fileId) => `<video src="${WEBUI_BASE_URL}/api/v1/files/${fileId}/content" controls></video>`
    },
    {
      regex: /{{HTML_FILE_ID_([a-f0-9-]+)}}/gi,
      replacement: (_, fileId) => `<file type="html" id="${fileId}" />`
    }
  ];
  content = replaceOutsideCode(content, (segment) => {
    tokens.forEach(({ regex, replacement }) => {
      if (replacement !== void 0 && replacement !== null) {
        segment = segment.replace(regex, replacement);
      }
    });
    return segment;
  });
  return content;
};
const sanitizeResponseContent = (content) => {
  return content.replace(/<\|[a-z]*$/, "").replace(/<\|[a-z]+\|$/, "").replace(/<$/, "").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(/<\|[a-z]+\|>/g, " ").trim();
};
const processResponseContent = (content) => {
  content = processChineseContent(content);
  return content.trim();
};
function isChineseChar(char) {
  return new RegExp("\\p{Script=Han}", "u").test(char);
}
function processChineseContent(content) {
  const lines = content.split("\n");
  const processedLines = lines.map((line) => {
    if (/[\u4e00-\u9fa5]/.test(line)) {
      if (line.includes("*")) {
        if (/（|）/.test(line)) {
          line = processChineseDelimiters(line, "**", "（", "）");
          line = processChineseDelimiters(line, "*", "（", "）");
        }
        if (/“|”/.test(line)) {
          line = processChineseDelimiters(line, "**", "“", "”");
          line = processChineseDelimiters(line, "*", "“", "”");
        }
      }
    }
    return line;
  });
  content = processedLines.join("\n");
  return content;
}
function processChineseDelimiters(line, symbol, leftSymbol, rightSymbol) {
  const escapedSymbol = escapeRegExp(symbol);
  const regex = new RegExp(
    `(.?)(?<!${escapedSymbol})(${escapedSymbol})([^${escapedSymbol}]+)(${escapedSymbol})(?!${escapedSymbol})(.)`,
    "g"
  );
  return line.replace(regex, (match, l, left, content, right, r) => {
    const result = content.startsWith(leftSymbol) && l && l.length > 0 && isChineseChar(l[l.length - 1]) || content.endsWith(rightSymbol) && r && r.length > 0 && isChineseChar(r[0]);
    if (result) {
      return `${l} ${left}${content}${right} ${r}`;
    } else {
      return match;
    }
  });
}
function unescapeHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.documentElement.textContent;
}
const splitStream = (splitOn) => {
  let buffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(splitOn);
      parts.slice(0, -1).forEach((part) => controller.enqueue(part));
      buffer = parts[parts.length - 1];
    },
    flush(controller) {
      if (buffer) controller.enqueue(buffer);
    }
  });
};
const convertMessagesToHistory = (messages) => {
  const history = {
    messages: {},
    currentId: null
  };
  let parentMessageId = null;
  let messageId = null;
  for (const message of messages) {
    messageId = v4();
    if (parentMessageId !== null) {
      history.messages[parentMessageId].childrenIds = [
        ...history.messages[parentMessageId].childrenIds,
        messageId
      ];
    }
    history.messages[messageId] = {
      ...message,
      id: messageId,
      parentId: parentMessageId,
      childrenIds: []
    };
    parentMessageId = messageId;
  }
  history.currentId = messageId;
  return history;
};
const canvasPixelTest = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = 1;
  canvas.width = 1;
  const imageData = new ImageData(canvas.width, canvas.height);
  const pixelValues = imageData.data;
  for (let i = 0; i < imageData.data.length; i += 1) {
    if (i % 4 !== 3) {
      pixelValues[i] = Math.floor(256 * Math.random());
    } else {
      pixelValues[i] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const p = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 0; i < p.length; i += 1) {
    if (p[i] !== pixelValues[i]) {
      /* @__PURE__ */ console.log(
        "canvasPixelTest: Wrong canvas pixel RGB value detected:",
        p[i],
        "at:",
        i,
        "expected:",
        pixelValues[i]
      );
      return false;
    }
  }
  return true;
};
let resizeImageWarmupDone = false;
async function resizeImageToDataURL(img, width, height, mimeType = "image/jpeg") {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
  const toDataURL = () => canvas.toDataURL(mimeType);
  if (!resizeImageWarmupDone && canvas.toBlob && /android|iphone|ipad|ipod/i.test(navigator?.userAgent)) {
    resizeImageWarmupDone = true;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(toDataURL());
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => resolve(toDataURL());
        reader.readAsDataURL(blob);
      }, mimeType);
    });
  }
  return Promise.resolve(toDataURL());
}
const compressImage = async (imageUrl, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      let width = img.width;
      let height = img.height;
      if (maxWidth && maxHeight) {
        if (width <= maxWidth && height <= maxHeight) {
          resolve(imageUrl);
          return;
        }
        if (width / height > maxWidth / maxHeight) {
          height = Math.round(maxWidth * height / width);
          width = maxWidth;
        } else {
          width = Math.round(maxHeight * width / height);
          height = maxHeight;
        }
      } else if (maxWidth) {
        if (width <= maxWidth) {
          resolve(imageUrl);
          return;
        }
        height = Math.round(maxWidth * height / width);
        width = maxWidth;
      } else if (maxHeight) {
        if (height <= maxHeight) {
          resolve(imageUrl);
          return;
        }
        width = Math.round(maxHeight * width / height);
        height = maxHeight;
      }
      const mimeType = imageUrl.match(/^data:([^;]+);/)?.[1] ?? "image/jpeg";
      resolve(await resizeImageToDataURL(img, width, height, mimeType));
    };
    img.onerror = (error) => reject(error);
    img.src = imageUrl;
  });
};
const generateInitialsImage = (name) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 100;
  canvas.height = 100;
  if (!canvasPixelTest()) {
    return `${WEBUI_BASE_URL}/user.png`;
  }
  ctx.fillStyle = "#F39C12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "40px Helvetica";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const sanitizedName = name.trim();
  const initials = sanitizedName.length > 0 ? sanitizedName[0] + (sanitizedName.split(" ").length > 1 ? sanitizedName[sanitizedName.lastIndexOf(" ") + 1] : "") : "";
  ctx.fillText(initials.toUpperCase(), canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL();
};
const formatDate = (inputDate) => {
  const date = dayjs(inputDate);
  if (date.isToday()) {
    return `Today at {{LOCALIZED_TIME}}`;
  } else if (date.isYesterday()) {
    return `Yesterday at {{LOCALIZED_TIME}}`;
  } else {
    return `{{LOCALIZED_DATE}} at {{LOCALIZED_TIME}}`;
  }
};
const copyToClipboard = async (text, html = null, formatted = false) => {
  if (formatted) {
    let styledHtml = "";
    if (!html) {
      const options = {};
      marked.use(markedKatexExtension(options));
      marked.use(markedExtension(options));
      const htmlContent = marked.parse(text);
      styledHtml = `
			<div>
				<style>
					pre {
						background-color: #f6f8fa;
						border-radius: 6px;
						padding: 16px;
						overflow: auto;
					}
					code {
						font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
						font-size: 14px;
					}
					.hljs-keyword { color: #d73a49; }
					.hljs-string { color: #032f62; }
					.hljs-comment { color: #6a737d; }
					.hljs-function { color: #6f42c1; }
					.hljs-number { color: #005cc5; }
					.hljs-operator { color: #d73a49; }
					.hljs-class { color: #6f42c1; }
					.hljs-title { color: #6f42c1; }
					.hljs-params { color: #24292e; }
					.hljs-built_in { color: #005cc5; }
					blockquote {
						border-left: 4px solid #dfe2e5;
						padding-left: 16px;
						color: #6a737d;
						margin-left: 0;
						margin-right: 0;
					}
					table {
						border-collapse: collapse;
						width: 100%;
						margin-bottom: 16px;
					}
					table, th, td {
						border: 1px solid #dfe2e5;
					}
					th, td {
						padding: 8px 12px;
					}
					th {
						background-color: #f6f8fa;
					}
				</style>
				${htmlContent}
			</div>
		`;
    } else {
      styledHtml = html;
    }
    const blob = new Blob([styledHtml], { type: "text/html" });
    try {
      const data = new ClipboardItem({
        "text/html": blob,
        "text/plain": new Blob([text], { type: "text/plain" })
      });
      await navigator.clipboard.write([data]);
      return true;
    } catch (err) {
      return await copyToClipboard(text);
    }
  } else {
    let result = false;
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        /* @__PURE__ */ console.log("Fallback: Copying text command was " + msg);
        result = true;
      } catch (err) {
      }
      document.body.removeChild(textArea);
      return result;
    }
    result = await navigator.clipboard.writeText(text).then(() => {
      return true;
    }).catch((error) => {
      return false;
    });
    return result;
  }
};
const getUserPosition = async (raw = false) => {
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  }).catch((error) => {
    throw error;
  });
  if (!position) {
    return "Location not available";
  }
  const { latitude, longitude } = position.coords;
  if (raw) {
    return { latitude, longitude };
  } else {
    return `${latitude.toFixed(3)}, ${longitude.toFixed(3)} (lat, long)`;
  }
};
const isYoutubeUrl = (url) => {
  return url.startsWith("https://www.youtube.com") || url.startsWith("https://youtu.be") || url.startsWith("https://youtube.com") || url.startsWith("https://m.youtube.com");
};
const removeDetails = (content, types) => {
  return replaceOutsideCode(content, (segment) => {
    for (const type of types) {
      segment = segment.replace(
        new RegExp(`<details\\s+type="${type}"[^>]*>.*?<\\/details>`, "gis"),
        ""
      );
    }
    return segment;
  }).trim();
};
const removeAllDetails = (content) => {
  content = content.replace(/<details[^>]*>[\s\S]*?<\/details>/gi, "");
  return replaceOutsideCode(content, (segment) => {
    return segment.replace(/<details[^>]*>.*?<\/details>/gis, "");
  }).trim();
};
const processDetails = (content) => {
  content = removeDetails(content, ["reasoning", "code_interpreter"]);
  const detailsRegex = /<details\s+type="tool_calls"([^>]*)>([\s\S]*?)<\/details>/gis;
  const matches = content.match(detailsRegex);
  if (matches) {
    for (const match of matches) {
      const attributesRegex = /(\w+)="([^"]*)"/g;
      const attributes = {};
      let attributeMatch;
      while ((attributeMatch = attributesRegex.exec(match)) !== null) {
        attributes[attributeMatch[1]] = attributeMatch[2];
      }
      if (attributes.result) {
        content = content.replace(match, unescapeHtml(attributes.result));
      }
    }
  }
  return content;
};
const blobToFile = (blob, fileName) => {
  const file = new File([blob], fileName, { type: blob.type });
  return file;
};
const getPromptVariables = (user_name, user_location, user_email = "") => {
  return {
    "{{USER_NAME}}": user_name,
    "{{USER_EMAIL}}": user_email || "Unknown",
    "{{USER_LOCATION}}": user_location || "Unknown",
    "{{CURRENT_DATETIME}}": getCurrentDateTime(),
    "{{CURRENT_DATE}}": getFormattedDate(),
    "{{CURRENT_TIME}}": getFormattedTime(),
    "{{CURRENT_WEEKDAY}}": getWeekday(),
    "{{CURRENT_TIMEZONE}}": getUserTimezone(),
    "{{USER_LANGUAGE}}": localStorage.getItem("locale") || "en-US"
  };
};
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const getTimeRange = (timestamp) => {
  const now = /* @__PURE__ */ new Date();
  const date = new Date(timestamp * 1e3);
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1e3 * 3600 * 24);
  const nowDate = now.getDate();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();
  const dateDate = date.getDate();
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();
  if (nowYear === dateYear && nowMonth === dateMonth && nowDate === dateDate) {
    return "Today";
  } else if (nowYear === dateYear && nowMonth === dateMonth && nowDate - dateDate === 1) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return "Previous 7 days";
  } else if (diffDays <= 30) {
    return "Previous 30 days";
  } else if (nowYear === dateYear) {
    return MONTH_NAMES[dateMonth];
  } else {
    return date.getFullYear().toString();
  }
};
const getFormattedDate = () => {
  const date = /* @__PURE__ */ new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const getFormattedTime = () => {
  const date = /* @__PURE__ */ new Date();
  return date.toTimeString().split(" ")[0];
};
const getCurrentDateTime = () => {
  return `${getFormattedDate()} ${getFormattedTime()}`;
};
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
const getWeekday = () => {
  const date = /* @__PURE__ */ new Date();
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[date.getDay()];
};
const createMessagesList = (history, messageId) => {
  const list = [];
  let currentId = messageId;
  while (currentId !== null && currentId !== void 0) {
    const message = history.messages[currentId];
    if (message === void 0) {
      break;
    }
    list.push(message);
    currentId = message.parentId;
  }
  return list.reverse();
};
const formatFileSize = (size) => {
  if (size == null) return "Unknown size";
  if (typeof size !== "number" || size < 0) return "Invalid size";
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
const getLineCount = (text) => {
  return text ? text.split("\n").length : 0;
};
const extractInputVariables = (text) => {
  const regex = /{{\s*([^|}\s]+)\s*\|\s*([^}]+)\s*}}/g;
  const regularRegex = /{{\s*([^|}\s]+)\s*}}/g;
  const variables = {};
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    const definition = match[2].trim();
    variables[varName] = parseVariableDefinition(definition);
  }
  while ((match = regularRegex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!variables.hasOwnProperty(varName)) {
      variables[varName] = { type: "text" };
    }
  }
  return variables;
};
const splitProperties = (str, delimiter) => {
  const result = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escapeNext = true;
      continue;
    }
    if (char === '"' && !escapeNext) {
      inString = !inString;
      current += char;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        depth++;
      } else if (char === "}" || char === "]") {
        depth--;
      }
      if (char === delimiter && depth === 0) {
        result.push(current.trim());
        current = "";
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
};
const parseVariableDefinition = (definition) => {
  const parts = splitProperties(definition, ":");
  const [firstPart, ...propertyParts] = parts;
  const type = firstPart.startsWith("type=") ? firstPart.slice(5) : firstPart;
  const properties = propertyParts.reduce(
    (props, part) => {
      const trimmed = part.trim();
      if (!trimmed) return props;
      const equalsParts = splitProperties(trimmed, "=");
      if (equalsParts.length === 1) {
        const flagName = equalsParts[0].trim();
        if (flagName.length > 0) {
          return { ...props, [flagName]: true };
        }
        return props;
      }
      const [propertyName, ...valueParts] = equalsParts;
      const propertyValueRaw = valueParts.join("=");
      if (!propertyName || propertyValueRaw == null) return props;
      return {
        ...props,
        [propertyName.trim()]: parseJsonValue(propertyValueRaw.trim())
      };
    },
    {}
  );
  return { type, ...properties };
};
const parseJsonValue = (value) => {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (/^[\[{]/.test(value)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};
async function ensurePDFjsLoaded() {
  if (!window.pdfjsLib) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    if (!window.pdfjsLib) {
      throw new Error("pdfjsLib is required for PDF extraction");
    }
  }
  return window.pdfjsLib;
}
const extractContentFromFile = async (file) => {
  const textExtensions = [
    ".txt",
    ".md",
    ".csv",
    ".json",
    ".js",
    ".ts",
    ".css",
    ".html",
    ".xml",
    ".yaml",
    ".yml",
    ".rtf"
  ];
  function getExtension(filename) {
    const dot = filename.lastIndexOf(".");
    return dot === -1 ? "" : filename.substr(dot).toLowerCase();
  }
  async function extractPdfText(file2) {
    const pdfjsLib = await ensurePDFjsLoaded();
    const arrayBuffer = await file2.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let allText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      allText += strings.join(" ") + "\n";
    }
    return allText;
  }
  function readAsText(file2) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file2);
    });
  }
  async function extractDocxText(file2) {
    const [arrayBuffer, { default: mammoth }] = await Promise.all([
      file2.arrayBuffer(),
      import("mammoth")
    ]);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  const type = file.type || "";
  const ext = getExtension(file.name);
  if (type === "application/pdf" || ext === ".pdf") {
    return await extractPdfText(file);
  }
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") {
    return await extractDocxText(file);
  }
  if (type.startsWith("text/") || textExtensions.includes(ext)) {
    return await readAsText(file);
  }
  try {
    return await readAsText(file);
  } catch (err) {
    throw new Error("Unsupported or non-text file type: " + (file.name || type));
  }
};
const getAge = (birthDate) => {
  const today = /* @__PURE__ */ new Date();
  const bDate = new Date(birthDate);
  let age = today.getFullYear() - bDate.getFullYear();
  const m = today.getMonth() - bDate.getMonth();
  if (m < 0 || m === 0 && today.getDate() < bDate.getDate()) {
    age--;
  }
  return age.toString();
};
const convertHeicToJpeg = async (file) => {
  const { default: heic2any } = await import("heic2any");
  try {
    return await heic2any({ blob: file, toType: "image/jpeg" });
  } catch (err) {
    if (err?.message?.includes("already browser readable")) {
      return file;
    }
    throw err;
  }
};
const decodeString = (str) => {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};
const initMermaid = async () => {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({
    startOnLoad: false,
    // Should be false when using render API
    theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
    securityLevel: "loose"
  });
  return mermaid;
};
const renderMermaidDiagram = async (mermaid, code) => {
  const parseResult = await mermaid.parse(code, { suppressErrors: false });
  if (parseResult) {
    const { svg } = await mermaid.render(`mermaid-${v4()}`, code);
    return svg;
  }
  return "";
};
const renderVegaVisualization = async (spec, i18n) => {
  const vega = await import("vega");
  const parsedSpec = JSON.parse(spec);
  let vegaSpec = parsedSpec;
  if (parsedSpec.$schema && parsedSpec.$schema.includes("vega-lite")) {
    const vegaLite = await import("vega-lite");
    vegaSpec = vegaLite.compile(parsedSpec).spec;
  }
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });
  const svg = await view.toSVG();
  return svg;
};
const getCodeBlockContents = (content) => {
  content = removeAllDetails(content);
  const codeBlockContents = content.match(/```[\s\S]*?```/g);
  let codeBlocks = [];
  let htmlGroups = [];
  const initDefaultGroup = () => {
    if (htmlGroups.length === 0) {
      htmlGroups.push({ html: "", css: "", js: "" });
    }
  };
  if (codeBlockContents) {
    codeBlockContents.forEach((block) => {
      const lang = block.split("\n")[0].replace("```", "").trim().toLowerCase();
      const code = block.replace(/```[\s\S]*?\n/, "").replace(/```$/, "");
      codeBlocks.push({ lang, code });
    });
    codeBlocks.forEach((block) => {
      const { lang, code } = block;
      if (lang === "html") {
        htmlGroups.push({ html: code + "\n", css: "", js: "" });
      } else if (lang === "css") {
        initDefaultGroup();
        htmlGroups[htmlGroups.length - 1].css += code + "\n";
      } else if (lang === "javascript" || lang === "js") {
        initDefaultGroup();
        htmlGroups[htmlGroups.length - 1].js += code + "\n";
      }
    });
  } else {
    content = removeAllDetails(content);
    const inlineHtml = content.match(/<html>[\s\S]*?<\/html>/gi);
    const inlineCss = content.match(/<style>[\s\S]*?<\/style>/gi);
    const inlineJs = content.match(/<script>[\s\S]*?<\/script>/gi);
    if (inlineHtml) {
      inlineHtml.forEach((block) => {
        const content2 = block.replace(/<\/?html>/gi, "");
        htmlGroups.push({ html: content2 + "\n", css: "", js: "" });
      });
    }
    if (inlineCss) {
      inlineCss.forEach((block) => {
        const content2 = block.replace(/<\/?style>/gi, "");
        initDefaultGroup();
        htmlGroups[htmlGroups.length - 1].css += content2 + "\n";
      });
    }
    if (inlineJs) {
      inlineJs.forEach((block) => {
        const content2 = block.replace(/<\/?script>/gi, "");
        initDefaultGroup();
        htmlGroups[htmlGroups.length - 1].js += content2 + "\n";
      });
    }
  }
  const htmlContent = htmlGroups.map((g) => g.html).join("");
  const cssContent = htmlGroups.map((g) => g.css).join("");
  const jsContent = htmlGroups.map((g) => g.js).join("");
  return {
    codeBlocks,
    html: htmlContent.trim(),
    css: cssContent.trim(),
    js: jsContent.trim(),
    htmlGroups: htmlGroups.filter((g) => g.html.trim() || g.css.trim() || g.js.trim()).map((g) => ({
      html: g.html.trim(),
      css: g.css.trim(),
      js: g.js.trim()
    }))
  };
};
export {
  initMermaid as A,
  renderMermaidDiagram as B,
  decodeString as C,
  unescapeHtml as D,
  markedKatexExtension as E,
  markedExtension as F,
  replaceTokens as G,
  processResponseContent as H,
  splitStream as I,
  copyToClipboard as a,
  getUserPosition as b,
  createMessagesList as c,
  getAge as d,
  getFormattedDate as e,
  getFormattedTime as f,
  generateInitialsImage as g,
  getCurrentDateTime as h,
  getUserTimezone as i,
  getWeekday as j,
  extractInputVariables as k,
  convertHeicToJpeg as l,
  compressImage as m,
  extractContentFromFile as n,
  blobToFile as o,
  formatFileSize as p,
  getTimeRange as q,
  getCodeBlockContents as r,
  sanitizeResponseContent as s,
  convertMessagesToHistory as t,
  processDetails as u,
  getPromptVariables as v,
  isYoutubeUrl as w,
  formatDate as x,
  getLineCount as y,
  renderVegaVisualization as z
};
//# sourceMappingURL=index3.js.map
