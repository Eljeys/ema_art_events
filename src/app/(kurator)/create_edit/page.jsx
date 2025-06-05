// src/app/(pages)/(kurator)/create_edit/page.jsx

import {
  getEventDates,
  getEventLocations,
  getEventId, // Antager du har en getEventId, der henter et enkelt event
  getSMKFilterCat,
  // getSMKImg, // <--- Denne skal være fjernet!
} from "@/lib/api";

import { Kuratorform } from "@/components/kurator_create_edit/KuratorForm";

// Vi modtager searchParams som en prop igen – dette er den korrekte måde
export default async function CreateEdit({ searchParams }) {
  // eventId er nu direkte tilgængelig fra searchParams
  const eventId = searchParams?.eventId;
  console.log("DEBUG_PAGE: eventId hentet via searchParams:", eventId); // Debug for at bekræfte

  const dates = await getEventDates();
  const locations = await getEventLocations();

  // ***** FØLGENDE BLOK SKAL FJERNET HELT FRA DENNE FIL *****
  // Disse linjer forårsagede ReferenceError, fordi getSMKImg ikke er importeret her.
  // getSMKImg kaldet og håndteringen af smkImages er flyttet til KuratorForm.jsx.
  // const smkApiResponse = await getSMKImg();
  // const smkImages = smkApiResponse?.items || [];
  // console.log("DEBUG_PAGE: smkImages array i page.js (længde):", smkImages.length);
  // **********************************************************

  const categories = await getSMKFilterCat();

  let eventToEdit = null;

  if (eventId) {
    // Fortsæt kun hvis eventId har en værdi
    try {
      eventToEdit = await getEventId(eventId); // Brug getEventId her
      console.log("DEBUG_PAGE: Event hentet til redigering:", eventToEdit?.id);
    } catch (error) {
      console.error("Fejl ved hentning af event til redigering:", error);
    }
  }

  const selectedLocationData = eventToEdit
    ? locations.find((loc) => loc.id === eventToEdit.location?.id)
    : null;

  const maxImages = selectedLocationData?.maxGuests || 5; // Standard til 5, hvis intet er valgt

  return (
    <section>
      <h1>{eventToEdit ? "Rediger Event" : "Opret nyt Event"}</h1>
      <Kuratorform
        eventDates={dates}
        eventLocations={locations}
        eventData={eventToEdit}
        // smkImages={smkImages} // <--- Denne prop skal IKKE sendes herfra, da den nu håndteres i KuratorForm
        categories={categories}
        maxImages={maxImages}
      />
    </section>
  );
}
