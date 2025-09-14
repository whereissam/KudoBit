#!/bin/bash

echo "🚀 Starting KudoBit Development Environment"
echo "========================================="

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start backend
echo "📡 Starting Backend API (Hono + SIWE)..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting Frontend (React + Vite)..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development Environment Ready!"
echo "📡 Backend API: http://localhost:3001"
echo "🎨 Frontend App: http://localhost:5173"
echo "🔐 SIWE Authentication: Ready"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait