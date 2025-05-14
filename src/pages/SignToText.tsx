
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import useWebcam from "@/hooks/useWebcam";
import { translateSignToText } from "@/lib/api";
import { HandMetal } from "lucide-react";
import CameraView from "@/components/sign-to-text/CameraView";
import RecognitionResults from "@/components/sign-to-text/RecognitionResults";
import InstructionsCard from "@/components/sign-to-text/InstructionsCard";

const SignToText = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [captionHistory, setCaptionHistory] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [detectionMode, setDetectionMode] = useState<"static" | "dynamic">("static");
  const [gestureSequence, setGestureSequence] = useState<any>(null);
  const { toast } = useToast();

  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureImage,
    isCameraSupported,
  } = useWebcam({ autoStart: false });

  // Start camera when component mounts
  useEffect(() => {
    if (isCameraSupported) {
      startCamera();
    }

    return () => {
      stopContinuousCapture();
      stopCamera();
    };
  }, [isCameraSupported]);

  // Handle camera errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Camera Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Start continuous capturing
  const startContinuousCapture = () => {
    if (!isActive) return;

    setIsCapturing(true);
    const interval = window.setInterval(() => {
      processFrame();
    }, 1000); // Process every second

    setCaptureInterval(interval);
  };

  // Stop continuous capturing
  const stopContinuousCapture = () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
    setIsCapturing(false);
  };

  // Toggle capturing
  const toggleCapturing = () => {
    if (isCapturing) {
      stopContinuousCapture();
    } else {
      startContinuousCapture();
    }
  };

  // Process a single frame
  const processFrame = async () => {
    if (isProcessing || !isActive) return;

    const imageData = captureImage();
    if (!imageData) return;

    try {
      setIsProcessing(true);

      const result = await translateSignToText(imageData);

      if (result.error) {
        console.error("Translation error:", result.error);
        return;
      }
      
      // Update UI based on hand detection
      setHandDetected(result.hand_detected || false);
      setConfidenceLevel(result.confidence * 100 || 0);
      
      // Update gesture sequence info if available
      if (result.gesture_sequence) {
        setGestureSequence(result.gesture_sequence);
      }

      // Draw hand landmarks on canvas if available
      if (result.hand_info && canvasRef.current) {
        drawHandInfo(canvasRef.current, result.hand_info);
      }

      // Only add meaningful signs (not "unknown" with low confidence)
      if (
        result.sign &&
        result.sign !== "unknown" &&
        result.confidence > 0.5
      ) {
        // Add to recognized text if it's different from the last added sign
        if (
          result.sign !== recognizedText &&
          !recognizedText.endsWith(result.sign)
        ) {
          const newText = recognizedText
            ? `${recognizedText} ${result.sign}`
            : result.sign;
          setRecognizedText(newText);
        }
      }
    } catch (err) {
      console.error("Error processing frame:", err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to draw hand information
  const drawHandInfo = (canvas: HTMLCanvasElement, handInfo: any) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;
    
    // Set canvas dimensions to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw hand detection info
    if (handInfo.thumb_tip && handInfo.index_tip) {
      const thumbX = handInfo.thumb_tip[0] * canvas.width;
      const thumbY = handInfo.thumb_tip[1] * canvas.height;
      const indexX = handInfo.index_tip[0] * canvas.width;
      const indexY = handInfo.index_tip[1] * canvas.height;
      
      // Draw points
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(indexX, indexY, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw line between points
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(thumbX, thumbY);
      ctx.lineTo(indexX, indexY);
      ctx.stroke();
    }
  };

  // Take a single capture
  const takeSingleCapture = () => {
    processFrame();
  };

  // Clear the recognized text
  const clearText = () => {
    if (recognizedText) {
      // Add current text to history before clearing
      setCaptionHistory((prev) => [recognizedText, ...prev.slice(0, 9)]);
      setRecognizedText("");
    }
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (recognizedText) {
      navigator.clipboard.writeText(recognizedText);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to clipboard",
      });
    }
  };

  // Restore text from history
  const restoreFromHistory = (text: string) => {
    setRecognizedText(text);
    // Remove the selected text from history
    setCaptionHistory((prev) => prev.filter((item) => item !== text));
  };
  
  // Toggle detection mode
  const toggleDetectionMode = () => {
    setDetectionMode(prev => prev === "static" ? "dynamic" : "static");
    // Reset recognition when switching modes
    clearText();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Sign to Text Translation</h1>
          <p className="text-muted-foreground mt-2">
            Translate Indian Sign Language gestures into text in real-time
          </p>
        </div>
        
        {/* Mode Selection */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button 
              variant={detectionMode === "static" ? "default" : "outline"}
              className="rounded-r-none"
              onClick={() => detectionMode !== "static" && toggleDetectionMode()}
            >
              Static Sign Mode
            </Button>
            <Button 
              variant={detectionMode === "dynamic" ? "default" : "outline"}
              className="rounded-l-none"
              onClick={() => detectionMode !== "dynamic" && toggleDetectionMode()}
            >
              Dynamic Gesture Mode
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Camera View */}
          <div className="md:col-span-2">
            <CameraView
              isActive={isActive}
              isLoading={isLoading}
              videoRef={videoRef}
              canvasRef={canvasRef}
              handDetected={handDetected}
              confidenceLevel={confidenceLevel}
              isCapturing={isCapturing}
              isProcessing={isProcessing}
              detectionMode={detectionMode}
              gestureSequence={gestureSequence}
              startCamera={startCamera}
              stopCamera={stopCamera}
              toggleCapturing={toggleCapturing}
              takeSingleCapture={takeSingleCapture}
              isCameraSupported={isCameraSupported}
            />
          </div>

          {/* Recognition Results */}
          <div className="md:col-span-1">
            <RecognitionResults
              recognizedText={recognizedText}
              captionHistory={captionHistory}
              isProcessing={isProcessing}
              isCapturing={isCapturing}
              detectionMode={detectionMode}
              clearText={clearText}
              copyToClipboard={copyToClipboard}
              restoreFromHistory={restoreFromHistory}
            />
          </div>
        </div>

        {/* Instructions */}
        <InstructionsCard />
      </div>
    </div>
  );
};

export default SignToText;
