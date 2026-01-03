"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getContentById } from "@/lib/services/content-service";
import { getNotionPageContent } from "@/lib/services/notion-service";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import type { ReadMargnet } from "@/lib/types/content";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // 컨텐츠 데이터 가져오기
  const contentQuery = useQuery<ReadMargnet | null>({
    queryKey: ["read_margnet", id],
    queryFn: () => getContentById(id),
    enabled: !!id,
  });

  // Notion 페이지 내용 가져오기
  const notionQuery = useQuery({
    queryKey: ["notion", contentQuery.data?.notion_url],
    queryFn: () => {
      if (!contentQuery.data?.notion_url) {
        throw new Error("Notion URL이 없습니다.");
      }
      return getNotionPageContent(contentQuery.data.notion_url);
    },
    enabled: !!contentQuery.data?.notion_url,
  });

  if (contentQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-3/4" />
            <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-1/2" />
            <div className="w-full aspect-[16/9] bg-surface-hover dark:bg-surface-elevated rounded-lg animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                컨텐츠를 불러올 수 없습니다.
              </p>
              <Button variant="outline" onClick={() => router.push("/contents")}>
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = contentQuery.data;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/contents")}
          className="mb-6"
        >
          ← 목록으로
        </Button>

        {/* 썸네일 */}
        {content.thumbnail_url && (
          <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-transparent">
            <Image
              src={content.thumbnail_url}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* 제목 및 설명 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight">
            <span className="box-decoration-clone bg-background-secondary/80 dark:bg-background-secondary/35 px-3 py-2 rounded-lg">
              {content.title}
            </span>
          </h1>
          {content.description && (
            <p className="text-lg text-text-secondary leading-7">
              {content.description}
            </p>
          )}
        </div>

        {/* Notion 컨텐츠 */}
        {notionQuery.isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
                <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-5/6" />
              </div>
            ))}
          </div>
        )}

        {notionQuery.isError && (
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                Notion 컨텐츠를 불러올 수 없습니다.
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                {notionQuery.error instanceof Error
                  ? notionQuery.error.message
                  : "알 수 없는 오류가 발생했습니다."}
              </p>
              <Button variant="outline" onClick={() => notionQuery.refetch()}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {notionQuery.isSuccess && notionQuery.data && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <NotionRenderer blocks={notionQuery.data.blocks || []} />
          </div>
        )}
      </div>
    </div>
  );
}
