#!/bin/bash
echo "Starting Groupware Backend..."
kill $(lsof -t -i:8083) 2>/dev/null
sleep 2
nohup java -jar /home/ryu/바탕화면/groupware/backend/build/libs/groupware-backend-0.0.1-SNAPSHOT.jar \
  > /tmp/groupware-backend.log 2>&1 &
echo "Backend PID: $!"
sleep 10
echo "Backend status:"
curl -s http://localhost:8083/api/approval/templates | head -50
