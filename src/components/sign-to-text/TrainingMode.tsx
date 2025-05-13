
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Camera, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { recordTrainingData, trainDynamicModel } from "@/lib/api";

type TrainingModeProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  isLoading: boolean;
  captureImage: () => string | null;
};

const TrainingMode = ({
  videoRef,
  canvasRef,
  isActive,
  isLoading,
  captureImage,
}: TrainingModeProps) => {
  const { toast } = useToast();
  const [gestureName, setGestureName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [captureCounts, setCaptureCounts] = useState<Record<string, number>>({});
  const [sessionId, setSessionId] = useState<string>("");
  const [isTraining, setIsTraining] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const captureIntervalRef = useRef<number | null>(null);
  const targetCaptureCount = 20; // Number of samples to collect per gesture

  // Generate a new session ID for grouping related samples
  const generateSessionId = () => {
    return `session_${Date.now()}`;
  };

  // Start recording samples for a gesture
  const startRecording = () => {
    if (!gestureName.trim()) {
      toast({
        title: "Gesture name required",
        description: "Please enter a name for the gesture you want to record",
        variant: "destructive",
      });
      return;
    }

    // Generate a new session ID for this recording
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setIsRecording(true);
    setCaptureProgress(0);

    // Start capturing frames at intervals
    captureIntervalRef.current = window.setInterval(() => {
      captureTrainingFrame(newSessionId);
    }, 500); // Capture every 500ms

    toast({
      title: "Recording started",
      description: `Recording samples for "${gestureName}" gesture`,
    });
  };

  // Stop recording
  const stopRecording = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setIsRecording(false);
    setSessionId("");

    toast({
      title: "Recording complete",
      description: "All samples have been captured",
    });
  };

  // Capture a single frame for training
  const captureTrainingFrame = async (currentSessionId: string) => {
    if (!isActive || !gestureName) return;

    const imageData = captureImage();
    if (!imageData) return;

    try {
      const result = await recordTrainingData(imageData, gestureName, currentSessionId);

      if (result.status === "success") {
        // Update capture count for this gesture
        setCaptureCounts((prev) => {
          const currentCount = prev[gestureName] || 0;
          const newCount = currentCount + 1;
          
          // Update progress based on target count
          const progress = (newCount / targetCaptureCount) * 100;
          setCaptureProgress(progress);
          
          // Stop recording when we reach the target
          if (newCount >= targetCaptureCount) {
            stopRecording();
          }
          
          return {
            ...prev,
            [gestureName]: newCount,
          };
        });
      }
    } catch (err) {
      console.error("Error capturing training frame:", err);
      toast({
        title: "Capture failed",
        description: "Failed to save training sample",
        variant: "destructive",
      });
    }
  };

  // Train model with collected data
  const handleTrainModel = async () => {
    setIsTraining(true);
    
    try {
      const result = await trainDynamicModel();
      
      if (result.status === "success") {
        toast({
          title: "Model trained",
          description: "Dynamic gesture model has been successfully trained",
        });
      } else {
        toast({
          title: "Training failed",
          description: result.message || "Failed to train model",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error training model:", err);
      toast({
        title: "Training error",
        description: "An error occurred while training the model",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  // Manual sample capture
  const captureManualSample = async () => {
    if (!gestureName.trim()) {
      toast({
        title: "Gesture name required",
        description: "Please enter a name for the gesture",
        variant: "destructive",
      });
      return;
    }

    if (!isActive) return;

    const imageData = captureImage();
    if (!imageData) return;

    try {
      const result = await recordTrainingData(
        imageData, 
        gestureName, 
        sessionId || generateSessionId()
      );

      if (result.status === "success") {
        toast({
          title: "Sample captured",
          description: `Saved training sample for "${gestureName}"`,
        });
        
        // Update capture count
        setCaptureCounts((prev) => ({
          ...prev,
          [gestureName]: (prev[gestureName] || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Error capturing manual sample:", err);
      toast({
        title: "Capture failed",
        description: "Failed to save training sample",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Training Mode</CardTitle>
        <CardDescription>
          Collect samples to train the dynamic gesture recognition model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="Gesture name (e.g., hello, thank_you)"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              disabled={isRecording}
              className="mb-2"
            />
            {captureCounts[gestureName] && (
              <p className="text-xs text-muted-foreground">
                {captureCounts[gestureName]} samples captured
              </p>
            )}
          </div>
          <Button
            onClick={captureManualSample}
            disabled={!isActive || isRecording || !gestureName.trim()}
          >
            <Camera className="mr-2 h-4 w-4" /> Capture
          </Button>
        </div>

        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Recording progress</span>
              <span>
                {captureCounts[gestureName] || 0}/{targetCaptureCount} frames
              </span>
            </div>
            <Progress value={captureProgress} className="h-2" />
          </div>
        )}

        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Suggested gestures to train:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>hello - Wave with your hand</li>
            <li>thank_you - Touch your chin and move hand forward</li>
            <li>please - Rub palm in circular motion on chest</li>
            <li>yes - Nod hand (fist with thumb up)</li>
            <li>no - Shake hand side to side</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t pt-4">
        <div className="flex gap-2 w-full">
          {!isRecording ? (
            <Button 
              className="flex-1" 
              onClick={startRecording}
              disabled={!isActive || !gestureName.trim()}
            >
              Start Recording Samples
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              variant="secondary" 
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          )}
        </div>
        
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleTrainModel}
          disabled={isTraining}
        >
          {isTraining ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Training...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Train Model
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrainingMode;
