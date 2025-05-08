
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import useWebcam from "@/hooks/useWebcam";
import { translateSignToText } from "@/lib/api";
import { Camera, Pause, Play, Delete, Copy, HandMetal } from "lucide-react";

const SignToText = () => {
  const [recognizedText, setRecognizedText] = useState("");
  const [captionHistory, setCaptionHistory] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Sign to Text Translation</h1>
          <p className="text-muted-foreground mt-2">
            Translate Indian Sign Language gestures into text in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Camera View */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Camera Feed
                </CardTitle>
                <CardDescription>
                  Position your hands clearly in front of the camera
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative bg-muted/50 aspect-video">
                {/* Show a placeholder when camera is not active */}
                {!isActive && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <HandMetal className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center px-4">
                      {isCameraSupported
                        ? "Camera is not active. Click 'Start Camera' to begin."
                        : "Camera access is not supported in your browser."}
                    </p>
                    {isCameraSupported && (
                      <Button
                        onClick={() => startCamera()}
                        className="mt-4"
                        disabled={isLoading}
                      >
                        {isLoading ? "Starting..." : "Start Camera"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Show loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="loader"></div>
                  </div>
                )}

                {/* Video element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover mirror-video"
                  playsInline
                  muted
                ></video>
                
                {/* Canvas overlay for drawing hand landmarks */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full hand-canvas"
                ></canvas>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleCapturing()}
                    disabled={!isActive || isLoading}
                    variant={isCapturing ? "secondary" : "default"}
                  >
                    {isCapturing ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Start Recognition
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={takeSingleCapture}
                    disabled={!isActive || isLoading || isCapturing}
                    variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
                </div>
                <Button
                  onClick={() => (isActive ? stopCamera() : startCamera())}
                  variant="outline"
                >
                  {isActive ? "Stop Camera" : "Start Camera"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recognition Results */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  Recognized Text
                  {isProcessing && (
                    <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-translator-primary"></span>
                  )}
                </CardTitle>
                <CardDescription>
                  Signs detected from your gestures
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="min-h-[150px] p-3 border rounded-md bg-background">
                  {recognizedText ? (
                    <p>{recognizedText}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {isCapturing
                        ? "Waiting for signs to be detected..."
                        : "Start recognition to see translated text here"}
                    </p>
                  )}
                </div>

                {captionHistory.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Recent History:</p>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {captionHistory.map((text, index) => (
                        <div
                          key={index}
                          className="p-2 border rounded-md text-sm flex justify-between items-center hover:bg-accent cursor-pointer"
                          onClick={() => restoreFromHistory(text)}
                        >
                          <p className="truncate">{text}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreFromHistory(text);
                            }}
                          >
                            ↑
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={clearText}
                    variant="outline"
                    className="flex-1"
                    disabled={!recognizedText}
                  >
                    <Delete className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1"
                    disabled={!recognizedText}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Position yourself in front of the camera with good lighting</li>
              <li>Click "Start Recognition" to begin detecting sign language</li>
              <li>Perform Indian Sign Language gestures clearly</li>
              <li>The system will translate recognized signs into text</li>
              <li>Use "Clear" to start over or "Copy" to copy the text</li>
            </ol>
            <div className="mt-4 p-4 bg-translator-light/50 rounded-md">
              <p className="text-sm font-medium">Tips for better recognition:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Ensure your hands are clearly visible in the frame</li>
                <li>Use clear, deliberate movements</li>
                <li>Maintain consistent lighting</li>
                <li>Avoid busy or cluttered backgrounds</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignToText;
