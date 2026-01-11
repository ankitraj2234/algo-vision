# 🚀 AlgoVision - Interactive Algorithm Visualizer

[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vitejs.dev/)

> **A modern, interactive web application for visualizing data structures and algorithms with beautiful animations.**

### 👨‍💻 Developer
**Ankit Raj**  
📧 [ar443203@gmail.com](mailto:ar443203@gmail.com)

---

## 📋 Overview

AlgoVision is a web-based algorithm visualization tool that transforms abstract algorithmic concepts into interactive, visual experiences. Built with React, TypeScript, and modern web technologies, it offers step-by-step animations for understanding complex algorithms.

## ✨ Features

| Category | Description |
|----------|-------------|
| 📚 **Stack** | LIFO operations with push, pop, peek animations |
| 📋 **Queue** | FIFO operations with enqueue, dequeue animations |
| 🔗 **Linked List** | Node-based operations with visual connections |
| #️⃣ **Hash Table** | Key-value storage with collision handling |
| 📊 **Sorting** | 9 algorithms with bar chart visualization |
| 🔍 **Searching** | Linear, Binary, Interpolation search |
| 🕸️ **Graph** | BFS, DFS, Dijkstra's algorithm |
| 📈 **Analysis** | Algorithm complexity comparison |

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **Build Tool**: Vite 7
- **Icons**: Lucide React

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/algo-vision.git
cd algo-vision

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Theme Support

AlgoVision supports both **Light** and **Dark** modes with automatic persistence. Toggle the theme using the sun/moon icon in the header.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause animation |
| `→` | Step forward |
| `←` | Step backward |
| `R` | Reset |
| `Ctrl+T` | Toggle theme |

## 📁 Project Structure

```
algo-vision/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI components
│   │   ├── layout/          # Header, Footer
│   │   └── visualizers/     # Algorithm visualizers
│   ├── pages/               # Page components
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom React hooks
│   ├── data/                # Algorithm info, code examples
│   └── models/              # TypeScript interfaces
├── public/
└── package.json
```

## 📄 License

This project is for educational purposes.

---

<p align="center">
  <strong>AlgoVision</strong><br>
  <em>Making algorithms visual</em>
</p>
