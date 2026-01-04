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
    const params = openContents.map((content) => ({
      id: content.id,
    }));
    console.log(`generateStaticParams: ${params.length}개의 정적 페이지 생성`);
    return params;
  } catch (error) {
    console.error("generateStaticParams error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // 빌드 실패를 방지하기 위해 빈 배열 반환
    return [];
  }
}

interface ContentDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  // Next.js 14.2.5에서는 params가 Promise일 수도 있고 아닐 수도 있음
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  if (!id || typeof id !== "string") {
    console.error("Invalid content ID:", id);
    notFound();
  }

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
      queryFn: async () => {
        try {
          return await getContentById(id);
        } catch (error) {
          console.error("getContentById error:", error);
          throw error;
        }
      },
    });

    if (!contentData) {
      console.error("Content not found for ID:", id);
      notFound();
    }

    // Notion 페이지 내용 가져오기
    let notionData = null;
    if (contentData.notion_url) {
      try {
        notionData = await queryClient.fetchQuery({
          queryKey: ["notion", contentData.notion_url],
          queryFn: async () => {
            try {
              return await getNotionPageContent(contentData.notion_url);
            } catch (error) {
              console.error("getNotionPageContent error:", error);
              // Notion 데이터 가져오기 실패해도 페이지는 렌더링
              return null;
            }
          },
        });
      } catch (error) {
        // Notion 데이터 가져오기 실패해도 페이지는 렌더링
        console.error("Notion 데이터 가져오기 실패:", error);
        notionData = null;
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
    // 에러 상세 정보 로깅
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    notFound();
  }
}
