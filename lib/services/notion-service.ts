"use client";

import type {
  NotionPageContent,
  NotionDatabaseQueryResult,
} from "@/lib/types/notion";

/**
 * Notion 페이지 내용 가져오기
 * 내부적으로 /api/notion Route Handler를 호출합니다.
 */
export async function getNotionPageContent(
  notionUrl: string
): Promise<NotionPageContent> {
  try {
    const response = await fetch(`/api/notion?pageUrl=${encodeURIComponent(notionUrl)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Notion 페이지 조회 실패: ${response.statusText}`
      );
    }

    const data: NotionPageContent = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Notion 페이지를 가져오는 중 오류가 발생했습니다.");
  }
}

/**
 * Notion 데이터베이스에서 페이지 목록 가져오기
 * 내부적으로 /api/notion Route Handler를 호출합니다.
 */
export async function getNotionDatabasePages(): Promise<NotionDatabaseQueryResult> {
  try {
    const response = await fetch("/api/notion?mode=database");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Notion 데이터베이스 조회 실패: ${response.statusText}`
      );
    }

    const data: NotionDatabaseQueryResult = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Notion 데이터베이스 페이지를 가져오는 중 오류가 발생했습니다.");
  }
}

/**
 * Notion 블록의 텍스트 내용 추출
 */
export function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) {
    return "";
  }

  return richText
    .map((item) => item.plain_text || "")
    .join("")
    .trim();
}

