import { ReactNode } from "react";
import { AuthButton } from "@/components/auth/AuthButton";

export default function ConsumerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-surface-elevated bg-surface/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-text-primary">
                ironArchive
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full">{children}</main>
      <footer className="border-t border-surface-elevated bg-surface mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-text-secondary">
            © {new Date().getFullYear()} ironArchive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

