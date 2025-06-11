// src/stores/ticketStore.js
import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],

  setEventInCart: (eventDetails) =>
    set((state) => {
      // VIGTIGT: Sørg for at totalTickets og bookedTickets er numeriske.
      // Brug parseFloat for at håndtere tilfælde, hvor de måtte være strenge ("40") eller null.
      const total = parseFloat(eventDetails.totalTickets) || 0;
      const booked = parseFloat(eventDetails.bookedTickets) || 0;
      const availableTickets = total - booked;

      let validatedQuantity = Math.max(1, eventDetails.quantity || 1);

      // **NY LOGIK HER: Juster den ønskede mængde ned, hvis den overstiger tilgængelige billetter**
      if (validatedQuantity > availableTickets) {
        console.warn(
          `[ticketStore] Forsøgte at sætte ${validatedQuantity} billetter, men kun ${availableTickets} er tilgængelige. Justerer tilgængelige billetter.`
        );
        validatedQuantity = availableTickets;
      }

      // Håndter tilfældet hvor der slet ikke er billetter tilgængelige (udsolgt)
      if (availableTickets <= 0) {
        console.warn(
          `[ticketStore] Eventet er udsolgt, kan ikke tilføje billetter.`
        );
        // Ryd kurven hvis eventet er udsolgt, så man ikke kan tilføje det
        return { items: [] };
      }

      const validatedPrice = eventDetails.pricePerTicket || 45;

      // Find det eksisterende element i kurven for at undgå at tilføje duplikater
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === eventDetails.id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        // Hvis eventet allerede er i kurven, opdater mængden
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: validatedQuantity,
                pricePerTicket: validatedPrice,
                totalTickets: total, // Opdater også total/booked, hvis de har ændret sig
                bookedTickets: booked,
              }
            : item
        );
      } else {
        // Hvis eventet ikke er i kurven, tilføj det
        updatedItems = [
          ...state.items,
          {
            ...eventDetails,
            quantity: validatedQuantity,
            pricePerTicket: validatedPrice,
            totalTickets: total, // Gem de validerede totalTickets i store
            bookedTickets: booked, // Gem de validerede bookedTickets i store
          },
        ];
      }

      return { items: updatedItems };
    }),

  // Øger mængden af det event, der er i kurven.
  incrementTicketQuantity: (eventId) =>
    set((state) => {
      const itemToUpdate = state.items.find((item) => item.id === eventId);
      if (!itemToUpdate) return state;

      // VIGTIGT: Sørg for at totalTickets og bookedTickets er numeriske i den gemte vare.
      const total = parseFloat(itemToUpdate.totalTickets) || 0;
      const booked = parseFloat(itemToUpdate.bookedTickets) || 0;
      const availableTickets = total - booked;

      const newQuantity = itemToUpdate.quantity + 1;

      // **NY LOGIK HER: Forhindre inkrementering over tilgængelige billetter**
      if (newQuantity > availableTickets) {
        console.warn(
          `[ticketStore] Kan ikke øge antallet over tilgængelige billetter (${availableTickets}).`
        );
        return state; // Returner den uændrede state
      }

      return {
        items: state.items.map((item) =>
          item.id === eventId ? { ...item, quantity: newQuantity } : item
        ),
      };
    }),

  // Reducerer mængden af det event, der er i kurven (fjerner eventuelt ved 0, men min. 1)
  decrementTicketQuantity: (eventId) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === eventId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) } // Aldrig under 1
            : item
        )
        .filter((item) => item.quantity > 0), // Fjern helt hvis 0
    })),

  // Fjerner et event helt fra kurven (sjældent brugt, da vi kun har ét event)
  removeEventFromCart: (eventId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== eventId),
    })),

  // Rydder hele kurven
  clearCart: () => set({ items: [] }),
}));

export default useCartStore;
