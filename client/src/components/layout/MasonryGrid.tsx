import { ReactNode } from 'react';

interface MasonryGridProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const MasonryGrid = ({ children }: MasonryGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 md:gap-6">
      {children}
    </div>
  );
};
