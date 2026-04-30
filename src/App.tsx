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
  
  // Using the map image you specified from catbox.moe
  const mapImageUrl = "https://files.catbox.moe/lsnc3r.png";

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
      <header className="h-16 shrink-0 border-b border-[#2a2a2a] bg-[#0A0B0D] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center border border-[#cfb997] text-[#cfb997] rounded-sm font-display text-lg">O</div>
          <h1 className="text-xl font-display tracking-[0.1em] text-[#e0e0e0] hidden sm:block">
            Oathsworn Skyrim Map
          </h1>
        </div>
        
        <div className="hidden md:flex gap-8 text-xs tracking-widest uppercase font-sans text-[#a0a0a0]">
          <span className="text-[#cfb997]">Province: Skyrim</span>
          <span className="opacity-60">Era: 4E 201</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-32 h-1 bg-[#1a1c20] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#cfb997]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-[10px] font-sans text-[#cfb997] w-8">{Math.min(loadingProgress, 100)}%</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#2a2a2a] bg-[#0A0B0D] p-6 flex flex-col gap-8 z-20 shrink-0 overflow-y-auto">
          
          <section className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm text-[#cfb997] font-display uppercase tracking-wider mb-4 border-b border-[#333] pb-2 text-center text-opacity-80">
              Active Markers
            </h3>
            <div className="space-y-2 font-serif flex-1 overflow-y-auto pr-2 pb-4">
              <AnimatePresence>
                {labels.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-sm text-[#777] italic my-4 text-center"
                  >
                    No markers placed. Click map to add.
                  </motion.div>
                )}
                {labels.map((L, i) => (
                  <motion.div 
                    key={L.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="group p-2 bg-transparent rounded-sm flex justify-between items-center transition-all hover:bg-[#1a1c20] border-b border-[#222]"
                  >
                    <input
                      type="text"
                      value={L.text}
                      onChange={(e) => updateLabelText(L.id, e.target.value)}
                      className="bg-transparent border-none outline-none text-base w-3/4 text-[#e0e0e0] focus:text-[#cfb997] font-serif"
                    />
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-sans text-opacity-40 uppercase text-[#888]">Pin {String(i + 1).padStart(2, '0')}</span>
                      <button 
                        onClick={() => removeLabel(L.id)}
                        className="text-xs text-red-900/60 hover:text-red-700 uppercase font-sans tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
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
            <div className="w-full py-3 bg-[#111] text-[#cfb997] text-xs font-display uppercase tracking-widest flex items-center justify-center gap-2 border border-[#333] rounded hover:bg-[#1a1c20] transition-colors cursor-default">
              <Plus size={14} /> Click map to place marker
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
            minScale={0.5}
            maxScale={8}
            centerOnInit
            wheel={{ step: 0.1, smoothStep: 0.005 }}
            doubleClick={{ disabled: true }}
            panning={{ excluded: ['input', 'button'] }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                  <button onClick={() => zoomIn()} className="p-2 bg-[#111] border border-[#333] text-[#cfb997] rounded hover:bg-[#222] transition-colors"><ZoomIn size={16} /></button>
                  <button onClick={() => zoomOut()} className="p-2 bg-[#111] border border-[#333] text-[#cfb997] rounded hover:bg-[#222] transition-colors"><ZoomOut size={16} /></button>
                  <button onClick={() => resetTransform()} className="p-2 bg-[#111] border border-[#333] text-[#cfb997] rounded hover:bg-[#222] transition-colors"><Maximize size={16} /></button>
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
                     <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#cfb997 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
                     
                     {/* Labels Overlay */}
                     {isLoaded && labels.map(L => (
                       <motion.div 
                         key={L.id}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2 group z-10"
                         style={{ top: `${L.y}%`, left: `${L.x}%` }}
                       >
                         {/* Skyrim style marker: simpler, less sci-fi */}
                         <div className="w-5 h-5 flex flex-col items-center relative mb-1">
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#cfb997] shadow-lg transform origin-bottom hover:scale-110 transition-transform"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-black/60 shadow-lg mt-1 border border-[#cfb997]/50"></div>
                         </div>
                         
                         <div className="bg-[#000]/70 backdrop-blur-sm border border-[#cfb997]/40 px-3 py-1 text-lg font-serif italic text-white shadow-xl shadow-black/50 text-shadow-sm min-w-max">
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
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center bg-[#050505] p-12 pointer-events-none h-full"
              >
                <div className="absolute inset-0 flex items-center justify-center -z-10 bg-[#0a0a0a]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-[#cfb997]/5 rounded-full blur-3xl bg-[#cfb997]/5 animate-pulse"></div>
                </div>

                <p className="text-xl tracking-[0.2em] font-display uppercase mb-6 text-[#cfb997] animate-pulse flex items-center gap-3">
                  Unfurling the Map...
                </p>
                <div className="w-96 max-w-[80vw] h-[1px] bg-[#333] overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-[#cfb997] absolute left-0 top-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between w-96 max-w-[80vw] mt-4 text-xs font-serif text-[#a0a0a0] uppercase tracking-widest">
                  <span>Charting Territories</span>
                  <span>{loadingProgress < 100 ? 'In Progress' : 'Complete'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compass */}
          <div className="absolute top-8 right-8 w-24 h-24 border-2 border-[#cfb997]/20 rounded-full flex flex-col items-center justify-center pointer-events-none bg-[#050505]/40 backdrop-blur-sm z-10 hidden sm:flex shadow-2xl">
            <div className="text-base text-[#cfb997] font-display font-bold mb-3 drop-shadow-md">N</div>
            <div className="text-[10px] text-[#e0e0e0]/50 tracking-widest uppercase font-sans">Skyrim</div>
            <div className="absolute inset-0 border-t-4 border-[#cfb997]/80 w-[2px] left-[calc(50%-1px)] h-[10%]"></div>
            <div className="absolute inset-0 border-b-2 border-[#cfb997]/30 w-[1px] left-[50%] top-[90%] h-[10%]"></div>
            <div className="absolute inset-0 border-r-2 border-[#cfb997]/30 h-[1px] top-[50%] left-[90%] w-[10%]"></div>
            <div className="absolute inset-0 border-l-2 border-[#cfb997]/30 h-[1px] top-[50%] left-[0%] w-[10%]"></div>
          </div>
          
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 shrink-0 border-t border-[#2a2a2a] bg-[#0A0B0D] px-6 flex items-center justify-between text-xs font-sans text-white/40 z-20">
        <div className="flex gap-4 sm:gap-6 uppercase">
          <span className="w-32 tracking-wider"><span className="text-[#888]">LAT:</span> {mouseCoords.lat.toFixed(4)}</span>
          <span className="w-32 tracking-wider"><span className="text-[#888]">LON:</span> {mouseCoords.lng.toFixed(4)}</span>
        </div>
        <div className="flex gap-4 items-center uppercase tracking-widest text-[#cfb997]">
          <span className="hidden sm:inline">{isLoaded ? 'Map Ready' : 'Loading'}</span>
          <div className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-[#cfb997] shadow-[0_0_8px_rgba(207,185,151,0.5)]' : 'bg-[#555] animate-pulse'}`}></div>
        </div>
      </footer>
    </div>
  );
}
