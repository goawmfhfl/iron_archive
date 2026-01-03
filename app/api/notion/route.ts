import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { extractNotionPageId, formatNotionPageId } from "@/lib/utils/notion";
import type { NotionBlock } from "@/lib/types/notion";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageUrl = searchParams.get("pageUrl");
    const mode = searchParams.get("mode"); // "structure" | "pages" | null (both)

    // pageUrl이 있으면 페이지 블록 가져오기 모드
    if (pageUrl) {
      const headers = getNotionHeaders();

      // 페이지 ID 추출 및 변환
      const pageIdRaw = extractNotionPageId(pageUrl);
      if (!pageIdRaw) {
        return NextResponse.json(
          {
            error: "유효하지 않은 Notion URL입니다.",
          },
          { status: 400 }
        );
      }

      const pageId = formatNotionPageId(pageIdRaw);

      // 페이지 정보 가져오기
      const pageResponse = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
        method: "GET",
        headers,
      });

      if (!pageResponse.ok) {
        const errorData = await pageResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: `Notion 페이지 조회 실패: ${
              errorData.message || pageResponse.statusText
            }`,
            detail: errorData,
            code: errorData.code,
          },
          { status: pageResponse.status }
        );
      }

      const page = await pageResponse.json();
      const title = extractPageTitle(page);

      // 블록들 가져오기
      const blocks = await fetchPageBlocks(pageId, headers);

      return NextResponse.json({
        title,
        blocks,
      });
    }

    // 기존 데이터베이스 쿼리 로직
    const databaseId = process.env.NOTION_CONTENTS_DATABASE_ID;

    if (!databaseId) {
      return NextResponse.json(
        {
          error: "NOTION_CONTENTS_DATABASE_ID가 설정되지 않았습니다.",
          envStatus: {
            NOTION_TOKEN: !!process.env.NOTION_TOKEN,
            NOTION_CONTENTS_DATABASE_ID: false,
          },
        },
        { status: 500 }
      );
    }

    const headers = getNotionHeaders();

    // 구조 정보만 가져오기
    if (mode === "structure") {
      const structure = await notion.databases.retrieve({
        database_id: databaseId,
      });
      return NextResponse.json({
        type: "structure",
        data: structure,
        envStatus: {
          NOTION_TOKEN: !!process.env.NOTION_TOKEN,
          NOTION_CONTENTS_DATABASE_ID: !!databaseId,
        },
      });
    }

    // 페이지 목록만 가져오기
    if (mode === "pages") {
      // SDK에 query 메서드가 없으므로 직접 API 호출
      const queryResponse = await fetch(
        `${NOTION_API_BASE}/databases/${databaseId}/query`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            page_size: 100,
          }),
        }
      );

      if (!queryResponse.ok) {
        const errorData = await queryResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: `Notion 데이터베이스 쿼리 실패: ${
              errorData.message || queryResponse.statusText
            }`,
            detail: errorData,
            code: errorData.code,
            envStatus: {
              NOTION_TOKEN: !!process.env.NOTION_TOKEN,
              NOTION_CONTENTS_DATABASE_ID: !!databaseId,
            },
          },
          { status: queryResponse.status }
        );
      }

      const pages = await queryResponse.json();
      return NextResponse.json({
        type: "pages",
        data: pages,
        summary: {
          totalPages: pages.results?.length || 0,
          hasMore: pages.has_more,
          nextCursor: pages.next_cursor,
        },
        envStatus: {
          NOTION_TOKEN: !!process.env.NOTION_TOKEN,
          NOTION_CONTENTS_DATABASE_ID: !!databaseId,
        },
      });
    }

    // 둘 다 가져오기 (기본값)
    const structure = await notion.databases.retrieve({
      database_id: databaseId,
    });

    // 페이지 목록은 직접 API 호출 (SDK에 query 메서드가 없음)
    const queryResponse = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_size: 100,
        }),
      }
    );

    if (!queryResponse.ok) {
      const errorData = await queryResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `Notion 데이터베이스 쿼리 실패: ${
            errorData.message || queryResponse.statusText
          }`,
          detail: errorData,
          code: errorData.code,
          envStatus: {
            NOTION_TOKEN: !!process.env.NOTION_TOKEN,
            NOTION_CONTENTS_DATABASE_ID: !!databaseId,
          },
        },
        { status: queryResponse.status }
      );
    }

    const pages = await queryResponse.json();
    const structureData = structure as any;

    return NextResponse.json({
      type: "both",
      structure: {
        id: structureData.id,
        title: structureData.title,
        properties: structureData.properties,
        created_time: structureData.created_time,
        last_edited_time: structureData.last_edited_time,
      },
      pages: {
        results: pages.results,
        has_more: pages.has_more,
        next_cursor: pages.next_cursor,
      },
      summary: {
        totalPages: pages.results?.length || 0,
        propertyCount: structureData.properties ? Object.keys(structureData.properties).length : 0,
        propertyNames: structureData.properties ? Object.keys(structureData.properties) : [],
      },
      envStatus: {
        NOTION_TOKEN: !!process.env.NOTION_TOKEN,
        NOTION_CONTENTS_DATABASE_ID: !!databaseId,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message ?? "Unknown error",
        detail: e?.body ?? null,
        code: e?.code,
        envStatus: {
          NOTION_TOKEN: !!process.env.NOTION_TOKEN,
          NOTION_CONTENTS_DATABASE_ID: !!process.env.NOTION_CONTENTS_DATABASE_ID,
        },
      },
      { status: 500 }
    );
  }
}
