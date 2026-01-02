"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSignUp, SignUpError } from "@/lib/hooks/useSignUp";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateNickname,
  validateGender,
} from "@/lib/utils/validation";
import type { Gender } from "@/lib/types/database";

function SignUpForm() {
  const signUpMutation = useSignUp();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
    gender: "" as Gender | "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 필드 변경 시 해당 필드의 에러 제거
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // 전체 에러 메시지도 제거
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    const nicknameError = validateNickname(formData.nickname);
    if (nicknameError) errors.nickname = nicknameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    const genderError = validateGender(formData.gender);
    if (genderError) errors.gender = genderError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await signUpMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        phone: formData.phone,
        gender: formData.gender as Gender,
      });
    } catch (err) {
      if (err instanceof SignUpError) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const genderOptions = [
    { value: "남성", label: "남성" },
    { value: "여성", label: "여성" },
    { value: "기타", label: "기타" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card elevation={2}>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-text-primary">
              회원가입
            </h1>
            <p className="text-center text-sm text-text-secondary mt-2">
              ironArchive에 오신 것을 환영합니다
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="닉네임"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleChange}
                error={fieldErrors.nickname}
                required
                placeholder="닉네임을 입력하세요"
              />

              <Input
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                placeholder="example@email.com"
              />

              <Input
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                required
                placeholder="최소 6자 이상"
              />

              <Input
                label="비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                required
                placeholder="비밀번호를 다시 입력하세요"
              />

              <Input
                label="핸드폰번호"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
                required
                placeholder="010-1234-5678"
              />

              <Select
                label="성별"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={fieldErrors.gender}
                options={genderOptions}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-error-light border border-error text-error text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? "처리 중..." : "회원가입"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
          <div className="w-full max-w-md">
            <Card elevation={2}>
              <CardContent className="py-12">
                <div className="text-center text-text-secondary">로딩 중...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
