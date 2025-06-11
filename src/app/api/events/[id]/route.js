// src/app/api/events/[id]/route.js

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Importer din updateEvent funktion fra din api.js fil i lib-mappen.
// Stien her er korrekt, hvis din api.js ligger i src/lib/api.js
import { updateEvent } from "@/lib/api"; // <--- Tjek denne sti!

export async function PATCH(request, { params }) {
  const { id } = params;
  const eventData = await request.json();

  try {
    const updatedEvent = await updateEvent(id, eventData); // Kalder din eksisterende funktion til at opdatere databasen

    revalidatePath("/dashboard"); // Rydder cachen for dashboard-siden
    revalidatePath(`/events/${id}`); // Rydder cachen for den specifikke event-detaljeside (hvis den findes)

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Fejl ved opdatering af event via Next.js API-rute:", error);
    return NextResponse.json(
      { message: "Fejl ved opdatering af event", error: error.message },
      { status: 500 }
    );
  }
}
