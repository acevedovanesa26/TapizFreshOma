import React, { useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { storage } from '../../services/storage';

export const WorkCarousel: React.FC = () => {
  const config = storage.getConfig();
  const items = config.carrusel || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAfter, setShowAfter] = useState<Record<number, boolean>>({});

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const isShowingAfter = showAfter[currentIndex] ?? true;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const toggleBeforeAfter = () => {
    setShowAfter((prev) => ({
      ...prev,
      [currentIndex]: !isShowingAfter,
    }));
  };

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF7F8] border border-[#78BDC4]/40 text-[#2F6F77] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#4F9DA6]" />
            Galería de Resultados Reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Conoce Nuestro Trabajo: Antes y Después
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Comprueba el poder de nuestra tecnología de inyección y extracción profunda en fibras delicadas, colchones y sofás de familias reales.
          </p>
        </div>

        {/* Featured Showcase */}
        <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-md">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 group">
            <img
              src={isShowingAfter ? currentItem.fotoDespues : currentItem.fotoAntes}
              alt={currentItem.titulo}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Status indicator tag */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                  isShowingAfter
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {isShowingAfter ? '✨ DESPUÉS (Limpio y Desinfectado)' : '⚠️ ANTES (Suciedad acumulada)'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-medium">
                {currentItem.categoria}
              </span>
            </div>

            {/* Toggle Before/After Button */}
            <button
              onClick={toggleBeforeAfter}
              className="absolute bottom-4 right-4 z-20 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 font-bold text-xs shadow-lg flex items-center gap-2 backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#4F9DA6]" />
              <span>Ver {isShowingAfter ? 'el Antes' : 'el Después'}</span>
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Details below carousel */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{currentItem.titulo}</h3>
              <p className="text-sm text-slate-600 mt-1">{currentItem.descripcion}</p>
            </div>
            {/* Dots */}
            <div className="flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-[#78BDC4]' : 'w-2.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
