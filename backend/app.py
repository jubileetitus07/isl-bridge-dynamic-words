
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import os
import json
import time
from ml_utils import predict_sign, initialize_model, extract_hand_landmarks

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all domains on all /api routes

# Ensure directories exist
os.makedirs('static/images/signs', exist_ok=True)
os.makedirs('static/models', exist_ok=True)
os.makedirs('static/gesture_sequences', exist_ok=True)

# Initialize model
print("Initializing sign language recognition model...")
initialize_model()
print("Model initialized successfully!")

# Load sign JSON data if it exists, or create a default dictionary
SIGNS_JSON_PATH = 'static/signs_data.json'

# Default dictionary of available signs with their image paths
DEFAULT_SIGNS_DICT = {
    "hello": "/static/images/signs/hello.svg",
    "thank you": "/static/images/signs/thank_you.svg",
    "please": "/static/images/signs/please.svg",
    "yes": "/static/images/signs/yes.svg",
    "no": "/static/images/signs/no.svg",
    "good": "/static/images/signs/good.svg",
    "bad": "/static/images/signs/bad.svg",
    "help": "/static/images/signs/help.svg",
    "sorry": "/static/images/signs/sorry.svg",
    "name": "/static/images/signs/name.svg",
    # Extended signs - can be dynamically populated
    "how": "/static/images/signs/how.svg",
    "what": "/static/images/signs/what.svg",
    "where": "/static/images/signs/where.svg",
    "when": "/static/images/signs/when.svg",
    "who": "/static/images/signs/who.svg",
    "why": "/static/images/signs/why.svg",
    "food": "/static/images/signs/food.svg",
    "water": "/static/images/signs/water.svg",
    "family": "/static/images/signs/family.svg",
    "friend": "/static/images/signs/friend.svg"
}

# Load signs from JSON or use default
def load_signs_data():
    if os.path.exists(SIGNS_JSON_PATH):
        try:
            with open(SIGNS_JSON_PATH, 'r') as file:
                return json.load(file)
        except Exception as e:
            print(f"Error loading signs data: {e}")
            return DEFAULT_SIGNS_DICT
    else:
        # Save default signs to JSON file
        with open(SIGNS_JSON_PATH, 'w') as file:
            json.dump(DEFAULT_SIGNS_DICT, file, indent=2)
        return DEFAULT_SIGNS_DICT

# Initialize signs dictionary
SIGNS_DICT = load_signs_data()

# Store the current sign sequence
current_sequence = []

# Store gesture history for dynamic gesture recognition
gesture_history = []
gesture_timestamps = []
MAX_HISTORY_LENGTH = 30  # Maximum number of frames to keep in history
SEQUENCE_TIMEOUT = 2.0   # Time in seconds before considering a new gesture sequence

@app.route('/api/sign-to-text', methods=['POST'])
def sign_to_text():
    try:
        data = request.json
        if 'base64_image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # Get image data from base64 string
        base64_string = data['base64_image']
        if base64_string.startswith('data:image'):
            # Remove the data:image/jpeg;base64, prefix if present
            base64_string = base64_string.split(',')[1]
        
        # Decode the base64 string
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Failed to decode image"}), 400

        # Extract hand landmarks for tracking
        landmarks, hand_detected = extract_hand_landmarks(image)
        
        # Get current timestamp
        current_time = time.time()
        
        # Update gesture history with timestamps
        if hand_detected:
            gesture_history.append(landmarks)
            gesture_timestamps.append(current_time)
            
            # Keep history within size limit
            while len(gesture_history) > MAX_HISTORY_LENGTH:
                gesture_history.pop(0)
                gesture_timestamps.pop(0)
        
        # Predict the sign using the ML model
        predicted_sign, confidence = predict_sign(image)
        
        # Add debug info about landmarks
        hand_info = {}
        if hand_detected:
            # Get some basic hand information for debugging
            points = landmarks.reshape(-1, 3)
            hand_info = {
                "num_landmarks": len(points),
                "thumb_tip": points[4].tolist() if len(points) > 4 else None,
                "index_tip": points[8].tolist() if len(points) > 8 else None,
                "history_length": len(gesture_history)
            }
        
        # Check for gesture sequence based on recent history
        gesture_sequence = None
        if len(gesture_timestamps) >= 2:
            # If we have a sufficient history and the gesture spans across at least 0.5 seconds
            if gesture_timestamps[-1] - gesture_timestamps[0] > 0.5:
                # Here we would analyze the sequence for dynamic gestures
                # For now, just indicate that we detected a sequence
                gesture_sequence = {
                    "duration": gesture_timestamps[-1] - gesture_timestamps[0],
                    "frame_count": len(gesture_history)
                }
        
        return jsonify({
            "sign": predicted_sign,
            "confidence": confidence,
            "hand_detected": hand_detected,
            "hand_info": hand_info,
            "gesture_sequence": gesture_sequence
        })
    
    except Exception as e:
        print(f"Error in sign-to-text: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/track-dynamic-gesture', methods=['POST'])
def track_dynamic_gesture():
    """
    Endpoint for processing a sequence of hand positions for dynamic gesture recognition
    """
    try:
        data = request.json
        if 'sequence' not in data or not isinstance(data['sequence'], list):
            return jsonify({"error": "No valid sequence data provided"}), 400
            
        sequence = data['sequence']
        
        # Here you would process the sequence for dynamic gesture recognition
        # This would typically involve:
        # 1. Normalization of the sequence
        # 2. Feature extraction
        # 3. Passing to a sequential model (RNN/LSTM/etc)
        
        # For demonstration, we'll return a simple analysis of the sequence
        seq_length = len(sequence)
        
        # Mock dynamic gesture recognition (would be replaced by actual ML model)
        recognizable_gestures = ["hello", "thank you", "please", "yes", "no"]
        
        if seq_length < 5:
            predicted_gesture = "unknown"
            confidence = 0.2
        else:
            # In a real implementation, this would use a trained model
            predicted_gesture = np.random.choice(recognizable_gestures)
            confidence = np.random.uniform(0.6, 0.95)
        
        return jsonify({
            "gesture": predicted_gesture,
            "confidence": float(confidence),
            "sequence_length": seq_length
        })
        
    except Exception as e:
        print(f"Error in track-dynamic-gesture: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# ... keep existing code (text-to-sign endpoint, clear-sequence endpoint)

@app.route('/api/isl-dictionary', methods=['GET'])
def get_dictionary():
    try:
        # Return all available signs with their image paths
        signs = []
        for sign, path in SIGNS_DICT.items():
            signs.append({
                "name": sign,
                "image_path": path
            })
        return jsonify({"signs": signs})
    
    except Exception as e:
        print(f"Error in get-dictionary: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/add-sign', methods=['POST'])
def add_sign():
    try:
        data = request.json
        if 'name' not in data or 'image_path' not in data:
            return jsonify({"error": "Name and image path are required"}), 400
        
        name = data['name'].lower().strip()
        image_path = data['image_path']
        
        # Add sign to dictionary
        SIGNS_DICT[name] = image_path
        
        # Save updated dictionary to JSON file
        with open(SIGNS_JSON_PATH, 'w') as file:
            json.dump(SIGNS_DICT, file, indent=2)
        
        return jsonify({"status": "success", "message": f"Sign '{name}' added successfully"})
    
    except Exception as e:
        print(f"Error adding sign: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
