"use client";

import { useState, useRef } from "react";
import { Button } from "./Button";
import { validateImageSize, validateImageType } from "@/lib/services/storage-service";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket: "thumbnails";
  expectedWidth?: number;
  expectedHeight?: number;
  label?: string;
  error?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  expectedWidth = 1280,
  expectedHeight = 720,
  label,
  error,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 파일 타입 검증
    if (!validateImageType(file)) {
      setUploadError("JPEG, PNG, WebP 형식만 업로드 가능합니다.");
      return;
    }

    // 이미지 크기 검증
    const validation = await validateImageSize(file, expectedWidth, expectedHeight);
    if (!validation.valid) {
      setUploadError(validation.error || "이미지 크기가 올바르지 않습니다.");
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    try {
      setUploading(true);
      const { uploadImage } = await import("@/lib/services/storage-service");
      const result = await uploadImage({ file, bucket });
      onChange(result.url);
      setUploadError(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다."
      );
      setPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          <span className="text-text-tertiary text-xs ml-2">
            ({expectedWidth}x{expectedHeight}px)
          </span>
        </label>
      )}

      <div className="space-y-3">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg border-2 border-border object-cover"
              style={{
                maxHeight: "400px",
                aspectRatio: `${expectedWidth}/${expectedHeight}`,
              }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "업로드 중..." : "변경"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              displayError
                ? "border-error bg-error-light/10"
                : "border-border hover:border-primary-300"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">
                {uploading ? (
                  "업로드 중..."
                ) : (
                  <>
                    이미지를 드래그하거나 클릭하여 업로드
                    <br />
                    <span className="text-xs text-text-tertiary">
                      {expectedWidth}x{expectedHeight}px 권장
                    </span>
                  </>
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                이미지 선택
              </Button>
            </div>
          </div>
        )}

        {displayError && (
          <p className="text-sm text-error">{displayError}</p>
        )}
      </div>
    </div>
  );
}

