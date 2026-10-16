
import type { Book } from "../models/Book";
import {
  SupabaseRepository,
  type ReadingStatus,
} from "../repositories/SupabaseRepository";

const repository = new SupabaseRepository();

export class LibraryService {
  async addBook(book: Book): Promise<void> {
    if (!book.id || !book.title.trim()) {
      throw new Error("El libro no tiene información suficiente.");
    }

    return repository.addBookToLibrary(book);
  }

  async getLibrary() {
    return repository.getMyLibrary();
  }

  async changeStatus(
    libraryId: string,
    status: ReadingStatus
  ): Promise<void> {
    return repository.updateBookStatus(libraryId, status);
  }

  async updateProgress(
    libraryId: string,
    pagesRead: number,
    totalPages: number | null
  ): Promise<void> {
    return repository.updateReadingProgress(
      libraryId,
      pagesRead,
      totalPages
    );
  }

  async removeBook(libraryId: string): Promise<void> {
    return repository.removeBookFromLibrary(libraryId);
  }

  async addFavorite(book: Book): Promise<void> {
    if (!book.id || !book.title.trim()) {
        throw new Error("El libro no tiene información suficiente.");
    }

    return repository.addFavorite(book);
  }

   async getFavorites(): Promise<Book[]> {
    return repository.getMyFavorites();
   }

   async removeFavorite(bookKey: string): Promise<void> {
    return repository.removeFavorite(bookKey);
   }
}
