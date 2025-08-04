#!/bin/bash

echo "🚀 Starting KudoBit Local Development Environment"
echo "================================================"

# Function to check if hardhat node is running
check_hardhat_node() {
    curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1
    return $?
}

# Step 1: Check if hardhat node is running
echo "🔍 Checking if Hardhat node is running..."
if check_hardhat_node; then
    echo "✅ Hardhat node is already running on localhost:8545"
else
    echo "❌ Hardhat node not running. Please start it in a separate terminal:"
    echo "   npm run hardhat:node"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Step 2: Check contract deployment status
echo ""
echo "🔍 Checking contract deployment status..."
npm run dev:check

# Step 3: Start the development servers
echo ""
echo "🎬 Starting frontend and backend servers..."
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Start both frontend and backend
npm run dev