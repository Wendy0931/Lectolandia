import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { LibraryService } from "../services/LibraryService";
import { useState } from "react";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonImg,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import type { Book } from "../models/Book";
import { BookService } from "../services/BookService";
import "./Home.css";
import "../theme/variables.css";

const bookService = new BookService();
const libraryService = new LibraryService();

function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [libraryMessage, setLibraryMessage] = useState("");
  const [savingBookId, setSavingBookId] = useState<string | null>(null);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [savingFavoriteId, setSavingFavoriteId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      setError("No se pudo cerrar la sesión. Inténtalo nuevamente.");
      return;
    }

    navigate("/login", { replace: true });
  };

  const handleAddToLibrary = async (book: Book) => {
    setLibraryMessage("");
    setSavingBookId(book.id);

    try {
      await libraryService.addBook(book);
      setLibraryMessage(`"${book.title}" se agregó a tu biblioteca.`);
    } catch (err) {
      setLibraryMessage(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el libro."
      );
    } finally {
      setSavingBookId(null);
      // El mensaje de biblioteca desaparece después de 4 segundos (4000 ms)
      setTimeout(() => {
        setLibraryMessage("");
      }, 1000);
    }
  };

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setError("Escribe al menos dos caracteres para buscar.");
      setBooks([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const result = await bookService.searchBooks(query);

      setBooks(result.books);
      setTotalResults(result.totalResults);
      setSearched(true);
    } catch (err) {
      console.error("Error al buscar libros:", err);
      setBooks([]);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible realizar la búsqueda."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (book: Book) => {
    setFavoriteMessage("");
    setSavingFavoriteId(book.id);

    try {
      await libraryService.addFavorite(book);

      setFavoriteMessage(
        `"${book.title}" se agregó a tus favoritos.`
      );
    } catch (error) {
      setFavoriteMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el favorito."
      );
    } finally {
      setSavingFavoriteId(null);
      // El mensaje de favoritos desaparece después de 4 segundos (4000 ms)
      setTimeout(() => {
        setFavoriteMessage("");
      }, 1000);
    }
  };

  return (
    <IonPage>
      <IonHeader className="custom-header">
        <IonToolbar className="custom-toolbar">
          <IonTitle className="custom-title">📖 Lectolandia</IonTitle>

          <IonButton
            slot="end"
            fill="clear"
            className="logout-btn"
            onClick={() => void handleLogout()}
          >
            Cerrar sesión
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <section className="home-container">
          <div className="home-intro">
            <h1>Encuentra tu próximo libro</h1>

            <p>
              Explora libros por título o autor y descubre nuevas
              historias para leer.
            </p>
          </div>
          
          <div className="home-quick-nav">
            <button className="quick-nav-btn library-btn" onClick={() => navigate("/library")}>
              <span>Mi biblioteca</span>
            </button>

            <button className="quick-nav-btn favorites-btn" onClick={() => navigate("/favorites")}>
              <span>Mis favoritos</span>
            </button>
          </div>

          <div className="search-container">
            <div className="search-bar-wrapper">
              <IonSearchbar
                value={query}
                placeholder="Título o nombre del autor"
                debounce={0}
                onIonInput={(event) =>
                  setQuery(event.detail.value ?? "")
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSearch();
                  }
                }}
                aria-label="Buscar libros por título o autor"
              />

              <IonButton
                onClick={() => void handleSearch()}
                disabled={loading}
              >
                Buscar
              </IonButton>
            </div>
          </div>

          {/* MENSAJE DE BIBLIOTECA EN LETRAS ROJAS */}
          {libraryMessage && (
            <IonText color="danger">
              <p role="status" style={{ textAlign: "center", fontWeight: 600, margin: "10px 0" }}>
                {libraryMessage}
              </p>
            </IonText>
          )}

          {favoriteMessage && (
            <IonText
              color={
                favoriteMessage.toLowerCase().includes("no se pudo") ||
                favoriteMessage.toLowerCase().includes("ya está")
                  ? "danger"
                  : "success"
              }
            >
              <p role="status" style={{ textAlign: "center", fontWeight: 600, margin: "10px 0" }}>
                {favoriteMessage}
              </p>
            </IonText>
          )}

          {loading && (
            <div className="home-message">
              <IonSpinner name="crescent" />
              <IonText>
                <p>Buscando libros...</p>
              </IonText>
            </div>
          )}

          {!loading && error && (
            <div className="home-message error-message" role="alert">
              <IonText color="danger">
                <h3>No se pudo completar la búsqueda</h3>
                <p>{error}</p>
              </IonText>

              <IonButton
                fill="outline"
                onClick={() => void handleSearch()}
              >
                Intentar nuevamente
              </IonButton>
            </div>
          )}

          {!loading && searched && !error && (
            <section className="results-section">
              <h2>Resultados de búsqueda</h2>

              <p className="results-count">
                {totalResults > 0
                  ? `Se encontraron ${totalResults} resultados. Se muestran hasta ${books.length} libros.`
                  : "No se encontraron resultados."}
              </p>

              {books.length === 0 ? (
                <div className="home-message">
                  <h3>No encontramos libros</h3>
                  <p>
                    Prueba con otro título o revisa la escritura
                    del nombre del autor.
                  </p>
                </div>
              ) : (
                <div className="books-grid">
                  {books.map((book) => (
                    <IonCard
                      className="book-card"
                      key={book.id}
                    >
                      <div className="book-cover-wrapper">
                        {book.coverId ? (
                          <IonImg
                            className="book-cover"
                            src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                            alt={`Portada de ${book.title}`}
                          />
                        ) : (
                          <div className="cover-placeholder">
                            <span>Sin portada disponible</span>
                          </div>
                        )}

                        {/* Botón flotante con corazón sin rellenar */}
                        <button 
                          className="favorite-heart-btn" 
                          onClick={() => void handleAddFavorite(book)}
                          disabled={savingFavoriteId === book.id}
                          title="Agregar a favoritos"
                        >
                          💙
                        </button>
                      </div>

                      <IonCardHeader>
                        <IonCardTitle>
                          {book.title}
                        </IonCardTitle>
                      </IonCardHeader>

                      <IonCardContent>
                        <p>
                          <strong>Autor:</strong>{" "}
                          {book.authors.length > 0
                            ? book.authors.join(", ")
                            : "No disponible"}
                        </p>

                        <p>
                          <strong>Año:</strong>{" "}
                          {book.firstPublishYear ?? "No disponible"}
                        </p>

                        {book.pageCount && (
                          <p>
                            <strong>Páginas:</strong>{" "}
                            {book.pageCount}
                            <span className="data-note">
                              {" "} (estimación)
                            </span>
                          </p>
                        )}

                        {/* Fila inferior con el botón de biblioteca y el enlace de detalles */}
                        <div className="card-actions-row">
                          <IonButton
                            className="btn-library-inline"
                            expand="block"
                            onClick={() => void handleAddToLibrary(book)}
                            disabled={savingBookId === book.id}
                          >
                            {savingBookId === book.id ? "Guardando..." : "Biblioteca"}
                          </IonButton>

                          <button
                            className="details-link"
                            onClick={() =>
                              navigate(`/book?id=${encodeURIComponent(book.id)}`)
                            }
                          >
                            Ver detalles
                          </button>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              )}
            </section>
          )}

          {!loading && !searched && !error && (
            <div className="home-message welcome-message">
              <h2>¿Qué te gustaría leer?</h2>
              <p>
                Escribe un título o el nombre de un autor
                para comenzar tu búsqueda.
              </p>
            </div>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
}

export default Home;