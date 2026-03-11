"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './utils/cropImage';

const FUNNY_MESSAGES = [
  'বড় ভাই, মান-সম্মান বাঁচাতে চাইলে দ্রুত সেলামি পাঠান!',
  '১০০ টাকা দিলে দোয়া ফ্রি, ৫০০ টাকা দিলে কোলাকুলি ফ্রি!',
  'বাজেট আপডেট: এ বছর সেলামি ৫০০ টাকার নিচে গ্রহণ করা হবে না।'
];

const COLOR_PRESETS = [
  { name: 'Emerald', gradient: 'from-emerald-950 via-slate-900 to-teal-950', border: 'border-emerald-500/20', accent: 'bg-emerald-500', button: 'bg-emerald-600 hover:bg-emerald-700' },
  { name: 'Royal', gradient: 'from-blue-950 via-slate-900 to-indigo-950', border: 'border-blue-500/20', accent: 'bg-blue-500', button: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'Golden', gradient: 'from-amber-950 via-slate-900 to-yellow-950', border: 'border-amber-500/20', accent: 'bg-amber-500', button: 'bg-amber-600 hover:bg-amber-700' },
  { name: 'Midnight', gradient: 'from-slate-950 via-black to-slate-900', border: 'border-slate-500/20', accent: 'bg-slate-500', button: 'bg-slate-700 hover:bg-slate-800' },
  { name: 'Rose', gradient: 'from-rose-950 via-slate-900 to-pink-950', border: 'border-rose-500/20', accent: 'bg-rose-500', button: 'bg-rose-600 hover:bg-rose-700' },
  { name: 'Ocean', gradient: 'from-cyan-950 via-slate-900 to-blue-950', border: 'border-cyan-500/20', accent: 'bg-cyan-500', button: 'bg-cyan-600 hover:bg-cyan-700' },
  { name: 'Crimson', gradient: 'from-red-950 via-slate-900 to-rose-950', border: 'border-red-500/20', accent: 'bg-red-500', button: 'bg-red-600 hover:bg-red-700' },
  { name: 'Forest', gradient: 'from-green-950 via-slate-900 to-emerald-950', border: 'border-green-500/20', accent: 'bg-green-500', button: 'bg-green-600 hover:bg-green-700' }
];

