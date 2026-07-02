# DevDex

Dongjoo의 기술 블로그 — <https://ekko0701.github.io>

[Jekyll](https://jekyllrb.com/) + [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) (`remote_theme`) 기반이며, 커스텀 Figma 스타일 디자인(라이트/다크 모드)을 적용했다.

## 로컬 실행

```bash
bundle install
bundle exec jekyll serve
```

## 구조

- `_posts/` — 글 (Algorithm / CS / iOS / Java / Spring / Others)
- `_pages/` — 카테고리·태그 아카이브
- `_data/` — 내비게이션·UI 텍스트
- `assets/css/main.scss` — 디자인 오버라이드 + 라이트/다크 테마(CSS 변수)
- `_sass/minimal-mistakes/skins/_figma.scss` — 커스텀 Figma 스킨
- `_includes/head/custom.html` — 웹폰트 로딩 + 다크모드 토글 스크립트

테마 본체는 `remote_theme`(mmistakes/minimal-mistakes@4.27.0)로 가져오며, 위 파일들만 오버라이드로 둔다.
