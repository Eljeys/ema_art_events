// ASYNC SERVER FRA DANNIE ENDPOINTS

export async function getEvent() {
  const dataEvents = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events?limit=*"
  ); //skift url med eksterne server side når det er deployet
  const dataevent = await dataEvents.json();
  return dataevent;
}

export async function getEventId(id) {
  const dataEventsids = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events" + `/${id}`
  ); //skift url med eksterne server side når det er deployet
  const dataeventid = await dataEventsids.json();
  return dataeventid;
}

export async function getEventDates() {
  const EventsDates = await fetch(
    "https://ema-async-exhibit-server.onrender.com/dates"
  ); //skift url med eksterne server side når det er deployet
  const eventsdates = await EventsDates.json();
  return eventsdates;
}

export async function getEventLocations() {
  const EventsLocations = await fetch(
    "https://ema-async-exhibit-server.onrender.com/locations"
  ); //skift url med eksterne server side når det er deployet
  const eventslocations = await EventsLocations.json();
  return eventslocations;
}

// SMK ENDPOINTS

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

// MODIFICERET: getSMKImg funktionen til at håndtere filtre og et højere antal rækker
export async function getSMKImg(filters = []) {
  // <-- Tilføjet 'filters' parameter med standardværdi
  const filterString =
    filters.length > 0 ? `&filters=[${filters.join("],[")}]` : "";
  // Sæt et højt antal rækker (f.eks. 500 eller 1000) for at hente mange billeder
  const url = `https://api.smk.dk/api/v1/art/search?keys=*&offset=0&rows=500${filterString}&filters=[has_image:true]`; // <-- Rows sat til 500, og filterString tilføjet

  console.log("DEBUG_API: Henter SMK-billeder med URL:", url);

  const datasSMK = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Ingen cache for dynamiske/filtrerede resultater
  });

  if (!datasSMK.ok) {
    const errorText = await datasSMK.text();
    console.error(
      "Fejl ved hentning af SMK-billeder (getSMKImg):",
      datasSMK.status,
      errorText
    );
    throw new Error(
      `Failed to fetch SMK images: ${datasSMK.status} ${datasSMK.statusText}`
    );
  }

  const dataSMK = await datasSMK.json();
  const SMKimages = dataSMK.items;
  const totalFound = dataSMK.totalFound; // Inkluder totalFound, hvis du vil vise det på klienten

  return { items: SMKimages, totalFound: totalFound }; // Returner et objekt med items og totalFound
}

export async function getArtworkByEventID(objectNumber) {
  const url = `https://api.smk.dk/api/v1/art?object_number=${objectNumber}`;
  const res = await fetch(url);
  const data = await res.json();
  const artImg = data.items?.[0];
  return artImg;
}

// Filter (getSMKFilter behøves ikke længere, da getSMKImg nu håndterer filtrering)
// Eksisterende getSMKFilter kan fjernes eller beholdes, hvis den bruges andre steder.
// Hvis den kun bruges her, kan den fjernes.
export async function getSMKFilter(filter, hasImg) {
  const { items } = await fetch(
    `https://api.smk.dk/api/v1/art/search/?keys=*${
      filter && `&filters=${filter}`
    }${hasImg ? "&filters=[has_image:true]" : ""}&offset=0&rows=100`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
  return items;
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

// --------------------------------   Til Event Create, Edit og Delete   --------------------------------------------//

// VIGTIGT: Disse funktioner er ændret til at returnere HELE response-objektet,
// så vi kan tjekke 'response.ok' og derefter parse JSON i komponenten.
export async function createEvent(indhold) {
  const response = await fetch(
    "https://ema-async-exhibit-server.onrender.com/events",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(indhold),
    }
  );
  return response; // Returnerer nu hele Response-objektet
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
  return response; // Returnerer nu hele Response-objektet
}
export async function deleteEvent(id, eventData) {
  const response = await fetch(
    `https://ema-async-exhibit-server.onrender.com/events/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }
  );

  return response.json(); // Denne kan forblive som den er, hvis du kun bruger den til at få bekræftelse
}
