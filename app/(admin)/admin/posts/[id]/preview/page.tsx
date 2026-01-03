"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getContentById } from "@/lib/services/content-service";
import { getNotionPageContent } from "@/lib/services/notion-service";
import { NotionRenderer } from "@/components/notion/NotionRenderer";

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // 컨텐츠 데이터 가져오기
  const contentQuery = useQuery({
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-text-secondary">컨텐츠를 불러오는 중...</div>
      </div>
    );
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card elevation={1}>
          <CardContent className="py-12 text-center">
            <p className="text-text-secondary mb-4">
              컨텐츠를 불러올 수 없습니다.
            </p>
            <Button variant="outline" onClick={() => router.push("/admin/posts")}>
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = contentQuery.data;

  return (
    <div className="min-h-screen bg-background">
      {/* 모바일 시뮬레이션 컨테이너 */}
      <div className="flex items-center justify-center min-h-screen py-8 px-4">
        <div
          className="w-full max-w-[360px] bg-background border border-surface-elevated rounded-lg shadow-elevation-3 overflow-hidden"
          style={{ minHeight: "640px" }}
        >
          {/* 모바일 헤더 */}
          <div className="sticky top-0 z-10 bg-surface border-b border-surface-elevated px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/posts")}
              className="text-text-primary"
            >
              ← 뒤로
            </Button>
            <h1 className="text-sm font-semibold text-text-primary">
              미리보기
            </h1>
            <div className="w-12" /> {/* 공간 맞추기 */}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {/* 썸네일 */}
            {content.thumbnail_url && (
              <div className="w-full">
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* 제목 및 설명 */}
            <div className="px-4 py-6 border-b border-surface-elevated">
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {content.title}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* Notion 컨텐츠 */}
            <div className="px-4 py-6">
              {notionQuery.isLoading && (
                <div className="text-center py-12 text-text-secondary">
                  Notion 컨텐츠를 불러오는 중...
                </div>
              )}

              {notionQuery.isError && (
                <div className="text-center py-12">
                  <p className="text-error mb-4 font-semibold">
                    Notion 컨텐츠를 불러올 수 없습니다.
                  </p>
                  <p className="text-sm text-text-tertiary mb-2">
                    {notionQuery.error instanceof Error
                      ? notionQuery.error.message
                      : "알 수 없는 오류가 발생했습니다."}
                  </p>
                  {content.notion_url && (
                    <p className="text-xs text-text-tertiary mb-4 break-all">
                      URL: {content.notion_url}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => notionQuery.refetch()}
                    >
                      다시 시도
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/posts/${id}/edit`)}
                    >
                      수정하기
                    </Button>
                  </div>
                </div>
              )}

              {notionQuery.isSuccess && notionQuery.data && (
                <div>
                  {notionQuery.data.title && (
                    <h1 className="text-2xl font-bold text-text-primary mb-4">
                      {notionQuery.data.title}
                    </h1>
                  )}
                  <NotionRenderer blocks={notionQuery.data.blocks} />
                </div>
              )}
            </div>

            {/* CTA 버튼들 */}
            {content.cta_buttons && content.cta_buttons.length > 0 && (
              <div className="px-4 py-6 border-t border-surface-elevated space-y-3">
                {content.cta_buttons.map((cta) => (
                  <a
                    key={cta.id}
                    href={cta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-surface-elevated border border-surface-elevated rounded-lg p-4 hover:bg-surface-hover transition-colors">
                      {cta.image_url && (
                        <img
                          src={cta.image_url}
                          alt={cta.title}
                          className="w-full h-auto rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-text-primary mb-1">
                        {cta.title}
                      </h3>
                      {cta.description && (
                        <p className="text-sm text-text-secondary">
                          {cta.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

