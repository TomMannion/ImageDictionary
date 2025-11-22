import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: { tags?: string[]; jlptLevel?: number }) => void;
  availableTags?: string[];
}

export const SearchBar = ({ onSearch, onFilterChange, availableTags = [] }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedJlptLevel, setSelectedJlptLevel] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        jlptLevel: selectedJlptLevel
      });
    }
  }, [selectedTags, selectedJlptLevel, onFilterChange]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-cream-50 mb-6 md:mb-12">
      <div className="flex gap-2 md:gap-4 items-end">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search your collection..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field text-lg"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary pb-3"
        >
          Filter {(selectedTags.length > 0 || selectedJlptLevel) && `(${selectedTags.length + (selectedJlptLevel ? 1 : 0)})`}
        </button>
      </div>

      {showFilters && (
        <div className="mt-8 pt-8 border-t border-charcoal-100 space-y-6">
          <div>
            <label className="block font-serif text-sm text-charcoal-600 mb-4 uppercase tracking-widest" style={{fontSize: '0.7rem', letterSpacing: '0.1em'}}>
              JLPT Level
            </label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => setSelectedJlptLevel(undefined)}
                className={`px-3 py-2 md:px-4 md:py-2 border font-sans font-light text-sm transition-all ${
                  !selectedJlptLevel
                    ? 'border-charcoal-700 text-charcoal-700 bg-charcoal-700 text-cream-50'
                    : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-400'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedJlptLevel(level)}
                  className={`px-3 py-2 md:px-4 md:py-2 border font-sans font-light text-sm transition-all ${
                    selectedJlptLevel === level
                      ? 'border-charcoal-700 text-charcoal-700 bg-charcoal-700 text-cream-50'
                      : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-400'
                  }`}
                >
                  N{level}
                </button>
              ))}
            </div>
          </div>

          {availableTags.length > 0 && (
            <div>
              <label className="block font-serif text-sm text-charcoal-600 mb-4 uppercase tracking-widest" style={{fontSize: '0.7rem', letterSpacing: '0.1em'}}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag ${
                      selectedTags.includes(tag)
                        ? 'border-charcoal-700 text-charcoal-800 bg-charcoal-50'
                        : ''
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
