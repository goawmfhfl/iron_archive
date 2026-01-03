"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { useRouter } from "next/navigation";

import type { NotionBlock } from "@/lib/types/notion";
import { extractTextFromRichText } from "@/lib/services/notion-service";
import { extractNotionPageId, formatNotionPageId } from "@/lib/utils/notion";

type PromoImage = {
  url: string;
  clickUrl?: string;
  alt?: string;
};

function LinkIndicatorIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10 13a5 5 0 0 1 0-7l.5-.5a5 5 0 0 1 7 7l-1 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 1 0 7l-.5.5a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function findFirstUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  const raw = match?.[0];
  if (!raw) return undefined;
  return raw.replace(/[),.;]+$/, "");
}

function toContentNotionHref(contentId: string, pageId: string): string {
  return `/contents/${contentId}/notion/${formatNotionPageId(pageId)}`;
}

function normalizeClickUrl(url: string, contentId?: string): string {
  const v = url.trim();
  if (!v) return v;

  // 컨텐츠 컨텍스트가 있으면 Notion 링크는 컨텐츠 하위 라우트로 라우팅
  if (contentId) {
    const pageId = extractNotionPageId(v);
    if (pageId) {
      return toContentNotionHref(contentId, pageId);
    }
  }

  return v;
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

type PromoLayoutType = "banner" | "carousel";
type PromoAspectRatio = "horizontal" | "vertical";

type PromoMeta = {
  title?: string;
  description?: string;
  layoutType?: PromoLayoutType;
  aspectRatio?: PromoAspectRatio;
  url?: string;
};

function stripListPrefix(text: string): string {
  // Notion에서 사용자가 `- title: ...` 같이 입력하는 케이스 대응
  return text.trim().replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
}

function parseKeyValueLine(
  text: string,
): { key: string; value: string } | null {
  const normalized = stripListPrefix(text);
  const colonIndex = normalized.indexOf(":");
  if (colonIndex <= 0) return null;
  const key = normalized.slice(0, colonIndex).trim().toLowerCase();
  const value = normalized.slice(colonIndex + 1).trim();
  if (!key) return null;
  return { key, value };
}

function parsePromoMeta(children: NotionBlock[]): PromoMeta {
  const meta: PromoMeta = {};

  for (const child of children) {
    if (child.type === "image") continue;

    const text = getTextFromChildBlock(child);
    if (!text) continue;

    const kv = parseKeyValueLine(text);
    if (!kv) continue;

    switch (kv.key) {
      case "title": {
        if (!meta.title) meta.title = kv.value;
        break;
      }
      case "description": {
        if (!meta.description) meta.description = kv.value;
        break;
      }
      case "layouttype": {
        if (meta.layoutType) break;
        const v = kv.value.toLowerCase();
        if (v.includes("carousel")) meta.layoutType = "carousel";
        else if (v.includes("banner")) meta.layoutType = "banner";
        break;
      }
      case "aspectratio": {
        if (meta.aspectRatio) break;
        const v = kv.value.toLowerCase();
        if (v.includes("horizontal")) meta.aspectRatio = "horizontal";
        else if (v.includes("vertical")) meta.aspectRatio = "vertical";
        break;
      }
      case "url": {
        if (meta.url) break;
        const raw = kv.value;
        const found = findFirstUrl(raw) ?? raw;
        if (found) meta.url = found;
        break;
      }
      default:
        break;
    }
  }

  return meta;
}

function collectBlocksDepthFirst(blocks: NotionBlock[]): NotionBlock[] {
  const collected: NotionBlock[] = [];
  for (const block of blocks) {
    collected.push(block);
    const kids = (block as any).children;
    if (kids && Array.isArray(kids) && kids.length > 0) {
      collected.push(...collectBlocksDepthFirst(kids));
    }
  }
  return collected;
}

export function PromoCallout({
  block,
  contentId,
}: {
  block: NotionBlock;
  contentId?: string;
}) {
  const router = useRouter();
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const parsed = useMemo(() => {
    const children: NotionBlock[] = Array.isArray(block.children) ? block.children : [];

    const images: PromoImage[] = [];
    const allBlocks = collectBlocksDepthFirst(children);
    const meta = parsePromoMeta(allBlocks);

    for (const child of allBlocks) {
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
        const captionUrl = captionText
          ? (findFirstUrl(captionText) ?? (extractNotionPageId(captionText) ? captionText.trim() : undefined))
          : undefined;

        images.push({
          url: imgUrl,
          clickUrl: captionUrl ? normalizeClickUrl(captionUrl, contentId) : undefined,
          alt: captionText || "promo-image",
        });
        continue;
      }
    }

    return { images, meta };
  }, [block, contentId]);

  const layoutType: PromoLayoutType = parsed.meta.layoutType ?? "banner";
  const aspectRatio: PromoAspectRatio = parsed.meta.aspectRatio ?? "vertical";

  const cardHref = parsed.meta.url ? normalizeClickUrl(parsed.meta.url, contentId) : undefined;
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
              {parsed.meta.title ?? ""}
            </h3>
            {parsed.meta.description && (
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap leading-7">
                {parsed.meta.description}
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
        ) : layoutType === "carousel" ? (
          <PromoGalleryCarousel images={parsed.images} aspectRatio={aspectRatio} />
        ) : parsed.images.length === 1 ? (
          <PromoImageCard image={parsed.images[0]} variant="single" aspectRatio={aspectRatio} />
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
                  <PromoImageCard image={img} variant="carousel" aspectRatio={aspectRatio} />
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

function PromoGalleryCarousel({
  images,
  aspectRatio,
}: {
  images: PromoImage[];
  aspectRatio: PromoAspectRatio;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  if (images.length === 0) return null;

  const current = images[Math.min(activeIndex, images.length - 1)];
  const aspectClass = aspectRatio === "horizontal" ? "aspect-[16/9]" : "aspect-[3/4]";

  const renderImage = (img: PromoImage) => (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-elevation-1">
        <div className={["relative w-full", aspectClass].join(" ")}>
          <Image
            src={img.url}
            alt={img.alt || "이미지"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>

        {/* 클릭 유도 아이콘: caption에 URL이 있을 때만 표시 */}
        {img.clickUrl && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white shadow-elevation-2">
              <LinkIndicatorIcon />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <Swiper
          modules={[Navigation, Thumbs]}
          slidesPerView={1}
          spaceBetween={12}
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
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="promo-gallery-main"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`${img.url}-${idx}`} onClick={(e) => e.stopPropagation()}>
              {img.clickUrl ? (
                <a
                  href={img.clickUrl}
                  target={img.clickUrl.startsWith("http") ? "_blank" : undefined}
                  rel={img.clickUrl.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="block"
                  aria-label="이미지 링크로 이동"
                  title="이미지 링크로 이동"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderImage(img)}
                </a>
              ) : (
                renderImage(img)
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 메인 네비게이션 버튼 (오버레이) */}
        <button
          ref={prevRef}
          type="button"
          className="promo-gallery-nav-btn promo-gallery-nav-btn--prev"
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
        <button
          ref={nextRef}
          type="button"
          className="promo-gallery-nav-btn promo-gallery-nav-btn--next"
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

      {/* 썸네일 스트립 */}
      <div className="mt-4">
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          watchSlidesProgress
          freeMode
          spaceBetween={10}
          slidesPerView="auto"
          className="promo-gallery-thumbs"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={`${img.url}-thumb-${idx}`} className="!w-auto" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={[
                  "relative h-[64px] w-[90px] sm:h-[72px] sm:w-[104px] overflow-hidden rounded-xl border",
                  idx === activeIndex
                    ? "border-primary-500/70 ring-2 ring-primary-500/25"
                    : "border-border hover:border-primary-400/40",
                  "bg-background shadow-elevation-1 transition-colors",
                ].join(" ")}
                aria-label={`썸네일 ${idx + 1}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={img.url}
                  alt={img.alt || "썸네일"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90px, 104px"
                />
                <div
                  className={[
                    "absolute inset-0 transition-opacity",
                    idx === activeIndex ? "opacity-0" : "opacity-10",
                  ].join(" ")}
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .promo-gallery-main .swiper-slide {
          width: 100%;
        }
        .promo-gallery-thumbs .swiper-wrapper {
          align-items: center;
        }
        .promo-gallery-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 42px;
          width: 42px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.35);
          color: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(10px);
          transition: transform 150ms ease, background 150ms ease, border-color 150ms ease, opacity 150ms ease;
          opacity: 0.92;
          z-index: 10;
        }
        .promo-gallery-nav-btn:hover {
          transform: translateY(-50%) translateY(-1px);
          background: rgba(15, 23, 42, 0.55);
          border-color: rgba(129, 140, 248, 0.55);
          opacity: 1;
        }
        .promo-gallery-nav-btn:active {
          transform: translateY(-50%);
        }
        .promo-gallery-nav-btn--prev {
          left: 10px;
        }
        .promo-gallery-nav-btn--next {
          right: 10px;
        }
        .dark .promo-gallery-nav-btn {
          background: rgba(15, 23, 42, 0.55);
          border-color: rgba(148, 163, 184, 0.28);
        }
        .dark .promo-gallery-nav-btn:hover {
          background: rgba(15, 23, 42, 0.75);
          border-color: rgba(129, 140, 248, 0.55);
        }
      `}</style>
    </div>
  );
}

function PromoImageCard({
  image,
  variant,
  aspectRatio,
}: {
  image: PromoImage;
  variant: "single" | "carousel";
  aspectRatio: PromoAspectRatio;
}) {
  const fixedCarouselSize = aspectRatio === "horizontal"
    ? "w-[240px] sm:w-[280px] aspect-[16/9]"
    : "w-[200px] sm:w-[220px] aspect-[3/4]";
  const singleAspect = aspectRatio === "horizontal" ? "aspect-[16/9]" : "aspect-[3/4]";

  // 단일 이미지는 플렉시블하게 중앙 정렬
  if (variant === "single") {
    const content = (
      <div className="group relative flex justify-center items-center">
        <div className="relative w-full max-w-full rounded-2xl overflow-hidden bg-background shadow-elevation-1">
          <div className={["relative w-full", singleAspect].join(" ")}>
            <Image
              src={image.url}
              alt={image.alt || "이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          {/* 클릭 유도 아이콘: caption에 URL이 있을 때만 표시 */}
          {image.clickUrl && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white shadow-elevation-2">
                <LinkIndicatorIcon />
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
    <div className="group relative rounded-2xl overflow-hidden bg-background shadow-elevation-1 shrink-0">
      <div className={["relative overflow-hidden", fixedCarouselSize].join(" ")}>
        <Image
          src={image.url}
          alt={image.alt || "이미지"}
          fill
          className="object-cover"
          sizes={
            aspectRatio === "horizontal"
              ? "(max-width: 640px) 240px, 280px"
              : "(max-width: 640px) 200px, 220px"
          }
        />
      </div>
      {/* 클릭 유도 아이콘: caption에 URL이 있을 때만 표시 */}
      {image.clickUrl && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white shadow-elevation-2">
            <LinkIndicatorIcon />
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
