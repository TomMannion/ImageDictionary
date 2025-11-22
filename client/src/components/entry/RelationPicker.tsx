import { useState, useEffect } from 'react';
import { Entry } from '../../types';

interface RelationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entry: Entry) => void;
  excludeIds?: string[];
}

export const RelationPicker = ({ isOpen, onClose, onSelect, excludeIds = [] }: RelationPickerProps) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (isOpen) {
      fetchEntries();
    }
  }, [isOpen, searchQuery]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const queryParam = searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(`${API_BASE_URL}/api/entries${queryParam}`);
      const data = await response.json();

      // Filter out excluded entries
      const filtered = data.data.filter((entry: Entry) => !excludeIds.includes(entry.id));
      setEntries(filtered);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-charcoal-900 bg-opacity-70 z-50 flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-cream-50 w-full max-w-full md:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-charcoal-200">
          <h3 className="font-display text-xl md:text-2xl text-charcoal-800 mb-4">Select Related Entry</h3>
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-0 py-2 font-serif text-charcoal-700 bg-transparent border-b border-charcoal-300 focus:border-charcoal-700 outline-none placeholder:text-charcoal-400"
            autoFocus
          />
        </div>

        {/* Entry Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 font-serif text-charcoal-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 font-serif text-charcoal-500">No entries found</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    onSelect(entry);
                    onClose();
                  }}
                >
                  <div className="aspect-square bg-charcoal-50 overflow-hidden border border-charcoal-200 hover:border-charcoal-400 transition-all duration-200">
                    <img
                      src={`${API_BASE_URL}${entry.imageUrl}`}
                      alt={entry.word}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-lg text-charcoal-800">{entry.word}</p>
                    <p className="text-sm text-charcoal-500">{entry.translation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-charcoal-200">
          <button onClick={onClose} className="btn-primary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
