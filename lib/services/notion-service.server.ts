import { Client } from "@notionhq/client";
import { extractNotionPageId, formatNotionPageId } from "@/lib/utils/notion";
import type { NotionBlock, NotionPageContent } from "@/lib/types/notion";

const NOTION_API_BASE = "https://api.notion.com/v1";

/**
 * Notion API 헤더 생성
 */
function getNotionHeaders(): HeadersInit {
  const apiKey = process.env.NOTION_TOKEN;

  if (!apiKey) {
    throw new Error("NOTION_TOKEN이 설정되지 않았습니다.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

/**
 * 중첩된 블록들을 재귀적으로 가져오기
 */
async function fetchNestedBlocks(
  blockId: string,
  headers: HeadersInit
): Promise<NotionBlock[]> {
  const nestedBlocks: NotionBlock[] = [];
  let nextCursor: string | null = null;

  do {
    const url: string = `${NOTION_API_BASE}/blocks/${blockId}/children${
      nextCursor ? `?start_cursor=${nextCursor}` : ""
    }`;

    const response: Response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(
        `중첩 블록 가져오기 실패: ${errorData.message || response.statusText}`
      );
    }

    const data: any = await response.json();
    nestedBlocks.push(...(data.results || []));

    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  // 각 블록의 중첩 블록도 재귀적으로 가져오기
  const blocksWithNested: NotionBlock[] = [];
  for (const block of nestedBlocks) {
    const blockWithNested = { ...block } as NotionBlock;
    if (block.has_children) {
      blockWithNested.children = await fetchNestedBlocks(block.id, headers);
    }
    blocksWithNested.push(blockWithNested);
  }

  return blocksWithNested;
}

/**
 * Notion 페이지의 블록들을 가져오기
 */
async function fetchPageBlocks(
  pageId: string,
  headers: HeadersInit
): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let nextCursor: string | null = null;

  do {
    const url: string = `${NOTION_API_BASE}/blocks/${pageId}/children${
      nextCursor ? `?start_cursor=${nextCursor}` : ""
    }`;

    const response: Response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(
        `블록 가져오기 실패: ${errorData.message || response.statusText}`
      );
    }

    const data: any = await response.json();
    const fetchedBlocks = data.results || [];

    // 각 블록의 중첩 블록도 가져오기
    for (const block of fetchedBlocks) {
      const blockWithNested = { ...block } as NotionBlock;
      if (block.has_children) {
        blockWithNested.children = await fetchNestedBlocks(block.id, headers);
      }
      blocks.push(blockWithNested);
    }

    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  return blocks;
}

/**
 * Notion 페이지의 제목 추출
 */
function extractPageTitle(page: any): string | undefined {
  if (!page.properties) return undefined;

  // properties에서 title 속성 찾기
  for (const [key, value] of Object.entries(page.properties)) {
    if ((value as any).type === "title" && (value as any).title) {
      const titleArray = (value as any).title;
      if (Array.isArray(titleArray) && titleArray.length > 0) {
        return titleArray
          .map((item: any) => item.plain_text || "")
          .join("")
          .trim();
      }
    }
  }

  return undefined;
}

/**
 * 중첩된 블록들을 평탄화하여 순서대로 배열로 변환
 * callout, toggle 같은 컨테이너 블록은 그대로 유지하고 내부 children은 유지
 * 다른 블록들의 children은 평탄화하여 순서대로 배치
 */
function flattenBlocks(blocks: NotionBlock[]): NotionBlock[] {
  const flattened: NotionBlock[] = [];

  for (const block of blocks) {
    // 컨테이너 블록 타입들 (children을 내부에 유지해야 하는 블록)
    const containerTypes = [
      "callout",
      "toggle",
      "quote",
      "column_list",
      "column",
      "synced_block",
      "child_page",
      "child_database",
      "link_to_page",
    ];

    if (containerTypes.includes(block.type)) {
      // 컨테이너 블록은 그대로 추가 (children은 유지됨)
      flattened.push(block);
    } else {
      // 일반 블록은 평탄화
      const { children, ...blockWithoutChildren } = block;
      flattened.push(blockWithoutChildren as NotionBlock);

      // children이 있으면 재귀적으로 평탄화하여 순서대로 추가
      if (children && Array.isArray(children) && children.length > 0) {
        const childBlocks = flattenBlocks(children);
        flattened.push(...childBlocks);
      }
    }
  }

  return flattened;
}

/**
 * Notion 페이지 내용 가져오기 (서버 사이드)
 */
export async function getNotionPageContent(
  notionUrl: string
): Promise<NotionPageContent> {
  try {
    if (!notionUrl || typeof notionUrl !== "string") {
      throw new Error("유효하지 않은 Notion URL입니다.");
    }

    const headers = getNotionHeaders();

    // 페이지 ID 추출 및 변환
    const pageIdRaw = extractNotionPageId(notionUrl);
    if (!pageIdRaw) {
      throw new Error("유효하지 않은 Notion URL입니다.");
    }

    const pageId = formatNotionPageId(pageIdRaw);

    // 페이지 정보 가져오기
    const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
      method: "GET",
      headers,
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!pageResponse.ok) {
      const errorData = await pageResponse.json().catch(() => ({}));
      console.error("Notion API error:", errorData);
      throw new Error(
        `Notion 페이지 조회 실패: ${errorData.message || pageResponse.statusText}`
      );
    }

    const page = await pageResponse.json();
    const title = extractPageTitle(page);

    // 블록들 가져오기
    const rawBlocks = await fetchPageBlocks(pageId, headers);

    // 블록들을 평탄화하여 순서대로 렌더링 가능하도록 변환
    const flattenedBlocks = flattenBlocks(rawBlocks);

    return {
      title,
      blocks: flattenedBlocks,
    };
  } catch (error) {
    console.error("getNotionPageContent error:", error);
    throw error;
  }
}
