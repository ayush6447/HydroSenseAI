import React, { useState } from 'react';

const PlantDiagnostic: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = (e: React.DragEvent) => {
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
    // YOLOv8 mock upload trigger
    alert('Leaf image received for YOLOv8 diagnosis.');
  };

  return (
    <div className="bg-theme-3 p-6 rounded-2xl shadow-sm border border-theme-4 mt-6">
      <h2 className="text-xl font-bold text-theme-5 border-b border-theme-4 pb-2 mb-4">Plant Diagnostic Interface</h2>
      <div 
        className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors duration-300 ${isDragging ? 'border-theme-5 bg-theme-2' : 'border-gray-300 bg-white'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        <p className="text-gray-500 font-medium text-center px-4">Drag and drop leaf photos here for YOLOv8 disease analysis</p>
      </div>
    </div>
  );
};

export default PlantDiagnostic;
