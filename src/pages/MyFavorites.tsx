import { useCallback, useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../models/Book";
import { LibraryService } from "../services/LibraryService";
import "./MyFavorites.css";

const libraryService = new LibraryService();

function MyFavorites() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadFavorites = useCallback(async () => {
    setLoading(true);

    try {
      const result = await libraryService.getFavorites();
      setBooks(result);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los favoritos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const removeFavorite = async (book: Book) => {
    try {
      await libraryService.removeFavorite(book.id);
      setBooks((previous) =>
        previous.filter((item) => item.id !== book.id)
      );
      setMessage(`"${book.title}" se eliminó de favoritos.`);
      
      // El mensaje desaparece automáticamente después de 4 segundos (4000 ms)
      setTimeout(() => {
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el favorito."
      );
      
      setTimeout(() => {
        setMessage("");
      }, 4000);
    }
  };

  return (
    <IonPage>
      <IonHeader className="custom-header ion-no-border">
        <IonToolbar className="custom-toolbar">
          <IonButton
            slot="start"
            fill="clear"
            className="back-btn"
            onClick={() => navigate("/home")}
          >
            ← Volver
          </IonButton>

          <IonTitle className="custom-title">Mis favoritos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="favorites-container">
          <h1 className="favorites-title">Mis libros favoritos</h1>

          {message && (
            <IonText color="medium">
              <p role="status" style={{ textAlign: "center", fontWeight: 600, margin: "10px 0" }}>
                {message}
              </p>
            </IonText>
          )}

          {loading ? (
            <div className="home-message">
              <IonSpinner name="crescent" />
              <p>Cargando favoritos...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="home-message">
              <h2>Aún no tienes favoritos</h2>
              <p>
                Busca libros y agrégalos a tus favoritos para
                encontrarlos fácilmente.
              </p>
              <IonButton onClick={() => navigate("/home")}>
                Buscar libros
              </IonButton>
            </div>
          ) : (
            books.map((book) => (
              <IonCard className="favorites-card" key={book.id}>
                <IonCardContent className="favorites-card-content">
                  {book.coverId && (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                      alt={`Portada de ${book.title}`}
                      style={{
                        display: "block",
                        maxWidth: "140px",
                        maxHeight: "210px",
                        objectFit: "contain",
                        margin: "0 auto 12px",
                        borderRadius: "8px",
                      }}
                    />
                  )}

                  <h2 className="favorites-book-title">{book.title}</h2>

                  <p className="favorites-book-author">
                    {book.authors.length
                      ? book.authors.join(", ")
                      : "Autor no disponible"}
                  </p>

                  {book.firstPublishYear && (
                    <p className="favorites-book-year">
                      Primera publicación: {book.firstPublishYear}
                    </p>
                  )}

                  <IonButton
                    expand="block"
                    fill="outline"
                    color="danger"
                    onClick={() => void removeFavorite(book)}
                  >
                    Quitar de favoritos
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default MyFavorites;