"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllContents } from "@/lib/services/content-service";
import { ContentCard } from "@/components/consumer/ContentCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReadMargnet } from "@/lib/types/content";

export default function ContentsPage() {
  const { data: contents, isLoading, isError, error, refetch } = useQuery<ReadMargnet[]>({
    queryKey: ["read_margnet", "all", "public"],
    queryFn: getAllContents,
  });

  // 오픈 상태인 컨텐츠만 필터링
  const openContents = contents?.filter((content) => content.status === "오픈") || [];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">컨텐츠</h1>
            <p className="text-text-secondary">유익한 인사이트를 발견하세요</p>
          </div>
          <div className="flex flex-col gap-10">
            {[...Array(6)].map((_, i) => (
              <Card key={i} elevation={1}>
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-64 md:w-80 lg:w-96 aspect-[16/9] bg-surface-elevated animate-pulse rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
                  <CardContent className="p-6 flex-1">
                    <div className="space-y-3">
                      <div className="h-6 bg-surface-elevated rounded animate-pulse" />
                      <div className="h-4 bg-surface-elevated rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-surface-elevated rounded animate-pulse w-4/6" />
                      <div className="h-4 bg-surface-elevated rounded animate-pulse w-3/6 mt-4" />
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">컨텐츠</h1>
            <p className="text-text-secondary">유익한 인사이트를 발견하세요</p>
          </div>
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-error font-semibold mb-4">
                컨텐츠를 불러오는데 실패했습니다.
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            컨텐츠
          </h1>
          <p className="text-base sm:text-lg text-text-secondary">
            유익한 인사이트를 발견하세요
          </p>
        </div>

        {/* 컨텐츠 리스트 - 가로형 카드로 1열 배치 */}
        {openContents.length === 0 ? (
          <Card elevation={1}>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary mb-4">
                아직 등록된 컨텐츠가 없습니다.
              </p>
              <p className="text-sm text-text-tertiary">
                곧 새로운 컨텐츠가 업로드될 예정입니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-10">
            {openContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
