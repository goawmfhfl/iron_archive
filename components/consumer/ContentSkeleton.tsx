export function ContentSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 스켈레톤 */}
        <div className="mb-6">
          <div className="h-8 w-32 bg-surface-hover dark:bg-surface-elevated rounded-md animate-pulse" />
        </div>

        {/* 썸네일 스켈레톤 */}
        <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-surface-hover dark:bg-surface-elevated">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-pulse" />
        </div>

        {/* 제목 및 설명 스켈레톤 */}
        <div className="mb-8 space-y-4">
          {/* 제목 스켈레톤 */}
          <div className="space-y-3">
            <div className="h-10 bg-surface-hover dark:bg-surface-elevated rounded-lg animate-pulse w-3/4" />
            <div className="h-10 bg-surface-hover dark:bg-surface-elevated rounded-lg animate-pulse w-1/2" />
          </div>
          {/* 설명 스켈레톤 */}
          <div className="space-y-2 pt-2">
            <div className="h-5 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
            <div className="h-5 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-5/6" />
            <div className="h-5 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-4/6" />
          </div>
        </div>

        {/* Notion 컨텐츠 영역 스켈레톤 */}
        <div className="space-y-6">
          {/* 단락 스켈레톤들 */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-full" />
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-5/6" />
              {i % 3 === 0 && (
                <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-4/6" />
              )}
            </div>
          ))}

          {/* 이미지/블록 스켈레톤 (간격을 두고) */}
          <div className="w-full aspect-[16/9] bg-surface-hover dark:bg-surface-elevated rounded-lg animate-pulse my-8" />

          {/* 추가 단락들 */}
          {[...Array(4)].map((_, i) => (
            <div key={`extra-${i}`} className="space-y-3">
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-full" />
              <div className="h-4 bg-surface-hover dark:bg-surface-elevated rounded animate-pulse w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
