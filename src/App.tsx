/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  Image as ImageIcon, 
  Newspaper, 
  Monitor, 
  Send, 
  Plus, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { generateProductConcept, generateBrandImage, ProductConcept } from './services/brandService';

type Medium = 'billboard' | 'newspaper' | 'social';

interface BrandAsset {
  medium: Medium;
  url: string | null;
  loading: boolean;
}

export default function App() {
  const [productInput, setProductInput] = useState('');
  const [concept, setConcept] = useState<ProductConcept | null>(null);
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [assets, setAssets] = useState<Record<Medium, BrandAsset>>({
    billboard: { medium: 'billboard', url: null, loading: false },
    newspaper: { medium: 'newspaper', url: null, loading: false },
    social: { medium: 'social', url: null, loading: false },
  });

  const handleCreateConcept = async () => {
    if (!productInput.trim()) return;
    setIsGeneratingConcept(true);
    try {
      const result = await generateProductConcept(productInput);
      setConcept(result);
      // Reset assets
      setAssets({
        billboard: { medium: 'billboard', url: null, loading: false },
        newspaper: { medium: 'newspaper', url: null, loading: false },
        social: { medium: 'social', url: null, loading: false },
      });
    } catch (error) {
      console.error('Error generating concept:', error);
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  const generateAsset = async (medium: Medium) => {
    if (!concept) return;
    
    setAssets(prev => ({
      ...prev,
      [medium]: { ...prev[medium], loading: true, url: null }
    }));

    try {
      await generateBrandImage(concept.detailedDescription, medium, (url) => {
        setAssets(prev => ({
          ...prev,
          [medium]: { ...prev[medium], url, loading: false }
        }));
      });
    } catch (error) {
      console.error(`Error generating ${medium} image:`, error);
      setAssets(prev => ({
        ...prev,
        [medium]: { ...prev[medium], loading: false }
      }));
    }
  };

  const generateAll = async () => {
    if (!concept) return;
    generateAsset('billboard');
    generateAsset('newspaper');
    generateAsset('social');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1A1A1A] font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Header */}
      <header className="border-b-2 border-black bg-white p-6 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm">
            <Box className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Brand Builder</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">Visual Identity Simulator v1.0</p>
          </div>
        </div>
        {concept && (
          <button 
            onClick={() => {
              setConcept(null);
              setProductInput('');
            }}
            className="p-2 hover:bg-black hover:text-white transition-colors border border-black rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {!concept ? (
            <motion.div 
              key="input-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8 py-20"
            >
              <div className="space-y-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                  Design your <br />
                  <span className="bg-black text-white px-2">next obsession.</span>
                </h2>
                <p className="text-lg opacity-80 leading-relaxed">
                  Describe a product in simple terms. We'll expand the concept and visualize it across high-impact mediums with consistent branding.
                </p>
              </div>

              <div className="relative group">
                <textarea
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  placeholder="e.g., A minimalist recycled glass perfume bottle with a raw cork topper and embossed branding..."
                  className="w-full h-40 p-6 bg-white border-2 border-black rounded-sm text-lg resize-none focus:outline-none focus:ring-0 focus:border-[#FFD700] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                />
                <button
                  onClick={handleCreateConcept}
                  disabled={isGeneratingConcept || !productInput.trim()}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-black text-white rounded-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#FFD700] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingConcept ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGeneratingConcept ? 'Processing...' : 'Build Concept'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['Billboard', 'Newspaper', 'Social Post'].map((item) => (
                  <div key={item} className="p-4 border border-black/10 rounded-sm flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                    {item === 'Billboard' && <Monitor className="w-6 h-6" />}
                    {item === 'Newspaper' && <Newspaper className="w-6 h-6" />}
                    {item === 'Social Post' && <ImageIcon className="w-6 h-6" />}
                    <span className="text-[10px] uppercase font-bold tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Concept Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 bg-white border-2 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Source Specification</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-[#FF4500]">Product Concept</h2>
                    <p className="text-sm leading-relaxed font-medium opacity-80 mb-6">
                      {concept.detailedDescription}
                    </p>
                    <button 
                      onClick={generateAll}
                      className="w-full py-4 bg-black text-white rounded-sm font-black uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Visualize All Shots
                    </button>
                  </div>
                </div>

                {/* Visualization Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(Object.keys(assets) as Medium[]).map((medium) => (
                    <AssetCard 
                      key={medium} 
                      asset={assets[medium]} 
                      onAction={() => generateAsset(medium)} 
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="p-12 border-t border-black/10 flex flex-col items-center gap-4 opacity-40">
        <div className="text-[10px] font-mono tracking-[0.4em] uppercase">No humans detected in visualization</div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold uppercase tracking-widest underline decoration-wavy decoration-[#FFD700]">High Fidelity</span>
          <span className="text-xs font-bold uppercase tracking-widest underline decoration-wavy decoration-[#FFD700]">Consistent Form</span>
          <span className="text-xs font-bold uppercase tracking-widest underline decoration-wavy decoration-[#FFD700]">Digital Core</span>
        </div>
      </footer>
    </div>
  );
}

interface AssetCardProps {
  asset: BrandAsset;
  onAction: () => void | Promise<void>;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onAction }) => {
  const titles = {
    billboard: 'Urban Billboard',
    newspaper: 'Editorial Print',
    social: 'Digital Stream'
  };

  const icons = {
    billboard: <Monitor className="w-5 h-5" />,
    newspaper: <Newspaper className="w-5 h-5" />,
    social: <ImageIcon className="w-5 h-5" />
  };

  return (
    <div className={`relative group border-2 border-black rounded-sm overflow-hidden bg-[#E8E8E8] aspect-[4/3] flex flex-col transition-all ${asset.url ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'opacity-80'}`}>
      {/* Top Bar */}
      <div className="border-b-2 border-black p-3 bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icons[asset.medium]}
          <span className="text-xs font-black uppercase tracking-widest">{titles[asset.medium]}</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full border border-black" />
          <div className="w-2 h-2 rounded-full border border-black" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {asset.loading ? (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin opacity-40" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">Rendering Pixel Buffer...</span>
          </div>
        ) : asset.url ? (
          <img 
            src={asset.url} 
            alt={asset.medium} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <button 
            onClick={onAction}
            className="group/btn flex flex-col items-center gap-4 hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Generate Visualization</span>
          </button>
        )}
      </div>

      {/* Hover Overlay */}
      {asset.url && !asset.loading && (
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={onAction}
            className="px-4 py-2 bg-[#FFD700] text-black font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-110 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <a 
            href={asset.url} 
            download={`${asset.medium}-shot.png`}
            className="px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-110 transition-transform"
          >
            <ImageIcon className="w-4 h-4" />
            Full View
          </a>
        </div>
      )}

      {/* Bottom Label */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <span className="px-2 py-1 bg-black text-white text-[8px] font-mono tracking-widest uppercase">
          Medium: {asset.medium} / Aspect: {asset.medium === 'billboard' ? '16:9' : asset.medium === 'newspaper' ? '4:3' : '1:1'}
        </span>
      </div>
    </div>
  );
}
