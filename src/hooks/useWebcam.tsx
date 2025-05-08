
import { useState, useEffect, useRef } from "react";
import { startWebcam, stopWebcam, captureFrame } from "@/lib/webcamUtils";

interface UseWebcamOptions {
  autoStart?: boolean;
  captureInterval?: number;
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  captureImage: () => string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  isCameraSupported: boolean;
}

/**
 * A custom hook for managing webcam functionality
 */
const useWebcam = ({
  autoStart = false,
  captureInterval = 0,
}: UseWebcamOptions = {}): UseWebcamReturn => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Check if camera is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(false);
      setError("Camera not supported in this browser.");
    }
  }, []);

  // Start camera automatically if autoStart is true
  useEffect(() => {
    if (autoStart && isCameraSupported) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [autoStart, isCameraSupported]);

  // Function to start webcam
  const startCamera = async (): Promise<boolean> => {
    if (!isCameraSupported) return false;

    try {
      setIsLoading(true);
      setError(null);

      const stream = await startWebcam(videoRef.current);
      if (!stream) {
        setError("Failed to start webcam");
        setIsLoading(false);
        return false;
      }

      streamRef.current = stream;
      setIsActive(true);
      setIsLoading(false);

      // Set up capture interval if specified
      if (captureInterval > 0) {
        intervalRef.current = window.setInterval(() => {
          captureImage();
        }, captureInterval);
      }

      return true;
    } catch (err) {
      setError(`Error starting webcam: ${(err as Error).message}`);
      setIsLoading(false);
      return false;
    }
  };

  // Function to stop webcam
  const stopCamera = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    stopWebcam(streamRef.current);
    streamRef.current = null;
    setIsActive(false);
  };

  // Function to capture current frame
  const captureImage = (): string | null => {
    if (!isActive || !videoRef.current) {
      return null;
    }

    return captureFrame(videoRef.current);
  };

  return {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    captureImage,
    startCamera,
    stopCamera,
    isCameraSupported,
  };
};

export default useWebcam;
