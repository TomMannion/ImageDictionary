export interface Entry {
  id: string;
  imageUrl: string;
  word: string;
  reading: string;
  romaji?: string;
  translation: string;
  notes?: string;
  definition?: string;
  tags: string[];
  jlptLevel?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  relatedEntries?: GridRelation[];
}

export interface GridRelation {
  position: number; // 0-8 (4 is center/self)
  entry: Entry;
}

export interface CreateEntryInput {
  word: string;
  reading: string;
  romaji?: string;
  translation: string;
  notes?: string;
  definition?: string;
  tags: string[];
  jlptLevel?: number;
  image: File;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  tags?: string[];
  jlptLevel?: number;
  page?: number;
  limit?: number;
}
