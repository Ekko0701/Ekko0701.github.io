# Dongjoo Archive - Claude 지침

## 프로젝트 개요

Jekyll 기반 기술 블로그 (Minimal Mistakes 테마)
- URL: https://ekko0701.github.io
- 언어: 한국어

## 블로그 포스트 작성 규칙

포스트 작성 시 `.claude/rules/blog-writing.md`의 규칙을 반드시 따른다.

핵심 요약:
- **말투**: 서술체 (`~다` 체) 사용, 반말체 (`~임`, `~함`) 금지
- **Front matter**: `title`, `categories`, `tags` 모두 필수
- **카테고리**: Algorithm / CS / iOS / Java / Spring / Others
- **섹션**: 카테고리별 정해진 구조를 따름

## 디렉토리 구조

```
_posts/
├── Algorithm/       # 알고리즘 문제 풀이
├── CS/
│   ├── Network/
│   ├── OS/
│   ├── DB/
│   └── ComputerArchitecture/
├── iOS/             # Apple 플랫폼 개발
├── Java/            # Java 언어/표준 라이브러리/JVM
├── Spring/          # Spring 백엔드
└── Others/          # 인프라, DevOps, 기타
```
