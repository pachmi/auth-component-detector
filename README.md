# 🔐 AI-Powered Authentication Component Detector

> Advanced web scraping tool that identifies login forms and authentication components on any website - Built with cutting-edge UI design

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

## 🎯 Project Overview

This application was built for an **AI Engineer Technical Assessment** and demonstrates:
- **✅ Web Scraping**: Successfully scrapes 5 different website types (Tech, SaaS, Blog, Social, E-commerce)
- **✅ Component Detection**: Uses dual detection strategies (DOM + raw HTML) with 7+ pattern-matching algorithms
- **✅ Dynamic Input**: Accepts any URL and returns structured, detailed results
- **✅ Modern UI/UX**: Ultra-modern design with gradients, glassmorphism, and smooth animations

## ✨ Key Features

### 🎨 Ultra-Modern UI
- **Gradient Backgrounds**: Triple-layer animated gradients (pink, purple, cyan)
- **Floating Particles**: 20 animated particles creating a dynamic atmosphere
- **Glassmorphism 2.0**: Enhanced backdrop blur effects with glowing borders
- **Smooth Animations**: Every interaction has polished transitions
- **Emoji Icons**: Visual indicators for each test site (💻 🐙 📝 💼 💳)
- **Gradient Text**: Eye-catching typography with color-shifting effects

### 🔍 Advanced Detection Engine
- ✅ **7 Detection Strategies**: Forms, password inputs, email inputs, username fields, buttons, containers, social auth
- ✅ **Dual Detection**: Scans both DOM elements AND raw HTML (handles JS-rendered forms!)
- ✅ **Fallback System**: 3 CORS proxies with automatic failover
- ✅ **Smart Pattern Matching**: Detects auth components even in complex layouts
- ✅ **Real-time Analysis**: Instant feedback with beautiful loading states

### 🚀 Technical Excellence
- 💻 **100% Client-Side**: No backend required - fully browser-based
- ⚡ **Multiple Proxies**: AllOrigins → CorsProxy → CodeTabs (automatic fallback)
- 🛡️ **Error Handling**: Graceful failures with helpful, actionable error messages
- 💾 **Local Storage**: Recent scans history (last 5 scans)
- 📱 **Fully Responsive**: Beautiful on desktop, tablet, and mobile

## 🎪 Live Demo

**[🌐 View Live Application →](https://pachmi.github.io/auth-component-detector/)**

## 🧪 Pre-configured Test Sites

The app includes 5 working test sites representing different categories:

| Site | Type | Icon | Status |
|------|------|------|--------|
| Stack Overflow | Tech | 💻 | ✅ Working |
| GitHub | SaaS | 🐙 | ✅ Working |
| WordPress.org | Blog | 📝 | ✅ Working |
| LinkedIn | Social | 💼 | ✅ Working |
| PayPal | E-commerce | 💳 | ✅ Working |

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom gradients and animations
- **Icons**: Lucide React (with custom glow effects)
- **Build Tool**: Vite 5
- **Deployment**: GitHub Pages
- **CORS Proxies**: AllOrigins, CorsProxy, CodeTabs

## 📦 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/pachmi/auth-component-detector.git
cd auth-component-detector

# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:5173/auth-component-detector/`

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🎯 How It Works

### Dual Detection Strategy

**Approach 1: DOM Parsing**
1. Parses HTML using DOMParser
2. Queries for form elements, inputs, buttons
3. Analyzes attributes (type, name, id, placeholder)
4. Returns structured component data

**Approach 2: Raw HTML Scanning (Fallback)**
1. If DOM parsing finds nothing, scans raw HTML
2. Searches for patterns: `type="password"`, `name="username"`, etc.
3. Reports findings as "JavaScript-rendered"
4. Handles modern SPA frameworks (React, Vue, Angular)

### Detection Categories

1. **Login Forms** - Forms containing password/username/email fields
2. **Password Inputs** - `<input type="password">` elements
3. **Email Inputs** - `<input type="email">` elements  
4. **Username Inputs** - Inputs with user/login in name/id
5. **Login Buttons** - Buttons with login/signin/submit text
6. **Auth Containers** - Divs/sections with login/auth classes
7. **Social Auth** - Google, Facebook, GitHub, etc. login buttons

### CORS Proxy System

The app tries 3 proxies in sequence with 15-second timeouts:

```javascript
1. AllOrigins (api.allorigins.win) → Try first
2. CorsProxy (corsproxy.io) → Fallback #1
3. CodeTabs (api.codetabs.com) → Fallback #2
```

If all fail, shows helpful error message with troubleshooting tips.

## 📊 Assessment Requirements Checklist

✅ **Scrapes 5 different website types** - Tech, SaaS, Blog, Social, E-commerce  
✅ **Extracts HTML markup** - Dual detection (DOM + raw HTML)  
✅ **Finds username & password sections** - 7 detection strategies  
✅ **Dynamic URL input** - Works with any URL  
✅ **Returns structured output** - Organized HTML snippets with metadata  
✅ **Deployment** - Live on GitHub Pages  

**Bonus Features:**
- ✨ Fallback detection for JS-rendered forms
- ✨ Multiple CORS proxy failover
- ✨ Ultra-modern, professional UI
- ✨ Social auth detection
- ✨ Recent scans history

## 🎨 UI Design Highlights

### Visual Features
- **Animated Background**: 3 gradient orbs with pulse animations
- **Floating Particles**: 20 particles with random float animations
- **Glassmorphism Cards**: Backdrop blur with gradient borders
- **Glowing Icons**: Every icon has a subtle blur glow effect
- **Gradient Stats**: Each metric has its own color theme
- **Hover Effects**: Smooth transitions on all interactive elements

### Color Palette
- **Primary**: Purple → Pink → Cyan gradients
- **Accents**: Stat-specific colors (red for passwords, blue for usernames, etc.)
- **Background**: Dark slate with animated gradient overlays
- **Text**: White with gradient accents for emphasis

## 🐛 Known Limitations

1. **JavaScript-Heavy Sites**: Some SPAs load forms after initial render (fallback detection helps!)
2. **CORS Restrictions**: Aggressive security policies may block proxy access
3. **Rate Limits**: Free proxies have usage limits (~60 requests/minute)
4. **Login Walls**: Cannot access content behind authentication

## 🔒 Privacy & Security

- ✅ Zero backend - all processing happens in your browser
- ✅ No data sent to external servers (except proxy requests)
- ✅ Recent scans stored only in browser localStorage
- ✅ No credentials captured or transmitted
- ✅ Open source - verify the code yourself!

## 🚀 Performance

- **Lightweight**: ~840 lines of React code
- **Fast**: CSS-based animations (no JS performance impact)
- **Efficient**: Results only rendered when expanded
- **Responsive**: Works smoothly on all devices

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

**Alyssa Bustos**
- GitHub: [@pachmi](https://github.com/pachmi)
- Built for: AI Engineer Technical Assessment
- Project: Authentication Component Detector

## 🙏 Acknowledgments

- **React Team** - For the incredible framework
- **Tailwind CSS** - For utility-first styling
- **Lucide** - For beautiful, customizable icons
- **AllOrigins, CorsProxy, CodeTabs** - For CORS proxy services
- **Vite** - For blazing fast build tooling

---

<div align="center">

**⭐ If this project helped you, please star the repo! ⭐**

Made with ❤️ and lots of ☕ for the AI Engineer Assessment

[Live Demo](https://pachmi.github.io/auth-component-detector/) • [Report Bug](https://github.com/pachmi/auth-component-detector/issues) • [Request Feature](https://github.com/pachmi/auth-component-detector/issues)

</div>