// src/components/global/EventItem.jsx
"use client";

import Image from "next/image";
import Placeholder from "@/app/assets/img/placeholder.png";
import EventItemText from "./EventItemText";

// Import CustomButton er ikke nødvendig her, hvis den kun bruges til "Køb billet"
// import CustomButton from "./CustomButton"; // KAN FJERNES

import { useRouter } from "next/navigation";
// useCartStore og useState er ikke nødvendige, da vi ikke køber herfra
// import useCartStore from "@/stores/ticketStore"; // KAN FJERNES
// import { useState } from "react"; // KAN FJERNES

// Modtag dataevent direkte som en prop.
// dataevent indeholder nu alle de oprindelige event-props (id, title, date, etc.) PLUS de berigede artImgs
const EventItem = (dataevent) => {
  // Modtager HELE dataevent-objektet
  // Udtræk artImgs fra dataevent
  const artImgs = dataevent.artImgs;

  // Vælg det første billede fra arrayet, hvis det findes
  const primaryArtImg = artImgs && artImgs.length > 0 ? artImgs[0] : null;

  const router = useRouter(); // Kan eventuelt fjernes, hvis den ikke bruges til andet her

  // Fjern al logik for at tilføje til kurv, da det ikke er EventItems ansvar
  // const { setEventInCart } = useCartStore();
  // const [ticketQuantity, setTicketQuantity] = useState(1);
  // const handleQuantityChange = (newQuantity) => { setTicketQuantity(newQuantity); };
  // const handleEnrollClick = () => { /* ... */ };

  // Bestem billed-URL
  const imageUrl = primaryArtImg?.image_thumbnail || Placeholder.src;

  return (
    <article className="grid @max-[474px]:grid-cols-1 @max-[474px]:grid-rows-auto @min-[475px]:grid-cols-2 @min-[475px]:grid-rows-1">
      <figure className="max-w-[210px] h-[325px] md:col-1 grid grid-cols-1 grid-rows-3 ">
        {/* Baggrundsfarve */}
        <div
          className={`max-w-[180px] h-[250px] rounded-sm row-span-2 row-start-1 col-start-1`}
          style={{
            backgroundColor:
              primaryArtImg?.suggested_bg_color?.[0] || "#CCCCCC", // Bemærk .[0] da suggested_bg_color er et array
          }}
        ></div>

        <div className=" max-w-[180px] h-[250px] col-1 row-start-2 row-span-2 self-end justify-self-end rounded-lg">
          <Image
            src={imageUrl}
            alt={primaryArtImg?.title || dataevent.title || "Event billede"}
            width={500}
            height={500}
            className=" h-full object-cover rounded-lg"
            priority={false}
          />
        </div>
      </figure>

      <EventItemText
        {...dataevent}
        totalTickets={dataevent.location?.maxGuests}
        bookedTickets={dataevent.bookedTickets}
        // Fjern showTicketCounter, onQuantityChange, currentQuantity, da TicketCounter ikke skal være her
        // showTicketCounter={true}
        // onQuantityChange={handleQuantityChange}
        // currentQuantity={ticketQuantity}
        artImg={primaryArtImg}
      ></EventItemText>

      {/* Fjern hele div'en med knapper, da "Køb billet" ikke skal være her */}
      {/*
      <div className="mt-4 flex gap-2">
        <CustomButton text="Køb billet" onClick={handleEnrollClick} />
        {dataevent.children}
      </div>
      */}
    </article>
  );
};

export default EventItem;
