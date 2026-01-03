"use client";

import { NotionBlock } from "./NotionBlock";
import type { NotionBlock as NotionBlockType } from "@/lib/types/notion";

interface NotionRendererProps {
  blocks: NotionBlockType[];
  className?: string;
}

export function NotionRenderer({ blocks, className }: NotionRendererProps) {
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
              <NotionBlock key={block.id} block={block} />
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
              <NotionBlock key={block.id} block={block} />
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
        elements.push(<NotionBlock key={block.id} block={block} />);
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

