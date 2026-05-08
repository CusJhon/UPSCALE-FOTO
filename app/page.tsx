"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Wand2,
  Zap,
  Sparkles,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Layers,
  Camera,
  Settings,
  Globe,
  Twitter,
  Github,
  Instagram,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  Cpu,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ==================================================
// CUSTOM COMPONENTS
// ==================================================

const MagneticButton = ({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const maxDistance = 20;
    const moveX = (distanceX / (rect.width / 2)) * maxDistance;
    const moveY = (distanceY / (rect.height / 2)) * maxDistance;
    setPosition({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      <div className="glass-card-light p-6 rounded-2xl transition-all duration-300 hover:border-indigo-500/50 h-full">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex justify-between items-center text-left group"
      >
        <span className="text-base sm:text-lg font-medium text-white group-hover:text-indigo-400 transition-colors">
          {question}
        </span>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================================================
// MAIN COMPONENT
// ==================================================

export default function Home() {
  const [view, setView] = useState<"landing" | "app">("landing");

  // App State - ORIGINAL FUNCTIONALITY PRESERVED
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [faqStates, setFaqStates] = useState([false, false, false, false]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingMessages = [
    "Analyzing image structure...",
    "Enhancing details...",
    "Restoring textures...",
    "Upscaling to 4K...",
    "Optimizing clarity...",
    "Applying AI enhancement...",
    "Finalizing result...",
  ];

  // ORIGINAL FUNCTIONALITY - Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // ORIGINAL FUNCTIONALITY - Process Selected File
  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file. (JPEG, PNG, WEBP)");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setResultImage(null);
    setShowSuccess(false);
    const objectUrl = URL.createObjectURL(file);
    setOriginalPreview(objectUrl);
  };

  // ORIGINAL FUNCTIONALITY - Drag & Drop Handlers
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

  // ORIGINAL FUNCTIONALITY - Upscale API Call
  const handleUpscale = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStep(0);
    setProgress(0);

    // Enhanced UI: Simulated processing steps (visual only, API call runs in background)
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 5;
      });
    }, 150);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upscale", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong during upscaling.");
      }

      // ORIGINAL FUNCTIONALITY - Handle both url and image response formats
      if (data.url) {
        setResultImage(data.url);
      } else if (data.image) {
        setResultImage(data.image);
      } else {
        throw new Error("No valid image returned from the API.");
      }

      setProgress(100);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  // ORIGINAL FUNCTIONALITY - Reset State
  const resetState = () => {
    setSelectedFile(null);
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setOriginalPreview(null);
    setResultImage(null);
    setError(null);
    setShowSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ORIGINAL FUNCTIONALITY - Download Image
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clarityhd_upscaled_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image", e);
      window.open(resultImage, "_blank");
    }
  };

  const toggleFaq = (index: number) => {
    setFaqStates(prev => prev.map((state, i) => i === index ? !state : state));
  };

  // ==================================================
  // LANDING PAGE
  // ==================================================
  if (view === "landing") {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Ambient Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="container-premium pt-32 pb-20 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-light mb-6"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs sm:text-sm font-medium text-indigo-300">
                  Powered by Advanced AI Enhancement
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1]"
              >
                Transform blurry
                <br />
                images into{" "}
                <span className="text-gradient">ultra HD</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mt-6 leading-relaxed"
              >
                Experience the future of image enhancement. Our AI technology
                restores lost details, removes noise, and upscales your photos
                to stunning 4K resolution in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              >
                <MagneticButton
                  onClick={() => setView("app")}
                  className="relative overflow-hidden group px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-600/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Upscaling <ArrowRight className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </MagneticButton>

                <MagneticButton className="glass-card-light px-8 py-3.5 rounded-full text-white font-medium hover:bg-white/10 transition-all duration-300 border border-white/10">
                  View Demo
                </MagneticButton>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-white/10"
              >
                {[
                  { icon: Users, label: "Creators", value: 100000, suffix: "+" },
                  { icon: Cpu, label: "Resolution", value: 4, suffix: "K" },
                  { icon: Award, label: "Quality Score", value: 98, suffix: "%" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Before/After Comparison Section */}
        <section className="relative py-20">
          <div className="container-premium">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                See the <span className="text-gradient">difference</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Watch how our AI transforms low-quality images into stunning HD masterpieces.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-4 rounded-3xl max-w-4xl mx-auto"
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Original Image</p>
                    </div>
                  </div>
                  <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                      <p className="text-indigo-300 text-sm">AI Enhanced 4K</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-white/30" />
                </div>
              </div>
              <div className="flex justify-between mt-4 px-6">
                <span className="text-sm font-medium text-gray-400">Original</span>
                <span className="text-sm font-medium text-indigo-400">AI Enhanced 4K</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="relative py-20">
          <div className="container-premium">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Premium <span className="text-gradient">features</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Everything you need to transform your images into stunning works of art.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Heart,
                  title: "Face Restoration",
                  description: "Recover facial details with precision AI.",
                  gradient: "from-indigo-500 to-purple-500",
                },
                {
                  icon: Sparkles,
                  title: "Anime Upscale",
                  description: "Perfect for anime and illustration enhancement.",
                  gradient: "from-pink-500 to-orange-500",
                },
                {
                  icon: Camera,
                  title: "Noise Reduction",
                  description: "Remove grain and artifacts automatically.",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: Layers,
                  title: "4K Export",
                  description: "Export images in stunning 4K resolution.",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Settings,
                  title: "Batch Processing",
                  description: "Process multiple images simultaneously.",
                  gradient: "from-purple-500 to-indigo-500",
                },
                {
                  icon: Shield,
                  title: "AI Texture Recovery",
                  description: "Restore lost textures and fine details.",
                  gradient: "from-red-500 to-orange-500",
                },
              ].map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="relative py-20">
          <div className="container-premium">
            <div className="glass-panel p-8 sm:p-12 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                {[
                  { icon: Users, label: "Happy Creators", value: "100K+", color: "text-indigo-400" },
                  { icon: Star, label: "Rating", value: "4.9/5", color: "text-yellow-400" },
                  { icon: Globe, label: "Countries", value: "50+", color: "text-cyan-400" },
                  { icon: Shield, label: "Privacy", value: "100% Secure", color: "text-green-400" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color}`} />
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    <div className="text-sm text-gray-500">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-20">
          <div className="container-premium max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently asked <span className="text-gradient">questions</span>
              </h2>
            </motion.div>

            <div className="glass-card-light rounded-2xl p-6">
              {[
                {
                  question: "What image formats are supported?",
                  answer: "We support JPG, PNG, WEBP, and HEIC formats. Maximum file size is 20MB per image.",
                },
                {
                  question: "Is my data private and secure?",
                  answer: "Yes! All images are processed securely and automatically deleted from our servers after 24 hours.",
                },
                {
                  question: "How long does processing take?",
                  answer: "Most images are processed within 5-15 seconds depending on size and complexity.",
                },
                {
                  question: "What's the maximum resolution output?",
                  answer: "Our AI can upscale images up to 4K (3840x2160) resolution while maintaining quality.",
                },
              ].map((faq, idx) => (
                <FAQItem
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={faqStates[idx]}
                  onToggle={() => toggleFaq(idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-white/10 py-12">
          <div className="container-premium">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">ClarityHD</span>
              </div>

              <div className="flex gap-6">
                <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

              <p className="text-sm text-gray-600">
                Created by <span className="text-indigo-400">SANN404 FORUM</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==================================================
  // APP VIEW - Premium Upload & Processing
  // ==================================================
  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 sticky top-0 glass-card border-b border-white/10 backdrop-blur-xl">
        <div className="container-premium py-4 flex items-center justify-between">
          <button
            onClick={() => setView("landing")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">ClarityHD</span>
          </button>
          <div className="glass-card-light px-4 py-1.5 rounded-full text-xs font-medium text-indigo-300">
            AI Workspace
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <main className="relative z-10 container-premium py-10 sm:py-16">
        <div className="max-w-5xl mx-auto">
          {!originalPreview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient">Upload your image</h2>
              <p className="text-gray-400">Drag & drop or click to browse</p>
            </motion.div>
          ) : null}

          <div className="glass-panel rounded-3xl overflow-hidden">
            {!originalPreview ? (
              <div className="p-8 sm:p-12">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div
                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-16 transition-all duration-300 ${
                      isDragOver
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                        : "border-indigo-500/30 hover:border-indigo-500/60 hover:bg-white/5"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <motion.div
                      animate={{ y: isDragOver ? -10 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6"
                    >
                      <UploadCloud className="w-10 h-10 text-indigo-400" />
                    </motion.div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      {isDragOver ? "Drop your image here" : "Drop your image here"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WEBP (Max 20MB)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Original Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-400">Original</span>
                      <span className="text-xs text-gray-600">
                        {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                      </span>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/30 border border-white/10">
                      {originalPreview && (
                        <Image
                          src={originalPreview}
                          alt="Original"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Result Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Enhanced
                      </span>
                      {resultImage && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      )}
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/30 border border-white/10">
                      {resultImage ? (
                        <motion.div
                          initial={{ filter: "blur(12px)", opacity: 0 }}
                          animate={{ filter: "blur(0px)", opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="relative w-full h-full"
                        >
                          <Image
                            src={resultImage}
                            alt="Upscaled Result"
                            fill
                            className="object-contain"
                            unoptimized={resultImage.startsWith('data:')}
                          />
                        </motion.div>
                      ) : isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
                          <p className="text-sm text-indigo-400 text-center px-4">
                            {processingMessages[processingStep]}
                          </p>
                          <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                          <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
                          <span className="text-sm opacity-50">Awaiting processing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Animation */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Image successfully enhanced!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons - ORIGINAL FUNCTIONALITY PRESERVED */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={resetState}
                    disabled={isProcessing}
                    className="glass-card-light px-6 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Another
                  </button>

                  {!resultImage ? (
                    <button
                      onClick={handleUpscale}
                      disabled={isProcessing}
                      className="relative overflow-hidden px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Upscale to HD
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Result
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative text-center py-6">
        <p className="text-sm text-gray-600">
          SYSTEM DEVELOPED BY <span className="text-indigo-400">SANN404 FORUM</span>
        </p>
      </footer>
    </div>
  );
}