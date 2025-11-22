import { stripOkurigana, tokenize, isKanji, isKana, isHiragana, isKatakana } from 'wanakana';
import zip from 'just-zip-it';

type FuriPair = [string, string];
type FuriLocation = [[number, number], string];

/**
 * Combines furigana with kanji into an array of string pairs.
 * @param  {string} word vocab kanji word
 * @param  {string} reading vocab kana reading
 * @param  {string|object} furi furigana placement info
 * @return {Array} furigana/kanji pairs
 */
export function combineFuri(word: string = '', reading: string = '', furi: string | Record<string, string> = ''): FuriPair[] {
  const furiLocs = parseFuri(furi);
  // 義訓/熟字訓 words with a single furi loc: 今日 "0:きょう"
  const isSpecialReading = furiLocs.length === 1 && [...word].every(isKanji);
  const isKanaWord = [...word].every(isKana);
  const isWanikaniMadness = [...reading].some(isHiragana) && [...reading].some(isKatakana);

  if (word === reading || isKanaWord) {
    return [['', word]];
  }

  if (!furi || isSpecialReading || isWanikaniMadness) {
    return basicFuri(word, reading);
  }

  return generatePairs(word, furiLocs);
}

/**
 * Displays simple furigana by removing redundant kana
 */
export function basicFuri(word: string = '', reading: string = ''): FuriPair[] {
  // early return + guard against words like １日 which are tokenized unfavourably
  if ([...word].every((c) => !isKana(c))) {
    return [[reading, word]];
  }

  const [bikago, okurigana] = [
    reading.slice(0, word.length - stripOkurigana(word, { leading: true }).length),
    reading.slice(stripOkurigana(reading, { matchKanji: word }).length),
  ];

  const innerWordTokens = tokenize(removeExtraneousKana(word, bikago, okurigana));
  let innerReadingChars: string | string[] = removeExtraneousKana(reading, bikago, okurigana);

  const kanjiOddKanaEvenRegex = RegExp(
    innerWordTokens.map((char) => (isKanji(char) ? '(.*)' : `(${char})`)).join(''),
  );

  [, ...innerReadingChars] = innerReadingChars.match(kanjiOddKanaEvenRegex) || [];

  const ret = zip(innerReadingChars as string[], innerWordTokens).map(skipRedundantReadings);

  if (bikago) {
    ret.unshift(['', bikago]);
  }

  if (okurigana) {
    ret.push(['', okurigana]);
  }

  return ret;
}

function removeExtraneousKana(str: string = '', leading: string = '', trailing: string = ''): string {
  return str.replace(RegExp(`^${leading}`), '').replace(RegExp(`${trailing}$`), '');
}

function skipRedundantReadings([reading, word = '']: [string, string]): FuriPair {
  return !reading || reading === word ? ['', word] : [reading, word];
}

export function parseFuri(data: string | Record<string, string>): FuriLocation[] {
  return typeof data === 'string' ? parseFuriString(data) : parseFuriObject(data);
}

/**
 * Parses furigana placement object
 */
function parseFuriObject(locations: Record<string, string> = {}): FuriLocation[] {
  return Object.entries(locations).map(([start, content]) => [
    [Number(start), Number(start) + 1],
    content,
  ]);
}

/**
 * Parses furigana placement string
 */
function parseFuriString(locations: string = ''): FuriLocation[] {
  return locations.split(';').map((entry) => {
    const [indexes, content] = entry.split(':');
    const [start, end] = indexes.split('-').map(Number);
    // NOTE: in the JMDict furistring data, the end index is either missing
    // or it is listed as the *start* index of the final char ¯\_(ツ)_/¯
    // so we need to bump it either way to encompass that char
    return [[start, end ? end + 1 : start + 1], content];
  });
}

/**
 * Generates array pairs via furigana location data
 */
export function generatePairs(word: string = '', furiLocs: FuriLocation[] = []): FuriPair[] {
  let prevCharEnd = 0;

  return furiLocs.reduce((pairs: FuriPair[], [[start, end], furiText], index, source) => {
    // if no furigana at this index, add intervening chars
    if (start !== prevCharEnd) {
      pairs.push(['', word.slice(prevCharEnd, start)]);
    }

    // add furigana and associated chars
    pairs.push([furiText, word.slice(start, end)]);

    // if no more furigana left, add any remaining chars/okurigana with blank furi
    if (end < word.length && !source[index + 1]) {
      pairs.push(['', word.slice(end)]);
    }

    prevCharEnd = end;
    return pairs;
  }, []);
}
