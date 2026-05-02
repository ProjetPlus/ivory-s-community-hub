const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "hr", "table", "thead", "tbody", "tr", "th", "td",
  "caption", "figure", "figcaption", "img", "video", "source", "div", "span",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "loading"],
  video: ["src", "controls", "poster", "muted", "playsinline"],
  source: ["src", "type"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
  div: ["class"],
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inlineFormat = (value: string) =>
  escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

function markdownishToHtml(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineFormat(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) { flushParagraph(); continue; }

    if (/^\|.+\|$/.test(line)) {
      flushParagraph();
      const rows: string[][] = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
        const row = lines[i].trim().slice(1, -1).split("|").map((cell) => cell.trim());
        if (!row.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(row);
        i += 1;
      }
      i -= 1;
      if (rows.length) {
        const [head, ...body] = rows;
        html.push(`<table><thead><tr>${head.map((cell) => `<th>${inlineFormat(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineFormat(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      }
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return html.join("");
}

function isSafeUrl(value: string) {
  const trimmed = value.trim();
  return /^(https?:|mailto:|tel:|\/|#)/i.test(trimmed) && !/^javascript:/i.test(trimmed);
}

function wrapTables(html: string) {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  doc.body.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("article-table-scroll")) return;
    const wrapper = doc.createElement("div");
    wrapper.className = "article-table-scroll";
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  return doc.body.firstElementChild?.innerHTML || html;
}

export function normalizeArticleHtml(value: string | null | undefined) {
  const raw = (value || "").trim();
  if (!raw) return "";
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  const hasMarkdownStructure = /^#{2,4}\s|^\|.+\|$|\*\*.+\*\*/m.test(raw);
  const source = !hasHtml || hasMarkdownStructure ? markdownishToHtml(raw) : raw;
  return wrapTables(sanitizeArticleHtml(source));
}

export function sanitizeArticleHtml(value: string | null | undefined) {
  const raw = value || "";
  if (typeof DOMParser === "undefined") {
    return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "");
  }

  const doc = new DOMParser().parseFromString(`<div>${raw}</div>`, "text/html");
  const clean = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        el.replaceWith(...Array.from(el.childNodes));
        return;
      }
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const allowed = (ALLOWED_ATTRS[tag] || []).includes(name);
        if (!allowed || name.startsWith("on")) el.removeAttribute(attr.name);
        if (["href", "src", "poster"].includes(name) && !isSafeUrl(attr.value)) el.removeAttribute(attr.name);
      });
      if (tag === "a") {
        el.setAttribute("rel", "noopener noreferrer");
        if (el.getAttribute("href")?.startsWith("http")) el.setAttribute("target", "_blank");
      }
      if (tag === "img") el.setAttribute("loading", "lazy");
      clean(el);
    });
  };

  clean(doc.body);
  return doc.body.firstElementChild?.innerHTML || "";
}