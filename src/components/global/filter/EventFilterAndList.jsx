// src/components/global/filter/EventFilterAndList.jsx
"use client";

import React, { useActionState, startTransition } from "react"; // <-- TILFØJET startTransition
import { usePathname } from "next/navigation";

import EventFilterDropdown from "./EventFilterDropdown";
import { filterEvents } from "./filterEvents";
import EventListWithFilter from "../EventListWithFilter";

export default function EventFilterAndList({
  initialEvents,
  availableDates,
  availableLocations,
}) {
  const pathname = usePathname();

  const [filterState, formAction, isFiltering] = useActionState(filterEvents, {
    active: [],
    data: initialEvents,
    totalFound: initialEvents.length,
  });

  // RETTELSE HER: Pakk formAction ind i startTransition
  const handleFilterSelection = (value, name) => {
    let currentFilters = filterState.active.filter(
      (f) => !f.startsWith(`${name}:`)
    );
    let newFilters = [...currentFilters];

    if (value !== "all") {
      newFilters.push(`${name}:${value}`);
    }

    // VIGTIG RETTELSE: Brug startTransition her
    startTransition(() => {
      // <-- Start en transition
      formAction(newFilters); // <-- Kald Server Actionen inde i transitionen
    });
  };

  const selectedDateValue =
    filterState.active.find((f) => f.startsWith("date:"))?.split(":")[1] ||
    "all";
  const selectedLocationValue =
    filterState.active
      .find((f) => f.startsWith("locationId:"))
      ?.split(":")[1] || "all";

  return (
    <>
      {(pathname === "/dashboard" || pathname === "/events") && (
        <aside className="flex flex-row items-center gap-4 px-2 py-1 mb-8">
          <EventFilterDropdown
            name="date"
            label={{ singular: "Dato", plural: "Datoer" }}
            items={availableDates}
            onValueChange={(value) => handleFilterSelection(value, "date")}
            selectedValue={selectedDateValue}
          />
          <EventFilterDropdown
            name="locationId"
            label={{ singular: "Lokation", plural: "Lokationer" }}
            items={availableLocations}
            onValueChange={(value) =>
              handleFilterSelection(value, "locationId")
            }
            selectedValue={selectedLocationValue}
          />
          {isFiltering && (
            <p className="ml-4 text-blue-600">Indlæser events...</p>
          )}
        </aside>
      )}

      <EventListWithFilter
        displayedEvents={filterState.data}
        availableLocations={availableLocations}
      />
    </>
  );
}
