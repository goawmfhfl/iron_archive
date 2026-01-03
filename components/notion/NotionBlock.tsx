"use client";

import Image from "next/image";
import { extractTextFromRichText } from "@/lib/services/notion-service";
import { NotionRenderer } from "./NotionRenderer";
import { renderRichText } from "./renderRichText";
import { formatNotionPageId } from "@/lib/utils/notion";
import { PromoCallout } from "./PromoCallout";
import type { NotionBlock } from "@/lib/types/notion";

interface NotionBlockProps {
  block: NotionBlock;
}

export function NotionBlock({ block }: NotionBlockProps) {
  const { type, id } = block;

  switch (type) {
    case "paragraph":
      const paragraphText = extractTextFromRichText(block.paragraph?.rich_text);

      if (!paragraphText) {
        return (
          <p
            className="text-base leading-7 mb-2"
            aria-hidden="true"
          >
            {"\u00A0"}
          </p>
        );
      }

      return (
        <p className="text-base text-text-primary leading-7  ">
          {renderRichText(block.paragraph?.rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-3xl font-bold text-text-primary mb-4 mt-6 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_1?.rich_text)}
          </span>
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-2xl font-bold text-text-primary mb-3 mt-5 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_2?.rich_text)}
          </span>
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4 first:mt-0 leading-tight">
          <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-2 py-1 rounded-md">
            {renderRichText(block.heading_3?.rich_text)}
          </span>
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-base text-text-primary leading-7 mb-1 ml-6 list-disc">
          {renderRichText(block.bulleted_list_item?.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-base text-text-primary leading-7 mb-1 ml-6 list-decimal">
          {renderRichText(block.numbered_list_item?.rich_text)}
        </li>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-secondary bg-surface-elevated rounded-r">
          <div>
            {block.quote?.rich_text && (
              <p className="mb-2 leading-normal">{renderRichText(block.quote?.rich_text)}</p>
            )}
            {/* 중첩된 children 블록 렌더링 */}
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <div className="mt-2">
                <NotionRenderer blocks={block.children} />
              </div>
            )}
          </div>
        </blockquote>
      );

    case "code":
      const codeText = extractTextFromRichText(block.code?.rich_text);
      const language = block.code?.language || "plain text";
      return (
        <pre className="bg-surface-elevated border border-border rounded-lg p-4 my-4 overflow-x-auto">
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
      const imageUrl: string | undefined =
        block.image?.type === "external"
          ? block.image?.external?.url
          : block.image?.file?.url;

      if (!imageUrl) {
        return (
          <div className="my-4 p-4 bg-surface-elevated rounded-lg text-center text-text-tertiary">
            이미지를 불러올 수 없습니다.
          </div>
        );
      }

      const imageCaption = block.image?.caption && block.image.caption.length > 0
        ? extractTextFromRichText(block.image.caption)
        : "이미지";

      return (
        <div className="my-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
            <Image
              src={imageUrl}
              alt={imageCaption}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          {block.image?.caption && block.image.caption.length > 0 && (
            <p className="text-sm text-text-tertiary text-center mt-2 leading-normal">
              {extractTextFromRichText(block.image.caption)}
            </p>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-6 border-border" />;

    case "callout":
      // green_background 콜아웃은 "홍보 카드" UI로 커스텀 렌더링
      if (block.callout?.color === "green_background") {
        return <PromoCallout block={block} />;
      }
      return (
        <div className="border border-border rounded-lg p-4 my-4">
          {block.callout?.icon && (
            <div className="text-2xl mb-2">{block.callout.icon.emoji}</div>
          )}
          <div className="text-base text-text-primary leading-7">
            {block.callout?.rich_text && (
              <p className="mb-2">{renderRichText(block.callout?.rich_text)}</p>
            )}
            {/* 중첩된 children 블록 렌더링 */}
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <div className="mt-2">
                <NotionRenderer blocks={block.children} />
              </div>
            )}
          </div>
        </div>
      );

    case "toggle":
      return (
        <details className="my-4">
          <summary className="cursor-pointer text-base font-medium text-text-primary mb-2 leading-normal">
            {renderRichText(block.toggle?.rich_text)}
          </summary>
          <div className="ml-4 mt-2">
            {/* Toggle 내부 블록 렌더링 */}
            {block.children && Array.isArray(block.children) && block.children.length > 0 && (
              <NotionRenderer blocks={block.children} />
            )}
          </div>
        </details>
      );

    case "child_page": {
      // Notion에서 '페이지 카드'처럼 보이는 블록
      const title = block.child_page?.title ?? "페이지";
      // child_page 블록의 id 자체가 이동해야 할 pageId 입니다.
      const pageId = formatNotionPageId(block.id);
      const href = `/notion?pageUrl=${encodeURIComponent(`/${pageId}`)}`;

      return (
        <a
          href={href}
          className="my-4 flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/30 px-4 py-3 hover:bg-surface-hover transition-colors"
        >
          <span className="text-xl leading-none">📄</span>
          <span className="font-semibold text-text-primary underline underline-offset-4">
            {title}
          </span>
        </a>
      );
    }

    case "link_to_page": {
      // 다른 페이지/DB로 연결되는 링크 블록
      const pageIdRaw =
        block.link_to_page?.page_id ??
        block.link_to_page?.database_id ??
        null;

      if (!pageIdRaw) {
        return (
          <div className="my-2 text-sm text-text-tertiary italic">
            [link_to_page 정보를 해석할 수 없습니다]
          </div>
        );
      }

      const pageId = formatNotionPageId(pageIdRaw);
      const href = `/notion?pageUrl=${encodeURIComponent(`/${pageId}`)}`;
      const label =
        block.link_to_page?.type === "database_id" ? "데이터베이스" : "페이지";
      const icon = block.link_to_page?.type === "database_id" ? "🗂️" : "📄";

      return (
        <a
          href={href}
          className="my-4 flex items-center gap-3 rounded-lg border border-border bg-surface-elevated/30 px-4 py-3 hover:bg-surface-hover transition-colors"
        >
          <span className="text-xl leading-none">{icon}</span>
          <span className="font-semibold text-text-primary underline underline-offset-4">
            {label}로 이동
          </span>
        </a>
      );
    }

    default:
      return (
        <div className="my-2 text-sm text-text-tertiary italic">
          [지원하지 않는 블록 타입: {type}]
        </div>
      );
  }
}
