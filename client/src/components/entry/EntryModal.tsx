import { Entry, GridRelation } from '../../types';
import { useEffect, useState } from 'react';
import { NineGridDisplay } from './NineGridDisplay';
import { RelationPicker } from './RelationPicker';
import { EntryForm } from './EntryForm';
import { Area } from 'react-easy-crop';
import { FuriganaText } from './FuriganaText';

interface EntryModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: FormData) => Promise<void>;
  onNavigateToEntry?: (entry: Entry) => void;
}

export const EntryModal = ({ entry, isOpen, onClose, onDelete, onUpdate, onNavigateToEntry }: EntryModalProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const [isEditRelationsMode, setIsEditRelationsMode] = useState(false);
  const [isEditEntryMode, setIsEditEntryMode] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [relations, setRelations] = useState<GridRelation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [fullEntry, setFullEntry] = useState<Entry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryHistory, setEntryHistory] = useState<Entry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);

  // Sync currentEntry with entry prop when modal opens fresh
  // Skip if we're navigating internally (history has entries)
  useEffect(() => {
    if (isOpen && entry && entryHistory.length === 0) {
      setCurrentEntry(entry);
    }
  }, [isOpen, entry, entryHistory.length]);

  // Fetch full entry data when modal opens or current entry changes
  useEffect(() => {
    if (isOpen && currentEntry?.id) {
      fetch(`${API_BASE_URL}/api/entries/${currentEntry.id}`)
        .then(res => res.json())
        .then(data => {
          setFullEntry(data);
          setRelations(data.relatedEntries || []);
        })
        .catch(error => {
          console.error('Error fetching entry:', error);
          setFullEntry(currentEntry);
          setRelations(currentEntry?.relatedEntries || []);
        });
    }
  }, [isOpen, currentEntry?.id, API_BASE_URL]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPickerOpen) {
          setIsPickerOpen(false);
        } else if (isEditRelationsMode) {
          setIsEditRelationsMode(false);
        } else if (isEditEntryMode) {
          setIsEditEntryMode(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsEditRelationsMode(false);
      setIsEditEntryMode(false);
      setEntryHistory([]); // Clear history when modal opens fresh
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCellClick = (position: number, existingEntry?: Entry) => {
    if (existingEntry) {
      // Remove relation
      setRelations(relations.filter(rel => rel.position !== position));
    } else {
      // Add relation
      setSelectedPosition(position);
      setIsPickerOpen(true);
    }
  };

  const handleEntrySelect = (selectedEntry: Entry) => {
    if (selectedPosition !== null) {
      setRelations([
        ...relations.filter(rel => rel.position !== selectedPosition),
        { position: selectedPosition, entry: selectedEntry }
      ]);
      setSelectedPosition(null);
    }
  };

  // Navigate to a related entry (push current to history)
  const handleNavigateToRelated = (targetEntry: Entry) => {
    if (currentEntry) {
      setEntryHistory(prev => [...prev, currentEntry]);
    }
    setCurrentEntry(targetEntry);
    // Note: We don't call onNavigateToEntry here because we're managing
    // navigation internally. The parent's selectedEntry stays as the original
    // entry so when we close the modal, it's consistent.
  };

  // Go back to previous entry in history
  const handleGoBack = () => {
    if (entryHistory.length > 0) {
      const previousEntry = entryHistory[entryHistory.length - 1];
      setEntryHistory(prev => prev.slice(0, -1));
      setCurrentEntry(previousEntry);
    }
  };

  const handleSaveRelations = async () => {
    if (!currentEntry) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/entries/${currentEntry.id}/relations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relations: relations.map(rel => ({
            position: rel.position,
            toEntryId: rel.entry.id
          }))
        })
      });

      if (response.ok) {
        const updatedRelations = await response.json();
        setRelations(updatedRelations);
        if (fullEntry) {
          setFullEntry({ ...fullEntry, relatedEntries: updatedRelations });
        }
        setIsEditRelationsMode(false);
      }
    } catch (error) {
      console.error('Error saving relations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEntry = async (data: { word: string; reading: string; romaji?: string; translation?: string; notes?: string; definition?: string; tags?: string; jlptLevel?: string; image?: File; cropData?: Area }) => {
    if (!currentEntry || !onUpdate) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('word', data.word);
      formData.append('reading', data.reading || '');
      formData.append('romaji', data.romaji || '');
      formData.append('translation', data.translation || '');
      formData.append('notes', data.notes || '');
      formData.append('definition', data.definition || '');
      formData.append('jlptLevel', data.jlptLevel || '');

      // Handle tags - always send tags field (empty array clears tags)
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
      formData.append('tags', JSON.stringify(tagsArray));

      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.cropData) {
        formData.append('cropData', JSON.stringify(data.cropData));
      }

      await onUpdate(currentEntry.id, formData);

      // Refresh entry data
      const response = await fetch(`${API_BASE_URL}/api/entries/${currentEntry.id}`);
      const updatedEntry = await response.json();
      setFullEntry(updatedEntry);
      setRelations(updatedEntry.relatedEntries || []);
      setIsEditEntryMode(false);
    } catch (error) {
      console.error('Error updating entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !currentEntry) return null;

  // Use fullEntry if available, otherwise fall back to currentEntry
  const displayEntry = fullEntry || currentEntry;

  // Get IDs to exclude from picker (current entry + already related entries)
  const excludeIds = [currentEntry.id, ...relations.map(rel => rel.entry.id)];

  return (
    <>
      <div
        className="fixed inset-0 bg-charcoal-900 bg-opacity-60 z-50 flex items-center justify-center p-4 md:p-6"
        onClick={onClose}
      >
        <div
          className="bg-cream-50 w-full max-w-full md:max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditEntryMode ? (
            /* Edit Entry Form */
            <div className="p-4 md:p-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-charcoal-800">Edit Entry</h2>
                <button
                  onClick={() => setIsEditEntryMode(false)}
                  className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                >
                  ← Back to View
                </button>
              </div>
              <EntryForm
                onSubmit={handleUpdateEntry}
                isLoading={isSaving}
                initialData={{
                  word: displayEntry.word,
                  reading: displayEntry.reading || '',
                  romaji: displayEntry.romaji || '',
                  translation: displayEntry.translation || '',
                  notes: displayEntry.notes || '',
                  definition: displayEntry.definition || '',
                  tags: displayEntry.tags.join(', '),
                  jlptLevel: displayEntry.jlptLevel?.toString() || '',
                }}
              />
            </div>
          ) : (
            <>
              {/* 9-Grid Display */}
              <div className="p-4 md:p-10 pb-4 md:pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-2">
                  <h4 className="font-serif text-xs text-charcoal-500 uppercase tracking-widest">
                    {isEditRelationsMode ? 'Edit Related Entries' : 'Related Entries'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {isEditRelationsMode ? (
                      <>
                        <button
                          onClick={() => setIsEditRelationsMode(false)}
                          className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                        >
                          ← Back to View
                        </button>
                        <button
                          onClick={handleSaveRelations}
                          disabled={isSaving}
                          className="bg-charcoal-800 text-cream-50 hover:bg-charcoal-900 font-sans font-light py-1 px-4 text-sm transition-all duration-200 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        {entryHistory.length > 0 && (
                          <button
                            onClick={handleGoBack}
                            className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                          >
                            ← Back
                          </button>
                        )}
                        <button
                          onClick={() => setIsEditEntryMode(true)}
                          className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                        >
                          Edit Entry
                        </button>
                        <button
                          onClick={() => setIsEditRelationsMode(true)}
                          className="border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                        >
                          Edit Relations
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="border border-red-300 text-red-600 hover:bg-red-50 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                          >
                            Delete Entry
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className="bg-charcoal-800 text-cream-50 hover:bg-charcoal-900 font-sans font-light py-1 px-4 text-sm transition-all duration-200"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <NineGridDisplay
                  currentEntry={displayEntry}
                  relatedEntries={relations}
                  isEditMode={isEditRelationsMode}
                  onCellClick={handleCellClick}
                  onNavigate={handleNavigateToRelated}
                />
              </div>

              {/* Content */}
              <div className="p-4 md:p-10 space-y-6 md:space-y-8">
          {/* Main Info */}
          <div>
            <h2 className="text-3xl md:text-5xl font-medium text-charcoal-800 mb-4 tracking-tight">
              <FuriganaText word={displayEntry.word} reading={displayEntry.reading || ''} />
            </h2>
            {displayEntry.romaji && (
              <p className="text-lg text-charcoal-400 italic">
                {displayEntry.romaji}
              </p>
            )}
          </div>

          {/* Translation */}
          {displayEntry.translation && (
            <div className="border-t border-charcoal-100 pt-6">
              <h3 className="text-xs text-charcoal-500 mb-3 uppercase tracking-widest" style={{letterSpacing: '0.1em'}}>
                Translation
              </h3>
              <p className="text-xl md:text-2xl text-charcoal-700 leading-relaxed">
                {displayEntry.translation}
              </p>
            </div>
          )}

          {/* Definition */}
          {displayEntry.definition && (
            <div className="border-t border-charcoal-100 pt-6">
              <h3 className="text-xs text-charcoal-500 mb-3 uppercase tracking-widest" style={{letterSpacing: '0.1em'}}>
                Definition
              </h3>
              <p className="text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                {displayEntry.definition}
              </p>
            </div>
          )}

          {/* Notes */}
          {displayEntry.notes && (
            <div className="border-t border-charcoal-100 pt-6">
              <h3 className="text-xs text-charcoal-500 mb-3 uppercase tracking-widest" style={{letterSpacing: '0.1em'}}>
                Notes
              </h3>
              <p className="text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                {displayEntry.notes}
              </p>
            </div>
          )}

          {/* Tags and JLPT Level */}
          {(displayEntry.tags.length > 0 || displayEntry.jlptLevel) && (
            <div className="flex flex-wrap gap-2 border-t border-charcoal-100 pt-6">
              {displayEntry.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              {displayEntry.jlptLevel && (
                <span className="tag border-sage-300 text-sage-700">
                  N{displayEntry.jlptLevel}
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="font-serif text-xs text-charcoal-400 border-t border-charcoal-100 pt-6 space-y-1">
            <p>Added {new Date(displayEntry.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {displayEntry.updatedAt !== displayEntry.createdAt && (
              <p>Updated {new Date(displayEntry.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-charcoal-100">
                  <button
                    onClick={onClose}
                    className="btn-primary ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RelationPicker */}
      <RelationPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleEntrySelect}
        excludeIds={excludeIds}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-charcoal-900 bg-opacity-80 z-[60] flex items-center justify-center p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-cream-50 max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl text-charcoal-800 mb-4">Delete Entry?</h3>
            <p className="font-sans text-charcoal-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{displayEntry?.word}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-charcoal-300 text-charcoal-600 hover:bg-charcoal-100 font-sans font-light py-2 px-6 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDelete && currentEntry) {
                    onDelete(currentEntry.id);
                  }
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 text-cream-50 hover:bg-red-700 font-sans font-light py-2 px-6 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
