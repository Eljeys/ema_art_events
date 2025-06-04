import {
  getEventDates,
  getEventLocations,
  getEventId,
  getSMKImg, // Importér denne for at hente billeder
  getSMKFilterCat, // Importér denne for at hente filterkategorier
} from "@/lib/api";

import { Kuratorform } from "@/components/kurator_create_edit/KuratorForm";

export default async function CreateEdit({ searchParams }) {
  const dates = await getEventDates();
  const locations = await getEventLocations();
  const smkImages = await getSMKImg(); // Hent alle SMK-billeder
  const categories = await getSMKFilterCat(); // Hent SMK-filterkategorier

  let eventToEdit = null;
  const eventId = searchParams.eventId;

  if (eventId) {
    try {
      eventToEdit = await getEventId(eventId);
    } catch (error) {
      console.error("Fejl ved hentning af event til redigering:", error);
      // Overvej at vise en fejlmeddelelse til brugeren her
    }
  }

  // Find den valgte lokation, hvis et event redigeres
  const selectedLocationData = eventToEdit
    ? locations.find((loc) => loc.id === eventToEdit.location?.id)
    : null;

  // Bestem maxImages baseret på den valgte lokations maxGuests (eller lignende)
  // Standard til en fornuftig værdi, hvis ikke specificeret
  const maxImages = selectedLocationData?.maxGuests || 5; // Antager maxGuests på lokation
  // eller en anden logik for at bestemme max billeder pr. lokation

  return (
    <section>
      <h1>{eventToEdit ? "Rediger Event" : "Opret nyt Event"}</h1>
      <Kuratorform
        eventDates={dates}
        eventLocations={locations}
        eventData={eventToEdit}
        smkImages={smkImages} // Send SMK-billeder ned
        categories={categories} // Send kategorier ned
        maxImages={maxImages} // Send maxImages ned
      />
    </section>
  );
}
