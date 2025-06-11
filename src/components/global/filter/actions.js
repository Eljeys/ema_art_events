// src/components/global/filter/actions.js
"use server";
// Importér KUN den **modificerede** getSMKImg funktion
import { getSMKImg } from "@/lib/api"; // <-- RETTET IMPORT: Skift fra getSMKImagesPaginated til getSMKImg

export async function filterData(prevState, filters) {
  // Omdøbt 'filter' til 'filters' for klarhed

  try {
    // Kald den modificerede getSMKImg, der nu håndterer filtre og en høj 'rows' (limit)
    // Bemærk, at getSMKImg returnerer et objekt { items: [], totalFound: number }
    const result = await getSMKImg(filters); // <-- RETTET KALDT: Brug den opdaterede getSMKImg

    return {
      active: filters, // Returner de aktive filtre, som de blev modtaget
      data: result.items || [], // Returner de faktiske filtrerede elementer
      totalFound: result.totalFound, // Inkluder totalt fundet for konsistens
    };
  } catch (error) {
    console.error("Fejl i filterData action:", error);
    return {
      active: filters,
      data: [],
      error: "Fejl ved filtrering af billeder.",
      totalFound: 0,
    };
  }
}
