"use client";

import { supabase } from "@/lib/supabase/client";
import type { SignInData, UserRole } from "@/lib/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthError {
  message: string;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "user" || value === "premium_user";
}

async function ensureUserRoleMetadata(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const current = (user.user_metadata as Record<string, unknown> | null) ?? {};
  const currentRole = current["user_role"];

  if (isUserRole(currentRole)) return;

  await supabase.auth.updateUser({
    data: {
      user_role: "user",
    },
  });
}

/**
 * 회원가입 함수
 * Supabase Auth에 사용자만 생성합니다. (별도 public.users 테이블 사용 안 함)
 */
export async function signUp(
  data: {
    email: string;
    password: string;
    // 필요한 경우 user_metadata로 저장 (선택)
    metadata?: Record<string, unknown>;
  }
): Promise<{ user: SupabaseUser | null; error: AuthError | null }> {
  try {
    const mergedMetadata: Record<string, unknown> = {
      ...(data.metadata ?? {}),
      user_role: isUserRole(data.metadata?.user_role) ? data.metadata?.user_role : "user",
    };

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: mergedMetadata },
    });

    if (authError) {
      return {
        user: null,
        error: { message: authError.message },
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: { message: "사용자 생성에 실패했습니다." },
      };
    }

    return {
      user: authData.user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}

/**
 * 로그인 함수
 */
export async function signIn(
  data: SignInData
): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        error: { message: error.message },
      };
    }

    // 로그인 시 user_role이 없으면 기본값 "user"로 세팅
    try {
      await ensureUserRoleMetadata();
    } catch {
      // metadata 보정 실패는 로그인 자체를 실패로 만들지 않음
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}

/**
 * 로그아웃 함수
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: { message: error.message },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<{
  user: SupabaseUser | null;
  error: AuthError | null;
}> {
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        user: null,
        error: { message: authError?.message || "인증되지 않은 사용자입니다." },
      };
    }

    return {
      user: authUser,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: {
        message:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}

