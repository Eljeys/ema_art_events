"use client";
import React, { useState } from "react"; // Importer useState
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from "date-fns";
import { da } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { createEvent, updateEvent } from "@/lib/api";

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
import KuratorGallery from "@/components/kurator_create_edit/KuratorGallery"; // Importer Gallery-komponenten

// Definer skema med Zod til validering
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
  // Tilføj artworkIds til skemaet (array af strenge)
  artworkIds: z.array(z.string()).optional(),
});

export function Kuratorform({
  eventDates,
  eventLocations,
  eventData,
  smkImages, // Modtag smkImages
  categories, // Modtag kategorier
  maxImages, // Modtag maxImages
}) {
  const router = useRouter();

  // State til at holde styr på de valgte billeder
  // Forudfyld med eksisterende billeder fra eventData
  const [selectedImages, setSelectedImages] = useState(
    eventData?.artworkIds || []
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventData?.title || "",
      locationId: eventData?.location?.id || "",
      date: eventData?.date ? parseISO(eventData.date) : undefined,
      description: eventData?.description || "",
      artworkIds: eventData?.artworkIds || [], // Forudfyld artworkIds
    },
  });

  // Brug useEffect til at opdatere form'ens felt for artworkIds, når selectedImages ændres
  React.useEffect(() => {
    form.setValue("artworkIds", selectedImages, { shouldValidate: true });
  }, [selectedImages, form]);

  React.useEffect(() => {
    if (eventData) {
      form.reset({
        title: eventData.title || "",
        locationId: eventData.location?.id || "",
        date: eventData.date ? parseISO(eventData.date) : undefined,
        description: eventData.description || "",
        artworkIds: eventData.artworkIds || [], // Sørg for at nulstille artworkIds her
      });
      setSelectedImages(eventData.artworkIds || []); // Nulstil også den lokale state for selectedImages
    } else {
      form.reset({
        title: "",
        locationId: "",
        date: undefined,
        description: "",
        artworkIds: [],
      });
      setSelectedImages([]); // Nulstil til tom array ved ny oprettelse
    }
  }, [eventData, form]);

  const allowedDates = React.useMemo(() => {
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
      artworkIds: selectedImages, // Sørg for at inkludere de valgte billeder
    };

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
      console.error("Fejl ved håndtering af event:", error);
      alert("Der skete en fejl under håndtering af eventet.");
    }
  };

  // Bestem om en lokation er valgt (nødvendig for at vise Galleriet)
  const locationSelected = !!form.watch("locationId");

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

        {/* Billedevalg sektion */}
        <Step number="2" text="Vælg billeder til eventet" />
        <p className="text-sm text-gray-500 mb-4">
          Vælg billeder fra SMK's samling. Du kan vælge op til{" "}
          <span className="font-bold">{maxImages}</span> billeder.
        </p>
        <KuratorGallery
          smkdata={{ smk: smkImages }} // Send smkImages som 'smk' property
          categories={categories}
          maxImages={maxImages}
          locationSelected={locationSelected} // Send om en lokation er valgt
          currentlySelectedArtworks={selectedImages} // Brug selectedImages state her
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          // handleImageSelect behøver ikke at sendes her, da det håndteres internt af Gallery/GalleryCard
        />

        <CustomButton type="submit">
          {eventData ? "Gem Ændringer" : "Opret Event"}
        </CustomButton>
      </form>
    </Form>
  );
}
