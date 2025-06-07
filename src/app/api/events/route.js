// src/app/api/events/route.js (Denne fil er for POST-anmodninger til /api/events)

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Importer din eksisterende createEvent funktion fra din api.js fil
import { createEvent } from "@/lib/api"; // <--- Tjek denne sti!

export async function POST(request) {
  const eventData = await request.json(); // Læser body'en fra POST-anmodningen

  try {
    // 1. Opret eventet i din eksterne database via din eksisterende 'createEvent' funktion.
    const newEvent = await createEvent(eventData);

    // 2. Efter at eventet er oprettet succesfuldt i databasen:
    //    Fortæl Next.js, at cachen for dashboard-siden skal ryddes.
    revalidatePath("/dashboard");

    // Send et succesfuldt svar tilbage til klienten
    return NextResponse.json(newEvent, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Fejl ved oprettelse af event via Next.js API-rute:", error);
    // Send et fejlssvar tilbage til klienten
    return NextResponse.json(
      { message: "Fejl ved oprettelse af event", error: error.message },
      { status: 500 }
    );
  }
}
