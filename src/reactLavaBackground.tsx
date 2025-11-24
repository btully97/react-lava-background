import * as React from "react";

export interface LavaLampProps {
  blobCount?: number;
  minRadius?: number;
  maxRadius?: number;
  speed?: number;
  blobColors?: [string, string, string]; // top, middle, bottom
  pixelSkip?: number; // optional pixel step for performance
}

interface Blob {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  dx: number;
  dy: number;
  phase: number;
}

// Helper to interpolate between two colors
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const c1 = parseInt(color1.slice(1, 7), 16);
  const c2 = parseInt(color2.slice(1, 7), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return [r, g, b];
};

const LavaLampBackground: React.FC<LavaLampProps> = ({
  blobCount = 8,
  minRadius = 40,
  maxRadius = 110,
  speed = 3,
  blobColors = ["#1E4482", "#1F6382", "#1EAC82"],
  pixelSkip = 2,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const blobsRef = React.useRef<Blob[]>([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = Math.floor(window.innerWidth);
      canvas.height = Math.floor(window.innerHeight);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize blobs
    blobsRef.current = Array.from({ length: blobCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radiusX: minRadius + Math.random() * (maxRadius - minRadius),
      radiusY: minRadius + Math.random() * (maxRadius - minRadius) * 0.7, // oblong ellipsoid
      dx: (Math.random() - 0.5) * speed,
      dy: (Math.random() - 0.5) * speed,
      phase: Math.random() * Math.PI * 2,
    }));

    const threshold = 1.0;
    let animationFrameId: number;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Move blobs
      blobsRef.current.forEach((blob) => {
        blob.phase += 0.01;
        blob.x += Math.sin(blob.phase) * 0.3 + blob.dx;
        blob.y += Math.sin(blob.phase * 0.5) * 0.5 + blob.dy;

        // Bounce within viewport
        if (blob.x - blob.radiusX < 0) {
          blob.x = blob.radiusX;
          blob.dx = Math.abs(blob.dx);
        }
        if (blob.x + blob.radiusX > canvas.width) {
          blob.x = canvas.width - blob.radiusX;
          blob.dx = -Math.abs(blob.dx);
        }
        if (blob.y - blob.radiusY < 0) {
          blob.y = blob.radiusY;
          blob.dy = Math.abs(blob.dy);
        }
        if (blob.y + blob.radiusY > canvas.height) {
          blob.y = canvas.height - blob.radiusY;
          blob.dy = -Math.abs(blob.dy);
        }
      });

      const width = canvas.width;
      const height = canvas.height;

      for (let y = 0; y < height; y += pixelSkip) {
        for (let x = 0; x < width; x += pixelSkip) {
          let sum = 0;
          blobsRef.current.forEach((blob) => {
            const dx = x - blob.x;
            const dy = y - blob.y;
            sum += (blob.radiusX * blob.radiusY) / (dx * dx + dy * dy);
          });

          if (sum > threshold) {
            const index = (y * width + x) * 4;
            const t = y / height;

            let r: number, g: number, b: number;
            if (t < 0.5) {
              [r, g, b] = interpolateColor(
                blobColors[0],
                blobColors[1],
                t / 0.5,
              );
            } else {
              [r, g, b] = interpolateColor(
                blobColors[1],
                blobColors[2],
                (t - 0.5) / 0.5,
              );
            }

            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [blobCount, minRadius, maxRadius, speed, blobColors, pixelSkip]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        imageRendering: "auto",
      }}
    />
  );
};

export default LavaLampBackground;
