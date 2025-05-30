import Step from "@/components/kurator_create_edit/Step";
import { useForm } from "react-hook-form";
import {
  getEventDates,
  getSMK,
  getSMKImg,
  getSMKFilter,
  getEventLocations,
  getEventId,
} from "@/lib/api";
import EventForm from "@/components/kurator_create_edit/EventForm";
import KuratorForm from "@/components/kurator_create_edit/KuratorForm";

export default async function Create_Edit({ searchParams }) {
  const { dataArtists, dataTechniques } = await getSMKFilter();
  console.log(
    "Page create_edit: dataArtists: ",
    dataArtists,
    "dataTechniques: ",
    dataTechniques
  );

  const eventsdates = await getEventDates();
  const eventslocations = await getEventLocations();
  const eventId = searchParams.eventId;
  let initialEventData = null;
  let maxImagesForLocation = 0;
  let locations = [];
  try {
    try {
      const fetchedLocations = await getEventLocations();
      if (Array.isArray(fetchedLocations)) {
        locations = fetchedLocations;
      } else {
        console.warn(
          "SERVER WARN: getEventLocations returned non-array data:",
          fetchedLocations
        );
      }
    } catch (locationError) {
      console.error("SERVER ERROR: Failed to fetch locations:", locationError);
    }

    const smkGeneralImages = await getSMKImg();
    console.log(
      "SERVER LOG: SMK general images fetched (count):",
      smkGeneralImages ? smkGeneralImages.length : "No data"
    );

    if (eventId) {
      try {
        initialEventData = await getEventId(eventId);
        console.log(
          "SERVER LOG: Fetched initial event data for editing:",
          initialEventData
        );

        if (
          initialEventData &&
          initialEventData.locationId &&
          Array.isArray(locations)
        ) {
          const selectedLocation = locations.find(
            (loc) => String(loc.id) === String(initialEventData.locationId)
          );

          if (selectedLocation) {
            maxImagesForLocation = Number(selectedLocation.maxArtworks) || 0;
            console.log(
              "SERVER LOG: Max images for selected location (from fetched event):",
              maxImagesForLocation
            );
          }
        }
      } catch (error) {
        console.error(
          `SERVER ERROR: Error fetching event with ID ${eventId}:`,
          error
        );
        initialEventData = null;
      }
    } else {
      console.log(
        "SERVER LOG: No eventId found in searchParams, creating new event."
      );
    }

    const finalSmkDataForGallery = { smk: smkGeneralImages || [] };

    console.log(
      "SERVER LOG: Final combined SMK data sent to KuratorForm (count):",
      finalSmkDataForGallery.smk.length
    );

    return (
      <KuratorForm
        initialEventData={initialEventData}
        smk={finalSmkDataForGallery}
        maxImages={maxImagesForLocation}
        locations={locations}
        dataArtists={dataArtists}
        dataTechniques={dataTechniques}
        eventsDates={eventsdates}
        eventsLocations={eventslocations}
      />
    );
  } catch (error) {
    console.error("SERVER ERROR: General error in CreateEditEventPage:", error);
    return (
      <p className="text-red-500">
        Fejl under indlæsning af data: {error.message}
      </p>
    );
  }
}
