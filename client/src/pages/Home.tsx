import { useState, useEffect, useRef } from 'react';
import { useInfiniteEntries, useTags, useDeleteEntry, useUpdateEntry } from '../hooks/useEntries';
import { Header } from '../components/layout/Header';
import { SearchBar } from '../components/layout/SearchBar';
import { MasonryGrid } from '../components/layout/MasonryGrid';
import { EntryCard } from '../components/entry/EntryCard';
import { EntryModal } from '../components/entry/EntryModal';
import { Entry } from '../types';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{ tags?: string[]; jlptLevel?: number }>({});
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteEntries({
    query: searchQuery || undefined,
    ...filters,
  });

  // Flatten all pages into a single array
  const entries = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const { data: tags } = useTags();
  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry.mutateAsync(id);
    setIsModalOpen(false);
  };

  const handleUpdateEntry = async (id: string, data: FormData) => {
    await updateEntry.mutateAsync({ id, data });
  };

  const handleCardClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleNavigateToEntry = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  // Infinite scroll with IntersectionObserver
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 md:py-12">
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          availableTags={tags || []}
        />

        {isLoading && (
          <div className="text-center py-24">
            <div className="inline-block h-1 w-24 bg-charcoal-200 animate-pulse"></div>
            <p className="mt-6 font-serif text-charcoal-500">Loading your collection...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <p className="font-serif text-rose-600">Unable to load entries. Please try again.</p>
          </div>
        )}

        {entries.length === 0 && !isLoading && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-charcoal-600 mb-3">No entries yet</p>
            <p className="font-serif text-charcoal-500">Start building your visual dictionary</p>
          </div>
        )}

        {entries.length > 0 && (
          <>
            <div className="mb-8 font-serif text-sm text-charcoal-500 tracking-wide">
              {entries.length} of {total} {total === 1 ? 'entry' : 'entries'}
            </div>

            <MasonryGrid columns={{ default: 1, sm: 2, md: 3, lg: 4 }}>
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleCardClick(entry)}
                />
              ))}
            </MasonryGrid>

            {/* Sentinel element for infinite scroll */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-charcoal-500">
                  <div className="inline-block h-1 w-12 bg-charcoal-200 animate-pulse"></div>
                  <p className="font-serif text-sm">Loading more...</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <EntryModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeleteEntry}
        onUpdate={handleUpdateEntry}
        onNavigateToEntry={handleNavigateToEntry}
      />
    </div>
  );
};
