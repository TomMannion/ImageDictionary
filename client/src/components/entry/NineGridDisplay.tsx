import { Entry, GridRelation } from '../../types';
import { FuriganaText } from './FuriganaText';

interface NineGridDisplayProps {
  currentEntry: Entry;
  relatedEntries?: GridRelation[];
  isEditMode: boolean;
  onCellClick: (position: number, entry?: Entry) => void;
  onNavigate?: (entry: Entry) => void;
}

export const NineGridDisplay = ({
  currentEntry,
  relatedEntries = [],
  isEditMode,
  onCellClick,
  onNavigate
}: NineGridDisplayProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  console.log('NineGridDisplay render:', {
    isEditMode,
    relatedEntriesCount: relatedEntries.length,
    relatedEntries: relatedEntries.map(r => ({ position: r.position, word: r.entry?.word, imageUrl: r.entry?.imageUrl })),
    currentEntry: { word: currentEntry.word, imageUrl: currentEntry.imageUrl }
  });

  // Create a map of position to entry
  const positionMap = new Map<number, Entry>();
  relatedEntries.forEach(rel => {
    positionMap.set(rel.position, rel.entry);
  });

  // Center position is always 4 (the current entry)
  positionMap.set(4, currentEntry);

  const renderCell = (position: number) => {
    const entry = positionMap.get(position);
    const isCenter = position === 4;

    if (entry) {
      return (
        <div
          className={`relative aspect-square bg-charcoal-50 overflow-hidden cursor-pointer group ${
            isCenter ? 'ring-2 ring-charcoal-300' : 'border border-charcoal-200'
          }`}
          onClick={() => {
            if (isEditMode && !isCenter) {
              onCellClick(position, entry);
            } else if (!isEditMode && !isCenter && onNavigate) {
              onNavigate(entry);
            }
          }}
        >
          <img
            src={`${API_BASE_URL}${entry.imageUrl}`}
            alt={entry.word}
            className={`w-full h-full object-cover ${
              !isCenter && !isEditMode ? 'group-hover:scale-105 transition-transform duration-300' : ''
            }`}
            onError={(e) => {
              console.error('Image failed to load:', {
                src: e.currentTarget.src,
                entry: entry.word,
                position
              });
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', {
                src: `${API_BASE_URL}${entry.imageUrl}`,
                entry: entry.word,
                position
              });
            }}
          />
          {isEditMode && !isCenter && (
            <button
              className="absolute top-1 right-1 w-6 h-6 bg-rose-700 text-cream-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onCellClick(position, entry);
              }}
            >
              ×
            </button>
          )}
          {!isEditMode && (
            <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/70 transition-all duration-300 flex items-center justify-center pointer-events-none p-2">
              <div className="text-cream-50 text-lg sm:text-2xl md:text-3xl opacity-0 group-hover:opacity-100 transition-opacity text-center break-words leading-tight">
                <FuriganaText word={entry.word} reading={entry.reading || ''} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Empty cell
    if (isEditMode) {
      return (
        <div
          className="aspect-square border-2 border-dashed border-charcoal-200 bg-cream-50 flex items-center justify-center cursor-pointer hover:border-charcoal-400 hover:bg-charcoal-50 transition-all duration-200"
          onClick={() => onCellClick(position)}
        >
          <span className="text-charcoal-400 text-3xl">+</span>
        </div>
      );
    }

    // Empty cell in view mode - invisible
    return <div className="aspect-square bg-transparent"></div>;
  };

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 max-w-full md:max-w-2xl mx-auto">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(position => (
        <div key={position}>
          {renderCell(position)}
        </div>
      ))}
    </div>
  );
};
