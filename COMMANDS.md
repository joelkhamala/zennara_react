# Quick Command Reference

## 🚀 Getting Started

```bash
# Install all dependencies (do this first!)
npm install

# Start development server
npm run dev

# Open browser automatically to http://localhost:3000
```

## 🛠️ Development Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Package Management

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update all packages
npm update

# Clean install (if issues)
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Useful Terminal Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated
```

## 🐛 Troubleshooting

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# If port is taken, change in vite.config.js
# or set different port:
npm run dev -- --port 3001
```

## 📝 Git Commands (if using Git)

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Phase 1: React conversion complete"

# Create .gitignore (already created)
# node_modules and dist are ignored
```

## 🌐 Network Access

```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Access from phone on same network
# http://YOUR_IP:3000
```

## 🔥 Hot Tips

```bash
# Open in VS Code
code .

# Open specific file
code src/App.jsx

# Format code (if prettier installed)
npm run format
```

---

## ⚡ Fastest Way to Start

Just copy and paste these 3 commands:

```bash
npm install
npm run dev
```

That's it! Your React app will open in the browser.
