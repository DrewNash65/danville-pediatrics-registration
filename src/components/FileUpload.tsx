'use client';

import React, { useState, useRef, useCallback } from 'react';
import { validateFileUpload } from '@/lib/encryption';

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
  helpText?: string;
  error?: string;
  required?: boolean;
  enableCamera?: boolean;
}

// Check if device has camera capabilities
const hasCamera = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export function FileUpload({
  label,
  accept = "image/*",
  onFileSelect,
  helpText,
  error,
  required,
  enableCamera = true
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (file: File | null) => {
    setUploadError(null);
    
    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (enableCamera) {
      setShowCameraOptions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputClick = () => {
    setShowCameraOptions(false);
    fileInputRef.current?.click();
  };

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      setUploadError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setUploadError('Unable to access camera. Please check permissions or use file upload instead.');
      setIsCapturing(false);
      // Fallback to file input
      cameraInputRef.current?.click();
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        handleFileChange(file);
        stopCamera();
        setShowCameraOptions(false);
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  const handleCameraClick = () => {
    setShowCameraOptions(false);

    // Try MediaDevices API first
    if (hasCamera()) {
      startCamera();
    } else {
      // Fallback to file input with capture attribute
      console.log('MediaDevices not available, using file input fallback');
      cameraInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadError(null);
    onFileSelect(null);
    setShowCameraOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-blue-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 shadow-sm ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 shadow-md'
            : selectedFile
            ? 'border-green-400 bg-green-50 shadow-md'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Camera input for direct camera access - rear camera preferred */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
          title="Take photo with camera"
          data-camera="true"
        />

        {/* Alternative camera input for better compatibility */}
        <input
          type="file"
          accept="image/*"
          capture="camera"
          onChange={handleInputChange}
          className="hidden"
          style={{ display: 'none' }}
          id="camera-fallback"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-green-600">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-gray-900 font-medium">{selectedFile.name}</div>
            <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Remove file
            </button>
          </div>
        ) : isCapturing ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Camera Capture</h3>

              {/* Video preview */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>

              {/* Camera controls */}
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Capture Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowCameraOptions(true);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Position the insurance card in the frame and click "Capture Photo"
              </p>
            </div>
          </div>
        ) : showCameraOptions ? (
          <div className="space-y-4">
            <div className="text-gray-600">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-sm text-gray-700 font-medium">
              Choose upload method:
              {hasCamera() && (
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  📷 Camera Available
                </span>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCameraClick();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileInputClick();
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Choose from Gallery</span>
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCameraOptions(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400">
              {enableCamera ? (
                <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {enableCamera ? (
                <>
                  <span className="font-medium text-blue-600">Click to take photo</span> or choose from gallery
                </>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </div>
          </div>
        )}
      </div>

      {helpText && !error && !uploadError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {(error || uploadError) && (
        <p className="text-sm text-red-600">{error || uploadError}</p>
      )}
    </div>
  );
}
