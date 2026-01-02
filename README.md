# ironArchive

기록을 통한 성장을 위한 플랫폼. React, Next.js, Supabase, Tailwind CSS를 활용하여 개발되었습니다.

## 주요 기능

- 🎨 **모던한 디자인 시스템**: 일관된 색상, 타이포그래피, 간격, 쉐도우 시스템
- 🌓 **다크모드 지원**: 시스템 설정 감지 및 수동 토글
- 📱 **완전 반응형**: 360px부터 데스크탑까지 모든 화면 크기 지원
- 👥 **이중 역할**: 관리자 페이지와 소비자 홈 페이지 통합
- ⚡ **Next.js 14+**: App Router 기반의 최신 Next.js
- 🎯 **TypeScript**: 타입 안정성 보장

## 프로젝트 구조

```
ironArchive/
├── app/
│   ├── (admin)/          # 관리자 페이지 그룹
│   │   └── admin/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── (consumer)/       # 소비자 페이지 그룹
│   │   ├── layout.tsx
│   │   └── page.tsx      # 홈 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   └── globals.css       # 전역 스타일
├── components/
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ThemeToggle.tsx
│   ├── providers/        # Context Providers
│   │   └── ThemeProvider.tsx
│   ├── admin/            # 관리자 전용 컴포넌트
│   └── consumer/         # 소비자 페이지 컴포넌트
├── lib/
│   ├── supabase/         # Supabase 클라이언트 설정
│   │   └── client.ts
│   └── utils/            # 유틸리티 함수
│       └── utils.ts
├── styles/
│   └── design-system.css # 디자인 시스템 변수
└── config/
    └── site.ts           # 사이트 설정
```

## 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 개발 서버 실행:
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 라우팅

- `/`: 소비자 홈 페이지 (모바일 최적화)
- `/admin`: 관리자 대시보드 (데스크탑 최적화)

## 디자인 시스템

### 색상
- Primary: Blue 계열
- Secondary: Purple 계열
- Accent: Teal 계열
- Background, Surface, Text 색상
- Success, Warning, Error 상태 색상

### 타이포그래피
- 시스템 폰트 스택 사용 (가독성 최적화)
- Heading, Body, Caption 크기 시스템

### 간격
- 4px 기준 spacing scale (4, 8, 12, 16, 24, 32, 48, 64...)

### 쉐도우
- Elevation 레벨별 쉐도우 (0-5 레벨)

### 반응형 Breakpoints
- xs: 360px (모바일)
- sm: 640px
- md: 768px
- lg: 1024px (데스크탑)
- xl: 1280px
- 2xl: 1536px

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Theme**: next-themes
- **UI Utilities**: clsx, tailwind-merge

## 개발

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 라이선스

MIT
