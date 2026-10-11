import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, PenTool, Image as ImageIcon } from 'lucide-react';
import { getSignatureImageUrl } from '../../utils/imageUrl';

export const SignatureUploader = ({
  currentSignatureUrl,
  onSignatureSelected,
  label = 'Signature',
  required = false
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'draw'
  const [previewUrl, setPreviewUrl] = useState(currentSignatureUrl || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync previewUrl whenever currentSignatureUrl updates from parent props / async fetches
  useEffect(() => {
    if (currentSignatureUrl) {
      setPreviewUrl(currentSignatureUrl);
    }
  }, [currentSignatureUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Please upload a PNG, JPG, or JPEG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds maximum 2MB limit');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onSignatureSelected(file);
  };

  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to Blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'drawn-signature.png', { type: 'image/png' });
        setPreviewUrl(canvas.toDataURL());
        onSignatureSelected(file);
      }
    }, 'image/png');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setPreviewUrl(null);
    onSignatureSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'draw' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Draw Digital
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id={`sig-upload-${label}`}
          />
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs mb-3 max-h-28 overflow-hidden">
                <img
                  src={getSignatureImageUrl(previewUrl)}
                  alt="Signature Preview"
                  className="max-h-24 object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`sig-upload-${label}`}
                  className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Change Image
                </label>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={`sig-upload-${label}`}
              className="cursor-pointer flex flex-col items-center gap-2 py-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Click to upload signature</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or JPEG (Max 2MB)</p>
              </div>
            </label>
          )}
        </div>
      ) : (
        <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-white shadow-2xs">
          <p className="text-[11px] text-slate-400 mb-2 font-medium flex items-center justify-between">
            <span>Draw your signature inside the box using mouse or touch:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">Live Pad</span>
          </p>
          <div className="border border-slate-200 rounded-xl relative overflow-hidden signature-grid-pattern shadow-inner">
            <canvas
              ref={canvasRef}
              width={380}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-28 touch-none cursor-crosshair bg-transparent"
            />
          </div>
          <div className="mt-2.5 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">Hold & drag to sign</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Pad</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
