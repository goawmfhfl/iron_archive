"use client";

import { extractTextFromRichText } from "@/lib/services/notion-service";
import type { NotionBlock } from "@/lib/types/notion";

interface NotionBlockProps {
  block: NotionBlock;
}

export function NotionBlock({ block }: NotionBlockProps) {
  const { type, id } = block;

  switch (type) {
    case "paragraph":
      return (
        <p className="text-base text-text-primary leading-relaxed mb-4">
          {extractTextFromRichText(block.paragraph?.rich_text) || (
            <span className="text-text-tertiary">빈 문단</span>
          )}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-3xl font-bold text-text-primary mb-4 mt-6 first:mt-0">
          {extractTextFromRichText(block.heading_1?.rich_text)}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-bold text-text-primary mb-3 mt-5 first:mt-0">
          {extractTextFromRichText(block.heading_2?.rich_text)}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4 first:mt-0">
          {extractTextFromRichText(block.heading_3?.rich_text)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-base text-text-primary leading-relaxed mb-2 ml-6 list-disc">
          {extractTextFromRichText(block.bulleted_list_item?.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-base text-text-primary leading-relaxed mb-2 ml-6 list-decimal">
          {extractTextFromRichText(block.numbered_list_item?.rich_text)}
        </li>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-secondary bg-surface-elevated rounded-r">
          {extractTextFromRichText(block.quote?.rich_text)}
        </blockquote>
      );

    case "code":
      const codeText = extractTextFromRichText(block.code?.rich_text);
      const language = block.code?.language || "plain text";
      return (
        <pre className="bg-surface-elevated border border-surface-elevated rounded-lg p-4 my-4 overflow-x-auto">
          <code className="text-sm text-text-primary font-mono">
            {codeText}
          </code>
          {language !== "plain text" && (
            <span className="text-xs text-text-tertiary block mt-2">
              {language}
            </span>
          )}
        </pre>
      );

    case "image":
      const imageUrl =
        block.image?.file?.url ||
        block.image?.external?.url ||
        block.image?.file?.expiry_time
          ? null // 만료된 이미지는 표시하지 않음
          : null;

      if (!imageUrl) {
        return (
          <div className="my-4 p-4 bg-surface-elevated rounded-lg text-center text-text-tertiary">
            이미지를 불러올 수 없습니다.
          </div>
        );
      }

      return (
        <div className="my-4">
          <img
            src={imageUrl}
            alt={block.image?.caption?.[0]?.plain_text || "이미지"}
            className="w-full h-auto rounded-lg border border-surface-elevated"
          />
          {block.image?.caption && block.image.caption.length > 0 && (
            <p className="text-sm text-text-tertiary text-center mt-2">
              {extractTextFromRichText(block.image.caption)}
            </p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-6 border-surface-elevated" />;

    case "callout":
      return (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 my-4">
          {block.callout?.icon && (
            <div className="text-2xl mb-2">{block.callout.icon.emoji}</div>
          )}
          <p className="text-base text-text-primary">
            {extractTextFromRichText(block.callout?.rich_text)}
          </p>
        </div>
      );

    case "toggle":
      return (
        <details className="my-4">
          <summary className="cursor-pointer text-base font-medium text-text-primary mb-2">
            {extractTextFromRichText(block.toggle?.rich_text)}
          </summary>
          <div className="ml-4 mt-2">
            {/* Toggle 내부 블록은 NotionRenderer에서 처리 */}
          </div>
        </details>
      );

    default:
      // 지원하지 않는 블록 타입
      return (
        <div className="my-2 text-sm text-text-tertiary italic">
          [지원하지 않는 블록 타입: {type}]
        </div>
      );
  }
}

