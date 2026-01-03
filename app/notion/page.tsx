import { notFound } from "next/navigation";

export default function NotionViewerPage() {
  // /notion 라우트는 미사용: 모든 Notion 이동은 /contents/[id]/notion/[pageId]로 처리
  // 의도치 않은 직접 접근을 404로 처리합니다.
  notFound();
}

