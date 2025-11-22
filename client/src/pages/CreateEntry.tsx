import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { EntryForm } from '../components/entry/EntryForm';
import { useCreateEntry } from '../hooks/useEntries';

export const CreateEntry = () => {
  const navigate = useNavigate();
  const createEntry = useCreateEntry();

  const handleSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      if (data.image) {
        formData.append('image', data.image);
      }

      // Add crop data if available
      if (data.cropData) {
        formData.append('cropData', JSON.stringify(data.cropData));
      }

      formData.append('word', data.word);
      formData.append('reading', data.reading);
      if (data.romaji) formData.append('romaji', data.romaji);
      formData.append('translation', data.translation);
      if (data.notes) formData.append('notes', data.notes);

      // Parse tags from comma-separated string
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];
      formData.append('tags', JSON.stringify(tags));

      if (data.jlptLevel) formData.append('jlptLevel', data.jlptLevel);

      await createEntry.mutateAsync(formData);
      navigate('/');
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal-800 mb-2">
            Create New Entry
          </h1>
          <p className="text-charcoal-600">
            Add a new word to your Japanese image dictionary
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <EntryForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
            isLoading={createEntry.isPending}
          />
        </div>
      </main>
    </div>
  );
};
