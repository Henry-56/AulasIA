/**
 * Utility functions for capturing and encoding video frames
 * for Gemini API analysis
 */

/**
 * Capture frame from video element and convert to base64
 *
 * @param videoElement - HTML video element
 * @param width - Canvas width (default: 640)
 * @param height - Canvas height (default: 480)
 * @returns Base64 encoded image data
 */
export function captureFrameAsBase64(videoElement: HTMLVideoElement, width = 640, height = 480): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Failed to get canvas context")
  }

  context.drawImage(videoElement, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", 0.8)
}

/**
 * Validate if frame data is valid base64
 *
 * @param frameData - Base64 frame data
 * @returns Boolean indicating validity
 */
export function isValidFrameData(frameData: string): boolean {
  return frameData.startsWith("data:image/") && frameData.includes(";base64,")
}

/**
 * Calculate frame size in bytes
 *
 * @param frameData - Base64 frame data
 * @returns Size in bytes
 */
export function getFrameSize(frameData: string): number {
  const base64String = frameData.replace(/^data:image\/[^;]+;base64,/, "")
  return Math.ceil(base64String.length * 0.75)
}

/**
 * Optimize frame for API transmission
 *
 * Reduces quality if frame exceeds size limit
 *
 * @param videoElement - HTML video element
 * @param maxSizeBytes - Maximum size in bytes (default: 1MB)
 * @returns Optimized base64 frame data
 */
export function optimizeFrameForAPI(videoElement: HTMLVideoElement, maxSizeBytes: number = 1024 * 1024): string {
  let frameData = captureFrameAsBase64(videoElement, 640, 480)
  let quality = 0.8

  // Reduce quality if frame is too large
  while (getFrameSize(frameData) > maxSizeBytes && quality > 0.3) {
    quality -= 0.1
    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    const context = canvas.getContext("2d")
    if (context) {
      context.drawImage(videoElement, 0, 0, 640, 480)
      frameData = canvas.toDataURL("image/jpeg", quality)
    }
  }

  return frameData
}
