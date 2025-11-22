import { useMemo } from 'react';
import { combineFuri } from '../../utils/furigana';

interface FuriganaTextProps {
  word: string;
  reading?: string;
  className?: string;
}

const wrapperStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexFlow: 'row wrap',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const pairStyle: React.CSSProperties = {
  display: 'inline-flex',
  fontSize: '24px',
  lineHeight: '1',
  flexFlow: 'column nowrap',
  justifyContent: 'flex-end',
  alignItems: 'center',
  alignSelf: 'flex-end',
};

const furiStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.5em',
  letterSpacing: '-0.02em',
  margin: '0 0.1em',
  paddingTop: '0.2em',
  paddingBottom: '0.1em',
  userSelect: 'none',
  opacity: 0.9,
};

const textStyle: React.CSSProperties = {
  display: 'block',
};

/**
 * React-furi inspired furigana component.
 *
 * @param word - Japanese text (with kanji)
 * @param reading - Full kana reading (optional, auto-inferred if not provided)
 */
export const FuriganaText = ({ word, reading = '', className = '' }: FuriganaTextProps) => {
  const pairs = useMemo(() => combineFuri(word, reading, ''), [word, reading]);

  return (
    <span lang="ja" style={wrapperStyle} className={className}>
      {pairs.map(([furiText, text], index) => {
        const uniquePairKey = text + index;

        return (
          <span key={uniquePairKey} style={pairStyle}>
            <span style={furiStyle}>{furiText || '\u00A0'}</span>
            <span style={textStyle}>{text}</span>
          </span>
        );
      })}
    </span>
  );
};
