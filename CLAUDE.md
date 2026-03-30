# CLAUDE.md — AutoTech Academy 프로젝트

## 프로젝트 개요

**AutoTech Academy** — 자동차 정비 학습 웹 시스템
한국폴리텍 미래자동차과 학생 **안현규(23세)**를 위한 개인 학습 도구

- 배포 URL: https://hanalim-svg.github.io/marketing-study/autotech-academy.html
- GitHub: https://github.com/hanalim-svg/marketing-study
- 브랜치: `main`
- 배포 방식: GitHub Pages (main 브랜치 루트)

## 파일 구조

```
D:/hana.html/
├── CLAUDE.md               ← 이 파일
├── autotech-academy.html   ← 메인 학습 시스템 (핵심)
├── marketing-study.html    ← 마케팅 학습 시스템 (별도)
└── index.html              ← 기존 파일
```

## autotech-academy.html 구조

### 페이지 탭
| 탭 | ID | 설명 |
|----|----|------|
| 대시보드 | `page-dashboard` | 진도 현황, 챕터 목록 |
| 챕터 학습 | `page-study` | 강의 내용 + TTS |
| 퀴즈 | `page-quiz` | 챕터별 퀴즈 |
| 모의시험 | `page-exam` | 실전 모의시험 |
| 오답노트 | `page-wrongnote` | 틀린 문제 모음 |
| AI 튜터 | `page-ai` | Grok API 챗봇 |

### 핵심 데이터 구조
- `chapters[]` — 8개 챕터 (엔진/냉각/연료/전기/제동/섀시/EFI/변속기)
- `chapterQuizData{}` — 챕터별 고정 퀴즈 3문제씩
- `examPool[]` — 모의시험 문제 풀 (25문제)
- `wrongNotes[]` — 오답노트 (런타임에 동적 저장)

### 퀴즈 흐름
```
챕터 학습 완료
  → startChapterQuiz(idx)
  → 고정 문제 3개
  → AI 문제 2개 (Grok API 자동 생성)
  → 틀린 문제 wrongNotes에 저장
  → 결과 화면 + 다음 챕터 버튼
```

### AI 튜터
- API: `https://api.x.ai/v1/chat/completions`
- 모델: `grok-3`
- API 키: `localStorage('grok_api_key')`에 저장
- 시스템 프롬프트: 자동차 정비 전문 튜터, 현규씨 호칭, 한국어 답변

## 배포 방법

```bash
git add autotech-academy.html
git commit -m "변경 내용"
git push origin main
```
GitHub Pages 반영까지 약 1~2분 소요

## 사용자 정보

- 이름: 안현규, 23세
- 학교: 한국폴리텍 미래자동차과
- 특징: 실기는 강하지만 이론이 약함
- 목표: 자동차 정비기능사 시험 합격
