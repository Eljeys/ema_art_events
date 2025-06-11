"use client";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { useState, useTransition, useRef } from "react";
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

// Importér de ændrede API-kald
import { createEvent, updateEvent } from "@/lib/api";

const KuratorForm = ({
  images: initialImages,
  locations,
  prevData,
  filterCategories,
  prevSelectedArtworkDetails,
}) => {
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

  const [filterState, formAction, isFiltering] = useActionState(filterData, {
    active: [],
    data: initialImages || [],
    totalFound: initialImages?.length || 0,
  });

  const [isPending, startTransition] = useTransition();

  const displayedImages = filterState.data;

  // State til fejl- og succesmeddelelser - erstatter alerts
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Reference til formularen
  const formRef = useRef(null);

  // PAGINERING STATES OG LOGIK
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 15; // Antal billeder per side

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
          // Beholder alert her, da det er en frontend validering for max billeder
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
    // Nulstil beskeder før et nyt submit forsøg
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      title: data.title,
      date: data.date,
      locationId: data.locationId,
      description: data.description,
      artworkIds: selectedImages,
    };

    try {
      let response;
      if (prevData && prevData.id) {
        response = await updateEvent(prevData.id, payload);
      } else {
        response = await createEvent(payload);
      }

      if (response.ok) {
        const result = await response.json();

        setSuccessMessage(
          `Eventet er ${prevData ? "opdateret" : "oprettet"} succesfuldt!`
        );

        // NYT: Scroll til toppen og forsink redirection ved succes
        if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000); // Forsink redirection i 3 sekunder (3000 ms)
      } else {
        const errorData = await response.json();
        console.error("Fejl ved event handling via API-rute:", errorData);
        // Brug setErrorMessage til at vise fejlen på skærmen
        let message = "Ukendt fejl.";
        if (
          errorData.message &&
          errorData.message.includes("conflict: another event already exists")
        ) {
          message = "Der findes allerede et event på denne dato og lokation."; // Kortere tekst
        } else if (errorData.message) {
          message = errorData.message;
        }
        setErrorMessage(`Fejl: ${message}`);
        // Scroll til toppen af formularen ved fejl
        if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    } catch (error) {
      console.error("Netværksfejl ved submit af event til API-rute:", error);
      // Brug setErrorMessage til at vise netværksfejlen på skærmen
      setErrorMessage(
        "Netværksfejl: Kunne ikke oprette/opdatere event. Tjek din internetforbindelse." // Kortere tekst
      );
      // Scroll til toppen af formularen ved fejl
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-4"
        ref={formRef}
      >
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setErrorMessage(null)} // Tillader at lukke beskeden
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
        {/* Vis succesmeddelelse her med Tailwind CSS */}
        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Succes! </strong>
            <span className="block sm:inline">{successMessage}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setSuccessMessage(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
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
                    sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-50"
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
                          sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-50"
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
