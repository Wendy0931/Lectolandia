
import { supabase } from "../config/supabaseClient";
import type { Book } from "../models/Book";

export type ReadingStatus = "por_leer" | "leyendo" | "terminado";

export interface LibraryBook extends Book {
  libraryId: string;
  status: ReadingStatus;
  pagesRead: number;
}

export class SupabaseRepository {
  async addBookToLibrary(book: Book): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Debes iniciar sesión para guardar libros.");
    }

    const { error } = await supabase
      .from("library_books")
      .insert({
        user_id: user.id,
        book_key: book.id,
        title: book.title,
        authors: book.authors,
        cover_id: book.coverId ?? null,
        first_publish_year: book.firstPublishYear ?? null,
        total_pages: book.pageCount ?? null,
        pages_read: 0,
        status: "por_leer",
      });

    if (error?.code === "23505") {
      throw new Error("Este libro ya está en tu biblioteca.");
    }

    if (error) {
      throw error;
    }
  }

  async getMyLibrary(): Promise<LibraryBook[]> {
    const { data, error } = await supabase
      .from("library_books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.book_key,
      libraryId: row.id,
      title: row.title,
      authors: row.authors ?? [],
      coverId: row.cover_id ?? undefined,
      firstPublishYear: row.first_publish_year ?? undefined,
      pageCount: row.total_pages ?? undefined,
      status: row.status as ReadingStatus,
      pagesRead: row.pages_read,
    }));
  }

  async updateBookStatus(
    libraryId: string,
    status: ReadingStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("library_books")
      .update({ status })
      .eq("id", libraryId);

    if (error) throw error;
  }

  async updateReadingProgress(
    libraryId: string,
    pagesRead: number,
    totalPages: number | null
  ): Promise<void> {
    if (!Number.isInteger(pagesRead) || pagesRead < 0) {
      throw new Error("Las páginas leídas deben ser un entero no negativo.");
    }

    if (
      totalPages !== null &&
      (!Number.isInteger(totalPages) ||
        totalPages <= 0 ||
        pagesRead > totalPages)
    ) {
      throw new Error("Revisa el total de páginas y el progreso.");
    }

    const { error } = await supabase
      .from("library_books")
      .update({
        pages_read: pagesRead,
        total_pages: totalPages,
      })
      .eq("id", libraryId);

    if (error) throw error;
  }

  async removeBookFromLibrary(libraryId: string): Promise<void> {
    const { error } = await supabase
      .from("library_books")
      .delete()
      .eq("id", libraryId);

    if (error) throw error;
  }

  async addFavorite(book: Book): Promise<void> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
        throw new Error("Debes iniciar sesión para guardar favoritos.");
    }

    const { error } = await supabase.from("favorite_books").insert({
        user_id: user.id,
        book_key: book.id,
        title: book.title,
        authors: book.authors,
        cover_id: book.coverId ?? null,
        first_publish_year: book.firstPublishYear ?? null,
    });

    if (error?.code === "23505") {
        throw new Error("Este libro ya está en tus favoritos.");
    }

    if (error) throw error;
   }

    async getMyFavorites(): Promise<Book[]> {
        const { data, error } = await supabase
            .from("favorite_books")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return (data ?? []).map((row) => ({
            id: row.book_key,
            title: row.title,
            authors: row.authors ?? [],
            coverId: row.cover_id ?? undefined,
            firstPublishYear: row.first_publish_year ?? undefined,
        }));
    }

    async removeFavorite(bookKey: string): Promise<void> {
        const { error } = await supabase
            .from("favorite_books")
            .delete()
            .eq("book_key", bookKey);

        if (error) throw error;
    }
}
