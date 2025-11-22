import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generate full hiragana reading from Japanese text (kanji + kana)
 * Calls the backend API to perform the conversion
 * @param text - Japanese text with kanji and/or kana
 * @returns Full hiragana reading
 */
export async function generateReading(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/entries/generate-reading`, {
      text
    });

    return response.data.reading;
  } catch (error) {
    console.error('Error generating reading:', error);
    throw error;
  }
}
