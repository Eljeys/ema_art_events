// src/components/global/TicketCounter.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import CustomButton from "@/components/global/CustomButton";
import useCartStore from "@/stores/ticketStore";
import { useRouter } from "next/navigation";

const TicketCounter = ({
  eventId,
  totalTickets,
  bookedTickets,
  pricePerTicket,
  eventDetails, // <--- Denne skal vi arbejde med
}) => {
  const router = useRouter();
  const {
    items,
    incrementTicketQuantity,
    decrementTicketQuantity,
    setEventInCart, // <--- Denne bruges til at gemme eventet
  } = useCartStore();

  const numericTotalTickets = parseFloat(totalTickets) || 0;
  const numericBookedTickets = parseFloat(bookedTickets) || 0;
  const remainingTickets = numericTotalTickets - numericBookedTickets;
  const isSoldOut = remainingTickets <= 0;

  const currentEventInCart = items.find((item) => item.id === eventId);

  let initialQuantity = currentEventInCart?.quantity || 1;
  if (initialQuantity > remainingTickets) {
    initialQuantity = remainingTickets;
  }
  if (remainingTickets <= 0) {
    initialQuantity = 0;
  }
  const currentTicketQuantity = initialQuantity;

  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    if (
      currentTicketQuantity <= remainingTickets &&
      currentTicketQuantity >= 0
    ) {
      setShowLimitWarning(false);
      setWarningMessage("");
    }
  }, [currentTicketQuantity, remainingTickets]);

  const handleIncrement = () => {
    if (isSoldOut) {
      setWarningMessage("Dette event er udsolgt.");
      setShowLimitWarning(true);
      return;
    }
    if (currentTicketQuantity >= remainingTickets) {
      setWarningMessage(`Kun ${remainingTickets} billetter tilbage!`);
      setShowLimitWarning(true);
      return;
    }

    // Ved inkrement: Opdater eventet i kurven
    // Sørg for at sende HELE eventDetails-objektet
    if (!currentEventInCart || currentEventInCart.quantity === 0) {
      setEventInCart({
        ...eventDetails, // Sørg for at eventDetails indeholder artImgs fra EventView
        quantity: Math.max(1, currentTicketQuantity + 1),
        totalTickets: numericTotalTickets,
        bookedTickets: numericBookedTickets,
      });
    } else {
      incrementTicketQuantity(eventId);
    }
    setShowLimitWarning(false);
    setWarningMessage("");
  };

  const handleDecrement = () => {
    if (currentTicketQuantity <= 1) {
      setWarningMessage("Du skal vælge mindst 1 billet.");
      setShowLimitWarning(true);
      return;
    }
    setShowLimitWarning(false);
    setWarningMessage("");
    decrementTicketQuantity(eventId);
  };

  const handleRegister = useCallback(() => {
    if (isSoldOut) {
      setWarningMessage("Dette event er udsolgt.");
      setShowLimitWarning(true);
      return;
    }
    if (currentTicketQuantity <= 0) {
      setWarningMessage("Vælg venligst mindst 1 billet, hvis tilgængeligt.");
      setShowLimitWarning(true);
      return;
    }

    // VIGTIGSTE RETTELSE ER HER:
    // Sørg for at setEventInCart modtager eventDetails som en del af event-objektet,
    // og tilføj den aktuelle mængde billetter.
    setEventInCart({
      ...eventDetails, // Dette objekt skal indeholde artImgs fra EventView
      quantity: currentTicketQuantity,
      totalTickets: numericTotalTickets,
      bookedTickets: numericBookedTickets,
    });

    console.log("DEBUG TicketCounter: Data sendes til kurven:", {
      ...eventDetails,
      quantity: currentTicketQuantity,
    });

    // Naviger til betalingssiden
    router.push(`/paymentpage`); // Next.js router.push without query params
  }, [
    eventId,
    currentTicketQuantity,
    eventDetails, // Inkluder eventDetails i useCallback afhængigheder
    setEventInCart,
    router,
    isSoldOut,
    numericTotalTickets,
    numericBookedTickets,
  ]);

  return (
    <div className="flex items-center gap-4 mt-4 relative">
      <div className="flex items-center gap-2 border rounded-md p-1 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={handleDecrement}
          className="size-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Fjern en billet"
          disabled={currentTicketQuantity <= 1 || isSoldOut}
        >
          <FaMinus className="size-3" />
        </button>
        <span className="text-md font-medium text-gray-800 dark:text-gray-200 min-w-[25px] text-center">
          {currentTicketQuantity}
        </span>
        <button
          onClick={handleIncrement}
          className="size-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:not-hover:bg-gray-300"
          aria-label="Tilføj en billet"
          disabled={
            currentTicketQuantity >= remainingTickets ||
            isSoldOut ||
            remainingTickets <= 0
          }
        >
          <FaPlus className="size-3 " />
        </button>
      </div>

      {showLimitWarning && warningMessage && (
        <p className="text-red-500 text-sm absolute bottom-[-25px] left-0 w-full text-left">
          {warningMessage}
        </p>
      )}
      <CustomButton
        onClick={handleRegister}
        text={isSoldOut ? "Udsolgt" : "Tilmeld"}
        disabled={isSoldOut || currentTicketQuantity <= 0}
      />
    </div>
  );
};

export default TicketCounter;
