// src/components/global/filter/filterEvents.js
"use server";

import { getEvent, getArtworkByEventID } from "@/lib/api";

export async function filterEvents(prevState, filters) {
  try {
    const eventListRaw = await getEvent();
    const allEventsWithArtwork = await Promise.all(
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
                  `Fejl ved hentning af kunstværk ID ${artworkId}:`,
                  error
                );
                return null;
              }
            })
          );
          artImgsData = artImgsData.filter((img) => img !== null);
        }
        return { ...event, artImgs: artImgsData };
      })
    );

    let filteredData = allEventsWithArtwork;

    const activeFilterMap = new Map();
    filters.forEach((filterString) => {
      const [filterName, filterValue] = filterString.split(":");
      activeFilterMap.set(filterName, filterValue);
    });

    const selectedDate = activeFilterMap.get("date");
    const selectedLocationId = activeFilterMap.get("locationId");

    if (selectedDate && selectedDate !== "all") {
      filteredData = filteredData.filter(
        (event) => event.date === selectedDate
      );
    }

    if (selectedLocationId && selectedLocationId !== "all") {
      filteredData = filteredData.filter(
        (event) => event.locationId?.toString() === selectedLocationId
      );
    }

    return {
      active: filters,
      data: filteredData,
      totalFound: filteredData.length,
    };
  } catch (error) {
    console.error("Fejl i filterEvents action:", error);
    return {
      active: filters,
      data: [],
      error: "Fejl ved filtrering af events.",
      totalFound: 0,
    };
  }
}
