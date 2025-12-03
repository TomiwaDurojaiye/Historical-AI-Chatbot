# Alternative Installation Methods

## Problem
npm is failing with "Invalid Version" error due to a bug in npm's dependency resolution for `@istanbuljs/load-nyc-config` (a Jest dependency).

## Solution Options

### Option 1: Use Yarn (Recommended)

Yarn doesn't have this bug. Install it and use it instead:

```bash
# Install Yarn globally (if not installed)
npm install -g yarn

# In server directory
yarn install

# In client directory  
cd ../client
yarn install

# Run with yarn
yarn dev
```

### Option 2: Install Dependencies Manually (Without Jest)

Temporarily remove Jest from package.json and install:

```bash
# In server directory
npm install express cors dotenv natural
npm install --save-dev @types/express @types/cors @types/node @types/natural typescript tsx eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Option 3: Use Different npm Version

The bug is in npm 10.9.2. Try downgrading:

```bash
npm install -g npm@9.8.1
cd server
npm install
```

### Option 4: Skip Testing Dependencies

For now, you can run without Jest:

1. Remove these from `server/package.json`:
   - `jest`
   - `@types/jest`  
   - `ts-jest`

2. Then run:
   ```bash
   npm install
   ```

## Recommended Quick Fix

**Use Yarn:**
```bash
# Install yarn if needed
npm install -g yarn

# Server
cd server
yarn

# Client
cd ../client
yarn

# Run
cd ..
yarn dev
```

This should work immediately without any npm cache issues!
