"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";

import type { NotionBlock } from "@/lib/types/notion";
import { extractTextFromRichText } from "@/lib/services/notion-service";

type PromoImage = {
  url: string;
  clickUrl?: string;
  alt?: string;
};

function findFirstUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/\S+/i);
  return match?.[0];
}

function looksLikeNotionId(value: string): boolean {
  const v = value.replace(/^\//, "").trim();
  const uuidWithHyphen =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hex32 = /^[0-9a-f]{32}$/i;
  return uuidWithHyphen.test(v) || hex32.test(v);
}

function toAppNotionViewerHref(pageUrl: string): string {
  return `/notion?pageUrl=${encodeURIComponent(pageUrl)}`;
}

function normalizeClickUrl(url: string): string {
  // Notion 내부 링크(/<pageId>)면 앱의 notion 뷰어로 라우팅
  if (url.startsWith("/") && looksLikeNotionId(url)) {
    return toAppNotionViewerHref(url);
  }
  return url;
}

function stripPrefix(value: string, prefix: string): string {
  const v = value.trim();
  if (v.toLowerCase().startsWith(prefix.toLowerCase())) {
    return v.slice(prefix.length).trim();
  }
  return value.trim();
}

type PromoLayout = "가로형" | "세로형";

function parseLayout(value: string): PromoLayout | undefined {
  const v = value.trim();
  if (v.includes("가로형")) return "가로형";
  if (v.includes("세로형")) return "세로형";
  return undefined;
}

function getTextFromChildBlock(child: NotionBlock): string {
  if (child.type === "paragraph") {
    return extractTextFromRichText(child.paragraph?.rich_text);
  }
  if (child.type === "bulleted_list_item") {
    return extractTextFromRichText(child.bulleted_list_item?.rich_text);
  }
  if (child.type === "numbered_list_item") {
    return extractTextFromRichText(child.numbered_list_item?.rich_text);
  }
  return "";
}

export function PromoCallout({ block }: { block: NotionBlock }) {
  const router = useRouter();
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const parsed = useMemo(() => {
    const children: NotionBlock[] = Array.isArray(block.children) ? block.children : [];

    const images: PromoImage[] = [];
    let title: string | undefined;
    let description: string | undefined;
    let ctaUrl: string | undefined;
    let layout: PromoLayout | undefined;

    for (const child of children) {
      if (child.type === "image") {
        const imgUrl =
          child.image?.type === "external"
            ? child.image?.external?.url
            : child.image?.file?.url;

        if (!imgUrl) continue;

        const captionText =
          child.image?.caption && child.image.caption.length > 0
            ? extractTextFromRichText(child.image.caption)
            : "";
        const captionUrl = captionText ? findFirstUrl(captionText) : undefined;

        images.push({
          url: imgUrl,
          clickUrl: captionUrl ? normalizeClickUrl(captionUrl) : undefined,
          alt: captionText || "promo-image",
        });
        continue;
      }

      // 텍스트 메타데이터는 paragraph 또는 bulleted_list_item 등으로 들어올 수 있음
      const text = getTextFromChildBlock(child);
      if (!text) continue;

      if (!title && text.trim().toLowerCase().startsWith("제목:")) {
        title = stripPrefix(text, "제목:");
        continue;
      }
      if (!description && text.trim().toLowerCase().startsWith("설명:")) {
        description = stripPrefix(text, "설명:");
        continue;
      }
      if (!layout && text.trim().toLowerCase().startsWith("레이아웃:")) {
        layout = parseLayout(stripPrefix(text, "레이아웃:"));
        continue;
      }
      if (!ctaUrl && text.trim().toLowerCase().startsWith("url:")) {
        const raw = stripPrefix(text, "url:");
        const found = findFirstUrl(raw) ?? raw;
        if (found) ctaUrl = normalizeClickUrl(found);
        continue;
      }

      // 마지막 fallback: 문단/리스트 아이템 안에 URL이 하나라도 있으면 CTA로 사용
      if (!ctaUrl) {
        const found = findFirstUrl(text);
        if (found) ctaUrl = normalizeClickUrl(found);
      }
    }

    return { images, title, description, ctaUrl, layout };
  }, [block]);

  const layout = parsed.layout ?? "세로형";
  const cardHref = parsed.ctaUrl ? normalizeClickUrl(parsed.ctaUrl) : undefined;
  const isCardClickable = Boolean(cardHref);

  return (
    <section
      className={[
        "not-prose my-6 rounded-2xl border border-border bg-surface shadow-elevation-2 overflow-hidden",
        isCardClickable ? "cursor-pointer hover:bg-surface-hover/30 transition-colors" : "",
      ].join(" ")}
      role={isCardClickable ? "link" : undefined}
      tabIndex={isCardClickable ? 0 : undefined}
      onClick={() => {
        if (!cardHref) return;
        if (cardHref.startsWith("/")) {
          router.push(cardHref);
          return;
        }
        window.open(cardHref, "_blank", "noreferrer");
      }}
      onKeyDown={(e) => {
        if (!cardHref) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (cardHref.startsWith("/")) {
          router.push(cardHref);
          return;
        }
        window.open(cardHref, "_blank", "noreferrer");
      }}
    >
      <header className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-text-primary truncate leading-tight">
              {parsed.title ?? "이런 컨텐츠 찾고 있나요?"}
            </h3>
            {parsed.description && (
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap leading-7">
                {parsed.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* 이미지 영역 */}
      <div className="px-3 pb-3">
        {parsed.images.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-elevated/40 p-6 text-sm text-text-tertiary">
            이미지가 없습니다.
          </div>
        ) : parsed.images.length === 1 ? (
          <PromoImageCard image={parsed.images[0]} variant="single" layout={layout} />
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={14}
              slidesPerView="auto"
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                // @ts-expect-error swiper 내부 타입 호환
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-expect-error swiper 내부 타입 호환
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              pagination={{
                clickable: true,
                el: ".promo-pagination",
              }}
              className="promo-swiper"
            >
              {parsed.images.map((img, idx) => (
                <SwiperSlide
                  key={`${img.url}-${idx}`}
                  className="!w-auto !shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PromoImageCard image={img} variant="carousel" layout={layout} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination + 좌/우 버튼 (아래 고정) */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                ref={prevRef}
                type="button"
                className="promo-nav-btn"
                aria-label="이전"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="promo-pagination" />

              <button
                ref={nextRef}
                type="button"
                className="promo-nav-btn"
                aria-label="다음"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Swiper 기본 pagination을 우리가 만든 컨테이너로 이동 */}
            <style jsx global>{`
              .promo-swiper .swiper-pagination {
                position: static;
                margin-top: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              .promo-swiper .swiper-pagination-bullet {
                width: 10px;
                height: 10px;
                border-radius: 9999px;
                opacity: 1;
                background: rgba(148, 163, 184, 0.55); /* slate-400 */
                transition: width 180ms ease, background 180ms ease;
              }
              .promo-swiper .swiper-pagination-bullet-active {
                width: 26px;
                background: rgba(99, 102, 241, 0.95); /* indigo-500 */
              }
              .dark .promo-swiper .swiper-pagination-bullet {
                background: rgba(148, 163, 184, 0.35);
              }
              .dark .promo-swiper .swiper-pagination-bullet-active {
                background: rgba(129, 140, 248, 0.95); /* indigo-400 */
              }

              .promo-nav-btn {
                height: 40px;
                width: 40px;
                border-radius: 9999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(148, 163, 184, 0.35);
                background: rgba(15, 23, 42, 0.35); /* dark surface */
                color: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                transition: transform 150ms ease, background 150ms ease, border-color 150ms ease;
              }
              .promo-nav-btn:hover {
                transform: translateY(-1px);
                background: rgba(15, 23, 42, 0.55);
                border-color: rgba(129, 140, 248, 0.55);
              }
              .promo-nav-btn:active {
                transform: translateY(0px);
              }
              .dark .promo-nav-btn {
                background: rgba(15, 23, 42, 0.55);
                border-color: rgba(148, 163, 184, 0.28);
              }
              .dark .promo-nav-btn:hover {
                background: rgba(15, 23, 42, 0.75);
                border-color: rgba(129, 140, 248, 0.55);
              }
            `}</style>
          </div>
        )}
      </div>
    </section>
  );
}

function PromoImageCard({
  image,
  variant,
  layout,
}: {
  image: PromoImage;
  variant: "single" | "carousel";
  layout: PromoLayout;
}) {
  const fixedCarouselSize =
    layout === "가로형"
      ? "w-[240px] sm:w-[280px] aspect-[16/9]"
      : "w-[200px] sm:w-[220px] aspect-[3/4]";

  // 단일 이미지는 플렉시블하게 중앙 정렬
  if (variant === "single") {
    const content = (
      <div className="group relative flex justify-center items-center">
        <div className="relative max-w-full rounded-2xl overflow-hidden border border-border bg-background shadow-elevation-1">
          <div className="relative w-full max-w-2xl aspect-[16/9]">
            <Image
              src={image.url}
              alt={image.alt || "이미지"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          {/* 클릭 유도 아이콘: caption에 URL이 있을 때만 표시 */}
          {image.clickUrl && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white shadow-elevation-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M14 5H19V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14L19 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 14V19H5V5H10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    if (image.clickUrl) {
      const isHttp = image.clickUrl.startsWith("http");
      return (
        <a
          href={image.clickUrl}
          target={isHttp ? "_blank" : undefined}
          rel={isHttp ? "noreferrer noopener" : undefined}
          className="block"
          aria-label="이미지 링크로 이동"
          title="이미지 링크로 이동"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      );
    }

    return content;
  }

  // 캐러셀 이미지는 기존 크기 유지
  const content = (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-background shadow-elevation-1 shrink-0">
      <div className={["relative overflow-hidden", fixedCarouselSize].join(" ")}>
        <Image
          src={image.url}
          alt={image.alt || "이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 240px, 280px"
        />
      </div>
      {/* 클릭 유도 아이콘: caption에 URL이 있을 때만 표시 */}
      {image.clickUrl && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white shadow-elevation-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 5H19V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 14L19 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 14V19H5V5H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  if (image.clickUrl) {
    const isHttp = image.clickUrl.startsWith("http");
    return (
      <a
        href={image.clickUrl}
        target={isHttp ? "_blank" : undefined}
        rel={isHttp ? "noreferrer noopener" : undefined}
        className="block"
        aria-label="이미지 링크로 이동"
        title="이미지 링크로 이동"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return content;
}
