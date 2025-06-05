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
      let artImgData = null;
      if (event.artworkIds && event.artworkIds.length > 0) {
        artImgData = await getArtworkByEventID(event.artworkIds[0]);
      }
      return {
        ...event,
        artImg: artImgData,
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