export default function Home() {
  const [formData, setFormData] = useState({
    message: '',
    paymentMethod: 'bKash',
    phoneNumber: '',
    qrCode: null as string | null,
  });

  const handleRandomize = () => {
    const randomMessage = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
    const randomColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    setFormData(prev => ({ ...prev, message: randomMessage }));
    setSelectedColor(randomColor);
  };

  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cropper states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `eid-salami-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropping(true);
        // Reset cropper states
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
      // Clear the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setFormData(prev => ({ ...prev, qrCode: croppedImage }));
        setIsCropping(false);
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageToCrop(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-(family-name:--font-hind-siliguri) selection:bg-emerald-500 selection:text-white flex flex-col items-center">
      <div className="w-full p-4 md:p-8 lg:p-12 grow max-w-6xl mx-auto">
        <div className="text-center mb-10 pb-4 border-b border-slate-200">
          <h1 className="text-4xl pt-5 md:text-5xl font-bold tracking-tight text-slate-900 mb-4 bg-clip-text text-transparent bg-linear-to-r from-[#00897b] to-[#004d40] drop-shadow-md">
            ✨ ঈদ সালামি কার্ড
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            ডিজিটাল যুগে এনালগ সেলামি চলে না, তাই তো কিউআর কোডের এই ব্যবস্থা।
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Left Column: Form Section */}
          <div className="w-full lg:w-5/12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">১</span>
              কার্ডের তথ্য
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700">আপনার নাম অথবা বার্তা</label>
                  <button
                    onClick={handleRandomize}
                    type="button"
                    className="text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    র‍্যান্ডম
                  </button>
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="আপনার নাম অথবা একটি মজার বার্তা লিখুন"
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                />
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs text-slate-500 font-medium px-1">মজার বার্তা বেছে নিন:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {FUNNY_MESSAGES.map((msg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, message: msg }))}
                        className="text-[11px] font-bold leading-tight bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 text-left transition-colors max-w-full"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="paymentMethod" className="block text-sm font-semibold text-slate-700">পেমেন্ট মেথড</label>
                <div className="relative">
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Upay">Upay</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700">বিকাশ/নগদ নম্বর</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">পেমেন্ট কিউআর কোড (QR Code)</label>
                <div className="relative group">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all duration-300 overflow-hidden">
                    {formData.qrCode ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img src={formData.qrCode} alt="QR string preview" className="h-full w-auto object-contain rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">পরিবর্তন করুন</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <div className="w-12 h-12 mb-3 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="mb-1 text-sm font-medium text-slate-700">কিউআর কোড আপলোড করুন</p>
                        <p className="text-xs text-slate-500">PNG, JPG or SVG (Max 2MB)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">কার্ডের থিম (রং)</label>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-full aspect-square rounded-2xl transition-all duration-200 ${color.accent} ${selectedColor.name === color.name ? 'ring-4 ring-offset-2 ring-slate-300 scale-105 shadow-lg' : 'hover:scale-105 shadow-md opacity-80 hover:opacity-100'}`}
                      title={color.name}
                      type="button"
                      aria-label={`Select ${color.name} theme`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Preview Section */}
          <div className="w-full lg:w-7/12 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 self-start lg:self-center flex items-center gap-2">
              <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">২</span>
              লাইভ প্রিভিউ
            </h2>

            <div ref={cardRef} className="w-full max-w-md relative min-h-[580px] rounded-[2.5rem] bg-slate-950 p-1 ring-1 ring-slate-900/5 shadow-2xl overflow-hidden group isolation-auto">

              {/* Decorative Background for Card */}
              <div className="absolute inset-0 overflow-hidden rounded-[2.4rem] z-0">
                <div className="absolute top-0 right-0 -mr-10 -mt-20 w-80 h-80 bg-emerald-600/40 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-20 w-80 h-80 bg-violet-600/40 rounded-full blur-[80px]" />

                {/* Stars */}
                <div className="absolute top-8 right-10 text-emerald-300/40">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.2 8.5L21 8.5L15.5 12.5L17.5 19L12 15L6.5 19L8.5 12.5L3 8.5L9.8 8.5L12 2Z" /></svg>
                </div>
                <div className="absolute top-16 right-24 text-teal-400/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.2 8.5L21 8.5L15.5 12.5L17.5 19L12 15L6.5 19L8.5 12.5L3 8.5L9.8 8.5L12 2Z" /></svg>
                </div>
              </div>

              {/* Card Container */}
              <div className={`relative h-full min-h-[560px] w-full rounded-[2.3rem] bg-linear-to-br ${selectedColor.gradient} border ${selectedColor.border} backdrop-blur-sm p-8 flex flex-col items-center justify-between z-10 shadow-inner overflow-hidden`}>

                {/* Mosque Silhouette Overlay */}
                <div className="absolute bottom-0 inset-x-0 w-full opacity-[0.08] pointer-events-none z-0 text-white flex justify-center">
                  <svg viewBox="0 0 800 200" className="w-full h-auto max-h-[160px] object-cover object-bottom translate-y-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    {/* Center Dome Pillar & Crescent */}
                    <rect x="399" y="32" width="2" height="28" />
                    <path d="M 400 15 A 12 12 0 1 0 414 29 A 10 10 0 1 1 400 15 Z" />
                    {/* Center Dome */}
                    <path d="M 400 60 C 330 60 300 160 300 200 L 500 200 C 500 160 470 60 400 60 Z" />
                    {/* Left Dome */}
                    <rect x="219" y="100" width="2" height="20" />
                    <path d="M 220 120 C 180 120 160 180 160 200 L 280 200 C 280 180 260 120 220 120 Z" />
                    {/* Right Dome */}
                    <rect x="579" y="100" width="2" height="20" />
                    <path d="M 580 120 C 540 120 520 180 520 200 L 640 200 C 640 180 620 120 580 120 Z" />
                    {/* Left Minaret */}
                    <rect x="80" y="80" width="24" height="120" />
                    <path d="M 72 80 L 112 80 L 92 40 Z" />
                    <rect x="91" y="20" width="2" height="20" />
                    <rect x="74" y="100" width="36" height="8" rx="4" />
                    <rect x="74" y="140" width="36" height="8" rx="4" />
                    {/* Right Minaret */}
                    <rect x="696" y="80" width="24" height="120" />
                    <path d="M 688 80 L 728 80 L 708 40 Z" />
                    <rect x="707" y="20" width="2" height="20" />
                    <rect x="690" y="100" width="36" height="8" rx="4" />
                    <rect x="690" y="140" width="36" height="8" rx="4" />
                    {/* Base */}
                    <rect x="0" y="196" width="800" height="4" />
                  </svg>
                </div>

                {/* Header with Moon and Eid Mubarak */}
                <div className="text-center mt-2 mb-4 flex flex-col items-center relative z-10">
                  <svg className="w-12 h-12 text-amber-300 drop-shadow-md mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.2,14.6c-1.3,0.3-2.6,0.3-4,0.1c-4.4-0.6-7.8-4-8.4-8.4c-0.2-1.3-0.2-2.7,0.1-4C4.3,3.3,1,7.5,1,12.5 c0,6.1,4.9,11,11,11c5.1,0,9.3-3.4,10.6-8.1C22.2,15.1,21.7,14.8,21.2,14.6z" />
                  </svg>
                  <h3 className="text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-linear-to-b from-white to-white/80" style={{ lineHeight: "1.2" }}>
                    ঈদ মোবারক
                  </h3>
                </div>

                {/* Salami Container */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[95%] relative z-10">
                  <div className="w-full bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-inner text-center relative overflow-hidden transition-colors duration-500">

                    {/* Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />

                    {!FUNNY_MESSAGES.includes(formData.message) && (
                      <p className="text-white/70 text-sm font-semibold mb-1">ঈদের সেলামি পাঠাতে পারেন</p>
                    )}
                    <p className={`text-white font-bold mb-6 tracking-wide drop-shadow-md pb-1 break-words px-2 ${formData.message && formData.message.length > 20 ? 'text-xl md:text-2xl leading-snug' : 'text-3xl truncate'}`}>
                      {formData.message || 'আপনার নাম'}
                    </p>

                    <div className="flex flex-col items-center gap-4 relative z-20">

                      {/* Payment Details */}
                      <div className="flex flex-col items-center mb-2">
                        <div className="bg-white/10 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg border border-white/20 mb-2 whitespace-nowrap uppercase tracking-wider">
                          {formData.paymentMethod}
                        </div>
                        <div className="text-white text-2xl md:text-3xl font-bold tracking-wider drop-shadow-lg pb-1">
                          {formData.phoneNumber || '০১৭XX-XXXXXX'}
                        </div>
                      </div>

                      {/* QR Code Block */}
                      <div className="relative p-2 bg-white rounded-3xl shadow-2xl shadow-black/30 transform group-hover:scale-105 transition-transform duration-500 ring-2 ring-white/20">
                        {formData.qrCode ? (
                          <img src={formData.qrCode} alt="QR Code" className="w-32 h-32 object-contain rounded-2xl" />
                        ) : (
                          <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-[10px] uppercase font-semibold opacity-70">No QR</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer on Card */}
                <div className="text-center mt-6 relative z-10">
                  <p className="text-white/40 text-xs font-semibold">Generated with Love</p>
                </div>

              </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-md">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all duration-300 ${selectedColor.button} disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]`}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    কার্ড তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    কার্ড ডাউনলোড করুন (PNG)
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500 font-medium text-center">
                কার্ডের প্রিভিউ নিজে থেকেই আপডেট হবে।
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-12 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm font-medium">
          ছোট ভাইরা, বড়ো ভাইদের খেয়ে দিতে হবে আমাদের স্টাইলে<span className="text-red-500">✨ </span>
        </p>
      </footer>

      {/* Cropper Modal */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col h-[80vh] md:h-[600px] shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h3 className="font-bold text-slate-800">QR Code ক্রপ করুন</h3>
              <button onClick={handleCropCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="relative flex-grow bg-slate-100 w-full overflow-hidden">
              <div className="absolute inset-0">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
            </div>

            <div className="p-6 bg-white z-10 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-600 min-w-10">জুম</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCropCancel} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                  বাতিল
                </button>
                <button onClick={handleCropSave} className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                  সেভ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
