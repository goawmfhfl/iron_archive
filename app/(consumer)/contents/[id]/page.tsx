import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getAllContents, getContentById } from "@/lib/services/content-service.server";
import { getNotionPageContent } from "@/lib/services/notion-service.server";
import { ContentDetailClient } from "./ContentDetailClient";

export const revalidate = 3600; // 1시간마다 재생성

/**
 * 모든 컨텐츠 ID를 반환하여 정적 페이지 생성
 */
export async function generateStaticParams() {
  try {
    const contents = await getAllContents();
    // 오픈 상태인 컨텐츠만 반환
    const openContents = contents.filter((content) => content.status === "오픈");
    return openContents.map((content) => ({
      id: content.id,
    }));
  } catch (error) {
    console.error("generateStaticParams error:", error);
    return [];
  }
}

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  
  // QueryClient 생성 (서버 사이드)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
      },
    },
  });

  try {
    // 컨텐츠 데이터 가져오기
    const contentData = await queryClient.fetchQuery({
      queryKey: ["read_margnet", id],
      queryFn: () => getContentById(id),
    });

    if (!contentData) {
      notFound();
    }

    // Notion 페이지 내용 가져오기
    let notionData = null;
    if (contentData.notion_url) {
      try {
        notionData = await queryClient.fetchQuery({
          queryKey: ["notion", contentData.notion_url],
          queryFn: () => getNotionPageContent(contentData.notion_url),
        });
      } catch (error) {
        // Notion 데이터 가져오기 실패해도 페이지는 렌더링
        console.error("Notion 데이터 가져오기 실패:", error);
      }
    }

    // React Query 상태를 직렬화하여 클라이언트에 전달
    const dehydratedState = dehydrate(queryClient);

    return (
      <HydrationBoundary state={dehydratedState}>
        <ContentDetailClient
          id={id}
          initialContent={contentData}
          initialNotionContent={notionData}
        />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("ContentDetailPage error:", error);
    notFound();
  }
}
