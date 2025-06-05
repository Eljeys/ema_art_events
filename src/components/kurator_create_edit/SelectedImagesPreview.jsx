// src/components/kurator_create_edit/SelectedImagesPreview.jsx
"use client";

import Image from "next/image";
import Placeholder from "../../app/assets/img/placeholder.png";
import { XCircle } from "lucide-react";
import { useState, useEffect } from "react"; // <-- Import useState og useEffect
import { getArtworkByEventID } from "@/lib/api"; // <-- Import af den funktion, der henter enkeltbilleder

const SelectedImagesPreview = ({ selectedImageIds, setSelectedImages }) => {
  const [selectedImageObjects, setSelectedImageObjects] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  // useEffect til at hente de faktiske billedobjekter baseret på IDs
  useEffect(() => {
    async function fetchSelectedImages() {
      if (!selectedImageIds || selectedImageIds.length === 0) {
        setSelectedImageObjects([]);
        setIsLoadingPreview(false);
        return;
      }

      setIsLoadingPreview(true);
      setPreviewError(null);
      const fetchedObjects = [];

      try {
        // Hent hvert billede individuelt
        // Dette kan være ineffektivt ved mange valgte billeder (>10-20),
        // men er den mest direkte løsning givet API'en og den nuværende struktur.
        // Overvej at implementere en batch-hentning i api.js, hvis dette bliver en flaskehals.
        for (const id of selectedImageIds) {
          const artwork = await getArtworkByEventID(id);
          if (artwork) {
            fetchedObjects.push(artwork);
          } else {
            console.warn(
              `Advarsel: Billede med ID ${id} kunne ikke hentes til preview.`
            );
          }
        }
        setSelectedImageObjects(fetchedObjects);
      } catch (error) {
        console.error(
          "Fejl ved hentning af valgte billeder til preview:",
          error
        );
        setPreviewError("Kunne ikke indlæse valgte billeder.");
      } finally {
        setIsLoadingPreview(false);
      }
    }

    fetchSelectedImages();
  }, [selectedImageIds]); // Afhængig af listen af valgte ID'er

  if (isLoadingPreview) {
    return (
      <div className="my-4 p-4 border rounded-md bg-gray-50">
        <p>Indlæser valgte billeder...</p>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="my-4 p-4 border rounded-md bg-gray-50">
        <p className="text-red-500">{previewError}</p>
      </div>
    );
  }

  if (selectedImageObjects.length === 0) {
    return null; // Vis intet, hvis der ikke er valgt billeder eller de ikke kunne hentes
  }

  const handleRemoveImage = (object_number_to_remove) => {
    setSelectedImages((prevSelected) =>
      prevSelected.filter((id) => id !== object_number_to_remove)
    );
  };

  return (
    <div className="my-4 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Valgte billeder:</h3>
      <ul className="flex flex-wrap gap-2">
        {selectedImageObjects.map((item) => (
          <li
            key={item.object_number}
            className="relative w-20 h-20 border rounded overflow-hidden shadow"
          >
            <Image
              src={item.image_thumbnail || item.image_native || Placeholder}
              alt={item.title || "Valgt billede"}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(item.object_number)}
              className="absolute top-0 right-0 bg-red-500 rounded-full text-white p-0.5 transform translate-x-1/3 -translate-y-1/3 hover:bg-red-600 transition-colors"
              aria-label="Fjern billede"
            >
              <XCircle size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedImagesPreview;
