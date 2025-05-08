
/**
 * A utility for handling webcam operations
 */

/**
 * Start webcam stream
 * @param videoElement - HTML Video element to attach the stream to
 * @returns Stream object
 */
export const startWebcam = async (
  videoElement: HTMLVideoElement | null
): Promise<MediaStream | null> => {
  if (!videoElement) return null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
      audio: false,
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    return stream;
  } catch (error) {
    console.error("Error starting webcam:", error);
    return null;
  }
};

/**
 * Stop webcam stream
 * @param stream - MediaStream to stop
 */
export const stopWebcam = (stream: MediaStream | null): void => {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

/**
 * Capture frame from video element as base64 string
 * @param videoElement - HTML Video element to capture from
 * @returns Base64 encoded image string
 */
export const captureFrame = (
  videoElement: HTMLVideoElement | null
): string | null => {
  if (!videoElement || videoElement.paused || videoElement.ended) return null;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw the video frame to canvas, mirror the image
    ctx.scale(-1, 1);
    ctx.drawImage(
      videoElement,
      0,
      0,
      videoElement.videoWidth * -1,
      videoElement.videoHeight
    );
    ctx.scale(-1, 1); // Reset scale

    return canvas.toDataURL("image/jpeg", 0.8);
  } catch (error) {
    console.error("Error capturing frame:", error);
    return null;
  }
};

/**
 * Draw hand landmarks on canvas
 * @param canvasElement - HTML Canvas element to draw on
 * @param landmarks - Array of landmarks to draw
 */
export const drawHandLandmarks = (
  canvasElement: HTMLCanvasElement | null,
  landmarks: any[]
): void => {
  if (!canvasElement || !landmarks || !landmarks.length) return;

  const ctx = canvasElement.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.fillStyle = "rgba(0, 128, 255, 0.3)";
  ctx.strokeStyle = "rgba(0, 128, 255, 0.8)";
  ctx.lineWidth = 2;

  // Draw points and connections between landmarks
  landmarks.forEach((point) => {
    if (point && point.x !== undefined && point.y !== undefined) {
      const x = point.x * canvasElement.width;
      const y = point.y * canvasElement.height;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  // Draw connections between landmarks
  // This is simplified - in a real app you'd define proper connections
  for (let i = 0; i < landmarks.length - 1; i++) {
    if (
      landmarks[i] &&
      landmarks[i + 1] &&
      landmarks[i].x !== undefined &&
      landmarks[i].y !== undefined &&
      landmarks[i + 1].x !== undefined &&
      landmarks[i + 1].y !== undefined
    ) {
      const x1 = landmarks[i].x * canvasElement.width;
      const y1 = landmarks[i].y * canvasElement.height;
      const x2 = landmarks[i + 1].x * canvasElement.width;
      const y2 = landmarks[i + 1].y * canvasElement.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
};
