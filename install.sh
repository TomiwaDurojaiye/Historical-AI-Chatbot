#!/bin/bash

echo "🚀 Malcolm X Chatbot - Installation Script"
echo "=========================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node_version=$(node --version)
echo "  Node version: $node_version"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install --loglevel=error

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install --loglevel=error
cd ..

# Install client dependencies  
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install --loglevel=error
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To run the application:"
echo "  1. Open two terminal windows"
echo "  2. In terminal 1, run: cd server && npm run dev"
echo "  3. In terminal 2, run: cd client && npm run dev"
echo "  4. Open http://localhost:3000 in your browser"
echo ""
echo "Or run both concurrently:"
echo "  npm run dev"
