
export function extractNotionPageId(url: string): string | null {
  if (!url) return null;

  // Notion ID는 보통 아래 둘 중 하나로 들어옵니다.
  // - 하이픈 포함 UUID: 8-4-4-4-12
  // - 32자리 hex(하이픈 없음): 예) 2d9834013f708023a99df368afc2338a
  const uuidWithHyphen = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hex32 = /^[0-9a-f]{32}$/i;

  const trimmed = url.trim();
  if (uuidWithHyphen.test(trimmed) || hex32.test(trimmed)) {
    return trimmed;
  }

  try {
    // URL 파싱
    const urlObj = new URL(url);
    const pathname = urlObj.pathname || "";

    // 1) pathname에서 먼저 찾기 (query의 viewId 등 32hex가 섞이는 걸 피하기 위해 우선순위)
    // 예) /grit-official/10-2d9834013f708023a99df368afc2338a
    //     -> 2d9834013f708023a99df368afc2338a 반환
    const pathMatch =
      pathname.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      ) ?? pathname.match(/[0-9a-f]{32}/i);

    if (pathMatch?.[0]) {
      // /10-<32hex> 같은 경우도 32hex만 잡히도록 위 정규식 순서가 보장합니다.
      return pathMatch[0];
    }

    // 2) pathname 전체가 ID인 경우
    const pathOnly = pathname.replace(/^\//, "");
    if (uuidWithHyphen.test(pathOnly) || hex32.test(pathOnly)) {
      return pathOnly;
    }
  } catch {
    // URL 파싱 실패 시 문자열에서 직접 추출 시도
    const anyMatch =
      url.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      ) ?? url.match(/[0-9a-f]{32}/i);
    if (anyMatch?.[0]) return anyMatch[0];
  }

  return null;
}

/**
 * Notion 페이지 ID를 표준 형식으로 변환 (하이픈 제거)
 */
export function formatNotionPageId(pageId: string): string {
  return pageId.replace(/-/g, "");
}

