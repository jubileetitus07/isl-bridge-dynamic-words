
# ISL Bridge: Indian Sign Language Translator

ISL Bridge is a web application that helps bridge the communication gap between the deaf and hearing communities by providing tools for Indian Sign Language (ISL) translation.

## Features

- **Sign to Text**: Use your webcam to translate sign language gestures into text in real-time
- **Text to Sign**: Convert written text into corresponding sign language illustrations
- **ISL Dictionary**: Browse through commonly used ISL signs with visual representations
- **Learning Resources**: Access resources to learn and practice Indian Sign Language

## Setup Instructions

### Prerequisites

- Python 3.7+
- Node.js 18+
- Webcam for sign detection features

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install required Python packages:
```
pip install -r requirements.txt
```

3. Start the Flask server:
```
python app.py
```
The server should start on http://localhost:5000

### Frontend Setup

1. From the project root directory, install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```
The application should be available at http://localhost:5173

### Using Start Scripts

For convenience, you can use:
- On Windows: `start_app.bat`
- On Linux/Mac: `chmod +x start_app.sh && ./start_app.sh`

## Usage Guide

### Sign to Text Translation

1. Navigate to "Sign to Text" page
2. Allow camera access when prompted
3. Position your hands clearly in the webcam view
4. Choose between:
   - "Start Recognition" for continuous translation
   - "Capture" for single frame translation
5. Perform ISL gestures clearly in front of the camera
6. View the translated text in the results panel

### Text to Sign Translation

1. Navigate to "Text to Sign" page
2. Enter text in the input field
3. Click "Translate" to see the corresponding signs
4. Use playback controls to navigate through multi-sign translations

### Dictionary

Browse the comprehensive collection of ISL signs categorized by:
- Alphabet
- Numbers
- Common Words
- Phrases

Use the search feature to find specific signs quickly.

## Troubleshooting

If you encounter issues:

1. **Connection Problems:**
   - Ensure both frontend and backend servers are running
   - Check browser console for error messages
   - Verify the API_BASE_URL in src/lib/api.ts points to http://localhost:5000/api

2. **Camera Not Working:**
   - Allow camera permissions in browser settings
   - Try using a different browser (Chrome recommended)

3. **Sign Detection Issues:**
   - Ensure good lighting conditions
   - Keep hands clearly visible in the frame
   - Use clear, deliberate movements

## Development

- Backend code is in Flask (Python)
- Frontend built with React + TypeScript + Tailwind CSS
- Hand detection uses MediaPipe and custom models

## License

This project is licensed for educational and personal use only.
