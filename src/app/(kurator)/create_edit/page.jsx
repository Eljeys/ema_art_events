import KuratorForm from "@/components/kurator_create_edit/KuratorForm";
import { getEvent, getEventId, getEventLocations, getSMKImg } from "@/lib/api";

export default async function CreateEditEventPage({ searchParams }) {
  const images = await getSMKImg();
  const events = await getEvent();
  const locations = await getEventLocations();
  const eventId = await searchParams.eventId;
  let prevData = null;
  if (eventId) {
    prevData = await getEventId(eventId);
  }

  console.log(
    "page: ",
    "images",
    images,
    "events",
    events,
    "locations",
    locations,
    "eventId",
    eventId,
    "prevData",
    prevData
  );
  return (
    <main>
      <h1>Create Edit</h1>
      <KuratorForm
        images={images}
        events={events}
        locations={locations}
        prevData={prevData}
      ></KuratorForm>
    </main>
  );
}
