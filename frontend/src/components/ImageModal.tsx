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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative max-w-5xl max-h-[90vh] bg-[#161616] rounded-3xl overflow-hidden border border-[#262626] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white bg-black/70 hover:bg-black rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <img 
          src={imageUrl} 
          alt="Trading Chart Zoomed" 
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
};
