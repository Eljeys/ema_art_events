// src/components/global/filter/actions.js
"use server";
// Importér KUN den nye paginerede funktion
import { getSMKImagesPaginated } from "@/lib/api"; // <-- Importér getSMKImagesPaginated

export async function filterData(prevState, filters) {
  // Omdøbt 'filter' til 'filters' for klarhed
  console.log("DEBUG_ACTIONS: Modtagne filtre til handling:", filters);

  try {
    // getSMKImagesPaginated håndterer allerede 'has_image:true' filteret som standard.
    // Vi sender den array af filtre, som `handleFilter` i KuratorGallery.jsx sammensætter.
    // Her kalder vi med offset=0 og limit=100 for at hente den første side af filtrerede resultater.
    const result = await getSMKImagesPaginated(0, 100, "", filters);

    console.log("DEBUG_ACTIONS: Resultat fra getSMKImagesPaginated:", {
      active: filters,
      data: result.items,
      totalFound: result.totalFound,
    });

    return {
      active: filters, // Returner de aktive filtre, som de blev modtaget
      data: result.items, // Returner de faktiske filtrerede elementer
      totalFound: result.totalFound, // Inkluder totalt fundet for konsistens (kan bruges til paginering på klienten)
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
