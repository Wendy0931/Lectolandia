
import { OpenLibraryRepository } from "../repositories/OpenLibraryRepository";

const openLibraryRepository = new OpenLibraryRepository();

export class BookService {
  async searchBooks(query: string) {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      throw new Error(
        "Escribe al menos dos caracteres para buscar libros."
      );
    }

    return openLibraryRepository.searchBooks(normalizedQuery);
  }

  async getBookDetails(bookId: string) {
    return openLibraryRepository.getBookDetails(bookId);
  }
}
