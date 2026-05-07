'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, Download, AlertCircle, RefreshCw, ArrowRight, Wand2, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function Home() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  // App State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Logic - Do Not Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file. (JPEG, PNG, WEBP)');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setResultImage(null);
    const objectUrl = URL.createObjectURL(file);
    setOriginalPreview(objectUrl);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  }, []);

  const handleUpscale = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upscale', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during upscaling.');
      }

      if (data.url) {
        setResultImage(data.url);
      } else if (data.image) {
        setResultImage(data.image);
      } else {
        throw new Error('No valid image returned from the API.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setOriginalPreview(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hd_upscaled_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image", e);
      window.open(resultImage, '_blank');
    }
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#F0F2FD] text-gray-900 font-sans overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-300/40 via-purple-300/30 to-blue-200/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/40 to-white/10 blur-3xl rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl tracking-tight text-indigo-950">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>ClarityHD</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-indigo-900 transition-colors">Home</a>
            <a href="#" className="hover:text-indigo-900 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-900 transition-colors">Technology</a>
            <a href="#" className="hover:text-indigo-900 transition-colors">Pricing</a>
          </nav>
          <button 
            onClick={() => setView('app')}
            className="bg-indigo-950 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-800 transition-colors hover:shadow-lg hover:shadow-indigo-900/20"
          >
            Start upscaling
          </button>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl lg:text-7xl font-semibold tracking-tight text-indigo-950 leading-[1.1] mb-6"
              >
                Upscale your images with smart AI solutions
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed"
              >
                Transform blurry, low-resolution photos into stunning high-definition masterpieces instantly using our advanced machine learning models.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <button 
                  onClick={() => setView('app')}
                  className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-600/30 flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button className="bg-white/50 backdrop-blur-sm border border-white px-8 py-3.5 rounded-full font-medium text-gray-700 hover:bg-white transition-colors">
                  View Examples
                </button>
              </motion.div>
            </div>

            <div className="relative h-[600px] w-full hidden lg:block">
              {/* Abstract Floating Shapes imitating 3D glass elements */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-20 w-32 h-32 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl flex items-center justify-center z-20"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl rotate-12" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-40 left-0 w-24 h-24 bg-white/40 backdrop-blur-md border border-white/60 rounded-full shadow-lg flex items-center justify-center z-30"
              >
                <Wand2 className="w-10 h-10 text-indigo-500" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, 30, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[40px] shadow-2xl p-6 flex flex-col justify-end z-20"
              >
                <div className="w-full h-8 bg-white/10 rounded-lg mb-2" />
                <div className="w-3/4 h-8 bg-white/10 rounded-lg" />
              </motion.div>

              {/* Main Center Piece */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/30 backdrop-blur-xl border border-white/50 rounded-full shadow-2xl flex items-center justify-center z-10">
                <div className="w-64 h-64 border border-indigo-200/50 rounded-full flex gap-4 items-end justify-center pb-8 relative">
                  <div className="w-12 h-32 bg-gradient-to-t from-indigo-500/50 to-indigo-400/80 rounded-t-xl backdrop-blur-md border border-white/30" />
                  <div className="w-12 h-48 bg-gradient-to-t from-blue-500/50 to-blue-400/80 rounded-t-xl backdrop-blur-md border border-white/30" />
                  <div className="w-12 h-24 bg-gradient-to-t from-purple-500/50 to-purple-400/80 rounded-t-xl backdrop-blur-md border border-white/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Bento Box Style Section */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20"
          >
            <div className="md:col-span-2 bg-[#121217] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 text-indigo-300 mb-6 font-medium text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>AI Enhancement</span>
                </div>
                <h3 className="text-2xl font-medium mb-2">Crystal clear quality</h3>
                <p className="text-gray-400 text-sm max-w-xs">Recover lost details and textures in seconds.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <Zap className="w-5 h-5" />
               </div>
               <h4 className="font-semibold text-gray-900 mb-1">Lightning Fast</h4>
               <p className="text-sm text-gray-600">Powered by optimized Vercel edge functions.</p>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-600/20 text-white flex flex-col justify-between">
              <div>
                <h4 className="font-semibold opacity-90 mb-1">Success Rate</h4>
                <div className="text-4xl font-bold">99.8%</div>
              </div>
              <button onClick={() => setView('app')} className="mt-4 flex items-center text-sm font-medium hover:text-indigo-200 transition-colors">
                Try it now <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>

          <div className="mt-16 text-center text-sm text-gray-500 font-medium pb-8">
            Created with passion by Developernya <span className="text-indigo-600 font-bold">SANN404 FORUM</span>
          </div>
        </main>
      </div>
    );
  }

  // APP VIEW
  return (
    <div className="min-h-screen bg-[#F0F2FD] text-gray-900 font-sans selection:bg-indigo-200 relative overflow-hidden flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/30 via-purple-300/20 to-blue-200/10 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      
      <header className="relative z-10 w-full bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-0 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl shadow-inner">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              ClarityHD
            </h1>
          </button>
          <div className="text-sm font-medium text-gray-500 bg-white/70 px-4 py-1.5 rounded-full border border-white shadow-sm hidden sm:block">
            AI Upscaler Workspace
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-950 mb-3"
          >
            Enhance Image Quality
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Upload a blurry photo and let AI do the magic.
          </motion.p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white overflow-hidden max-w-4xl mx-auto w-full">
          {!originalPreview ? (
            <div className="p-8 sm:p-16">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer group flex flex-col pt-4">
                <div 
                  className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center py-20 transition-all duration-300 ${
                    isDragOver 
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-inner' 
                    : 'border-indigo-200 hover:border-indigo-400 hover:bg-white/50 hover:shadow-md'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="bg-indigo-100 p-5 rounded-full mb-6 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">Drop your image here</h3>
                  <p className="text-sm text-gray-500 bg-white/60 px-4 py-1.5 rounded-full">Supports JPG, PNG and WEBP up to 10MB</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-4 sm:p-6 rounded-3xl border border-gray-100">
                {/* Original Image */}
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Original</h4>
                    <span className="text-xs font-medium text-gray-400">
                      {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                    </span>
                  </div>
                  <div className="relative aspect-square sm:aspect-video md:aspect-square bg-gray-200/50 rounded-2xl overflow-hidden border border-gray-200/50 shadow-inner">
                    <Image
                      src={originalPreview}
                      alt="Original Preview"
                      fill
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Result Image */}
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full shadow-sm border border-indigo-100 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Upscaled
                    </h4>
                    {resultImage && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                        Ready
                      </span>
                    )}
                  </div>
                  <div className={`relative aspect-square sm:aspect-video md:aspect-square rounded-2xl overflow-hidden border shadow-inner transition-colors duration-500 ${resultImage ? 'border-indigo-200 bg-white' : 'border-gray-200/50 bg-gray-100/50 flex items-center justify-center'}`}>
                    {resultImage ? (
                      <Image
                        src={resultImage}
                        alt="Upscaled Result"
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                        unoptimized={resultImage.startsWith('data:')}
                      />
                    ) : isProcessing ? (
                      <div className="flex flex-col items-center text-indigo-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <span className="text-sm font-medium">Enhancing details...</span>
                        <div className="w-32 h-1 bg-indigo-100 rounded-full mt-4 overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-500 rounded-full"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                        <span className="text-sm font-medium opacity-70">Awaiting processing</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-start space-x-3 border border-red-100">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">Failed to process image</h5>
                        <p className="text-sm opacity-90 mt-1">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                <button
                  onClick={resetState}
                  disabled={isProcessing}
                  className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Another
                </button>
                
                {!resultImage ? (
                  <button
                    onClick={handleUpscale}
                    disabled={isProcessing}
                    className="flex-1 max-w-sm bg-indigo-600 text-white font-medium py-3.5 px-8 rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98] focus:ring-4 focus:ring-indigo-200 transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center group"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing File...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Upscale Image to HD
                      </>
                    )}
                  </button>
                ) : (
                   <button
                    onClick={handleDownload}
                    className="flex-1 max-w-sm bg-[#121217] text-white font-medium py-3.5 px-8 rounded-2xl hover:bg-black hover:shadow-lg hover:shadow-gray-900/30 active:scale-[0.98] focus:ring-4 focus:ring-gray-300 transition-all flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download HD Result
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer strictly for APP VIEW */}
      <footer className="w-full text-center py-6 mt-auto">
         <p className="text-sm text-gray-400 font-medium tracking-wide">
           SYSTEM DEVELOPED BY <span className="text-indigo-600 font-bold ml-1">SANN404 FORUM</span>
         </p>
      </footer>
    </div>
  );
}

