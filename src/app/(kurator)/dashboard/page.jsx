import {
  getEvent,
  getArtworkByEventID,
  getEventDates,
  getEventLocations,
  getSMKFilterCat,
} from "@/lib/api";

import EventListWithFilter from "@/components/global/EventListWithFilter";

export default async function Dashboard() {
  const eventListRaw = await getEvent();
  const eventsDates = await getEventDates();
  const eventsLocations = await getEventLocations();
  //Filter start
  const categories = await getSMKFilterCat();
  //Filter end

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
