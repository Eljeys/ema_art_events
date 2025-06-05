// src/components/kurator_create_edit/KuratorGallery.jsx
"use client";
import Image from "next/image";
import { useState, useActionState, startTransition, useEffect } from "react"; // <-- Import useEffect
import { getSMKImagesPaginated } from "@/lib/api"; // <-- Import den paginerede funktion
import Filter from "../global/filter/Filter"; // Antager Filter er i denne sti

import Placeholder from "../../app/assets/img/placeholder.png";
import CustomButton from "@/components/global/CustomButton";

const IMAGES_PER_PAGE = 20;

const Gallery = ({
  initialSmkImages, // De første billeder fra SmkImageFetcher
  totalSmkImages, // Det totale antal billeder fra API'en
  categories,
  locationSelected,
  maxImages,
  setSelectedImages,
  selectedImages,
}) => {
  const [smkImages, setSmkImages] = useState(initialSmkImages); // State til at holde de billeder, der vises
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTotal, setCurrentTotal] = useState(totalSmkImages); // Holder styr på totalen, kan ændres ved filtrering
  const [isLoading, setIsLoading] = useState(false); // Ny loading state for klient-side hentning
  const [galleryError, setGalleryError] = useState(null); // Ny fejl-state for klient-side hentning
  const [activeFilters, setActiveFilters] = useState([]); // Nye state til aktive filtre
  const [searchQuery, setSearchQuery] = useState(""); // Ny state til søgeforespørgsel (hvis du tilføjer søgning)

  // UseEffect til at hente billeder, når side, filtre eller søgning ændres
  useEffect(() => {
    async function fetchGalleryImages() {
      if (!locationSelected) return; // Vent til lokation er valgt

      setIsLoading(true);
      setGalleryError(null); // Ryd tidligere fejl

      try {
        const offset = (currentPage - 1) * IMAGES_PER_PAGE;
        const limit = IMAGES_PER_PAGE;

        console.log(
          `DEBUG_Gallery: Fetching images with offset: ${offset}, limit: ${limit}, filters: ${activeFilters}`
        );
        const result = await getSMKImagesPaginated(
          offset,
          limit,
          searchQuery,
          activeFilters
        );

        setSmkImages(result.items);
        setCurrentTotal(result.totalFound); // Opdater det totale antal fundne billeder baseret på filtre

        if (
          result.items.length === 0 &&
          result.totalFound > 0 &&
          currentPage === 1
        ) {
          setGalleryError(
            "Ingen billeder fundet for de valgte filtre på første side."
          );
        } else if (result.items.length === 0 && result.totalFound === 0) {
          setGalleryError("Ingen billeder fundet med de valgte filtre.");
        }
      } catch (error) {
        console.error("Fejl ved hentning af galleribilleder:", error);
        setGalleryError("Fejl ved indlæsning af billeder.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGalleryImages();
  }, [currentPage, activeFilters, searchQuery, locationSelected]); // Afhængigheder

  // Funktion til at håndtere filterændringer
  function handleFilter(value, category) {
    setCurrentPage(1); // Nulstil side til 1, når et filter ændres
    setSearchQuery(""); // Ryd søgning ved filtrering (eller implementer kombineret logik)

    // Logik for at opdatere activeFilters (kopieret fra din gamle kode)
    // Sørg for at dette matcher det format, getSMKImagesPaginated forventer i `filters` array'en.
    // getSMKImagesPaginated forventer "[category:value]".
    const updatedFilters = activeFilters.filter(
      (item) => !item.includes(category) // Fjerner eksisterende filter for denne kategori
    );

    const newFilters =
      value === "all"
        ? updatedFilters
        : [...updatedFilters, `[${category}:${value}]`];

    setActiveFilters(newFilters); // Sæt den nye liste af aktive filtre
  }

  // Logik for søgning (tilføj Input-felt for søgning i din JSX)
  function handleSearch(query) {
    setSearchQuery(query);
    setCurrentPage(1);
    setActiveFilters([]); // Ryd filtre ved søgning (eller implementer kombineret logik)
  }

  // Pagination Controls
  const totalPages = Math.ceil(currentTotal / IMAGES_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <section className="border p-4 rounded-md">
      <p className="text-black my-4">
        {(maxImages === 0 && "Denne lokation har ingen billedkapacitet.") ||
          (selectedImages.length === 0 &&
            maxImages > 0 &&
            `Ingen billeder valgt endnu. Vælg op til ${maxImages} billeder.`)}
        {selectedImages.length > 0 &&
          maxImages > 0 &&
          `Du har valgt ${selectedImages.length} ud af ${maxImages} billeder.`}
      </p>
      <article className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Filter-komponent */}
        <Filter data={categories} fn={handleFilter} />

        {/* Tilføj eventuelt et søgefelt her */}
        {/*
        <div className="col-span-full">
            <input
                type="text"
                placeholder="Søg billeder..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="p-2 border rounded w-full"
            />
        </div>
        */}

        <ul className="-col-end-1 sm:col-start-2 grid grid-cols-subgrid gap-4">
          {isLoading ? (
            <p className="col-span-full">Indlæser SMK billeder...</p>
          ) : !locationSelected ? (
            <p className="text-red-500 col-span-full">
              Vælg venligst en lokation for at se billeder.
            </p>
          ) : galleryError ? (
            <p className="text-red-500 col-span-full">{galleryError}</p>
          ) : smkImages.length === 0 &&
            (activeFilters.length > 0 || searchQuery) ? (
            <p className="text-red-500 col-span-full">
              Ingen billeder fundet med de valgte filtre/søgning.
            </p>
          ) : smkImages.length === 0 ? (
            <p className="text-blue-600 col-span-full">
              Ingen billeder at vise.
            </p>
          ) : (
            smkImages.map((item) => (
              <GalleryCard
                key={item.object_number}
                {...item}
                isDisabled={
                  selectedImages.length >= maxImages &&
                  !selectedImages.includes(item.object_number)
                }
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
            ))
          )}
        </ul>
      </article>

      {/* Pagination Controls */}
      {currentTotal > IMAGES_PER_PAGE &&
        totalPages > 1 && ( // Vis kun paginering, hvis der er mere end 1 side
          <div className="flex justify-center items-center mt-6 gap-2">
            <CustomButton
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2"
            >
              Forrige
            </CustomButton>
            <span className="text-black">
              Side {currentPage} af {totalPages}
            </span>
            <CustomButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2"
            >
              Næste
            </CustomButton>
          </div>
        )}
    </section>
  );
};

export default Gallery;

// GalleryCard forbliver uændret
function GalleryCard({
  object_number,
  image_thumbnail,
  image_native,
  image_width,
  image_height,
  title,
  isDisabled,
  selectedImages,
  setSelectedImages,
}) {
  const isSelected = selectedImages.includes(object_number);

  const handleClick = () => {
    console.log("DEBUG_GalleryCard: Clicked on:", object_number);
    if (isSelected) {
      console.log("DEBUG_GalleryCard: Deselecting", object_number);
      setSelectedImages(selectedImages.filter((id) => id !== object_number));
    } else {
      if (!isDisabled) {
        console.log("DEBUG_GalleryCard: Selecting", object_number);
        setSelectedImages([...selectedImages, object_number]);
      } else {
        console.log("DEBUG_GalleryCard: Cannot select, disabled.");
      }
    }
  };

  return (
    <li
      onClick={handleClick}
      className={`${
        isSelected
          ? "ring-4 ring-[#A89C9E] cursor-pointer"
          : isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "border-gray-300 cursor-pointer"
      }
      relative border-2 aspect-square
      `}
    >
      {image_thumbnail === "https://api.smk.dk/api/v1/thumbnail/PD" ? (
        <div className="bg-btn-bg/50 text-white grid place-content-center p-2 w-full aspect-square">
          Billede ikke fundet.
        </div>
      ) : (
        <Image
          src={image_thumbnail || image_native || Placeholder}
          width={image_width || 400}
          height={image_height || 400}
          alt={title || "SMK billede"}
          className="object-cover w-full h-full"
        />
      )}
    </li>
  );
}
