import { convert } from "html-to-text";
import { Renderer, marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export const prettyInlineTitle = (
  pretitle: string | null | undefined,
  title: string | null | undefined,
  subtitle: string | null | undefined
): string => {
  let result = "";
  if (pretitle) result += `${pretitle}: `;
  result += title;
  if (subtitle) result += ` - ${subtitle}`;
  return result;
};

export const prettyMarkdown = (markdown: string): string => {
  const block = (text: string) => `${text}\n\n`;
  const escapeBlock = (text: string) => `${escape(text)}\n\n`;
  const line = (text: string) => `${text}\n`;
  const inline = (text: string) => text;
  const newline = () => "\n";
  const empty = () => "";

  const TxtRenderer: Renderer = {
    // Block elements
    code: escapeBlock,
    blockquote: block,
    html: empty,
    heading: block,
    hr: newline,
    list: (text) => block(text.trim()),
    listitem: line,
    checkbox: empty,
    paragraph: block,
    table: (header, body) => line(header + body),
    tablerow: (text) => line(text.trim()),
    tablecell: (text) => `${text} `,
    // Inline elements
    strong: inline,
    em: inline,
    codespan: inline,
    br: newline,
    del: inline,
    link: (_0, _1, text) => text,
    image: (_0, _1, text) => text,
    text: inline,
    // etc.
    options: {},
  };

  return convert(
    DOMPurify.sanitize(marked(markdown, { renderer: TxtRenderer, mangle: false, headerIds: false }))
  ).trim();
};
