import {
  getEvent,
  getEventDates,
  getEventLocations,
  getSMK,
  getArtworkByEventID,
  getSMKFilterCat,
} from "@/lib/api";

import EventListWithFilter from "@/components/global/EventListWithFilter";

export default async function Events() {
  const eventListRaw = await getEvent();
  const eventsDates = await getEventDates();
  const smk = await getSMK();
  const eventsLocations = await getEventLocations();
  const categories = await getSMKFilterCat();

  const eventListWithArtwork = await Promise.all(
    eventListRaw.map(async (event) => {
      let artImgsData = [];

      if (event.artworkIds && event.artworkIds.length > 0) {
        // Brug Promise.all til at hente data for ALLE billed-ID'er parallelt
        artImgsData = await Promise.all(
          event.artworkIds.map(async (artworkId) => {
            try {
              // Hent data for hvert enkelt artworkId
              const imgData = await getArtworkByEventID(artworkId);
              return imgData;
            } catch (error) {
              console.error(
                `Fejl ved hentning af billede med ID ${artworkId}:`,
                error
              );
              return null; // Returner null eller et standardobjekt ved fejl
            }
          })
        );
        // Filtrer eventuelle null-værdier fra, hvis en hentning fejlede
        artImgsData = artImgsData.filter((img) => img !== null);
      }
      console.log(`Dashboard: Event ID ${event.id} har artImgs:`, artImgsData);
      return {
        ...event,
        artImgs: artImgsData, // <- Send det samlede array af billeddata
      };
    })
  );

  return (
    <main>
      <EventListWithFilter
        initialEvents={eventListWithArtwork}
        availableDates={eventsDates}
        availableLocations={eventsLocations}
        categories={categories}
      />
    </main>
  );
}
