// src/components/kurator_create_edit/KuratorForm.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from "date-fns";
import { da } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { createEvent, updateEvent } from "@/lib/api"; // getSMKImg SKAL FJERNES HERFRA
import SmkImageFetcher from "./SmkImageFetcher"; // <-- NY IMPORT!

import CustomButton from "@/components/global/CustomButton";
import Step from "./Step";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
// import KuratorGallery from "@/components/kurator_create_edit/KuratorGallery"; // Fjern denne import, da SmkImageFetcher håndterer den
// import SelectedImagesPreview from "./SelectedImagesPreview"; // Fjern denne import, da SmkImageFetcher håndterer den
import Placeholder from "../../app/assets/img/placeholder.png";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Titel skal være mindst 2 tegn.",
  }),
  locationId: z.string().min(1, {
    message: "Lokation er påkrævet.",
  }),
  date: z.date({
    required_error: "Dato er påkrævet.",
  }),
  description: z.string().optional(),
  artworkIds: z.array(z.string()).optional(),
});

export function Kuratorform({
  eventDates,
  eventLocations,
  eventData,
  categories,
  maxImages,
}) {
  const router = useRouter();

  // ***** FJERNEDE STATE OG USEEFFECT FOR SMK BILLEDER HERFRA *****
  // const [smkImages, setSmkImages] = useState([]);
  // const [isLoadingImages, setIsLoadingImages] = useState(true);
  // const [imageError, setImageError] = useState(null);
  // Fjern den useEffect, der kalder fetchSmkImages()
  // *************************************************************

  const [selectedImages, setSelectedImages] = useState(
    eventData?.artworkIds || []
  );

  // Denne useEffect opdaterer selectedImages, når eventData ændrer sig (ved redigering)
  useEffect(() => {
    if (eventData) {
      setSelectedImages(eventData.artworkIds || []);
      console.log(
        "DEBUG_KuratorForm: useEffect updated selectedImages from eventData:",
        eventData.artworkIds
      );
    } else {
      setSelectedImages([]);
    }
  }, [eventData]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventData?.title || "",
      locationId: eventData?.location?.id || "",
      date: eventData?.date ? parseISO(eventData.date) : undefined,
      description: eventData?.description || "",
      artworkIds: eventData?.artworkIds || [],
    },
  });

  // Denne useEffect synkroniserer selectedImages state med react-hook-form's interne state
  useEffect(() => {
    form.setValue("artworkIds", selectedImages, { shouldValidate: true });
    console.log(
      "DEBUG_KuratorForm: Form's artworkIds updated via setValue:",
      selectedImages
    );
  }, [selectedImages, form]);

  const allowedDates = useMemo(() => {
    if (!eventDates) return new Set();
    return new Set(
      eventDates
        .map((dateStr) => parseISO(dateStr))
        .filter((date) => isValid(date))
        .map((date) => date.toDateString())
    );
  }, [eventDates]);

  const filterDatesForPicker = (date) => {
    return !allowedDates.has(date.toDateString());
  };

  const handleFormSubmit = async (data) => {
    const formattedData = {
      ...data,
      date: format(data.date, "yyyy-MM-dd"),
      artworkIds: selectedImages,
    };

    console.log("DEBUG_SUBMIT: Data being sent to API:", formattedData);

    try {
      if (eventData) {
        await updateEvent(eventData.id, formattedData);
        alert("Event opdateret succesfuldt!");
      } else {
        await createEvent(formattedData);
        alert("Event oprettet succesfuldt!");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("DEBUG_SUBMIT: Fejl ved håndtering af event:", error);
      alert("Der skete en fejl under håndtering af eventet.");
    }
  };

  const locationSelected = !!form.watch("locationId");

  // selectedImageObjects useMemo er fjernet herfra, da SelectedImagesPreview
  // nu selv håndterer filtreringen baseret på de fulde smkImages.

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 p-4"
      >
        <Step number="1" text="Dato og tid for event" />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel på event</FormLabel>
              <FormControl>
                <Input placeholder="Huttelihu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokation</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg en lokation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventLocations && eventLocations.length > 0 ? (
                    eventLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="">
                      Ingen lokationer fundet.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Dato</FormLabel>
              <FormControl>
                <DatePicker
                  field={field}
                  locale={da}
                  filter={filterDatesForPicker}
                  buttonClassName="w-fit"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea placeholder="Indtast beskrivelse her..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Step number="2" text="Vælg billeder til eventet" />
        <p className="text-sm text-gray-500 mb-4">
          Vælg billeder fra SMK's samling. Du kan vælge op til{" "}
          <span className="font-bold">{maxImages}</span> billeder.
        </p>

        {/* Her kalder vi vores nye Server Component */}
        <SmkImageFetcher
          categories={categories}
          maxImages={maxImages}
          locationSelected={locationSelected}
          selectedImages={selectedImages} // Send selectedImages state (IDs) ned
          setSelectedImages={setSelectedImages} // Send setSelectedImages funktion ned
        />

        <CustomButton type="submit">
          {eventData ? "Gem Ændringer" : "Opret Event"}
        </CustomButton>
      </form>
    </Form>
  );
}
