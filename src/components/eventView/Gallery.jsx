// src/components/eventView/Gallery.jsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Placeholder from "@/app/assets/img/placeholder.png"; // Importér Placeholder

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Gallery = ({ galleryData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const scrollContainerRef = useRef(null);

  console.log("Gallery component received galleryData:", galleryData);

  const handleThumbnailClick = (artworkIdToSet) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("backgroundArtworkId", artworkIdToSet);

    newSearchParams.set("showArtworkDetails", "true"); // Er denne stadig nødvendig?

    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  const currentSelectedArtworkId = searchParams.get("backgroundArtworkId");

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -280,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 280,
        behavior: "smooth",
      });
    }
  };

  if (!galleryData || galleryData.length === 0) {
    return (
      <p className="text-white bg-opacity-50 p-2 rounded-md">
        Ingen billeder tilgængelige for galleriet.
      </p>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center">
        <div
          className="relative flex items-center justify-between self-center p-4 rounded-lg shadow-lg"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
        >
          <button
            onClick={scrollLeft}
            className="p-2 text-black bg-white bg-opacity-70 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black z-10"
            aria-label="Scroll left"
          >
            <FaArrowLeft />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex flex-row gap-2 overflow-x-scroll scrollbar-hide snap-x snap-mandatory mx-4"
            style={{
              scrollSnapType: "x mandatory",
              width: "256px",
            }}
          >
            {galleryData.map((artwork, index) => {
              // Sørg for at borderColor er en enkelt streng, hvis den kommer som array
              const borderColor = artwork.suggested_bg_color || "#000000"; // suggested_bg_color er allerede string i EventView

              return (
                <button
                  key={artwork.id || index}
                  onClick={() => handleThumbnailClick(artwork.id)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer transition-opacity duration-300 shadow-md snap-start ${
                    currentSelectedArtworkId === artwork.id ||
                    (!currentSelectedArtworkId && index === 0)
                      ? "opacity-100 border-4"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ borderColor: borderColor }}
                >
                  <Image
                    src={artwork.thumbnail || Placeholder.src} // <-- Retten ligger her!
                    alt={`Miniature ${artwork.id || index + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }} // Brug style-prop for object-fit
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={scrollRight}
            className="p-2 text-black bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black z-10"
            aria-label="Scroll right"
          >
            <FaArrowRight />
          </button>
        </div>
      </section>
    </>
  );
};

export default Gallery;
