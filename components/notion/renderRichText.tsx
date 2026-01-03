"use client";

import React from "react";

function normalizeNewlines(text: string): string {
  // 일부 환경/데이터에서는 실제 개행(\n) 대신 문자열 "\\n"로 들어오는 경우가 있어
  // 둘 다 지원하도록 정규화합니다.
  return String(text).replace(/\\n/g, "\n");
}

function looksLikeNotionId(value: string): boolean {
  const v = value.replace(/^\//, "").trim();
  const uuidWithHyphen =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hex32 = /^[0-9a-f]{32}$/i;
  return uuidWithHyphen.test(v) || hex32.test(v);
}

function toAppNotionViewerHref(pageUrl: string): string {
  return `/notion?pageUrl=${encodeURIComponent(pageUrl)}`;
}

type NotionColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gray_background"
  | "brown_background"
  | "orange_background"
  | "yellow_background"
  | "green_background"
  | "blue_background"
  | "purple_background"
  | "pink_background"
  | "red_background";

type NotionAnnotations = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: NotionColor;
};

type NotionRichText = {
  type?: string;
  plain_text?: string;
  href?: string | null;
  text?: { content?: string; link?: { url?: string } | null };
  annotations?: NotionAnnotations;
};

function colorToClasses(color?: NotionColor): string {
  if (!color || color === "default") return "";

  const isBg = color.endsWith("_background");
  const base = (isBg ? color.replace("_background", "") : color) as Exclude<
    NotionColor,
    `${string}_background`
  >;

  const fgMap: Record<string, string> = {
    gray: "text-gray-600 dark:text-gray-300",
    brown: "text-amber-800 dark:text-amber-300",
    orange: "text-orange-600 dark:text-orange-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
    green: "text-green-600 dark:text-green-300",
    blue: "text-blue-600 dark:text-blue-300",
    purple: "text-purple-600 dark:text-purple-300",
    pink: "text-pink-600 dark:text-pink-300",
    red: "text-red-600 dark:text-red-300",
  };

  const bgMap: Record<string, string> = {
    gray: "bg-gray-100 dark:bg-gray-800/60",
    brown: "bg-amber-100 dark:bg-amber-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
  };

  if (isBg) {
    // background 컬러는 보통 약간의 패딩/라운딩이 있어야 "하이라이트"처럼 보입니다.
    return `${bgMap[base] ?? ""} px-1 rounded`;
  }

  return fgMap[base] ?? "";
}

function annotationsToClasses(a?: NotionAnnotations): string {
  if (!a) return "";
  return [
    a.bold ? "font-semibold" : "",
    a.italic ? "italic" : "",
    a.underline ? "underline underline-offset-2" : "",
    a.strikethrough ? "line-through" : "",
    a.code
      ? "font-mono text-[0.95em] bg-surface-elevated border border-border px-1 rounded"
      : "",
    colorToClasses(a.color),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Notion rich_text 배열을 annotation(굵게/색상/배경/링크 등)을 유지하며 렌더링합니다.
 */
export function renderRichText(richText: unknown): React.ReactNode {
  if (!Array.isArray(richText) || richText.length === 0) return null;

  return (richText as NotionRichText[]).map((rt, idx) => {
    const rawText = rt.plain_text ?? rt.text?.content ?? "";
    const text = normalizeNewlines(rawText);
    const multilineStyle = text.includes("\n") ? ({ whiteSpace: "pre-wrap" } as const) : undefined;
    const className = annotationsToClasses(rt.annotations);
    const href = rt.href ?? rt.text?.link?.url ?? null;

    if (href) {
      // Notion 내부 링크는 보통 "/<pageId>" 형태로 옵니다.
      // 우리 앱에서 해당 페이지를 바로 렌더링할 수 있도록 /notion 뷰어로 라우팅합니다.
      const isInternalNotionLink =
        href.startsWith("/") && looksLikeNotionId(href);

      const resolvedHref = isInternalNotionLink
        ? toAppNotionViewerHref(href)
        : href;

      return (
        <a
          key={idx}
          href={resolvedHref}
          // Notion 내부 링크는 Notion처럼 "같은 탭"에서 이동하는 UX가 자연스럽습니다.
          target={isInternalNotionLink ? undefined : "_blank"}
          rel={isInternalNotionLink ? undefined : "noreferrer noopener"}
          className={`underline underline-offset-2 ${className}`}
          style={multilineStyle}
        >
          {text}
        </a>
      );
    }

    return (
      <span key={idx} className={className} style={multilineStyle}>
        {text}
      </span>
    );
  });
}

