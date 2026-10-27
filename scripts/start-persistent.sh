#!/bin/bash
# Persistent dev server starter
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
sleep 2

# Start server with nohup and full detachment
nohup npx next dev --turbopack > dev.log 2>&1 &
echo $! > /tmp/next-pid.txt
echo "Started PID: $(cat /tmp/next-pid.txt)"

# Wait for ready
for i in $(seq 1 60); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "Server ready at attempt $i"
    exit 0
  fi
  sleep 1
done
echo "Server failed to start"
exit 1
