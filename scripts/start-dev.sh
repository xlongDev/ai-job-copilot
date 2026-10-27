#!/bin/bash
# Keep-alive script for dev server
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
sleep 2

# Start the server
npx next dev --turbopack > dev.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for it to be ready
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "Server is ready"
    break
  fi
  sleep 1
done

# Keep the process alive
wait $SERVER_PID
