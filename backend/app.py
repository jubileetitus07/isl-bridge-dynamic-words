
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
        unmatched_words = []
        
        for word in words:
            original_word = word
            # Try exact match
            if word in SIGNS_DICT:
                signs.append({
                    "sign": word,
                    "image_path": SIGNS_DICT[word],
                    "match_type": "exact"
                })
            else:
                # Try stemming (remove common suffixes)
                stemmed = word
                for suffix in ['s', 'es', 'ed', 'ing', 'er', 'est']:
                    if word.endswith(suffix) and word[:-len(suffix)] in SIGNS_DICT:
                        stemmed = word[:-len(suffix)]
                        signs.append({
                            "sign": stemmed,
                            "image_path": SIGNS_DICT[stemmed],
                            "match_type": "stemmed",
                            "original": original_word
                        })
                        break
                # If stemming didn't help, look for partial matches
                else:
                    found_partial = False
                    for sign in SIGNS_DICT:
                        # Check if word contains sign or sign contains word
                        if (word in sign and len(word) > 2) or (sign in word and len(sign) > 2):
                            signs.append({
                                "sign": sign,
                                "image_path": SIGNS_DICT[sign],
                                "match_type": "partial",
                                "original": original_word
                            })
                            found_partial = True
                            break
                    
                    # If no match found at all, track the word for potential finger-spelling
                    if not found_partial:
                        unmatched_words.append(original_word)
        
        # For words that couldn't be matched, we could implement finger-spelling
        # For now, we'll just note that they weren't matched
        if unmatched_words:
            # In a more advanced implementation, we would add finger-spelling here
            # For now, we'll just include the words as "unmatched" in the response
            pass
        
        global current_sequence
        current_sequence = signs
        
        return jsonify({
            "signs": signs, 
            "unmatched_words": unmatched_words
        })
    
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
