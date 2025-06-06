// src/components/kurator_create_edit/KuratorForm.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
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
import { createEvent, updateEvent } from "@/lib/api";

const KuratorForm = ({ images, locations, prevData }) => {
  // Debugging logs for initialisering af prevData og selectedImages
  console.log("KuratorForm - prevData ved initialisering:", prevData);
  console.log("KuratorForm - prevData?.artworkIds:", prevData?.artworkIds);

  const form = useForm({
    defaultValues: prevData || {
      title: "",
      date: "",
      locationId: "", // Vigtigt at initialisere med tom streng for select, hvis intet er valgt
      description: "",
    },
  });

  const { handleSubmit, control } = form; // 'register' er ikke længere nødvendig, da du bruger FormField

  // Initialiser selectedImages med de eksisterende artworkIds fra prevData.
  // Sørg for at prevData?.artworkIds er et array, selvom det er undefined eller null.
  const [selectedImages, setSelectedImages] = useState(
    prevData?.artworkIds || []
  );

  console.log(
    "KuratorForm - selectedImages initialiseret til:",
    selectedImages
  );

  const router = useRouter();

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      date: data.date,
      locationId: data.locationId,
      description: data.description,
      artworkIds: selectedImages, // Denne state indeholder de valgte billeder
    };

    console.log("Payload, der sendes til API:", payload); // Log den endelige payload

    try {
      if (prevData && prevData.id) {
        console.log(
          "Forsøger at opdatere event (PATCH):",
          payload,
          "ID:",
          prevData.id
        );
        await updateEvent(prevData.id, payload);
        alert("Eventet er opdateret succesfuldt!");
      } else {
        console.log("Forsøger at oprette event (POST):", payload);
        await createEvent(payload);
        alert("Eventet er oprettet succesfuldt!");
      }

      router.push("/dashboard"); // Juster stien om nødvendigt
    } catch (error) {
      console.error("Fejl ved submit af event:", error);
      alert(
        "Der opstod en fejl ved oprettelse/opdatering af event. Tjek konsollen for detaljer."
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
        {/* Title Input */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event Title" {...field} />
              </FormControl>
              <FormDescription>Dette er eventets titel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Date Input */}
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dato</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>Vælg eventets dato.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Location Select */}
        <FormField
          control={control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokation</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg en lokation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* RETTET TILBAGE TIL DIN FØR-VERSION: value="location" */}
                  <SelectItem value="location">Vælg en lokation</SelectItem>
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
              <FormDescription>
                Vælg den lokation eventet afholdes på.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description Textarea */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea placeholder="Beskrivelse af eventet" {...field} />
              </FormControl>
              <FormDescription>
                Giv en detaljeret beskrivelse af eventet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* GALLERI SECTION */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Vælg billeder fra SMK</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
            <div className="md:col-span-1">
              <p className="text-gray-600">Filter her (placeholder)</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => {
                // Tjek om billedet er valgt i den aktuelle state
                const isSelected = selectedImages.includes(img.object_number);

                return (
                  <div
                    key={img.object_number}
                    onClick={() => {
                      setSelectedImages((prevSelectedImages) => {
                        if (prevSelectedImages.includes(img.object_number)) {
                          // Billedet er allerede valgt, fravælg det
                          return prevSelectedImages.filter(
                            (item) => item !== img.object_number
                          );
                        } else {
                          // Billedet er ikke valgt, vælg det
                          return [...prevSelectedImages, img.object_number];
                        }
                      });
                    }}
                    className={`relative aspect-square overflow-hidden rounded-md cursor-pointer
                      ${
                        isSelected
                          ? "ring-4 ring-green-500" // Brug ring for valgte billeder
                          : "opacity-75 hover:opacity-100" // Standardudseende
                      }
                      transition-all duration-200 ease-in-out
                      ${isSelected ? "order-first" : ""} 
                    `}
                  >
                    <Image
                      src={
                        img.image_thumbnail || img.image_native || Placeholder
                      }
                      alt={img.title || "SMK billede"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {isSelected && ( // Vis flueben, hvis billedet er valgt
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-3xl">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {prevData ? "Opdater Event" : "Opret Event"}
        </Button>
      </form>
    </Form>
  );
};

export default KuratorForm;
