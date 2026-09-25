import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative max-w-5xl max-h-[92vh] bg-[#161616] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#262626] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 text-white bg-black/70 hover:bg-black rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <img 
          src={imageUrl} 
          alt="Trading Chart Zoomed" 
          className="w-full h-auto max-h-[88vh] object-contain rounded-xl sm:rounded-2xl"
        />
      </div>
    </div>
  );
};
