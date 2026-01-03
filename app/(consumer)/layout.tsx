"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ConsumerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.user_metadata?.user_role === "admin";

  const navItems = [
    { href: "/", label: "홈" },
    // { href: "/social", label: "소셜링" }, // 개발 예정
    { href: "/contents", label: "컨텐츠" },
    // { href: "/community", label: "커뮤니티" }, // 개발 예정
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 로고 및 네비게이션 */}
            <div className="flex items-center gap-6">
              {/* 데스크톱 로고 */}
              <Link href="/" className="hidden md:block text-xl font-bold text-text-primary hover:text-primary-600 transition-colors">
                ironArchive
              </Link>
              
              {/* 모바일 네비게이션 버튼 (홈/컨텐츠) */}
              <nav className="md:hidden flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              {/* 데스크톱 네비게이션 */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 오른쪽 메뉴 */}
            <div className="flex items-center gap-3">
              {/* 관리자 버튼 */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/admin"}
                  className="hidden sm:flex"
                >
                  어드민
                </Button>
              )}

              {/* 인증 버튼 */}
              <AuthButton />

              {/* 모바일 햄버거 메뉴 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors"
                aria-label="메뉴 열기"
              >
                <svg
                  className="w-6 h-6 text-text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = "/admin";
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover text-left transition-colors"
                  >
                    어드민 페이지로 이동
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      <main className="w-full">{children}</main>
      <footer className="border-t border-border bg-surface mt-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} ironArchive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
