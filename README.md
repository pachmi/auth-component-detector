# 🔐 AI-Powered Authentication Component Detector

> Advanced web scraping tool that identifies login forms and authentication components on any website

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

## 🎯 Project Overview

This application demonstrates advanced capabilities in:
- **Web Scraping**: Fetches and analyzes HTML markup from any website
- **Component Detection**: Uses AI-powered pattern matching to identify authentication elements
- **Dynamic Input**: Accepts any URL and returns structured results
- **Modern UI/UX**: Beautiful, responsive interface with real-time feedback

## ✨ Features

### Core Functionality
- ✅ **Multi-Website Scanning**: Analyze any website for authentication components
- ✅ **Intelligent Detection**: Finds login forms, password fields, username inputs, and auth containers
- ✅ **Structured Output**: Returns organized HTML snippets and metadata
- ✅ **Real-time Analysis**: Immediate feedback with loading indicators

### UI/UX Highlights
- 🎨 **Modern Glassmorphism Design**: Beautiful backdrop blur effects and gradients
- 🌈 **Animated Backgrounds**: Smooth pulse animations for visual appeal
- 📊 **Visual Statistics**: Color-coded metrics showing detection results
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 💾 **Recent Scans History**: Tracks your last 5 scans with timestamps
- 🚀 **Quick Test Buttons**: Pre-configured popular websites for instant testing

### Technical Features
- 🔍 **Advanced Pattern Matching**: Multiple detection strategies
- 🛡️ **Error Handling**: Graceful failure with helpful error messages
- ⚡ **CORS Proxy Integration**: Bypasses cross-origin restrictions
- 💻 **Zero Backend Required**: Fully client-side application

## 🚀 Live Demo

**[View Live Application →](https://pachmi.github.io/auth-component-detector/)**

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: GitHub Pages
- **CORS Proxy**: AllOrigins API

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git
- GitHub account

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/pachmi/auth-component-detector.git
cd auth-component-detector
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to `http://localhost:5173/auth-component-detector/`

### Build for Production
```bash
npm run build
```

Built files will be in the `dist/` directory.

## 🎯 How It Works

### Detection Algorithm

1. **HTML Parsing**: Uses DOMParser to convert HTML string to DOM
2. **Form Detection**: Searches for `<form>` tags containing password/username fields
3. **Input Detection**: Identifies inputs with types: password, email, or name patterns
4. **Button Detection**: Finds buttons with login-related text
5. **Container Detection**: Locates divs/sections with auth-related classes/IDs

### CORS Handling

The application uses `api.allorigins.win` as a CORS proxy to fetch website content.

## 🧪 Testing

### Pre-configured Test Sites

The application includes quick-test buttons for:
- GitHub Login
- Twitter Login
- LinkedIn Login
- Reddit Login
- Stack Overflow Login

### Manual Testing

1. Enter any website URL
2. Click "Analyze" button
3. View detailed results with HTML snippets
4. Expand sections to see full markup

## 📊 Performance Considerations

- **Caching**: Recent scans stored in localStorage
- **Rate Limiting**: CORS proxy has rate limits (60 requests/minute)
- **HTML Truncation**: Large HTML snippets are truncated to 500 characters
- **Lazy Rendering**: Detailed results only shown when expanded

## 🐛 Known Limitations

1. **CORS Proxy**: Some websites block proxy services
2. **JavaScript-heavy Sites**: May not capture dynamically loaded forms
3. **Rate Limits**: Free CORS proxy has usage limits
4. **Authentication Required**: Cannot access sites requiring login

## 🔒 Security Notes

- No user data is stored on servers
- All processing happens client-side
- Recent scans stored locally in browser
- No authentication credentials are ever captured or transmitted

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for utility-first styling
- Lucide for beautiful icons
- AllOrigins for CORS proxy service

---

Made with ❤️ for the Candidate Assessment

⭐ Star this repo if you find it helpful!