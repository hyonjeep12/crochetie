# Crochetie 🧶

뜨개 작품을 관리하고 도안을 보며 뜨개질할 수 있는 모바일 앱

## 주요 기능

- 도안 업로드 및 탐색
- 뜨개 모드 (목록형식 / 갤러리 형식)
- 마이 스튜디오 (진행중인 작품 및 저장한 작품 관리)

## 기술 스택

- React + Vite
- Tailwind CSS
- LocalStorage 기반 데이터 저장

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
