"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NotionRenderer } from "@/components/notion/NotionRenderer";
import type { NotionPageContent } from "@/lib/types/notion";

type EnvStatus = {
  NOTION_TOKEN?: boolean;
  NOTION_CONTENTS_DATABASE_ID?: boolean;
};

type ApiResult =
  | { ok: true; data: unknown; type?: string; summary?: unknown; envStatus?: EnvStatus }
  | { ok: false; status?: number; error: string; detail?: unknown; envStatus?: EnvStatus };

type TestMode = "both" | "structure" | "pages";

export default function TestPage() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<TestMode>("both");
  
  // 페이지 블록 테스트 상태
  const [pageUrl, setPageUrl] = useState("");
  const [pageResult, setPageResult] = useState<NotionPageContent | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchNotionData = async (testMode: TestMode = mode) => {
    setLoading(true);
    setResult(null);

    try {
      const url = testMode === "both" 
        ? "/api/notion" 
        : `/api/notion?mode=${testMode}`;
      
      const res = await fetch(url, { cache: "no-store" });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setResult({
          ok: false,
          status: res.status,
          error:
            (json && (json.error as string)) ||
            `요청 실패: ${res.status} ${res.statusText}`,
          detail: json?.detail ?? json,
          envStatus: json?.envStatus,
        });
        return;
      }

      setResult({ 
        ok: true, 
        data: json,
        type: json?.type,
        summary: json?.summary,
        envStatus: json?.envStatus,
      });
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "알 수 없는 오류",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPageBlocks = async () => {
    if (!pageUrl.trim()) {
      setPageError("Notion URL을 입력해주세요.");
      return;
    }

    setPageLoading(true);
    setPageError(null);
    setPageResult(null);

    try {
      const url = `/api/notion?pageUrl=${encodeURIComponent(pageUrl.trim())}`;
      const res = await fetch(url, { cache: "no-store" });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setPageError(
          (json && (json.error as string)) ||
            `요청 실패: ${res.status} ${res.statusText}`
        );
        return;
      }

      setPageResult(json as NotionPageContent);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchNotionData();
  }, []);


  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Notion API 테스트
          </h1>
          <p className="text-text-secondary">
            `/api/notion` 엔드포인트를 호출하여 Notion 데이터베이스 정보를 확인합니다.
          </p>
        </div>

        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              환경변수 상태
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">NOTION_TOKEN:</span>
                <span className={`font-semibold ${result?.envStatus?.NOTION_TOKEN ? 'text-success' : 'text-error'}`}>
                  {result?.envStatus?.NOTION_TOKEN ? '✓ 설정됨' : '✗ 미설정'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">NOTION_CONTENTS_DATABASE_ID:</span>
                <span className={`font-semibold ${result?.envStatus?.NOTION_CONTENTS_DATABASE_ID ? 'text-success' : 'text-error'}`}>
                  {result?.envStatus?.NOTION_CONTENTS_DATABASE_ID ? '✓ 설정됨' : '✗ 미설정'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              테스트 모드 선택
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setMode("both");
                  fetchNotionData("both");
                }}
                disabled={loading}
                variant={mode === "both" ? "primary" : "outline"}
                size="sm"
              >
                전체 (구조 + 페이지)
              </Button>
              <Button
                onClick={() => {
                  setMode("structure");
                  fetchNotionData("structure");
                }}
                disabled={loading}
                variant={mode === "structure" ? "primary" : "outline"}
                size="sm"
              >
                구조 정보만
              </Button>
              <Button
                onClick={() => {
                  setMode("pages");
                  fetchNotionData("pages");
                }}
                disabled={loading}
                variant={mode === "pages" ? "primary" : "outline"}
                size="sm"
              >
                페이지 목록만
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => fetchNotionData()}
            disabled={loading}
            variant="primary"
          >
            {loading ? "호출 중..." : "다시 호출"}
          </Button>

          <a
            href="/api/notion"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
          >
            /api/notion 직접 열기
          </a>
        </div>

        <Card elevation={2}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">결과</h2>
          </CardHeader>
          <CardContent>
            {loading && !result && (
              <div className="text-center py-8 text-text-secondary">
                Notion API를 호출하는 중...
              </div>
            )}

            {!loading && !result && (
              <div className="text-center py-8 text-text-secondary">
                결과가 없습니다. "다시 호출" 버튼을 클릭하세요.
              </div>
            )}

            {result?.ok === false && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-error-light border border-error">
                  <div className="text-error font-semibold mb-2">
                    {result.status ? `[${result.status}] ` : ""}
                    {result.error}
                  </div>
                  {result.detail !== undefined && (
                    <details className="mt-2">
                      <summary className="text-sm text-error cursor-pointer hover:underline">
                        상세 정보 보기
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto p-3 rounded bg-background border border-surface-elevated text-text-primary">
                        {JSON.stringify(result.detail, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {result?.ok === true && (() => {
              const data = result.data as any;
              const hasStructure = data && typeof data === "object" && data !== null && "structure" in data;
              
              return (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-success-light border border-success">
                    <div className="text-success font-semibold mb-2">
                      ✓ 성공적으로 데이터를 가져왔습니다.
                    </div>
                    {result.type && (
                      <div className="text-sm text-success">
                        모드: {result.type === "both" ? "전체 (구조 + 페이지)" : result.type === "structure" ? "구조 정보" : "페이지 목록"}
                      </div>
                    )}
                    {(() => {
                      const summary = result.summary;
                      if (summary && typeof summary === "object") {
                        return (
                          <div className="mt-2 text-sm text-success">
                            <div className="font-semibold mb-1">요약:</div>
                            <pre className="text-xs bg-background p-2 rounded border border-surface-elevated overflow-auto">
                              {JSON.stringify(summary as Record<string, unknown>, null, 2)}
                            </pre>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  {hasStructure && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          데이터베이스 구조 정보
                        </h3>
                        <div className="overflow-auto">
                          <pre className="text-xs p-4 rounded-lg bg-surface-elevated border border-surface-elevated text-text-primary overflow-x-auto max-h-96">
                            {JSON.stringify(data.structure, null, 2)}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          페이지 목록 ({data.pages?.results?.length || 0}개)
                        </h3>
                        <div className="overflow-auto">
                          <pre className="text-xs p-4 rounded-lg bg-surface-elevated border border-surface-elevated text-text-primary overflow-x-auto max-h-96">
                            {JSON.stringify(data.pages, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!hasStructure && (
                    <div className="overflow-auto">
                      <pre className="text-xs p-4 rounded-lg bg-surface-elevated border border-surface-elevated text-text-primary overflow-x-auto max-h-[600px]">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* 페이지 블록 테스트 섹션 */}
        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              페이지 블록 테스트
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  label="Notion 페이지 URL"
                  type="url"
                  placeholder="https://www.notion.so/..."
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !pageLoading) {
                      fetchPageBlocks();
                    }
                  }}
                />
              </div>
              <Button
                onClick={fetchPageBlocks}
                disabled={pageLoading || !pageUrl.trim()}
                variant="primary"
              >
                {pageLoading ? "가져오는 중..." : "페이지 블록 가져오기"}
              </Button>

              {pageError && (
                <div className="p-4 rounded-lg bg-error-light border border-error">
                  <div className="text-error font-semibold">{pageError}</div>
                </div>
              )}

              {pageResult && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-success-light border border-success">
                    <div className="text-success font-semibold mb-2">
                      ✓ 페이지 블록을 성공적으로 가져왔습니다.
                    </div>
                    {pageResult.title && (
                      <div className="text-sm text-success">
                        제목: {pageResult.title}
                      </div>
                    )}
                    <div className="text-sm text-success">
                      블록 수: {pageResult.blocks?.length || 0}개
                    </div>
                  </div>

                  {/* 렌더링 결과 */}
                  <div className="border border-surface-elevated rounded-lg p-6 bg-background">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      렌더링 결과
                    </h3>
                    {pageResult.title && (
                      <h1 className="text-2xl font-bold text-text-primary mb-4">
                        {pageResult.title}
                      </h1>
                    )}
                    <NotionRenderer blocks={pageResult.blocks || []} />
                  </div>

                  {/* JSON 원본 데이터 */}
                  <details className="mt-4">
                    <summary className="text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                      JSON 원본 데이터 보기
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-4 rounded-lg bg-surface-elevated border border-surface-elevated text-text-primary max-h-96">
                      {JSON.stringify(pageResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card elevation={1}>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              환경변수 설정 안내
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary mb-2">
                필수 환경변수:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <code className="px-1.5 py-0.5 rounded bg-surface-elevated text-text-primary">
                    NOTION_TOKEN
                  </code>
                  : Notion Integration의 API 토큰
                </li>
                <li>
                  <code className="px-1.5 py-0.5 rounded bg-surface-elevated text-text-primary">
                    NOTION_CONTENTS_DATABASE_ID
                  </code>
                  : Notion 데이터베이스 ID
                </li>
              </ul>
              <p className="mt-4 text-text-tertiary">
                <strong>주의:</strong> 환경변수를 수정한 후에는 개발 서버를
                재시작해야 합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

