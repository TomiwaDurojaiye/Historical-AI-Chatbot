# Troubleshooting Guide

Common issues and their solutions for the Malcolm X Historical Chatbot.

## Installation Issues

### npm Install Errors

**Problem:** `npm error Invalid Version` during installation

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete lockfiles and node_modules:
   ```bash
   cd server && rm -rf node_modules package-lock.json
   cd ../client && rm -rf node_modules package-lock.json
   cd .. && rm -rf node_modules package-lock.json
   ```

3. Use the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

4. Or install manually, one at a time:
   ```bash
    # Root
   npm install
   
   # Server
   cd server && npm install && cd ..
   
   # Client
   cd client && npm install && cd ..
   ```

**Problem:** Permission errors during install

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
```

### TypeScript Compilation Errors

**Problem:** `Cannot find module` errors

**Solution:**
```bash
cd server
npm run build
cd ../client
npm run build
```

## Runtime Issues

### Server Won't Start

**Problem:** `Error [ERR_MODULE_NOT_FOUND]`

**Solution:**
1. Check that all dependencies are installed:
   ```bash
   cd server && npm list
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Try running with `npx`:
   ```bash
   npx tsx watch src/server.ts
   ```

**Problem:** `Port 5000 already in use`

**Solution:**
1. Find and kill the process:
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. Or change the port in `server/.env`:
   ```
   PORT=5001
   ```

### Client Won't Start

**Problem:** Vite errors or blank page

**Solution:**
1. Clear Vite cache:
   ```bash
   cd client
   rm -rf node_modules/.vite
   npm run dev
   ```

2. Check browser console for errors

**Problem:** API requests fail with CORS errors

**Solution:**
1. Ensure server is running on port 5000
2. Check `server/.env` has correct CORS_ORIGIN:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```

3. Verify proxy in `client/vite.config.ts`

## Conversation Engine Issues

**Problem:** Bot not responding or giving generic responses

**Solution:**
1. Check server logs for errors
2. Verify `server/src/data/malcolmx-conversation.json` exists
3. Restart server to reload conversation data

**Problem:** Context not tracking properly

**Solution:**
- Session may have been lost. Click "Reset" button to start fresh conversation

## Build Issues

**Problem:** TypeScript errors during build

**Solution:**
```bash
# Server
cd server
npx tsc --noEmit   # Check for errors without compiling
npm run build

# Client
cd client
npx tsc --noEmit
npm run build
```

## Browser Issues

**Problem:** UI not displaying correctly

**Solution:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Try different browser (Chrome, Firefox, Safari)

**Problem:** Animations stuttering

**Solution:**
- Enable hardware acceleration in browser settings
- Close other resource-intensive browser tabs

## Performance Issues

**Problem:** Slow responses from bot

**Solution:**
1. Check server logs for performance warnings
2. Restart server
3. Check system resources (CPU, memory)

## Development Issues

### Hot Module Replacement Not Working

**Problem:** Changes not reflecting in browser

**Solution:**
1. Check Vite dev server is running
2. Hard refresh browser
3. Restart Vite dev server:
   ```bash
   cd client
   npm run dev
   ```

### ESLint Errors

**Problem:** Linting errors preventing compilation

**Solution:**
```bash
# Fix auto-fixable issues
npm run lint -- --fix
```

## Platform-Specific Issues

### macOS

**Problem:** "command not found: tsx"

**Solution:**
```bash
cd server
npm install --save-dev tsx
```

### Windows

**Problem:** Scripts won't run

**Solution:**
- Use Git Bash or WSL (Windows Subsystem for Linux)
- Or install dependencies individually as shown above

## Getting Help

If you encounter issues not listed here:

1. **Check the logs:**
   - Server: Terminal running `npm run dev:server`
   - Client: Browser DevTools Console
   - Network: Browser DevTools Network tab

2. **Verify environment:**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   ```

3. **Fresh install:**
   ```bash
   # Complete clean reinstall
   rm -rf node_modules package-lock.json
   rm -rf server/node_modules server/package-lock.json
   rm -rf client/node_modules client/package-lock.json
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

## Known Limitations

1. **Sessions are in-memory:** Sessions reset when server restarts
2. **No persistence:** Conversation history not saved to database
3. **Single user:** Not optimized for concurrent multi-user access
4. **Browser support:** Tested on modern browsers (Chrome, Firefox, Safari)

## Reporting Bugs

When reporting issues, please include:
- Node.js and npm versions
- Operating system
- Complete error message
- Steps to reproduce
- Browser and version (for frontend issues)
