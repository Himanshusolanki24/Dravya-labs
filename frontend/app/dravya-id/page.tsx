'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Camera, Upload, Leaf, Sparkles,
    X, ArrowRight, Check,
    Scan, Zap, Info, ChevronRight
} from 'lucide-react';

// Recent identifications mock data
const recentIdentifications = [
    {
        id: 'tulsi',
        name: 'Tulsi',
        scientificName: 'Ocimum tenuiflorum',
        confidence: 98,
        imagePath: '/ayurvedic_plants/Tulsi.png',
        identifiedAt: '2026-01-08',
    },
    {
        id: 'ashwagandha',
        name: 'Ashwagandha',
        scientificName: 'Withania somnifera',
        confidence: 92,
        imagePath: '/ayurvedic_plants/Ashwagandha.jpg',
        identifiedAt: '2026-01-07',
    },
    {
        id: 'neem',
        name: 'Neem',
        scientificName: 'Azadirachta indica',
        confidence: 95,
        imagePath: '/ayurvedic_plants/neem.jpg',
        identifiedAt: '2026-01-06',
    },
];

export default function DravyaIDPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<typeof recentIdentifications[0] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                simulateAnalysis();
            };
            reader.readAsDataURL(file);
        }
    };

    const simulateAnalysis = () => {
        setIsAnalyzing(true);
        setResult(null);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult(recentIdentifications[0]); // Mock result
        }, 2500);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50">
            {/* Header */}
            <div className="px-6 py-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                        <Sparkles className="size-4" />
                        AI-Powered Plant Recognition
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">Dravya ID</h1>
                    <p className="text-emerald-100 max-w-lg mx-auto">
                        Identify Ayurvedic plants instantly using AI. Upload a photo or use your camera to discover medicinal herbs.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Upload Section */}
                    {!selectedImage ? (
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Upload or Capture Plant Image</h2>
                                <p className="text-gray-500">Take a clear photo of the plant leaves, flowers, or entire plant</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all group"
                                >
                                    <div className="size-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                                        <Upload className="size-7" />
                                    </div>
                                    <span className="font-medium text-gray-700">Upload Photo</span>
                                    <span className="text-xs text-gray-500">JPG, PNG, WebP</span>
                                </button>

                                <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 hover:bg-teal-100 hover:border-teal-400 transition-all group">
                                    <div className="size-16 rounded-2xl bg-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-teal-200">
                                        <Camera className="size-7" />
                                    </div>
                                    <span className="font-medium text-gray-700">Use Camera</span>
                                    <span className="text-xs text-gray-500">Take a photo now</span>
                                </button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {/* Tips */}
                            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800 text-sm">Tips for best results:</p>
                                        <ul className="text-xs text-amber-700 mt-1 space-y-1">
                                            <li>• Capture clear, well-lit photos</li>
                                            <li>• Include distinctive features (leaves, flowers, stems)</li>
                                            <li>• Avoid blurry or dark images</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8">
                            {/* Image Preview & Results */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image */}
                                <div className="relative">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                        <img
                                            src={selectedImage}
                                            alt="Uploaded plant"
                                            className="size-full object-cover"
                                        />
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <div className="size-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                                                    <p className="font-medium">Analyzing...</p>
                                                    <p className="text-sm text-white/70">Identifying plant species</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={clearImage}
                                        className="absolute top-3 right-3 size-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 shadow-lg transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>

                                {/* Results */}
                                <div className="flex flex-col justify-center">
                                    {isAnalyzing ? (
                                        <div className="text-center py-8">
                                            <Scan className="size-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
                                            <h3 className="text-lg font-bold text-gray-800">Scanning Plant...</h3>
                                            <p className="text-gray-500 mt-1">Our AI is analyzing the image</p>
                                        </div>
                                    ) : result ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Check className="size-5 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-medium text-emerald-600">Plant Identified!</span>
                                            </div>

                                            <h2 className="text-3xl font-bold text-gray-800 mb-1">{result.name}</h2>
                                            <p className="text-gray-500 italic mb-4">{result.scientificName}</p>

                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                                                        style={{ width: `${result.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-emerald-600">{result.confidence}% match</span>
                                            </div>

                                            <Link
                                                href={`/ensyclopedia/${result.id}`}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                                            >
                                                <Leaf className="size-5" />
                                                View Plant Details
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Identifications */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Recent Identifications</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {recentIdentifications.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/ensyclopedia/${item.id}`}
                                    className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors"
                                >
                                    <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={item.imagePath}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{item.scientificName}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Zap className="size-3 text-emerald-500" />
                                            <span className="text-xs text-emerald-600">{item.confidence}% match</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="size-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                            <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                <Zap className="size-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Instant Recognition</h4>
                            <p className="text-sm text-gray-500 mt-1">Results in seconds with AI</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                            <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                                <Leaf className="size-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">25+ Ayurvedic Plants</h4>
                            <p className="text-sm text-gray-500 mt-1">Growing database of herbs</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 text-center border border-gray-100">
                            <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="size-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Detailed Information</h4>
                            <p className="text-sm text-gray-500 mt-1">Learn about each plant</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
