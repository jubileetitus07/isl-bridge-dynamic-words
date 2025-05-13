
import cv2
import numpy as np
import mediapipe as mp
import os
import pickle
import json
import time
from collections import deque

# MediaPipe solutions
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = None

# Model variables
model = None
labels = ["hello", "thank you", "please", "yes", "no", "good", "bad", "help", "sorry", "name"]

# Dynamic gesture recognition
dynamic_model = None
gesture_history = deque(maxlen=30)  # Store last 30 frames for dynamic gesture recognition
gesture_timestamps = deque(maxlen=30)  # Corresponding timestamps
last_prediction_time = 0
MIN_SEQUENCE_LENGTH = 10  # Minimum number of frames for a valid dynamic gesture
PREDICTION_COOLDOWN = 0.5  # Seconds between predictions to avoid overloading

# Dynamic gesture labels (can be expanded)
dynamic_labels = ["hello", "thank you", "please", "yes", "no"]

def initialize_model():
    """Initialize the MediaPipe hands model and load the classification models"""
    global hands, model, dynamic_model
    
    # Initialize MediaPipe Hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Try to load trained static gesture model if it exists
    model_path = 'static/models/isl_model.pkl'
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print("Loaded trained static gesture model from", model_path)
        except Exception as e:
            print(f"Error loading static model: {e}")
            print("Using rule-based approach as fallback")
    else:
        print("No trained static model found at", model_path)
        print("Using rule-based approach")
    
    # Try to load dynamic gesture model if it exists
    dynamic_model_path = 'static/models/dynamic_gesture_model.pkl'
    if os.path.exists(dynamic_model_path):
        try:
            with open(dynamic_model_path, 'rb') as f:
                dynamic_model = pickle.load(f)
            print("Loaded trained dynamic gesture model from", dynamic_model_path)
        except Exception as e:
            print(f"Error loading dynamic model: {e}")
            print("Using rule-based approach for dynamic gestures")

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

def update_gesture_history(landmarks):
    """Update the gesture history with new landmarks and timestamp"""
    current_time = time.time()
    gesture_history.append(landmarks)
    gesture_timestamps.append(current_time)

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

def predict_dynamic_gesture():
    """Predict dynamic gesture from gesture history"""
    global last_prediction_time
    
    # Check if we have enough frames for prediction
    if len(gesture_history) < MIN_SEQUENCE_LENGTH:
        return None, 0
    
    current_time = time.time()
    
    # Check if we should make a prediction (based on cooldown)
    if current_time - last_prediction_time < PREDICTION_COOLDOWN:
        return None, 0
    
    # Check if sequence spans at least 0.5 seconds
    if gesture_timestamps[-1] - gesture_timestamps[0] < 0.5:
        return None, 0
    
    last_prediction_time = current_time
    
    # If we have a trained model, use it
    if dynamic_model is not None:
        try:
            # Prepare gesture sequence for prediction
            # (This would require preprocessing the gesture_history to match the model's input format)
            # For example, resampling the sequence to a fixed length and normalizing
            
            # For this example, we'll use a placeholder
            # In a real implementation, this would be model.predict() on the processed sequence
            prediction = "hello"  # Placeholder
            confidence = 0.75     # Placeholder
            
            return prediction, confidence
        except Exception as e:
            print(f"Error in dynamic model prediction: {e}")
    
    # If no model or prediction failed, use rule-based approach
    # In a real implementation, this would analyze the motion patterns in gesture_history
    # For now, we'll return a mock result based on sequence length
    
    # Simple mock logic for demonstration
    sequence_length = len(gesture_history)
    if sequence_length > 25:
        return "thank you", 0.7
    elif sequence_length > 20:
        return "hello", 0.6
    elif sequence_length > 15:
        return "please", 0.6
    else:
        return "unknown", 0.4

def predict_sign(image):
    """Predict sign from image"""
    global gesture_history, gesture_timestamps
    
    # Extract hand landmarks
    landmarks, hand_detected = extract_hand_landmarks(image)
    
    if not hand_detected:
        return "No hand detected", 0.0
    
    # Update gesture history for dynamic recognition
    update_gesture_history(landmarks)
    
    # Extract features
    features = get_hand_shape_features(landmarks)
    
    # Check for dynamic gesture predictions periodically
    dynamic_sign, dynamic_confidence = predict_dynamic_gesture()
    if dynamic_sign and dynamic_confidence > 0.5:
        return dynamic_sign, dynamic_confidence
    
    # If we have a trained model for static gestures, use it
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

def clear_gesture_history():
    """Clear the gesture history"""
    global gesture_history, gesture_timestamps
    gesture_history.clear()
    gesture_timestamps.clear()

def train_dynamic_gesture_model(training_data_path):
    """Train a model for dynamic gesture recognition"""
    # This function would be called with training data to build a dynamic gesture model
    # The implementation depends on the structure of your training data
    
    # In a real implementation, you would:
    # 1. Load training sequences
    # 2. Preprocess sequences (normalize, resample, etc.)
    # 3. Train a sequence model (e.g., LSTM, 1D-CNN)
    # 4. Save the model to disk
    
    print(f"Training dynamic gesture model with data from {training_data_path}")
    print("This is a placeholder - implement actual training with real data")
    
    # For demonstration, we'll create a dummy model
    dummy_model = {"type": "dynamic_gesture_classifier"}
    
    # Save dummy model
    with open('static/models/dynamic_gesture_model.pkl', 'wb') as f:
        pickle.dump(dummy_model, f)
    
    return True
