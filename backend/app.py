from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import os
import json
from ml_utils import predict_sign, initialize_model

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all domains on all /api routes

# Ensure directories exist
os.makedirs('static/images/signs', exist_ok=True)
os.makedirs('static/models', exist_ok=True)

# Initialize model
print("Initializing sign language recognition model...")
initialize_model()
print("Model initialized successfully!")

# Dictionary of available signs with their image paths
SIGNS_DICT = {
    "hello": "/static/images/signs/hello.svg",
    "thank you": "/static/images/signs/thank_you.svg",
    "please": "/static/images/signs/please.svg",
    "yes": "/static/images/signs/yes.svg",
    "no": "/static/images/signs/no.svg",
    "good": "/static/images/signs/good.svg",
    "bad": "/static/images/signs/bad.svg",
    "help": "/static/images/signs/help.svg",
    "sorry": "/static/images/signs/sorry.svg",
    "name": "/static/images/signs/name.svg"
}

# Store the current sign sequence
current_sequence = []

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

        # Predict the sign using the ML model
        predicted_sign, confidence = predict_sign(image)
        
        return jsonify({
            "sign": predicted_sign,
            "confidence": confidence
        })
    
    except Exception as e:
        print(f"Error in sign-to-text: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/text-to-sign', methods=['POST'])
def text_to_sign():
    try:
        data = request.json
        if 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text'].lower().strip()
        words = text.split()
        
        signs = []
        for word in words:
            if word in SIGNS_DICT:
                signs.append({
                    "sign": word,
                    "image_path": SIGNS_DICT[word]
                })
            else:
                # If exact word not found, try to find close matches
                for sign in SIGNS_DICT:
                    if word in sign or sign in word:
                        signs.append({
                            "sign": sign,
                            "image_path": SIGNS_DICT[sign]
                        })
                        break
                else:
                    # If no close match, represent as individual letters (finger-spelling)
                    for letter in word:
                        if letter.isalpha() and letter.lower() in SIGNS_DICT:
                            signs.append({
                                "sign": letter.lower(),
                                "image_path": SIGNS_DICT[letter.lower()]
                            })
        
        global current_sequence
        current_sequence = signs
        
        return jsonify({"signs": signs})
    
    except Exception as e:
        print(f"Error in text-to-sign: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/clear-sequence', methods=['POST'])
def clear_sequence():
    global current_sequence
    current_sequence = []
    return jsonify({"status": "success"})

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
