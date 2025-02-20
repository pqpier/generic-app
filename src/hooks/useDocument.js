import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export const useDocument = (coll, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coll || !id) return;

    const unsub = onSnapshot(
      doc(db, coll, id),
      (docSnapshot) => {
        if (docSnapshot.data()) {
          setDocument({ ...docSnapshot.data(), id: docSnapshot.id });
          setError(null);
        } else {
          setError("Dados não encontrados.");
          setDocument(undefined);
          console.log(`Dados não encontrados. Collection: ${coll}, ID: ${id}`);
        }
      },
      (err) => {
        setError(err.message);
        setDocument(undefined);
        console.log(err.message);
        console.log("Erro ao ler documento da coleção:", coll, "com ID:", id);
      }
    );

    return () => unsub();
  }, [coll, id]);

  return { document, error };
};
