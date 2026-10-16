import { useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Book } from "../models/Book";
import { BookService } from "../services/BookService";
import "./BookDetails.css"; // <-- Importamos los estilos exclusivos

const bookService = new BookService();

function BookDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("id");

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!bookId) {
        setError("No se especificó el libro que deseas consultar.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await bookService.getBookDetails(bookId);

        if (active) {
          setBook(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los detalles del libro."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [bookId]);

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

                <IonTitle className="custom-title">Detalles del libro</IonTitle>
            </IonToolbar>
        </IonHeader>

      <IonContent className="ion-padding">
        <div className="details-container">
          {loading ? (
            <div className="home-message">
              <IonSpinner name="crescent" />
              <p>Cargando información del libro...</p>
            </div>
          ) : error ? (
            <IonText color="danger">
              <p role="alert" style={{ textAlign: "center", fontWeight: 600 }}>{error}</p>
            </IonText>
          ) : book ? (
            <div className="details-card">
              {book.coverId && (
                <img
                  className="details-cover"
                  src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`}
                  alt={`Portada de ${book.title}`}
                />
              )}

              <h1 className="details-title">{book.title}</h1>

              <p className="details-author">
                {book.authors.length
                  ? book.authors.join(", ")
                  : "Autor no disponible en esta consulta"}
              </p>

              <div>
                <h2 className="details-section-title">Descripción</h2>
                {book.description ? (
                  <p className="details-description">{book.description}</p>
                ) : (
                  <p className="details-description" style={{ color: "#94a3b8" }}>
                    No hay una descripción disponible para este libro.
                  </p>
                )}
              </div>

              {book.subjects && book.subjects.length > 0 && (
                <div>
                  <h2 className="details-section-title">Temas</h2>
                  <ul className="details-subjects-list">
                    {book.subjects.slice(0, 15).map((subject) => (
                      <li className="details-subject-tag" key={subject}>
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <IonButton
                expand="block"
                onClick={() => navigate("/home")}
              >
                Volver a buscar libros
              </IonButton>
            </div>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default BookDetails;