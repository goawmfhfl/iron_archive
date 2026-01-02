export type UserRole = "admin" | "user" | "premium_user";
export type Gender = "남성" | "여성" | "기타";

export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
  phone: string;
  gender: Gender;
}

export interface SignInData {
  email: string;
  password: string;
}

