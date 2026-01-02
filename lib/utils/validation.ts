/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return "이메일을 입력해주세요.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "올바른 이메일 형식이 아닙니다.";
  }

  return null;
}

/**
 * 비밀번호 검증
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "비밀번호를 입력해주세요.";
  }

  if (password.length < 6) {
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  }

  return null;
}

/**
 * 핸드폰번호 검증 (한국 형식)
 */
export function validatePhone(phone: string): string | null {
  if (!phone) {
    return "핸드폰번호를 입력해주세요.";
  }

  // 한국 핸드폰번호 형식: 010-1234-5678 또는 01012345678
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  const cleanedPhone = phone.replace(/-/g, "");

  if (!phoneRegex.test(phone) && cleanedPhone.length !== 11) {
    return "올바른 핸드폰번호 형식이 아닙니다. (예: 010-1234-5678)";
  }

  return null;
}

/**
 * 닉네임 검증
 */
export function validateNickname(nickname: string): string | null {
  if (!nickname) {
    return "닉네임을 입력해주세요.";
  }

  if (nickname.length < 2) {
    return "닉네임은 최소 2자 이상이어야 합니다.";
  }

  if (nickname.length > 20) {
    return "닉네임은 최대 20자까지 입력 가능합니다.";
  }

  return null;
}

/**
 * 성별 검증
 */
export function validateGender(gender: string): string | null {
  if (!gender) {
    return "성별을 선택해주세요.";
  }

  const validGenders = ["남성", "여성", "기타"];
  if (!validGenders.includes(gender)) {
    return "올바른 성별을 선택해주세요.";
  }

  return null;
}

