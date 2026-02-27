"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Props = {
  onCapture: (file: File) => void;
};

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    setLoadingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      toast({ title: "Không mở được camera", description: "Bạn có thể chọn ảnh từ thư viện." });
    } finally {
      setLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      onCapture(file);
    }, "image/jpeg");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onCapture(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border bg-black">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-[360px] object-contain bg-black" />
        ) : (
          <video ref={videoRef} className="w-full h-[360px] object-contain bg-black" playsInline muted />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex flex-wrap gap-2">
        {!preview && (
          <Button onClick={handleCapture} disabled={!streaming || loadingCamera}>
            {loadingCamera ? "Đang mở camera..." : "Chụp ảnh"}
          </Button>
        )}
        {preview && (
          <Button variant="outline" onClick={() => setPreview(null)}>
            Chụp lại
          </Button>
        )}
        <label className="cursor-pointer">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
          <div className="inline-flex h-10 items-center rounded-md border border-input bg-white px-4 text-sm font-medium shadow-sm">
            Tải ảnh từ máy
          </div>
        </label>
      </div>
    </div>
  );
}
