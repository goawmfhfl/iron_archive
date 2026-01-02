"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { SignUpData, UserRole } from "@/lib/types/database";

// 회원가입 응답 타입 정의
export interface SignUpResponse {
  user: SupabaseUser | null;
  session: Session | null;
}

// 커스텀 에러 클래스
export class SignUpError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "SignUpError";
  }
}

/**
 * 회원가입 함수
 * 1. Supabase Auth에 사용자 생성
 * 2. raw_user_meta_data(user_metadata)에 user_role을 포함해 저장 (기본: "user")
 */
const signUpUser = async (data: SignUpData): Promise<SignUpResponse> => {
  const { email, password, nickname, phone, gender } = data;
  const defaultRole: UserRole = "user";

  // 필수 필드 검증
  if (!email) {
    throw new SignUpError("이메일을 입력해주세요.");
  }

  if (!password) {
    throw new SignUpError("비밀번호를 입력해주세요.");
  }

  if (!nickname) {
    throw new SignUpError("닉네임을 입력해주세요.");
  }

  if (!phone) {
    throw new SignUpError("전화번호를 입력해주세요.");
  }

  if (!gender) {
    throw new SignUpError("성별을 선택해주세요.");
  }

  try {
    // 1. Supabase Auth를 통한 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          phone,
          gender,
          user_role: defaultRole,
        },
      },
    });

    if (authError) {
      // Supabase 에러 메시지를 한국어로 변환
      let errorMessage = authError.message;

      if (authError.message.includes("already registered")) {
        errorMessage = "이미 가입된 이메일입니다.";
      } else if (authError.message.includes("Invalid email")) {
        errorMessage = "올바른 이메일 형식을 입력해주세요.";
      } else if (authError.message.includes("Password should be")) {
        errorMessage = "비밀번호는 6자 이상이어야 합니다.";
      } else if (authError.message.includes("over_email_send_rate_limit")) {
        errorMessage =
          "이메일 전송이 너무 빈번합니다. 잠시 후 다시 시도해주세요.";
      } else if (authError.message.includes("signup_disabled")) {
        errorMessage = "현재 회원가입이 일시적으로 중단되었습니다.";
      } else if (authError.message.includes("email_not_confirmed")) {
        errorMessage = "이메일 인증이 필요합니다. 이메일을 확인해주세요.";
      }

      throw new SignUpError(errorMessage, authError.message);
    }

    if (!authData.user) {
      throw new SignUpError("회원가입에 실패했습니다.");
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    if (error instanceof SignUpError) {
      throw error;
    }

    // 예상치 못한 에러
    console.error("회원가입 중 예상치 못한 에러:", error);
    throw new SignUpError(
      "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
};

/**
 * 회원가입 훅
 */
export const useSignUp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      if (data.session) {
        // 세션이 있는 경우 (이메일 확인이 필요 없는 경우) 홈으로 이동
        router.push("/");
        router.refresh();
      } else {
        // 이메일 확인이 필요한 경우 로그인 페이지로 이동
        router.push(
          "/login?message=회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요."
        );
      }
    },
    onError: (error: SignUpError) => {
      console.error("회원가입 실패:", error.message);
    },
  });
};

