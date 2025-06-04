// components/kurator_create_edit/KuratorGallery.jsx
"use client";
import Image from "next/image";
import { useState, useActionState, startTransition } from "react";

import { filterData } from "../global/filter/actions";
import Filter from "../global/filter/Filter";

import Placeholder from "../../app/assets/img/placeholder.png";
import CustomButton from "@/components/global/CustomButton"; // Antager du har denne knap komponent

const IMAGES_PER_PAGE = 20; // Definer hvor mange billeder per side

const Gallery = ({
  smkImages,
  categories,
  locationSelected,
  maxImages,
  currentlySelectedArtworks,
  setSelectedImages,
  selectedImages,
}) => {
  const [currentPage, setCurrentPage] = useState(1); // Tilføj state for den aktuelle side

  const [state, action, isPending] = useActionState(filterData, {
    active: [],
    data: [], // Starter med tom data, så "Vælg filter" vises
  });

  // Kalder filterData med en tom active array ved første render, hvis der er smkImages
  // Dette sikrer, at alle billeder vises som standard, hvis intet filter vælges
  // Dog, for at vise "Vælg noget i filteret...", initialiseres data som tom.
  // Hvis du vil vise alle billeder som standard FØR filter, fjern denne `useEffect`
  // og initialiser `useActionState` med `smkImages` som `data`.
  // React.useEffect(() => {
  //   if (smkImages && smkImages.length > 0 && state.active.length === 0) {
  //     action([]); // Udløser handlingen uden filtre for at indlæse alle billeder
  //   }
  // }, [smkImages, action]);

  function handleFilter(value, category) {
    setCurrentPage(1); // Nulstil side til 1, når et filter ændres
    const replaceFilter = state?.active?.filter(
      (item) => !item.includes(category)
    );
    const data =
      value === "all"
        ? replaceFilter
        : [...replaceFilter, `[${category}:${value}]`];

    startTransition(() => {
      action(data);
    });
  }

  // Logik for sideinddeling
  const totalPages = Math.ceil(state.data.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = state.data.slice(startIndex, endIndex);

  // Bestem om der er aktive filtre
  const hasActiveFilters = state.active && state.active.length > 0;

  return (
    <section className="border p-4 rounded-md">
      <p className="text-black my-4">
        {(maxImages === 0 && "Denne lokation har ingen billedkapacitet.") ||
          (currentlySelectedArtworks.length === 0 &&
            maxImages > 0 &&
            `Ingen billeder valgt endnu. Vælg op til ${maxImages} billeder.`)}
      </p>
      <article className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Filter data={categories} fn={handleFilter} />

        <ul className="-col-end-1 sm:col-start-2 grid grid-cols-subgrid gap-4">
          {isPending ? (
            <p className="col-span-full">Indlæser SMK billeder...</p>
          ) : !locationSelected ? (
            <p className="text-red-500 col-span-full">
              Vælg venligst en lokation for at se billeder.
            </p>
          ) : !hasActiveFilters ? ( // Viser denne besked, hvis ingen filtre er valgt
            <p className="text-blue-600 col-span-full">
              Vælg noget i filteret for at billederne bliver vist.
            </p>
          ) : currentImages.length === 0 ? ( // Viser denne besked hvis filtre er valgt, men intet match
            <p className="text-red-500 col-span-full">
              Ingen billeder fundet med de valgte filtre.
            </p>
          ) : (
            currentImages.map((item) => (
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
      {hasActiveFilters && state.data.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <CustomButton
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isPending}
            className="px-4 py-2"
          >
            Forrige
          </CustomButton>
          <span className="text-black">
            Side {currentPage} af {totalPages}
          </span>
          <CustomButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isPending}
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
    if (isSelected) {
      setSelectedImages(selectedImages.filter((id) => id !== object_number));
    } else {
      if (!isDisabled) {
        setSelectedImages([...selectedImages, object_number]);
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
          Image not found.
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
