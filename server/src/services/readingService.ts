// @ts-ignore
import Kuroshiro from 'kuroshiro';
// @ts-ignore
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

let kuroshiroInstance: any = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize Kuroshiro with Kuromoji analyzer (lazy loading)
 * Only loads on first use, then reuses the same instance
 */
async function initializeKuroshiro(): Promise<void> {
  if (kuroshiroInstance) {
    return; // Already initialized
  }

  if (initializationPromise) {
    return initializationPromise; // Initialization in progress
  }

  initializationPromise = (async () => {
    try {
      kuroshiroInstance = new Kuroshiro();
      await kuroshiroInstance.init(new KuromojiAnalyzer());
      console.log('Kuroshiro initialized successfully on server');
    } catch (error) {
      console.error('Failed to initialize Kuroshiro:', error);
      kuroshiroInstance = null;
      initializationPromise = null;
      throw new Error('Failed to initialize reading generator');
    }
  })();

  return initializationPromise;
}

/**
 * Generate full hiragana reading from Japanese text (kanji + kana)
 * @param text - Japanese text with kanji and/or kana
 * @returns Full hiragana reading
 */
export async function generateReading(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    await initializeKuroshiro();

    if (!kuroshiroInstance) {
      throw new Error('Kuroshiro instance not available');
    }

    // Convert to hiragana
    const reading = await kuroshiroInstance.convert(text, {
      mode: 'normal',
      to: 'hiragana',
    });

    return reading;
  } catch (error) {
    console.error('Error generating reading:', error);
    throw error;
  }
}
