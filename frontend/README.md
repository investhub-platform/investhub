# Frontend — InvestHub

This folder contains the React frontend built with Vite and Tailwind.

**Quick start**

```powershell
cd frontend
npm install
npm run dev
```

The dev server runs on port `5173` by default. Update API endpoints to point to the backend at `http://localhost:5000` (or your `BACKEND_URL`).

**Main files**
- `src/main.jsx` — SPA entry
- `src/App.jsx` — main application component
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## ESLint tips

For a JavaScript project use lint rules targeting `.js/.jsx` files. Example configuration snippet:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
])
```

You can also enable React-specific lint rules (example):

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      reactDom.configs.recommended,
    ],
  },
])
```
