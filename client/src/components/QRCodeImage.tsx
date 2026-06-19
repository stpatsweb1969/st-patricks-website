import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Renders a QR code as a canvas element using the qrcode library.
 * No external image URLs needed — generated entirely client-side.
 */
export default function QRCodeImage({ value, size = 128, className, alt }: QRCodeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).catch(console.error);
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={alt ?? `QR code for ${value}`}
      style={{ display: "block" }}
    />
  );
}
