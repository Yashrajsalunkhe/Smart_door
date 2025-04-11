export interface WebcamOptions {
  width?: number;
  height?: number;
  facingMode?: string;
}

export async function setupWebcam(
  videoElement: HTMLVideoElement | null,
  options: WebcamOptions = {}
): Promise<MediaStream | null> {
  if (!videoElement) return null;

  try {
    const defaultConstraints = {
      width: options.width || 640,
      height: options.height || 480,
      facingMode: options.facingMode || "user"
    };

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: defaultConstraints,
      audio: false
    });

    // Connect stream to video element
    videoElement.srcObject = stream;

    // Wait for video to be loaded
    return new Promise<MediaStream>((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(stream);
      };
    });
  } catch (error) {
    console.error("Error accessing webcam:", error);
    return null;
  }
}

export function stopWebcam(videoElement: HTMLVideoElement | null): void {
  if (!videoElement) return;
  
  const stream = videoElement.srcObject as MediaStream;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }
}

export function captureSnapshot(videoElement: HTMLVideoElement | null): string | null {
  if (!videoElement) return null;
  
  // Create a canvas element with the same dimensions as the video
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Draw the current video frame to the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // Get the image as a data URL
  return canvas.toDataURL('image/jpeg');
}

export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
