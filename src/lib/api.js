// src/lib/api.js

// ASYNC SERVER FRA DANNIE ENDPOINTS
// ... (behold dine eksisterende event-relaterede funktioner som de er) ...
export async function getEvent() {
  const dataEvents = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events?limit=*"
  );
  const dataevent = await dataEvents.json();
  return dataevent;
}

export async function getEventId(id) {
  const dataEventsids = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events" + `/${id}`
  );
  const dataeventid = await dataEventsids.json();
  return dataeventid;
}

export async function getEventDates() {
  const EventsDates = await fetch(
    "https://ema-async-exhibit-server.onrender.com/dates"
  );
  const eventsdates = await EventsDates.json();
  return eventsdates;
}

export async function getEventLocations() {
  const EventsLocations = await fetch(
    "https://ema-async-exhibit-server.onrender.com/locations"
  );
  const eventslocations = await EventsLocations.json();
  return eventslocations;
}

export async function createEvent(eventData) {
  const response = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }
  );
  return response.json();
}

export async function updateEvent(id, eventData) {
  const response = await fetch(
    `https://ema-async-exhibit-server.onrender.com/events/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }
  );

  return response.json();
}

export async function deleteEvent(id) {
  const response = await fetch(
    `https://ema-async-exhibit-server.onrender.com/events/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// SMK ENDPOINTS

// Denne getSMK er sandsynligvis ikke længere i brug, da vi har en pagineret.
// Du kan kommentere den ud eller slette den.
export async function getSMK() {
  const datasSMK = await fetch(
    "https://api.smk.dk/api/v1/art/search/?keys=*&offset=0&rows=10",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const dataSMK = await datasSMK.json();
  const SMKItems = dataSMK.items;
  return SMKItems;
}

// Din gamle getSMKImg, der hentede alt, er nu kommenteret ud. Dette er KORREKT og VIGTIGT!
// export async function getSMKImg() { ... }

// **NY OG FORBEDRET FUNKTION TIL HENTNING AF SMK BILLEDER MED PAGINERING OG FILTRE**
export async function getSMKImagesPaginated(
  offset = 0,
  limit = 100,
  searchQuery = "",
  filters = [] // Forventer en array af strings som "[category:value]"
) {
  try {
    let url = `https://api.smk.dk/api/v1/art/search?`;
    let params = [];

    params.push(`offset=${offset}`);
    params.push(`rows=${limit}`);
    params.push(`filters=[has_image:true]`); // Altid sikre, at der er et billede

    if (searchQuery) {
      params.push(`keys=${encodeURIComponent(searchQuery)}`);
    }

    // Tilføj dynamiske filtre
    if (filters.length > 0) {
      filters.forEach((filter) => {
        params.push(`filters=${encodeURIComponent(filter)}`);
      });
    }

    url += params.join("&");

    console.log("DEBUG_API_PAGINATED_CALL: Fuld URL:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP fejl! Status: ${response.status} ved ${url}`);
    }

    const data = await response.json();

    return {
      items: data.items || [],
      totalFound: data.found || 0,
    };
  } catch (error) {
    console.error("Fejl ved hentning af paginerede SMK billeder:", error);
    throw error;
  }
}

export async function getArtworkByEventID(objectNumber) {
  // Tilføj headers for konsistens, selvom det måske virker uden
  const url = `https://api.smk.dk/api/v1/art?object_number=${objectNumber}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  const artImg = data.items?.[0]; // returnerer det første element fra items array
  return artImg;
}

// Filter
// **RETTELSE HER:** Brug den nye getSMKImagesPaginated for at være konsistent og mere robust
export async function getSMKFilter(filter, hasImg) {
  // `filter` er en streng (f.eks. "[artist:Rembrandt]")
  // `hasImg` er en boolean
  const filtersArray = [];
  if (filter) {
    filtersArray.push(filter);
  }
  if (hasImg) {
    // Denne check er måske redundant, da getSMKImagesPaginated allerede tilføjer [has_image:true]
    // If you need to explicitly add it here for some reason, ensure it's not duplicated in getSMKImagesPaginated
    // For now, let's assume getSMKImagesPaginated handles has_image.
  }

  // Kald den paginerede funktion for at hente de filtrerede elementer.
  // Her henter vi de første 100 resultater for dette specifikke filter.
  try {
    const result = await getSMKImagesPaginated(0, 100, "", filtersArray);
    return result.items;
  } catch (error) {
    console.error("Fejl i getSMKFilter:", error);
    return []; // Returner tom array ved fejl
  }
}

export async function getSMKFilterCat() {
  const {
    facets: { artist, techniques },
  } = await fetch(
    `https://api.smk.dk/api/v1/art/search/?keys=*&filters=[has_image:true]&filters=[object_names:maleri]&facets=techniques&facets=artist`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  const categories = [
    {
      name: "artist",
      label: { singular: "Kunstner", plural: "Kunstnere" },
      items: artist.toSorted(),
    },
    {
      name: "techniques",
      label: { singular: "Teknik", plural: "Teknikker" },
      items: techniques.toSorted(),
    },
  ];
  return categories;
}
