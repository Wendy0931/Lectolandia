
import type { Book, BookSearchResult } from "../models/Book";

const API_URL = "https://openlibrary.org/search.json";

interface OpenLibrarySearchResponse {
  numFound?: number;
  num_found?: number;
  docs?: Array<{
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    number_of_pages_median?: number;
    subject?: string[];
  }>;
}

export class OpenLibraryRepository {
  async searchBooks(query: string): Promise<BookSearchResult> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return { books: [], totalResults: 0 };
    }

    const url = new URL(API_URL);

    url.searchParams.set("q", normalizedQuery);
    url.searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,number_of_pages_median,subject"
    );
    url.searchParams.set("limit", "20");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Error al consultar Open Library: ${response.status}`
      );
    }

    const data: OpenLibrarySearchResponse = await response.json();

    const books: Book[] = (data.docs ?? [])
      .filter((item) => Boolean(item.key && item.title))
      .map((item) => ({
        id: item.key!,
        title: item.title!,
        authors: item.author_name ?? [],
        firstPublishYear: item.first_publish_year,
        coverId: item.cover_i,
        pageCount: item.number_of_pages_median,
        subjects: item.subject?.slice(0, 5),
      }));

    return {
      books,
      totalResults: data.numFound ?? data.num_found ?? books.length,
    };
  }

  async getBookDetails(bookId: string): Promise<Book> {
    const normalizedId = bookId.startsWith("/")
        ? bookId
        : `/${bookId}`;

    const url = `https://openlibrary.org${normalizedId}.json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
        `No se pudieron consultar los detalles: ${response.status}`
        );
    }

    const data = await response.json();

    // Obtener la descripción, si está disponible.
    const description =
        typeof data.description === "string"
        ? data.description
        : data.description?.value;

    // Algunos registros incluyen directamente los nombres
    // de los autores y otros solamente sus identificadores.
    let authors: string[] = [];

    if (Array.isArray(data.authors)) {
        authors = (
        await Promise.all(
            data.authors.map(async (item: {
            name?: string;
            author?: { key?: string; name?: string };
            key?: string;
            }) => {
            const directName =
                item.name ?? item.author?.name;

            if (directName) {
                return directName;
            }

            const authorKey =
                item.author?.key ?? item.key;

            if (!authorKey) {
                return null;
            }

            try {
                const authorUrl =
                `https://openlibrary.org${authorKey}.json`;

                const authorResponse = await fetch(authorUrl);

                if (!authorResponse.ok) {
                return null;
                }

                const authorData = await authorResponse.json();

                return typeof authorData.name === "string"
                ? authorData.name
                : null;
            } catch {
                // Si falla la consulta de un autor, conservamos
                // los demás datos del libro.
                return null;
            }
            })
        )
        ).filter(
        (name): name is string => typeof name === "string"
        );
    }

    // En algunos registros de ediciones se utiliza by_statement.
    if (authors.length === 0 && typeof data.by_statement === "string") {
        authors = [data.by_statement];
    }

    const publishDate =
        typeof data.publish_date === "string"
            ? data.publish_date
            : typeof data.first_publish_date === "string"
            ? data.first_publish_date
            : "";

    const yearMatch = publishDate.match(/\d{4}/);

    const firstPublishYear =
        data.first_publish_year ??
        (yearMatch ? Number(yearMatch[0]) : undefined);
        
    return {
        id: normalizedId,
        title: data.title ?? "Título no disponible",
        authors,
        firstPublishYear:
            data.first_publish_year ??
            (data.publish_date?.match(/\d{4}/)?.[0]
            ? Number(data.publish_date.match(/\d{4}/)?.[0])
            : undefined),
        description,
        subjects: data.subjects?.slice(0, 10),
    };
   }
}
