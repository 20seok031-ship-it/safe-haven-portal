## 메인 포털 페이지 구성

### 라우팅
- `/` → 새 포털 메인 페이지 (`PortalHome`)
- `/risk-assessment` → 기존 `SiteInfoForm` (수시 위험성평가)
- `/hazard-analysis` → 자리표시 페이지 (현장 위험요인 분석, 추후 구현)

### 메인 페이지 레이아웃
1. **헤로 영역**
   - 상단 배경: **블루 → 화이트** 그라데이션
   - 타이틀: **EHS AI Assistant** (파란색)
   - 서브카피: 산업안전보건 AI 포털 소개 문구
   - 상단 칩 없음

2. **카드 그리드 (3열)**
   - **카드 1 — 수시 위험성평가** (뱃지: `위험방지`) → `/risk-assessment`
   - **카드 2 — 현장 위험요인 분석** (뱃지: `사진점검`) → `/hazard-analysis`
   - **카드 3 — (준비중)** 비활성, 뱃지 `Coming Soon`, 버튼 비활성

각 카드: 좌상단 컬러 액센트 보더, 제목 + 설명 + `바로가기 →` 버튼.

### 디자인 토큰
- `src/index.css`에 블루→화이트 그라데이션 토큰 추가
- 시맨틱 토큰만 사용, 하드코딩 컬러 금지

### 파일 변경
- 신규: `src/pages/PortalHome.tsx`, `src/pages/HazardAnalysis.tsx`, `src/components/portal/PortalCard.tsx`
- 수정: `src/App.tsx` (라우트 추가), `src/index.css` (토큰 추가)
