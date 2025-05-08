
import cv2
import numpy as np
import mediapipe as mp
import os
import pickle
import json

# MediaPipe solutions
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = None

# Model variables
model = None
labels = ["hello", "thank you", "please", "yes", "no", "good", "bad", "help", "sorry", "name"]

def initialize_model():
    """Initialize the MediaPipe hands model and load the classification model if available"""
    global hands, model
    
    # Initialize MediaPipe Hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Try to load trained model if exists
    model_path = 'static/models/isl_model.pkl'
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print("Loaded trained model from", model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Using rule-based approach as fallback")
    else:
        print("No trained model found at", model_path)
        print("Using rule-based approach")

def extract_hand_landmarks(image):
    """Extract hand landmarks from image using MediaPipe"""
    # Convert the BGR image to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process the image and extract hand landmarks
    results = hands.process(image_rgb)
    
    landmarks = []
    if results.multi_hand_landmarks:
        # Get the first detected hand
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Extract landmark coordinates (normalized)
        for lm in hand_landmarks.landmark:
            landmarks.append([lm.x, lm.y, lm.z])
        
        return np.array(landmarks).flatten(), True
    
    return np.zeros(21 * 3), False  # Return zeros if no hand detected

def get_hand_shape_features(landmarks):
    """Extract basic shape features from landmarks"""
    if len(landmarks) < 63:  # 21 landmarks x 3 coordinates
        return {}
    
    # Reshape landmarks to get individual points
    points = landmarks.reshape(-1, 3)
    
    # Calculate distances between fingertips and wrist
    wrist = points[0]
    thumb_tip = points[4]
    index_tip = points[8]
    middle_tip = points[12]
    ring_tip = points[16]
    pinky_tip = points[20]
    
    # Calculate Euclidean distances
    thumb_dist = np.linalg.norm(thumb_tip - wrist)
    index_dist = np.linalg.norm(index_tip - wrist)
    middle_dist = np.linalg.norm(middle_tip - wrist)
    ring_dist = np.linalg.norm(ring_tip - wrist)
    pinky_dist = np.linalg.norm(pinky_tip - wrist)
    
    # Calculate angles between fingers
    thumb_index_angle = angle_between(thumb_tip - wrist, index_tip - wrist)
    index_middle_angle = angle_between(index_tip - wrist, middle_tip - wrist)
    middle_ring_angle = angle_between(middle_tip - wrist, ring_tip - wrist)
    ring_pinky_angle = angle_between(ring_tip - wrist, pinky_tip - wrist)
    
    return {
        "thumb_dist": thumb_dist,
        "index_dist": index_dist,
        "middle_dist": middle_dist,
        "ring_dist": ring_dist,
        "pinky_dist": pinky_dist,
        "thumb_index_angle": thumb_index_angle,
        "index_middle_angle": index_middle_angle,
        "middle_ring_angle": middle_ring_angle,
        "ring_pinky_angle": ring_pinky_angle
    }

def angle_between(v1, v2):
    """Calculate angle between two vectors"""
    v1 = v1[:2]  # Use only x,y coordinates
    v2 = v2[:2]
    
    dot = np.dot(v1, v2)
    mag1 = np.linalg.norm(v1)
    mag2 = np.linalg.norm(v2)
    
    if mag1 * mag2 == 0:
        return 0
    
    cos_angle = dot / (mag1 * mag2)
    # Ensure cos_angle is within valid range for arccos
    cos_angle = max(-1, min(cos_angle, 1))
    
    angle = np.arccos(cos_angle)
    return np.degrees(angle)

def rule_based_classification(features):
    """Simple rule-based classification for common signs"""
    # These are simplified examples - real signs have more complex patterns
    
    # Check if all fingers are extended (like in "hello" or "five")
    if (features["thumb_dist"] > 0.2 and 
        features["index_dist"] > 0.2 and 
        features["middle_dist"] > 0.2 and 
        features["ring_dist"] > 0.2 and 
        features["pinky_dist"] > 0.2):
        return "hello", 0.7
    
    # Check if only index and middle fingers are extended (like in "victory" or "peace")
    if (features["index_dist"] > 0.2 and 
        features["middle_dist"] > 0.2 and 
        features["thumb_dist"] < 0.15 and 
        features["ring_dist"] < 0.15 and 
        features["pinky_dist"] < 0.15):
        return "yes", 0.65
    
    # Check if only thumb is extended (like in "good" or thumbs up)
    if (features["thumb_dist"] > 0.2 and 
        features["index_dist"] < 0.15 and 
        features["middle_dist"] < 0.15 and 
        features["ring_dist"] < 0.15 and 
        features["pinky_dist"] < 0.15):
        return "good", 0.7
    
    # Check if fist is made (like in "no")
    if (features["thumb_dist"] < 0.15 and 
        features["index_dist"] < 0.15 and 
        features["middle_dist"] < 0.15 and 
        features["ring_dist"] < 0.15 and 
        features["pinky_dist"] < 0.15):
        return "no", 0.6
    
    # Default fallback
    return "unknown", 0.3

def predict_sign(image):
    """Predict sign from image"""
    # Extract hand landmarks
    landmarks, hand_detected = extract_hand_landmarks(image)
    
    if not hand_detected:
        return "No hand detected", 0.0
    
    # Extract features
    features = get_hand_shape_features(landmarks)
    
    # If we have a trained model, use it
    if model is not None:
        try:
            # Prepare features for model prediction
            X = np.array([landmarks])  # Use raw landmarks for ML model
            
            # Get prediction
            prediction = model.predict(X)[0]
            probabilities = model.predict_proba(X)[0]
            confidence = probabilities.max()
            
            return prediction, float(confidence)
        except Exception as e:
            print(f"Error in model prediction: {e}")
            print("Falling back to rule-based classification")
    
    # Use rule-based approach as fallback
    return rule_based_classification(features)
