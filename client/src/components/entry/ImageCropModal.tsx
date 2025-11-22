import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedAreaPixels: Area) => void;
  isAnimated?: boolean;
}

export const ImageCropModal = ({ isOpen, imageUrl, onClose, onCropComplete, isAnimated }: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  const handleUseFull = () => {
    // Auto-crop to center square
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      onCropComplete({ x, y, width: size, height: size });
    };
    img.src = imageUrl;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-charcoal-900 bg-opacity-80 z-50 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-cream-50 w-full max-w-full md:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-charcoal-200">
          <h3 className="font-serif text-xl md:text-2xl text-charcoal-800">Crop Image to Square</h3>
          <p className="text-sm text-charcoal-500 mt-1">
            Adjust the crop area to select the part of your image you'd like to use
          </p>
          {isAnimated && (
            <div className="mt-3 p-3 bg-charcoal-50 border border-charcoal-200 rounded">
              <p className="text-sm text-charcoal-600">
                <span className="font-medium">Animated image detected.</span> The crop will be applied to all frames to preserve animation.
              </p>
            </div>
          )}
        </div>

        <div className="relative h-64 md:h-96 bg-charcoal-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 md:gap-4 pt-4 border-t border-charcoal-100">
            <button
              onClick={onClose}
              className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-2 px-3 md:px-6 text-xs md:text-base transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUseFull}
              className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-2 px-3 md:px-6 text-xs md:text-base transition-all duration-200"
            >
              Auto-Crop
            </button>
            <button
              onClick={handleSave}
              className="btn-primary ml-auto text-xs md:text-base"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
