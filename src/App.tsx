import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Map as MapIcon, Plus, Target, Navigation, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface Label {
  id: string;
  x: number;
  y: number;
  text: string;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [labels, setLabels] = useState<Label[]>([
    { id: '1', x: 30, y: 40, text: 'Old Harbor' },
    { id: '2', x: 60, y: 35, text: 'Mist Peak' },
    { id: '3', x: 45, y: 70, text: 'Crystal Lake' },
  ]);
  const [mouseCoords, setMouseCoords] = useState({ lat: 45.523062, lng: -122.676482 });
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Using the map image you specified. Make sure this image is placed in the project's 'public' folder.
  const mapImageUrl = "/a7omhol1ggnc1_upscayl_2x_digital-art-4x.png";

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 500);
          return 100;
        }
        // Random increment between 5 and 15
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    
    // Calculate relative position (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Map to some fake lat/long coordinates just for visual effect
    const baseLat = 45.52;
    const baseLng = -122.67;
    
    setMouseCoords({
      lat: baseLat + (y * 0.05),
      lng: baseLng - (x * 0.05)
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoaded || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    
    // Use relative percentages to keep labels in place across screen sizes
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newId = Math.random().toString(36).substr(2, 9);
    setLabels([...labels, {
      id: newId,
      x,
      y,
      text: `Sector ${Math.floor(x)}-${Math.floor(y)}`
    }]);
  };

  const updateLabelText = (id: string, newText: string) => {
    setLabels(labels.map(L => L.id === id ? { ...L, text: newText } : L));
  };
  
  const removeLabel = (id: string) => {
    setLabels(labels.filter(L => L.id !== id));
  };

  return (
    <div className="w-screen h-screen bg-[#0A0B0D] text-[#E2E8F0] font-sans overflow-hidden flex flex-col border border-[#1A1C20] select-none text-sm">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-[#2D3036] bg-[#111318] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center border border-[#C5A059] text-[#C5A059] rounded-sm italic font-serif">A</div>
          <h1 className="text-sm font-semibold tracking-[0.2em] uppercase hidden sm:block">
            Axiom Cartography <span className="text-[#C5A059] opacity-50">//</span> v2.4.1
          </h1>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] tracking-widest uppercase font-medium">
          <span className="text-[#C5A059]">Project: Terra Nova</span>
          <span className="opacity-40">Scale: 1:25,000</span>
          <span className="opacity-40">Datum: WGS84</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-32 h-1 bg-[#1A1C20] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#C5A059]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#C5A059] w-8">{Math.min(loadingProgress, 100)}%</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#2D3036] bg-[#0F1116] p-6 flex flex-col gap-8 z-20 shrink-0 overflow-y-auto hidden md:flex">
          <section>
            <h3 className="text-[10px] text-[#C5A059] uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapIcon size={12} /> Map Layers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs opacity-90 cursor-pointer hover:text-[#C5A059] transition-colors">
                <div className="w-3 h-3 border border-[#C5A059] bg-[#C5A059] rounded-sm"></div>
                <span>Topographic Raster</span>
              </div>
              <div className="flex items-center gap-3 text-xs opacity-90 cursor-pointer hover:text-[#C5A059] transition-colors">
                <div className="w-3 h-3 border border-[#444] rounded-sm"></div>
                <span>Contour Intervals</span>
              </div>
              <div className="flex items-center gap-3 text-xs opacity-90 cursor-pointer hover:text-[#C5A059] transition-colors">
                <div className="w-3 h-3 border border-[#444] rounded-sm"></div>
                <span>Satellite Overlay</span>
              </div>
            </div>
          </section>
          
          <section className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[10px] text-[#C5A059] uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
              <Target size={12} /> Active Labels
            </h3>
            <div className="space-y-2 font-serif flex-1 overflow-y-auto pr-2 pb-4">
              <AnimatePresence>
                {labels.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-xs text-white/30 italic my-4"
                  >
                    No labels placed. Click map to add.
                  </motion.div>
                )}
                {labels.map((L, i) => (
                  <motion.div 
                    key={L.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="group p-2 bg-[#1A1C20] rounded border-l-2 border-[#C5A059] flex justify-between items-center transition-all hover:bg-[#22252A]"
                  >
                    <input
                      type="text"
                      value={L.text}
                      onChange={(e) => updateLabelText(L.id, e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-3/4 focus:text-[#C5A059]"
                    />
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-mono non-italic opacity-40 uppercase">Pin {String(i + 1).padStart(2, '0')}</span>
                      <button 
                        onClick={() => removeLabel(L.id)}
                        className="text-[9px] text-red-500/50 hover:text-red-500 uppercase font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
          
          <div className="mt-auto shrink-0 pt-4">
            <div className="w-full py-3 bg-[#1A1C20] text-[#C5A059] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-[#C5A059]/30 rounded">
              <Plus size={14} /> Click map to place label
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <section 
          className="flex-1 relative bg-[#0D0E12] overflow-hidden"
          ref={mapRef}
        >
          {/* Map Content */}
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            doubleClick={{ disabled: true }}
            panning={{ excluded: ['input', 'button'] }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                  <button onClick={() => zoomIn()} className="p-2 bg-[#1A1C20] border border-[#C5A059]/30 text-[#C5A059] rounded hover:bg-[#22252A] transition-colors"><ZoomIn size={16} /></button>
                  <button onClick={() => zoomOut()} className="p-2 bg-[#1A1C20] border border-[#C5A059]/30 text-[#C5A059] rounded hover:bg-[#22252A] transition-colors"><ZoomOut size={16} /></button>
                  <button onClick={() => resetTransform()} className="p-2 bg-[#1A1C20] border border-[#C5A059]/30 text-[#C5A059] rounded hover:bg-[#22252A] transition-colors"><Maximize size={16} /></button>
                </div>
                
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                   <div 
                     className="relative w-full h-full min-w-[1000px] min-h-[800px] cursor-crosshair"
                     onClick={(e) => {
                       if (!isLoaded || !mapRef.current) return;
                       
                       // Prevent firing if dragging occurred (react-zoom-pan-pinch usually stops propagation on drag, but let's be safe)
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = ((e.clientX - rect.left) / rect.width) * 100;
                       const y = ((e.clientY - rect.top) / rect.height) * 100;
                       
                       const newId = Math.random().toString(36).substr(2, 9);
                       setLabels([...labels, {
                         id: newId,
                         x,
                         y,
                         text: `Sector ${Math.floor(x)}-${Math.floor(y)}`
                       }]);
                     }}
                     onMouseMove={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = (e.clientX - rect.left) / rect.width;
                       const y = (e.clientY - rect.top) / rect.height;
                       const baseLat = 45.52;
                       const baseLng = -122.67;
                       setMouseCoords({
                         lat: baseLat + (y * 0.05),
                         lng: baseLng - (x * 0.05)
                       });
                     }}
                   >
                     {/* Map Image Layer */}
                     <img 
                       src={mapImageUrl} 
                       alt="Map"
                       className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                       draggable={false}
                     />
                     
                     {/* Grid Overlay */}
                     <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
                     
                     {/* Labels Overlay */}
                     {isLoaded && labels.map(L => (
                       <motion.div 
                         key={L.id}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2 group z-10"
                         style={{ top: `${L.y}%`, left: `${L.x}%` }}
                       >
                         {/* Target reticle styling instead of just a line */}
                         <div className="w-6 h-6 border rounded-full border-[#C5A059]/50 flex items-center justify-center relative mb-2">
                            <div className="w-1 h-1 bg-[#C5A059] rounded-full shadow-[0_0_8px_#C5A059]"></div>
                            <div className="absolute inset-0 animate-ping opacity-30 border rounded-full border-[#C5A059]"></div>
                         </div>
                         
                         <div className="bg-[#0A0B0D]/80 backdrop-blur border border-[#C5A059]/80 px-4 py-1.5 text-sm font-serif italic text-[#C5A059] shadow-lg flex items-center gap-2 shadow-[#C5A059]/10">
                           {L.text}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          {/* Loading Screen Overlay */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center bg-[#0A0B0D] p-12 pointer-events-none h-full"
              >
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className="relative w-[120%] h-[120%] blur-[2px] opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, #1A202C 0%, transparent 60%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 border border-[#C5A059]/20 rounded-full blur-3xl bg-[#C5A059]/10 animate-pulse"></div>
                  </div>
                </div>

                <p className="text-xs tracking-[0.4em] uppercase mb-6 text-[#C5A059] animate-pulse font-mono flex items-center gap-2">
                  <Navigation size={14} className="animate-spin-slow" /> Initializing Map Data...
                </p>
                <div className="w-96 max-w-[80vw] h-[2px] bg-[#2D3036] overflow-hidden relative rounded">
                  <motion.div 
                    className="h-full bg-[#C5A059] absolute left-0 top-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#C5A059] blur-sm"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between w-96 max-w-[80vw] mt-3 text-[10px] font-mono opacity-40 uppercase">
                  <span>Loading Raster Tiles</span>
                  <span>{loadingProgress < 100 ? 'In Progress' : 'Complete'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compass */}
          <div className="absolute top-10 right-10 w-24 h-24 border border-[#C5A059]/30 rounded-full flex flex-col items-center justify-center pointer-events-none bg-[#0A0B0D]/50 backdrop-blur-sm z-10 hidden sm:flex">
            <div className="text-[10px] text-[#C5A059] tracking-widest font-serif font-bold mb-4">N</div>
            <div className="text-[8px] text-white/30 tracking-widest uppercase">Alt 500</div>
            <div className="absolute inset-0 border-t border-[#C5A059]/50 w-[1px] left-[50%] h-[15%]"></div>
            <div className="absolute inset-0 border-b border-[#C5A059]/20 w-[1px] left-[50%] top-[85%] h-[15%]"></div>
            <div className="absolute inset-0 border-r border-[#C5A059]/20 h-[1px] top-[50%] left-[85%] w-[15%]"></div>
            <div className="absolute inset-0 border-l border-[#C5A059]/20 h-[1px] top-[50%] left-[0%] w-[15%]"></div>
          </div>
          
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 shrink-0 border-t border-[#2D3036] bg-[#0F1116] px-6 flex items-center justify-between text-[10px] font-mono text-white/40 z-20">
        <div className="flex gap-4 sm:gap-6 uppercase">
          <span className="w-32"><span className="text-white/20">LAT:</span> {mouseCoords.lat.toFixed(6)}</span>
          <span className="w-32"><span className="text-white/20">LON:</span> {mouseCoords.lng.toFixed(6)}</span>
        </div>
        <div className="flex gap-4 items-center uppercase">
          <span className="hidden sm:inline">{isLoaded ? 'System Ready' : 'Initializing'}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
        </div>
      </footer>
    </div>
  );
}
