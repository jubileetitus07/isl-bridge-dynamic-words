
#!/bin/bash

echo "Starting ISL Translator Application..."
echo

echo "Starting Backend Server..."
cd backend && pip install -r requirements.txt && python app.py &
BACKEND_PID=$!

echo "Waiting for backend to initialize (10 seconds)..."
sleep 10

echo "Starting Frontend Server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo
echo "ISL Translator started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo
echo "Press Ctrl+C to stop all servers..."

# Wait for user to press Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID; kill $FRONTEND_PID; echo 'Application stopped.'; exit 0" INT
while true; do sleep 1; done
