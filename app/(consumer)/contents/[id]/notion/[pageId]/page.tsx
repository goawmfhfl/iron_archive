"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import { getNotionPageContent } from "@/lib/services/notion-service";
import { formatNotionPageId } from "@/lib/utils/notion";

export default function ContentNotionSubPage() {
  const params = useParams();
  const router = useRouter();

  const contentId = params.id as string;
  const pageIdRaw = params.pageId as string;
  const pageId = formatNotionPageId(pageIdRaw);
  const notionInput = `/${pageId}`;

  const notionQuery = useQuery({
    queryKey: ["content_notion_subpage", contentId, pageId],
    queryFn: () => getNotionPageContent(notionInput),
    enabled: !!contentId && !!pageId,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/contents/${contentId}`)}
          className="mb-6"
        >
          ← 컨텐츠로 돌아가기
        </Button>

        {notionQuery.isLoading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
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
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" onClick={() => notionQuery.refetch()}>
                  다시 시도
                </Button>
                <Button variant="outline" onClick={() => router.push(`/contents/${contentId}`)}>
                  컨텐츠로
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notionQuery.isSuccess && notionQuery.data && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <NotionRenderer blocks={notionQuery.data.blocks || []} contentId={contentId} />
          </div>
        )}
      </div>
    </div>
  );
}

