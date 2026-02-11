"use client";

import { useState, useRef } from "react";

const MAX_DIMENSION = 600;
const JPEG_QUALITY = 0.7;

interface ImageUploadProps {
  onUpload: (originalBase64: string, compressedBase64: string, mediaType: string) => Promise<boolean>;
  isAnalyzing: boolean;
}

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.src = dataUrl;
  });
}

export default function ImageUpload({
  onUpload,
  isAnalyzing,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      const originalBase64 = result.split(",")[1];
      const compressed = await compressImage(result);
      const compressedBase64 = compressed.split(",")[1];
      const success = await onUpload(originalBase64, compressedBase64, file.type);
      if (success) setPreview(null);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-pink-300 bg-pink-50/50"
            : "border-purple-200/60 hover:border-pink-300 hover:bg-pink-50/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#c3aed6', borderTopColor: 'transparent' }}
            />
            <p className="font-medium" style={{ color: '#9b7ba3' }}>
              analyzing your fit...
            </p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-2xl shadow-sm"
            />
            <p className="text-sm" style={{ color: '#b8879b' }}>
              tap or drop to swap it out
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #fce4ec, #ede7f6)' }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="#c3aed6"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ color: '#6b4c6e' }}>
                drop a pic of your clothes here
              </p>
              <p className="text-sm mt-1" style={{ color: '#b8879b' }}>
                or tap to browse your camera roll
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
