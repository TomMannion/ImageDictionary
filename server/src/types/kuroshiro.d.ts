declare module 'kuroshiro' {
  export interface ConvertOptions {
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
    to?: 'hiragana' | 'katakana' | 'romaji';
    romajiSystem?: 'nippon' | 'passport' | 'hepburn';
  }

  export default class Kuroshiro {
    /**
     * Initialize Kuroshiro with an analyzer
     * @param analyzer - The analyzer to use (e.g., KuromojiAnalyzer)
     */
    init(analyzer: any): Promise<void>;

    /**
     * Convert Japanese text to different formats
     * @param text - Japanese text to convert
     * @param options - Conversion options
     */
    convert(text: string, options?: ConvertOptions): Promise<string>;
  }
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor(options?: any);
  }
}
