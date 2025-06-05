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

export async function getSMKImg() {
  const datasSMK = await fetch(
    "https://api.smk.dk/api/v1/art/search?keys=*&filters=[has_image:true]&offset=0&rows=8",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const dataSMK = await datasSMK.json();
  const SMKimages = dataSMK.items;
  return SMKimages;
}

export async function getArtworkByEventID(objectNumber) {
  const url = `https://api.smk.dk/api/v1/art?object_number=${objectNumber}`;
  const res = await fetch(url);
  const data = await res.json();
  const artImg = data.items?.[0];
  return artImg;
}

// Filter
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

  return response.json();
}
