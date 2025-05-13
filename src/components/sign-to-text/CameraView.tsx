
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Pause, Play } from "lucide-react";

type CameraViewProps = {
  isActive: boolean;
  isLoading: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handDetected: boolean;
  confidenceLevel: number;
  isCapturing: boolean;
  isProcessing: boolean;
  detectionMode: "static" | "dynamic";
  gestureSequence: any;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  toggleCapturing: () => void;
  takeSingleCapture: () => void;
  isCameraSupported: boolean;
};

const CameraView = ({
  isActive,
  isLoading,
  videoRef,
  canvasRef,
  handDetected,
  confidenceLevel,
  isCapturing,
  isProcessing,
  detectionMode,
  gestureSequence,
  startCamera,
  stopCamera,
  toggleCapturing,
  takeSingleCapture,
  isCameraSupported,
}: CameraViewProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Camera Feed
          </div>
          {handDetected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              Hand Detected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Position your hands clearly in front of the camera
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 relative bg-muted/50 aspect-video">
        {/* Show a placeholder when camera is not active */}
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              className="h-16 w-16 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
              />
            </svg>
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
        
        {/* Confidence indicator */}
        {isActive && handDetected && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/40 text-white p-2 rounded-md">
            <div className="flex justify-between text-xs mb-1">
              <span>Confidence</span>
              <span>{confidenceLevel.toFixed(0)}%</span>
            </div>
            <Progress value={confidenceLevel} className="h-2" />
          </div>
        )}
        
        {/* Gesture sequence indicator */}
        {isActive && detectionMode === "dynamic" && gestureSequence && (
          <div className="absolute top-2 left-2 bg-blue-600/80 text-white px-3 py-1 rounded-full text-xs">
            Recording: {gestureSequence.frame_count} frames
          </div>
        )}
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
  );
};

export default CameraView;
