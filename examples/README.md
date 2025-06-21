# Analytics Examples

This directory contains comprehensive examples demonstrating how to use the Analytics library across different frameworks and scenarios. Each example includes complete setup instructions, live demos (where available), and detailed implementation guides.

## 🚀 Framework Examples

### [Kitchen Sink Demo](./demo)
**Full-featured demo application with comprehensive analytics setup**
- **Framework**: React with Vite
- **Features**: Complete analytics implementation with multiple plugins, event tracking, user identification, and real-time analytics debugging
- **Live Demo**: Available locally
- **Best For**: Understanding all analytics features, testing plugin configurations, and development workflows
- **Key Files**: `./src/utils/analytics/` contains various configuration examples
- **Setup**: Requires building local packages first (`npm run setup && npm run build` from repo root)

### [React Example](./react)
**Production-ready React application with analytics integration**
- **Framework**: React with routing
- **Features**: Page view tracking, component-level analytics, React Router integration
- **Live Demo**: [https://analytics-react-example.netlify.app/](https://analytics-react-example.netlify.app/)
- **Best For**: React applications with client-side routing
- **Key Files**: `./src/components/Layout` for analytics setup
- **Setup**: Standard React app setup with `npm install && npm start`

### [Next.js App Router Example](./nextjs-app-router)
**Modern Next.js 13+ app router implementation**
- **Framework**: Next.js with App Router
- **Features**: Server-side rendering compatibility, automatic page tracking, React hooks integration
- **Best For**: Next.js applications using the new app router pattern
- **Key Files**: `/src/app/analytics.tsx` and `/src/app/layout.tsx`
- **Setup**: `npm install && npm run dev`

### [HTML/Vanilla JavaScript Example](./vanilla-html)
**Simple browser-based implementation using CDN**
- **Framework**: Plain HTML/JavaScript
- **Features**: CDN-based loading, minimal setup, browser compatibility
- **Live Demo**: [https://analytics-html-example.netlify.app/](https://analytics-html-example.netlify.app/)
- **Best For**: Static websites, simple integrations, quick prototyping
- **Key Features**: No build process required, works with any website
- **Setup**: Open `index.html` in browser or serve statically

### [Preact Example](./preact)
**Lightweight Preact application with routing**
- **Framework**: Preact with Preact Router
- **Features**: Small bundle size, React-like development experience, automatic page tracking
- **Live Demo**: [https://analytics-preact-example.netlify.app/](https://analytics-preact-example.netlify.app/)
- **Best For**: Performance-conscious applications, smaller bundle requirements
- **Key Files**: `/src/analytics.js` for setup
- **Setup**: `npm install && npm run dev`

### [Vue Example](./vue)
**Vue.js application with Vue Router integration**
- **Framework**: Vue.js with Vue Router
- **Features**: Vue ecosystem integration, automatic page view tracking via router hooks
- **Best For**: Vue.js applications with client-side routing
- **Key Files**: `./src/main.js` & `./src/analytics.js`
- **Router Integration**: Page views fired from `router.afterEach` events
- **Setup**: `npm install && npm run serve`

## 🔧 Specialized Examples

### [Performance Tracking with Perfume.js](./using-perfumejs)
**Advanced performance monitoring integration**
- **Framework**: React with Perfume.js
- **Features**: Core Web Vitals tracking, performance metrics, automatic performance event sending
- **Live Demo**: [https://analytics-perfumejs-example.netlify.app/](https://analytics-perfumejs-example.netlify.app/)
- **Best For**: Applications requiring detailed performance monitoring and optimization
- **Video Tutorial**: [Watch the implementation video](https://www.youtube.com/watch?v=9DZAVpAubtQ)
- **Key Integration**: Automatic performance metrics sent to analytics providers

## 🌐 External Examples

### [React Router v6 Hooks Example](https://github.com/DavidWells/use-analytics-with-react-router-demo)
**Advanced React Router integration with analytics hooks**
- **Framework**: React with React Router v6
- **Features**: `use-analytics` React hooks, advanced routing patterns, hook-based analytics
- **Best For**: Modern React applications using hooks pattern with React Router v6

## 📋 Getting Started

### Prerequisites
- Node.js 18+ for framework examples
- Modern browser for HTML example
- For demo example: Build local packages first

### Quick Start Guide

1. **Choose your framework** from the examples above
2. **Navigate to the example directory**: `cd examples/{example-name}`
3. **Install dependencies**: `npm install` (except for HTML example)
4. **Start development server**: `npm start` or `npm run dev`
5. **Open browser** and start exploring analytics features

### Development Workflow

For the **demo example** specifically:
1. Build all packages: `npm run setup && npm run build` (from repo root)
2. Install demo dependencies: `cd examples/demo && npm install`
3. For live plugin development: `npm run watch` (from repo root)
4. Start demo: `npm start` (from demo directory)

## 🎯 Use Cases

- **Learning**: Start with the HTML example for simplicity
- **React Development**: Use React or Next.js examples based on your setup
- **Performance Monitoring**: Use the Perfume.js example for Core Web Vitals
- **Production Setup**: The demo example shows comprehensive configuration options
- **Small Bundles**: Preact example for size-conscious applications
- **Vue Ecosystem**: Vue example for Vue.js applications

## 📚 Additional Resources

- [Analytics Documentation](../README.md)
- [Plugin Documentation](../packages/)
- [API Reference](../site/main/source/api.md)
- [Writing Custom Plugins](../site/main/source/plugins/writing-plugins.md)
