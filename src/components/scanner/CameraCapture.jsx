import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, Upload } from "lucide-react";

export default function CameraCapture({ onCapture, onClose, fileInputRef, onGallery }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      onClose();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `food-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      onCapture(file);
    }, "image/jpeg", 0.9);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl"
      style={{ background: "#000" }}
    >
      <video ref={videoRef} autoPlay playsInline className="w-full aspect-[3/4] object-cover" />

      {/* Scanning frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 relative">
          {/* Corner indicators */}
          {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8`}>
              <div className="w-full h-1 bg-[#CEF17B] rounded-full" />
              <div className="w-1 h-full bg-[#CEF17B] rounded-full" />
            </div>
          ))}
          {/* Scan line animation */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-[#CEF17B]/60"
            style={{ top: "50%" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Tip */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
          <p className="text-xs text-white/80">Fotografe de cima com boa iluminação</p>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center gap-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={capture}
          className="flex-1 h-14 rounded-2xl font-bold text-[#084734] text-base"
          style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
        >
          <div className="flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            Capturar
          </div>
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { stopCamera(); onGallery(e.target.files[0]); }} />
        <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.div>
  );
}