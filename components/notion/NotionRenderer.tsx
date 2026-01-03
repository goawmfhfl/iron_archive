"use client";

/**
 * NotionRenderer - 컨텐츠 전용 렌더러
 * 
 * 이 컴포넌트는 컨텐츠 페이지에서 사용되는 Notion 블록 렌더러입니다.
 * 향후 커뮤니티 후기 전용, 소셜링 전용 렌더러는 별도 컴포넌트로 분리될 예정입니다.
 */

import { NotionBlock } from "./NotionBlock";
import type { NotionBlock as NotionBlockType } from "@/lib/types/notion";

interface NotionRendererProps {
  blocks: NotionBlockType[];
  className?: string;
  /**
   * 컨텐츠 상세(/contents/[id]) 컨텍스트에서 Notion 내부 링크를
   * /contents/[id]/notion/[pageId] 로 라우팅하기 위해 사용합니다.
   */
  contentId?: string;
}

export function NotionRenderer({ blocks, className, contentId }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        컨텐츠가 없습니다.
      </div>
    );
  }

  // 리스트 아이템들을 그룹화하여 ul/ol로 렌더링
  const renderBlocks = () => {
    const elements: JSX.Element[] = [];
    let currentBulletList: NotionBlockType[] = [];
    let currentNumberedList: NotionBlockType[] = [];

    const flushBulletList = () => {
      if (currentBulletList.length > 0) {
        elements.push(
          <ul key={`bullet-${currentBulletList[0].id}`} className="mb-4">
            {currentBulletList.map((block) => (
              <NotionBlock key={block.id} block={block} contentId={contentId} />
            ))}
          </ul>
        );
        currentBulletList = [];
      }
    };

    const flushNumberedList = () => {
      if (currentNumberedList.length > 0) {
        elements.push(
          <ol key={`numbered-${currentNumberedList[0].id}`} className="mb-4">
            {currentNumberedList.map((block) => (
              <NotionBlock key={block.id} block={block} contentId={contentId} />
            ))}
          </ol>
        );
        currentNumberedList = [];
      }
    };

    blocks.forEach((block) => {
      if (block.type === "bulleted_list_item") {
        currentBulletList.push(block);
        flushNumberedList(); // 번호 리스트가 끝났으므로 flush
      } else if (block.type === "numbered_list_item") {
        currentNumberedList.push(block);
        flushBulletList(); // 불릿 리스트가 끝났으므로 flush
      } else {
        // 다른 블록 타입이 나오면 리스트 flush
        flushBulletList();
        flushNumberedList();
        elements.push(<NotionBlock key={block.id} block={block} contentId={contentId} />);
      }
    });

    // 마지막 리스트 flush
    flushBulletList();
    flushNumberedList();

    return elements;
  };

  return (
    <div className={className}>
      <article className="prose prose-sm max-w-none dark:prose-invert">
        {renderBlocks()}
      </article>
    </div>
  );
}
