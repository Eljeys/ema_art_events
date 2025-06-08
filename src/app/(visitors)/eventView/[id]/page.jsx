import OpacityTextBox from "@/components/global/OpacityTextBox";
import TicketCounter from "@/components/global/TicketCounter";
import { getEventId, getArtworkByEventID } from "@/lib/api";
import Placeholder from "@/app/assets/img/placeholder.png";
import Gallery from "@/components/eventView/Gallery";

export default async function EventView({ params, searchParams }) {
  const { id } = await params;
  const { backgroundArtworkId } = await searchParams;

  const dataeventid = await getEventId(id);

  if (!dataeventid) {
    return (
      <div className="event-view-background w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Eventet blev ikke fundet.</p>
      </div>
    );
  }

  let allArtworkDetails = [];
  if (dataeventid.artworkIds && dataeventid.artworkIds.length > 0) {
    allArtworkDetails = await Promise.all(
      dataeventid.artworkIds.map(async (artworkId) => {
        const artwork = await getArtworkByEventID(artworkId);
        return {
          id: artworkId,
          thumbnail: artwork?.image_thumbnail || Placeholder.src,
          suggested_bg_color: artwork?.suggested_bg_color || ["#f0f0f0"],
          title: artwork?.titles?.[0]?.title || "Ukendt Titel",
        };
      })
    );
  }

  let currentArtworkForBackground = null;
  if (backgroundArtworkId) {
    currentArtworkForBackground = allArtworkDetails.find(
      (art) => art.id === backgroundArtworkId
    );
  }

  if (!currentArtworkForBackground && allArtworkDetails.length > 0) {
    currentArtworkForBackground = allArtworkDetails[0];
  }

  const eventDate = dataeventid.date
    ? new Date(dataeventid.date).toLocaleDateString("da-DK")
    : "Ukendt dato";
  const eventLocationName = dataeventid.location?.name || "Ukendt lokation";

  const opacityBoxTitle = `${eventDate} - ${eventLocationName}`;
  const opacityBoxContent = `${dataeventid.title}\n\n${dataeventid.description}`;

  const eventDetailsForCounter = {
    id: dataeventid.id,
    title: dataeventid.title,
    date: dataeventid.date,
    location: dataeventid.location,
    pricePerTicket: dataeventid.pricePerTicket || 45,
    artImg: currentArtworkForBackground,
    description: dataeventid.description,
    time: dataeventid.time,
    totalTickets: dataeventid.location?.maxGuests,
    bookedTickets: dataeventid.bookedTickets,
  };

  return (
    <div
      className="event-view-background w-full h-screen overflow-hidden"
      style={{
        backgroundImage: currentArtworkForBackground?.thumbnail
          ? `url(${currentArtworkForBackground.thumbnail})`
          : "none",
        backgroundColor: currentArtworkForBackground?.suggested_bg_color?.[0]
          ? currentArtworkForBackground.suggested_bg_color[0]
          : "#f0f0f0",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition:
          "background-image 0.5s ease-in-out, background-color 0.5s ease-in-out",
      }}
    >
      <main className="z-20 w-full h-full p-6 grid grid-cols-1 grid-rows-[1fr_1fr_auto] gap-4 md:grid-cols-2">
        <section className="col-start-1 row-start-2 h-full flex flex-col justify-end items-start">
          <OpacityTextBox
            title={opacityBoxTitle}
            content={opacityBoxContent}
            className="p-4 max-w-md mb-4"
            maxContentHeightClasses="overflow-y-auto"
          />

          <TicketCounter
            eventId={dataeventid.id}
            totalTickets={dataeventid.location?.maxGuests}
            bookedTickets={dataeventid.bookedTickets}
            pricePerTicket={dataeventid.pricePerTicket || 45}
            eventDetails={eventDetailsForCounter}
          />
        </section>

        <section className="col-start-1 md:col-start-2 row-start-3 justify-self-center md:justify-self-end self-end mb-4 mr-4">
          <Gallery galleryData={allArtworkDetails} />
        </section>
      </main>
    </div>
  );
}
