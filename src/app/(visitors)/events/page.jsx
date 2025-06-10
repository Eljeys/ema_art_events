// /app/events/page.jsx
// Vigtigt: INGEN "use client"; her. Dette er en Server Komponent.
import {
  getEvent,
  getEventDates,
  getEventLocations,
  getSMK, // Behold denne, hvis du stadig bruger den på Events-siden for noget andet
  getArtworkByEventID,
  getSMKFilterCat, // Behold denne, hvis du stadig bruger den på Events-siden for noget andet
} from "@/lib/api";

// Importér den nye centrale klientkomponent til event-filtrering og liste-visning
import EventFilterAndList from "@/components/global/filter/EventFilterAndList"; // <-- STIEN ER NU TILPASSET DIN STRUKTUR

export default async function Events() {
  // Hent alle rådata på serveren FØRST
  const eventListRaw = await getEvent();
  const eventsDates = await getEventDates();
  const eventsLocations = await getEventLocations();
  const smkData = await getSMK(); // Hent SMK data, hvis relevant for andre UI-elementer her
  const categories = await getSMKFilterCat(); // Hent SMK kategorier, hvis relevant for andre UI-elementer her

  // Berig alle events med kunstværksdata på serveren
  // Dette sker kun én gang, når siden indlæses, og de berigede events sendes til klienten.
  const eventListWithArtwork = await Promise.all(
    eventListRaw.map(async (event) => {
      let artImgsData = [];

      if (event.artworkIds && event.artworkIds.length > 0) {
        artImgsData = await Promise.all(
          event.artworkIds.map(async (artworkId) => {
            try {
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
        artImgsData = artImgsData.filter((img) => img !== null); // Filtrer eventuelle null-værdier fra
      }
      // console.log(`Events Page (Server): Event ID ${event.id} har artImgs:`, artImgsData.length); // Fjern denne log
      return {
        ...event,
        artImgs: artImgsData, // <- Send det samlede array af billeddata
      };
    })
  );

  return (
    <main>
      {/* Send de FULDT berigede og ufiltrerede events til EventFilterAndList.
          EventFilterAndList vil selv håndtere filtrering via Server Actions. */}
      <EventFilterAndList
        initialEvents={eventListWithArtwork} // Vigtigt: Send de berigede events her
        availableDates={eventsDates}
        availableLocations={eventsLocations}
        // categories={categories} // Send kun denne, hvis den bruges INDE I EventFilterAndList for noget andet end events-filtrering
      />
      {/* Hvis du har en separat SMK-filterkomponent på Events-siden, skal den inkluderes her. */}
    </main>
  );
}
