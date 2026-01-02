import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-surface border-r border-surface-elevated">
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-surface-elevated">
              <h1 className="text-xl font-bold text-text-primary">
                ironArchive
              </h1>
              <span className="ml-2 text-sm text-text-secondary">Admin</span>
            </div>
            <nav className="flex-1 flex flex-col overflow-y-auto py-6 px-4">
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-primary hover:bg-surface-hover transition-colors mb-2"
              >
                대시보드
              </Link>
              <Link
                href="/admin/posts"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors mb-2"
              >
                콘텐츠 관리
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
              >
                설정
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Navigation */}
          <header className="w-full border-b border-surface-elevated bg-surface">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-text-primary lg:hidden">
                  Admin
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

