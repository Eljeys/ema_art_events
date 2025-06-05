"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Korrekt import for useRouter

// --------------------------- Components -------------------------------------//
import CustomButton from "../global/CustomButton";
import Placeholder from "../../app/assets/img/placeholder.png"; // Tjek lige stien til placeholder, den er her relativt til app-roden
import { createEvent, updateEvent } from "@/lib/api";

// Fjern useSearchParams, da den ikke bruges i KuratorForm
// import { useSearchParams } from "next/navigation";

// ----------------------------- KuratorForm ---------------------------------- //
const KuratorForm = ({ images, locations, prevData }) => {
  // Debugging console.log kan fjernes når koden virker
  // console.log("KuratorForm: ", "prevData", prevData, "prevData.artworkIds", prevData?.artworkIds);

  const { register, handleSubmit } = useForm({
    defaultValues: prevData || {},
  });

  // Initialiser selectedImages med eksisterende artworkIds hvis prevData findes
  // Ellers start med en tom array.
  const [selectedImages, setSelectedImages] = useState(
    prevData?.artworkIds || []
  );

  const router = useRouter(); // Initialiser useRouter

  const onSubmit = async (data) => {
    // Kombiner indholdet for både create og update for at undgå gentagelse
    const payload = {
      title: data.title,
      date: data.date,
      locationId: data.locationId,
      description: data.description,
      artworkIds: selectedImages,
    };

    try {
      if (prevData && prevData.id) {
        // Hvis prevData eksisterer, er det en opdatering (PATCH)
        console.log(
          "Forsøger at opdatere event (PATCH):",
          payload,
          "ID:",
          prevData.id
        );
        await updateEvent(prevData.id, payload);
        alert("Eventet er opdateret succesfuldt!");
      } else {
        // Ellers er det en ny oprettelse (POST)
        console.log("Forsøger at oprette event (POST):", payload);
        await createEvent(payload);
        alert("Eventet er oprettet succesfuldt!");
      }

      // Efter succesfuld oprettelse/opdatering, redirect til dashboard
      router.push("/dashboard"); // Juster stien om nødvendigt
    } catch (error) {
      console.error("Fejl ved submit af event:", error);
      alert(
        "Der opstod en fejl ved oprettelse/opdatering af event. Tjek konsollen for detaljer."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-(--space-2rem)"
    >
      <input
        className="border-2 border-amber-700"
        defaultValue={"Title"} // Overvej at fjerne defaultValue her, hvis du bruger prevData
        placeholder="Title" // Bedre for tomme felter
        {...register("title")}
      ></input>
      <input
        className="border-2 border-amber-700"
        defaultValue={"Dato"} // Overvej at fjerne defaultValue her
        placeholder="Dato"
        {...register("date")}
      ></input>
      <select
        className="border-2 border-amber-700"
        defaultValue={"Lokation"} // Overvej at fjerne defaultValue her
        {...register("locationId")}
      >
        {/* Tilføj en tom option, hvis du vil have "Vælg lokation" som standard */}
        {/* <option value="">Vælg lokation</option> */}
        {locations.map((location) => {
          return (
            <option key={location.id} value={location.id}>
              {location.name}(Max billeder: {location.maxArtWorks})
            </option>
          );
        })}
      </select>
      <textarea
        className="border-2 border-amber-700"
        defaultValue={"Beskrivelse"} // Overvej at fjerne defaultValue her
        placeholder="Beskrivelse"
        {...register("description")}
      ></textarea>

      {/* GALLERI SECTION */}
      <ul className="grid grid-cols-3 gap-x-(--space-2rem)">
        {/* Filter element - dette er den statiske tekst fra din venindes kode */}
        <li className="col-3 row-span-2">Filter her</li>

        {/* Billedvisning */}
        <li className="col-start-1 col-end-3 grid grid-cols-4 gap-(--space-1rem)">
          {images.map((img) => {
            // Bestem om billedet er valgt i den aktuelle state
            const isSelected = selectedImages.includes(img.object_number);

            return (
              <Image
                onClick={() => {
                  // Her håndteres tilføjelse/fjernelse af billed-ID'er
                  setSelectedImages((prevSelectedImages) => {
                    if (prevSelectedImages.includes(img.object_number)) {
                      // Fjern hvis allerede valgt
                      return prevSelectedImages.filter(
                        (item) => item !== img.object_number
                      );
                    } else {
                      // Tilføj hvis ikke valgt
                      // Du kan her tilføje logik for maxArtWorks, hvis nødvendigt
                      // F.eks. if (prevSelectedImages.length < maxArtWorks) { return ... }
                      return [...prevSelectedImages, img.object_number];
                    }
                  });
                }}
                key={img.object_number}
                src={img.image_thumbnail || img.image_native || Placeholder}
                width={img.image_width || 400}
                height={img.image_height || 400}
                alt={img.title || "SMK billede"}
                className={`object-cover w-full h-full col-span-1 row-span-1 cursor-pointer
                  ${isSelected ? "border-4 border-green-500 order-first" : "opacity-50"}
                `}
              />
            );
          })}
        </li>
      </ul>
      <CustomButton type="Submit" text="Submit"></CustomButton>
    </form>
  );
};

export default KuratorForm;
