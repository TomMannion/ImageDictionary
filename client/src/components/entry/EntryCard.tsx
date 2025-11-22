import { Entry } from '../../types';
import { FuriganaText } from './FuriganaText';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
}

export const EntryCard = ({ entry, onClick }: EntryCardProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div
      onClick={onClick}
      className="masonry-item card overflow-hidden cursor-pointer group"
    >
      <div className="w-full aspect-square overflow-hidden bg-charcoal-50">
        <img
          src={`${API_BASE_URL}${entry.imageUrl}`}
          alt={entry.word}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="p-3 md:p-5">
        <h3 className="text-xl md:text-3xl font-medium text-charcoal-800 mb-2 md:mb-4 tracking-tight flex items-end">
          <FuriganaText word={entry.word} reading={entry.reading || ''} />
        </h3>
        <p className="text-sm md:text-base text-charcoal-600 mb-2 md:mb-4 leading-relaxed">
          {entry.translation}
        </p>

        {entry.definition && (
          <p className="text-xs md:text-sm text-charcoal-500 mb-2 md:mb-4 leading-relaxed italic hidden md:block">
            {entry.definition}
          </p>
        )}

        {(entry.tags.length > 0 || entry.jlptLevel) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-charcoal-100">
            {entry.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {entry.jlptLevel && (
              <span className="tag border-sage-300 text-sage-700">
                N{entry.jlptLevel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
