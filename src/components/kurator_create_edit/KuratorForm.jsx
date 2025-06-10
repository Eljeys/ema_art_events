"use client";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

// Shadcn UI Components

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Lokale komponenter/assets
import Placeholder from "../../app/assets/img/placeholder.png";

// Importér filter-relaterede komponenter og actions
import { filterData } from "@/components/global/filter/actions";
import Filter from "@/components/global/filter/Filter";
import CustomButton from "../global/CustomButton";

const KuratorForm = ({
  images: initialImages,
  locations,
  prevData,
  filterCategories,
  prevSelectedArtworkDetails,
}) => {
  console.log("KuratorForm - prevData ved initialisering:", prevData);
  console.log("KuratorForm - prevData?.artworkIds:", prevData?.artworkIds);
  console.log(
    "KuratorForm - initialImages prop (fra page.jsx):",
    initialImages
  );
  console.log(
    "KuratorForm - filterCategories prop (fra page.jsx):",
    filterCategories
  );
  console.log(
    "KuratorForm - prevSelectedArtworkDetails prop (fra page.jsx):",
    prevSelectedArtworkDetails
  );

  const form = useForm({
    defaultValues: {
      title: prevData?.title || "",
      date: prevData?.date || "",
      locationId: prevData?.locationId?.toString() || "",
      description: prevData?.description || "",
    },
  });

  const { handleSubmit, control, getValues } = form;

  const [selectedImages, setSelectedImages] = useState(
    prevData?.artworkIds || []
  );

  const [selectedArtworkDetails, setSelectedArtworkDetails] = useState(
    prevSelectedArtworkDetails || []
  );

  console.log(
    "KuratorForm - selectedImages initialiseret til:",
    selectedImages
  );

  const [filterState, formAction, isFiltering] = useActionState(filterData, {
    active: [],
    data: initialImages || [],
    totalFound: initialImages?.length || 0,
  });

  const [isPending, startTransition] = useTransition();

  const displayedImages = filterState.data;

  // PAGINERING STATES OG LOGIK
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 15; // <-- Antal billeder per side

  // Filtrer først valgte billeder fra displayedImages
  const filteredDisplayedImages = displayedImages.filter(
    (img) => !selectedImages.includes(img.object_number)
  );

  // Beregn billeder til den aktuelle side
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImagesForGallery = filteredDisplayedImages.slice(
    indexOfFirstImage,
    indexOfLastImage
  );

  const totalPages = Math.ceil(filteredDisplayedImages.length / imagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const router = useRouter();

  const handleImageClick = (img) => {
    setSelectedImages((prevSelectedImages) => {
      const isCurrentlySelected = prevSelectedImages.includes(
        img.object_number
      );

      let newSelectedImageIds;
      if (isCurrentlySelected) {
        newSelectedImageIds = prevSelectedImages.filter(
          (item) => item !== img.object_number
        );
      } else {
        const selectedLocation = locations.find(
          (loc) => loc.id.toString() === getValues("locationId")
        );

        if (
          selectedLocation &&
          selectedLocation.maxArtworks &&
          prevSelectedImages.length >= selectedLocation.maxArtworks
        ) {
          alert(
            `Du kan kun vælge op til ${selectedLocation.maxArtworks} billeder for denne lokation.`
          );
          return prevSelectedImages;
        }
        newSelectedImageIds = [...prevSelectedImages, img.object_number];
      }

      setSelectedArtworkDetails((prevDetails) => {
        if (isCurrentlySelected) {
          return prevDetails.filter(
            (detail) => detail.object_number !== img.object_number
          );
        } else {
          if (
            !prevDetails.some(
              (detail) => detail.object_number === img.object_number
            )
          ) {
            return [...prevDetails, img];
          }
          return prevDetails;
        }
      });

      return newSelectedImageIds;
    });
  };

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      date: data.date,
      locationId: data.locationId,
      description: data.description,
      artworkIds: selectedImages,
    };

    console.log("Payload, der sendes til API:", payload);

    try {
      let response;
      if (prevData && prevData.id) {
        console.log(
          "Forsøger at opdatere event (PATCH) via Next.js API-rute:",
          `/api/events/${prevData.id}`,
          "med payload:",
          payload
        );
        response = await fetch(`/api/events/${prevData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        console.log(
          "Forsøger at oprette event (POST) via Next.js API-rute:",
          `/api/events`,
          "med payload:",
          payload
        );
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log(
          `Event ${prevData ? "opdateret" : "oprettet"} succesfuldt:`,
          result
        );
        alert(`Eventet er ${prevData ? "opdateret" : "oprettet"} succesfuldt!`);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        console.error(
          "Fejl ved event handling via Next.js API-rute:",
          errorData
        );
        alert(
          `Der opstod en fejl ved ${prevData ? "opdatering" : "oprettelse"} af event: ${errorData.message || "Ukendt fejl"}. Tjek konsollen for detaljer.`
        );
      }
    } catch (error) {
      console.error(
        "Netværksfejl ved submit af event til Next.js API-rute:",
        error
      );
      alert(
        "Der opstod en netværksfejl ved oprettelse/opdatering af event. Tjek konsollen for detaljer."
      );
    }
  };

  const handleFilterSelection = (value, name) => {
    let newFilters = [];
    if (value !== "all") {
      newFilters = [`${name}:${value}`];
    }
    startTransition(() => {
      formAction(newFilters);
      setCurrentPage(1); // Nulstil til side 1, når filter ændres
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="Begivenhedens titel" {...field} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokation</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg en lokation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
                        {location.name} (Max billeder: {location.maxArtworks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea placeholder="Beskrivelse af eventet" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valgte Billeder Sektion - JUSTERET GRID KLASSER OG SIZES HER */}
        <div className="space-y-4 border p-4 rounded-lg">
          <Label className="text-lg font-semibold">Valgte Billeder</Label>
          {selectedArtworkDetails.length > 0 ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {selectedArtworkDetails.map((img) => (
                <div
                  key={`selected-${img.object_number}`}
                  onClick={() => handleImageClick(img)}
                  className="relative aspect-square overflow-hidden rounded-md cursor-pointer ring-4 ring-blue-500 group"
                >
                  <Image
                    src={img.image_thumbnail || img.image_native || Placeholder}
                    alt={img.titles?.[0]?.title || "Valgt billede"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-50"
                    // title={img.titles?.[0]?.title || "Valgt billede"} // Fjernet title herfra
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                    <span className="text-white text-2xl">✓</span>{" "}
                  </div>
                  {/* Overlay for titel */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-center text-xs px-2 break-words">
                      {img.titles?.[0]?.title || "Ukendt titel"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Ingen billeder er valgt endnu.</p>
          )}
        </div>

        {/* GALLERI SECTION MED FILTER OG PAGINERING */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            Filtrer billeder fra SMK
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8">
            <div className="md:col-span-1">
              {filterCategories && filterCategories.length > 0 ? (
                <Filter data={filterCategories} fn={handleFilterSelection} />
              ) : (
                <p>Ingen filterkategorier fundet.</p>
              )}
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {currentImagesForGallery.length > 0 ? (
                  currentImagesForGallery.map((img) => {
                    const isSelected = selectedImages.includes(
                      img.object_number
                    );
                    return (
                      <div
                        key={img.object_number}
                        onClick={() => handleImageClick(img)}
                        className={`relative aspect-square overflow-hidden rounded-md cursor-pointer group // Added group class
                          ${
                            isSelected
                              ? "ring-4 ring-blue-500"
                              : "opacity-75 hover:opacity-100"
                          }
                          transition-all duration-200 ease-in-out
                          ${isSelected ? "order-first" : ""}
                        `}
                      >
                        <Image
                          src={
                            img.image_thumbnail ||
                            img.image_native ||
                            Placeholder
                          }
                          alt={img.titles?.[0]?.title || "SMK billede"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-50"
                          // title={img.titles?.[0]?.title || "SMK billede"} // Fjernet title herfra
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                            <span className="text-white text-3xl">✓</span>
                          </div>
                        )}
                        {/* Overlay for titel */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-center text-xs px-2 break-words">
                            {img.titles?.[0]?.title || "Ukendt titel"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : isFiltering || isPending ? (
                  <p className="md:col-span-full text-center">
                    Indlæser billeder...
                  </p>
                ) : (
                  <p className="md:col-span-full text-center text-gray-500">
                    Ingen billeder fundet med de valgte filtre.
                  </p>
                )}
              </div>
              {/* PAGINERINGSKNAPPER */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <CustomButton
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1 || isFiltering || isPending}
                    variant="outline"
                    type="button"
                    text={<FaArrowLeft />}
                  ></CustomButton>
                  <span className="text-gray-700">
                    Side {currentPage} af {totalPages}
                  </span>
                  <CustomButton
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage === totalPages || isFiltering || isPending
                    }
                    variant="outline"
                    type="button"
                    text={<FaArrowRight />}
                  ></CustomButton>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Submit Button */}
        <CustomButton
          type="submit"
          text="Submit"
          className="w-fit text-xl"
        ></CustomButton>
      </form>
    </Form>
  );
};

export default KuratorForm;
