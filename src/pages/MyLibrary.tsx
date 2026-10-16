import { useCallback, useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";

import { useNavigate } from "react-router-dom";
import { LibraryService } from "../services/LibraryService";
import type {
  LibraryBook,
  ReadingStatus,
} from "../repositories/SupabaseRepository";
import "./MyLibrary.css"; // Archivo de estilos dedicado

const libraryService = new LibraryService();

function MyLibrary() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await libraryService.getLibrary();
      setBooks(result);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la biblioteca."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const changeStatus = async (
    book: LibraryBook,
    status: ReadingStatus
  ) => {
    setMessage("");

    try {
      await libraryService.changeStatus(book.libraryId, status);
      await loadLibrary();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado."
      );
    }
  };

  const removeBook = async (book: LibraryBook) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar "${book.title}" de tu biblioteca?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      await libraryService.removeBook(book.libraryId);
      await loadLibrary();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el libro."
      );
    }
  };

  const saveProgress = async (book: LibraryBook) => {
    setMessage("");

    const inputValue = progressInputs[book.libraryId] ?? String(book.pagesRead);
    const pagesRead = Number(inputValue);
    const totalPages = book.pageCount ?? null;

    if (
        inputValue.trim() === "" ||
        !Number.isInteger(pagesRead) ||
        pagesRead < 0
    ) {
        setMessage("Introduce un número entero de páginas válido.");
        return;
    }

    if (totalPages !== null && pagesRead > totalPages) {
        setMessage(
        `El progreso no puede superar las ${totalPages} páginas del libro.`
        );
        return;
    }

    if (
        book.status === "terminado" &&
        totalPages !== null &&
        pagesRead !== totalPages
    ) {
        setMessage(
        "Un libro terminado debe tener registradas todas sus páginas."
        );
        return;
    }

    try {
        await libraryService.updateProgress(
        book.libraryId,
        pagesRead,
        totalPages
        );

        setMessage(`Progreso actualizado: ${book.title}.`);
        await loadLibrary();
    } catch (err) {
        setMessage(
        err instanceof Error
            ? err.message
            : "No se pudo guardar el progreso."
        );
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

          <IonTitle className="custom-title">Mi biblioteca</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="library-container">
          <h1 className="library-title">Mis libros</h1>

          {message && (
            <IonText color="danger">
              <p role="alert">{message}</p>
            </IonText>
          )}

          {loading ? (
            <div className="home-message">
              <IonSpinner name="crescent" />
              <p>Cargando tu biblioteca...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="home-message">
              <h2>Tu biblioteca está vacía</h2>
              <p>
                Busca libros y agrégalos para comenzar tu colección.
              </p>
              <IonButton onClick={() => navigate("/home")}>
                Buscar libros
              </IonButton>
            </div>
          ) : (
            books.map((book) => {
              const percentage =
                book.pageCount && book.pageCount > 0
                  ? Math.min(
                      100,
                      Math.round((book.pagesRead / book.pageCount) * 100)
                    )
                  : 0;

              return (
                <IonCard className="library-card" key={book.libraryId}>
                  <IonCardContent className="library-card-content">
                    <h2 className="library-book-title">{book.title}</h2>

                    <p className="library-book-author">
                      {book.authors.length
                        ? book.authors.join(", ")
                        : "Autor no disponible"}
                    </p>

                    <p className="library-status-text">
                      Estado: <strong>{book.status.replace("_", " ")}</strong>
                    </p>

                    <IonSelect
                      label="Cambiar estado"
                      value={book.status}
                      interface="popover"
                      onIonChange={(event) => {
                        const status =
                          event.detail.value as ReadingStatus;

                        if (status) {
                          void changeStatus(book, status);
                        }
                      }}
                    >
                      <IonSelectOption value="por_leer">
                        Por leer
                      </IonSelectOption>

                      <IonSelectOption value="leyendo">
                        Leyendo
                      </IonSelectOption>

                      <IonSelectOption value="terminado">
                        Terminado
                      </IonSelectOption>
                    </IonSelect>

                    <p className="progress-info-text">
                      Progreso: {book.pagesRead}
                      {book.pageCount
                        ? ` de ${book.pageCount} páginas`
                        : " páginas leídas"}
                      {percentage !== null ? ` (${percentage}%)` : ""}
                    </p>

                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <IonInput
                        type="number"
                        label="Páginas leídas"
                        labelPlacement="stacked"
                        min={0}
                        max={book.pageCount}
                        value={
                            progressInputs[book.libraryId] ??
                            String(book.pagesRead)
                        }
                        onIonChange={(event) => {
                            setProgressInputs((previous) => ({
                            ...previous,
                            [book.libraryId]: event.detail.value ?? "",
                            }));
                        }}
                        placeholder="Introduce las páginas leídas"
                    />

                    <IonButton
                        expand="block"
                        onClick={() => void saveProgress(book)}
                    >
                        Guardar progreso
                    </IonButton>

                    <IonButton
                      expand="block"
                      fill="outline"
                      color="danger"
                      onClick={() => void removeBook(book)}
                    >
                      Eliminar de mi biblioteca
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default MyLibrary;