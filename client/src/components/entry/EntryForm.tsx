import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { ImageCropModal } from './ImageCropModal';
import { Area } from 'react-easy-crop';
import { TagInput } from './TagInput';
import { useTags } from '../../hooks/useEntries';
import { generateReading } from '../../utils/readingGenerator';

const entrySchema = z.object({
  word: z.string().min(1, 'Japanese word is required'),
  reading: z.string().optional(),
  romaji: z.string().optional(),
  translation: z.string().optional(),
  notes: z.string().optional(),
  definition: z.string().optional(),
  tags: z.string().optional(),
  jlptLevel: z.string().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface EntryFormProps {
  onSubmit: (data: EntryFormData & { image?: File; cropData?: Area }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<EntryFormData>;
}

export const EntryForm = ({ onSubmit, onCancel, isLoading, initialData }: EntryFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropData, setCropData] = useState<Area | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [tagsValue, setTagsValue] = useState(initialData?.tags || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const { data: tags } = useTags();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: initialData,
  });

  const checkIfNeedsCrop = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const needsCrop = img.width !== img.height || img.width > 1200 || img.height > 1200;
        resolve(needsCrop);
      };
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const previewUrl = reader.result as string;
          setImagePreview(previewUrl);

          // Check if image needs cropping
          const needsCrop = await checkIfNeedsCrop(file);
          if (needsCrop) {
            setIsCropModalOpen(true);
          }
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const handleCropComplete = (croppedAreaPixels: Area) => {
    setCropData(croppedAreaPixels);
    setIsCropModalOpen(false);
  };

  const handleFetchUrl = async () => {
    if (!imageUrl.trim()) return;

    setIsLoadingUrl(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/entries/fetch-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) throw new Error('Failed to fetch image');

      const data = await response.json();

      // Create a File object from the fetched image
      const fileResponse = await fetch(`${API_BASE_URL}/uploads/${data.filename}`);
      const blob = await fileResponse.blob();
      const file = new File([blob], data.filename, { type: blob.type });

      setSelectedImage(file);
      setImagePreview(imageUrl); // Use original URL for preview

      // Check if needs cropping
      const needsCrop = await checkIfNeedsCrop(file);
      if (needsCrop) {
        setIsCropModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching image URL:', error);
      alert('Failed to fetch image from URL. Please try a direct image link.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleGenerateReading = async () => {
    const wordValue = watch('word');
    if (!wordValue || wordValue.trim() === '') {
      return;
    }

    setIsGeneratingReading(true);
    try {
      const reading = await generateReading(wordValue);
      setValue('reading', reading);
    } catch (error) {
      console.error('Failed to generate reading:', error);
      alert('Failed to generate reading. Please try again or enter it manually.');
    } finally {
      setIsGeneratingReading(false);
    }
  };

  const handleFormSubmit = (data: EntryFormData) => {
    onSubmit({
      ...data,
      tags: tagsValue,
      image: selectedImage || undefined,
      cropData: cropData || undefined,
    });
  };

  const handleTagsChange = (value: string) => {
    setTagsValue(value);
    setValue('tags', value);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image *
        </label>

        {/* Toggle between upload and URL */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUseUrl(false)}
            className={`px-4 py-2 text-sm transition-colors ${
              !useUrl
                ? 'bg-charcoal-800 text-cream-50'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUseUrl(true)}
            className={`px-4 py-2 text-sm transition-colors ${
              useUrl
                ? 'bg-charcoal-800 text-cream-50'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Paste URL
          </button>
        </div>

        {!useUrl ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  Click or drag to change image
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: JPEG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={isLoadingUrl || !imageUrl.trim()}
                className="bg-charcoal-800 text-cream-50 hover:bg-charcoal-900 px-6 py-2 disabled:opacity-50 transition-colors"
              >
                {isLoadingUrl ? 'Loading...' : 'Fetch'}
              </button>
            </div>
            {imagePreview && (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <p className="text-sm text-gray-600 text-center">
                  Image loaded successfully
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Japanese Word */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Japanese Word (漢字) *
        </label>
        <input
          {...register('word')}
          type="text"
          className="input-field"
          placeholder="例: 食べる"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the word with kanji. Furigana will auto-generate from the reading field below.
        </p>
        {errors.word && (
          <p className="mt-1 text-sm text-red-600">{errors.word.message}</p>
        )}
      </div>

      {/* Reading */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reading (ひらがな/カタカナ) (Optional)
        </label>
        <div className="relative">
          <input
            {...register('reading')}
            type="text"
            className="input-field pr-24 md:pr-32"
            placeholder="例: たべる"
          />
          <button
            type="button"
            onClick={handleGenerateReading}
            disabled={!watch('word') || isGeneratingReading}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-xs px-3 py-1 bg-charcoal-800 text-cream-50 hover:bg-charcoal-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingReading ? '⏳ Generating...' : '✨ Generate'}
          </button>
        </div>
        {errors.reading && (
          <p className="mt-1 text-sm text-red-600">{errors.reading.message}</p>
        )}
      </div>

      {/* Romaji */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Romaji (Optional)
        </label>
        <input
          {...register('romaji')}
          type="text"
          className="input-field"
          placeholder="taberu"
        />
      </div>

      {/* Translation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Translation (Optional)
        </label>
        <input
          {...register('translation')}
          type="text"
          className="input-field"
          placeholder="to eat"
        />
      </div>

      {/* Definition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Definition (Optional)
        </label>
        <textarea
          {...register('definition')}
          rows={3}
          className="input-field"
          placeholder="Usage context, quantifier rules, specific scenarios, etc."
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe when and how to use this word (e.g., quantifier usage, situational context).
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <TagInput
          value={tagsValue}
          onChange={handleTagsChange}
          availableTags={tags || []}
          placeholder="verb, food, beginner"
          className="input-field"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate multiple tags with commas. Start typing to see suggestions.
        </p>
      </div>

      {/* JLPT Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JLPT Level (Optional)
        </label>
        <select {...register('jlptLevel')} className="input-field">
          <option value="">Select JLPT Level</option>
          <option value="5">N5 (Beginner)</option>
          <option value="4">N4</option>
          <option value="3">N3 (Intermediate)</option>
          <option value="2">N2</option>
          <option value="1">N1 (Advanced)</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className="input-field"
          placeholder="Additional notes, usage examples, etc."
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-2 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : (
            'Save Entry'
          )}
        </button>
      </div>

      {/* Processing indicator for GIFs */}
      {isLoading && selectedImage && selectedImage.type === 'image/gif' && (
        <div className="mt-4 p-4 bg-charcoal-50 border border-charcoal-200 rounded">
          <p className="text-sm text-charcoal-600 font-serif">
            <span className="font-medium">Processing animated image...</span> This may take a moment as all frames are being optimized.
          </p>
        </div>
      )}

      {/* Crop Modal */}
      {imagePreview && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageUrl={imagePreview}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          isAnimated={selectedImage?.type === 'image/gif'}
        />
      )}
    </form>
  );
};
