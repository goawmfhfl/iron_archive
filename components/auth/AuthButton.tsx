"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/auth";
import { useAuth } from "./AuthProvider";

export function AuthButton() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push("/");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="w-20 h-10 bg-surface animate-pulse rounded-lg" />
    );
  }

  if (user) {
    const nickname =
      (user.user_metadata?.nickname as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      "사용자";
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary hidden sm:inline">
          {nickname}님
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/login")}
      >
        로그인
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => router.push("/signup")}
      >
        회원가입
      </Button>
    </div>
  );
}

