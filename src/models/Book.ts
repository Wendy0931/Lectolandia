
export interface Book {
  id: string;
  title: string;
  authors: string[];
  firstPublishYear?: number;
  coverId?: number;
  pageCount?: number;
  subjects?: string[];
  description?: string;
}

export interface BookSearchResult {
  books: Book[];
  totalResults: number;
}
