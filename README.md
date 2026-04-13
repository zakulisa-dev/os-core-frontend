# Zakulisa OS

**A browser-based operating system with a window manager, file system, and built-in apps.**

[![Demo](https://github.com/user-attachments/assets/50163625-98b9-446e-8a3b-c0e97e343987)](https://opsy.netlify.app)

![preview](https://github.com/user-attachments/assets/a3daca02-4887-4aef-8e7c-6112b1f83087)

---

## ✨ Overview

Zakulisa OS is a fully browser-based web operating system built with React 19 and TypeScript. It features a real window manager, a virtual file system backed by IndexedDB, real-time communication via WebSocket, i18n support, Sentry monitoring, and E2E test coverage with Cypress.

The key feature is an **open SDK** — any developer can build and publish an app for the platform via the `@nameless-os/sdk` npm package.

---

## 🖥️ Built-in Apps

| App | Description |
|---|---|
| 🖥️ **Terminal** | Full-featured terminal with 30+ commands, aliases, background jobs, file system access |
| 📁 **File Explorer** | Browse and manage the virtual file system |
| 🧮 **Calculator** | Scientific calculator with history |
| ✅ **To-Do** | Task manager with filters and details |
| 🌐 **Browser** | In-OS browser |
| 🌍 **Translate** | Built-in translation app |
| 🎮 **Simon** | Simon Says game with difficulty levels |
| 💣 **Minesweeper** | Classic minesweeper |
| 🐂 **Bulls & Cows** | Number guessing game |
| 🎵 **Media Viewer** | Image and video viewer |
| 📝 **Text Editor** | Monaco-based code/text editor |
| 🕹️ **JS-DOS** | DOSBox emulator in the browser |
| 🏆 **Achievements** | Platform achievement system |
| ⚙️ **Settings** | Themes, backgrounds, language, window styles |

---

## 🧰 Tech Stack

```
React 19 · TypeScript · Zustand · Vite · Socket.io
Framer Motion · i18next · Cypress · Sentry
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/zakulisa-dev/os-core-frontend.git
cd os-core-frontend
npm install
```

### Environment variables

Create a `.env` file in the root:

```env
VITE_API_URL=your_api_url
VITE_SENTRY_DSN=your_sentry_dsn
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run cypress
```

---

## 🏗️ Architecture

Feature-based structure with a clean separation between the OS core and individual apps.

```
src/
├── api/            # Core OS APIs: FS, WindowManager, EventBus, Notifications
├── apps/           # Built-in applications
├── components/     # Shared UI components
├── features/       # Platform features: i18n, icons, settings, sound
├── hooks/          # Shared React hooks
├── pages/          # Login, Main, Registration
└── stores/         # Global Zustand stores
```

Each app is self-contained and registered through a unified `registerApp` interface — the same interface exposed via the public SDK.

---

## 🔌 SDK

Any developer can build a Zakulisa OS app:

```bash
npm install @nameless-os/sdk
```

Apps get access to the full OS API: file system, window manager, event bus, notifications, achievements, sound, and more.

---

## 👤 Author

**Denis Goncharov** — Full-Stack Developer

- [GitHub](https://github.com/noxtheris)
- [Telegram](https://t.me/noxtheris_dev)
- [Email](mailto:noxtheris.dev@gmail.com)

---

## 📄 License

[MIT](./LICENSE)