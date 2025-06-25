'use client';

import React, { useRef } from 'react';

export default function CameraTestPage() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    console.log('Camera button clicked');
    console.log('Camera input ref:', cameraInputRef.current);
    
    if (cameraInputRef.current) {
      console.log('Triggering camera input');
      cameraInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type);
      alert(`File selected: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Camera Functionality Test</h1>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Test 1: Camera Input with capture="environment"</h2>
            <button
              onClick={handleCameraClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📷 Take Photo (Environment Camera)
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Test 2: Camera Input with capture="camera"</h2>
            <button
              onClick={() => {
                const input = document.getElementById('camera-test-2') as HTMLInputElement;
                input?.click();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📷 Take Photo (Generic Camera)
            </button>
            <input
              id="camera-test-2"
              type="file"
              accept="image/*"
              capture="camera"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Test 3: Camera Input with capture="user"</h2>
            <button
              onClick={() => {
                const input = document.getElementById('camera-test-3') as HTMLInputElement;
                input?.click();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              📷 Take Photo (Front Camera)
            </button>
            <input
              id="camera-test-3"
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Test 4: Regular File Input</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              📁 Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Test each button to see which one activates your camera</li>
              <li>• On mobile devices, camera should open directly</li>
              <li>• On desktop, behavior may vary by browser</li>
              <li>• Check browser console for debug messages</li>
              <li>• "Environment" should use rear camera, "User" should use front camera</li>
            </ul>
          </div>

          <div className="text-center">
            <a 
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Registration Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
