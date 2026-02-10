# SBOM Dashboard

A comprehensive Software Bill of Materials (SBOM) visualization dashboard built with React, TypeScript, and Vite. This application provides an interactive interface for analyzing software components, security vulnerabilities, licenses, and risk metrics.

## Features

- **Component Management**: Browse and filter software components by ecosystem, license, and vulnerability status
- **Security Analysis**: View detailed vulnerability reports with severity levels (Critical, High, Low)
- **License Compliance**: Track and analyze license distribution across components
- **Interactive Charts**: Visualize ecosystem distribution, license usage, and security risks
- **Risk Scoring**: Automated risk assessment based on vulnerability severity
- **Multi-tab Interface**: Organized views for Overview, Components, Security, and Licenses

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **CycloneDX** - SBOM format support

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

The built files will be generated in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Dependencies

### Core Dependencies

- `react` (^19.2.4) - React library
- `react-dom` (^19.2.4) - React DOM rendering
- `recharts` (^3.7.0) - Charting library for data visualization
- `lucide-react` (^0.563.0) - Icon components

### Development Dependencies

- `typescript` (~5.9.3) - TypeScript compiler
- `vite` (^7.3.1) - Build tool
- `@vitejs/plugin-react` (^5.1.3) - React plugin for Vite
- `eslint` (^9.39.2) - Linting utility
- `typescript-eslint` (^8.54.0) - TypeScript ESLint plugin

## Project Structure

```
├── src/
│   ├── components/
│   │   └── sbom-dashboard.jsx    # Main dashboard component
│   ├── App.tsx                    # Application entry component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── dist/                          # Production build output
├── public/                        # Static assets
└── package.json                   # Project dependencies
```

## Deployment

See [S3-DEPLOYMENT.md](./S3-DEPLOYMENT.md) for detailed instructions on deploying to AWS S3.

Quick deploy command:

```bash
chmod +x deploy-s3.sh
./deploy-s3.sh your-bucket-name
```

## Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

#Technology Details
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
