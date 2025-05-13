
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import os
import json
import time
from ml_utils import predict_sign, initialize_model, extract_hand_landmarks, clear_gesture_history, train_dynamic_gesture_model

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all domains on all /api routes

# Ensure directories exist
os.makedirs('static/images/signs', exist_ok=True)
os.makedirs('static/models', exist_ok=True)
os.makedirs('static/gesture_sequences', exist_ok=True)
os.makedirs('static/training_data', exist_ok=True)

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

@app.route('/api/clear-sequence', methods=['POST'])
def clear_sequence():
    """Clear the current gesture sequence and history"""
    try:
        clear_gesture_history()
        return jsonify({"status": "success", "message": "Gesture history cleared"})
    
    except Exception as e:
        print(f"Error clearing sequence: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/train-dynamic-model', methods=['POST'])
def train_model():
    """Train a new dynamic gesture recognition model"""
    try:
        data = request.json
        training_data_path = data.get('training_data_path', 'static/training_data')
        
        success = train_dynamic_gesture_model(training_data_path)
        
        if success:
            return jsonify({
                "status": "success", 
                "message": "Dynamic gesture model trained successfully"
            })
        else:
            return jsonify({
                "status": "error", 
                "message": "Failed to train dynamic gesture model"
            }), 500
    
    except Exception as e:
        print(f"Error training model: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/record-training-data', methods=['POST'])
def record_training_data():
    """Record training data for a specific gesture"""
    try:
        data = request.json
        if not all(k in data for k in ['base64_image', 'gesture_name']):
            return jsonify({"error": "Image data and gesture name are required"}), 400
            
        gesture_name = data['gesture_name']
        session_id = data.get('session_id', str(int(time.time())))
        
        # Create directory for this gesture if it doesn't exist
        gesture_dir = os.path.join('static/training_data', gesture_name)
        os.makedirs(gesture_dir, exist_ok=True)
        
        # Save the image with a timestamp filename
        base64_string = data['base64_image']
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
            
        img_data = base64.b64decode(base64_string)
        filename = f"{session_id}_{int(time.time() * 1000)}.jpg"
        file_path = os.path.join(gesture_dir, filename)
        
        with open(file_path, 'wb') as f:
            f.write(img_data)
            
        return jsonify({
            "status": "success",
            "message": f"Saved training image for gesture '{gesture_name}'",
            "file_path": file_path
        })
        
    except Exception as e:
        print(f"Error recording training data: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

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
