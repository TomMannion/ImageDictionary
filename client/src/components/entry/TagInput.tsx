import { useState, useEffect, useRef } from 'react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  availableTags: string[];
  placeholder?: string;
  className?: string;
}

export const TagInput = ({ value, onChange, availableTags, placeholder, className }: TagInputProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the current tag being typed (after the last comma)
  const getCurrentTag = (text: string): string => {
    const parts = text.split(',');
    return parts[parts.length - 1].trim();
  };

  // Get all tags before the current one
  const getPreviousTags = (text: string): string => {
    const parts = text.split(',');
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join(',') + ',';
  };

  // Update suggestions when input changes
  useEffect(() => {
    const currentTag = getCurrentTag(value);
    setCurrentInput(currentTag);

    if (currentTag.length > 0) {
      // Get existing tags already in the input
      const existingTags = value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Filter suggestions: match current input and exclude already added tags
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(currentTag.toLowerCase()) &&
        !existingTags.includes(tag)
      );

      setSuggestions(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [value, availableTags]);

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    const previousTags = getPreviousTags(value);
    const newValue = previousTags ? `${previousTags} ${suggestion}` : suggestion;
    onChange(newValue);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsDropdownOpen(true);
          }
        }}
      />

      {isDropdownOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-charcoal-300 shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-charcoal-100 transition-colors font-sans text-sm text-charcoal-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
