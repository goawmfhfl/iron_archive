"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReadMargnet } from "@/lib/types/content";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: ReadMargnet;
  className?: string;
}

export function ContentCard({ content, className }: ContentCardProps) {
  const formattedDate = new Date(content.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/contents/${content.id}`}>
      <Card
        elevation={1}
        className={cn(
          "group transition-all duration-200 hover:shadow-elevation-2 hover:-translate-y-1",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* 이미지 영역 - 모바일: 위쪽, 데스크톱: 왼쪽 */}
          {content.thumbnail_url && (
            <div className="relative w-full sm:w-64 md:w-80 lg:w-96 aspect-[16/9] sm:flex-shrink-0 overflow-hidden sm:rounded-l-lg rounded-t-lg sm:rounded-tr-none bg-surface-elevated">
              <Image
                src={content.thumbnail_url}
                alt={content.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 384px"
              />
            </div>
          )}
          
          {/* 텍스트 영역 */}
          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between min-h-[180px] sm:min-h-[192px]">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {content.title}
              </h3>
              <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                {content.description}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
              <span>{formattedDate}</span>
              <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                읽기 →
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
