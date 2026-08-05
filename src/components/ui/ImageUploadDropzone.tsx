import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Link, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  optional?: boolean;
}

export function processImageFile(file: File, maxDimension = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (PNG, JPG, WEBP, etc.).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to parse image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadDropzone({
  value,
  onChange,
  label = "Profile Photo",
  optional = true
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error processing image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block">
          {label}
        </label>
        {optional && (
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Optional
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {value ? (
        <div className="relative flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl group transition-all">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
            <img src={value} alt="Profile photo preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white mb-0.5">
              <Check size={14} className="text-emerald-500" /> Photo attached
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono">
              {value.startsWith('data:') ? 'Local image uploaded' : value}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Change photo"
            >
              <Camera size={14} />
              <span className="hidden sm:inline">Change</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
              title="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !showUrlInput && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-950/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
            isDragging
              ? 'bg-blue-600 text-white scale-110'
              : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-100 dark:border-slate-700'
          }`}>
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : isDragging ? (
              <Upload size={22} className="animate-bounce" />
            ) : (
              <Camera size={22} />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isDragging ? 'Drop your photo here' : 'Click to select photo or drag & drop'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Supports PNG, JPG, WEBP (Auto-optimized)
            </p>
          </div>

          {!showUrlInput ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUrlInput(true);
              }}
              className="mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Link size={12} />
              Or enter web image URL
            </button>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="w-full mt-2 space-y-2 text-left"
            >
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase font-bold"
                >
                  Hide URL Input
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-500 font-medium px-1">{errorMsg}</p>
      )}
    </div>
  );
}
