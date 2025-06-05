// src/components/kurator_create_edit/SmkImageFetcher.jsx
// Dette er en Server Component, så ingen "use client"
import { getSMKImagesPaginated } from "@/lib/api"; // Importér den NYE funktion
import KuratorGallery from "./KuratorGallery";
import SelectedImagesPreview from "./SelectedImagesPreview";

// Denne komponent er en asynkron Server Component
export default async function SmkImageFetcher({
  categories,
  maxImages,
  locationSelected,
  selectedImages, // Array af IDs (f.eks. ['KMSst1', 'KMSst2']) fra KuratorForm
  setSelectedImages, // Funktion til at opdatere selectedImages state fra KuratorForm
}) {
  let initialSmkImages = [];
  let totalSmkImagesFound = 0;
  let imageError = null;

  try {
    // Kald den nye paginerede funktion for at hente den første side
    const result = await getSMKImagesPaginated(0, 100); // Hent de første 100 billeder

    initialSmkImages = result.items;
    totalSmkImagesFound = result.totalFound;

    console.log(
      `DEBUG_SmkImageFetcher: Initialt hentet ${initialSmkImages.length} billeder. Totalt fundet: ${totalSmkImagesFound}`
    );
    if (initialSmkImages.length === 0 && totalSmkImagesFound > 0) {
      // Edge case: API returnerede 0 for første side, men siger der er flere.
      // Dette kan ske hvis den første side ikke har billeder, men fx side 2 har.
      // For nu antager vi, at 0 items betyder ingen fundet.
      imageError = "Ingen billeder fundet for initial visning.";
    } else if (initialSmkImages.length === 0 && totalSmkImagesFound === 0) {
      imageError = "Ingen billeder fundet fra SMK API.";
    }
  } catch (error) {
    console.error(
      "Fejl ved hentning af SMK billeder i SmkImageFetcher:",
      error
    );
    imageError = "Fejl ved indlæsning af billeder.";
  }

  return (
    <>
      {/* SelectedImagesPreview modtager IKKE alle billeder mere.
          Den skal nu hente de specifikke billeder, der matcher selectedImageIds,
          eller få dem sendt med fra KuratorForm, hvis de allerede er i kontekst.
          For at undgå serverkald her, skal den stadig filtrere på client-side.
          Da vi ikke har en direkte 'allItems' at sende ned til SelectedImagesPreview fra SmkImageFetcher,
          og vi vil undgå serverkald for hvert valgt billede, er den bedste løsning,
          at SelectedImagesPreview får `allSmkImages` fra KuratorGallery (når den er loadet)
          eller at KuratorGallery sender `selectedImageObjects` op til KuratorForm,
          som så sender dem til SelectedImagesPreview.
          
          For at simplificere og bevare "ingen useEffect i KuratorForm" for data hentning,
          laver vi om på SelectedImagesPreview igen. SelectedImagesPreview skal
          modtage de *objekter*, der er valgt, ikke kun ID'erne og alle billeder.
          Dette betyder, at KuratorGallery skal filtrere og sende de valgte objekter op.
      */}
      {/* TEMP FIX: SelectedImagesPreview kan stadig ikke fungere optimalt uden alle billeder.
          For nu, lad os fokusere på galleriet og løse SelectedImagesPreview separat
          hvis det stadig er et problem efter galleriet virker.
          Alternativt kan SelectedImagesPreview kalde getArtworkByEventID for hvert valgt ID,
          men det er mange individuelle kald.
          
          For nu, lad os antage, at KuratorGallery vil give de objekter til SelectedImagesPreview.
          Eller vi sender `initialSmkImages` ned til SelectedImagesPreview, og den filtrerer på den.
          MEN hvad så med valgte billeder, der ikke er i `initialSmkImages`?
          
          Den mest robuste løsning: SelectedImagesPreview kalder `getArtworkByEventID` for hvert `selectedImageId`.
          Dette giver præcis de data, den har brug for, uden at sende 54k billeder.
          **Dette betyder, at SelectedImagesPreview skal køre `use client` og have en `useEffect` til at hente dataen.**
          Det er en undtagelse, da den kun henter specifikke data og ikke alle.
          
          Vi ændrer SelectedImagesPreview i trin 4.
      */}
      <SelectedImagesPreview
        selectedImageIds={selectedImages} // Sender kun ID'erne
        setSelectedImages={setSelectedImages}
        // allSmkImages={initialSmkImages} // <-- Vi kan ikke sende dette, da det kun er en delmængde.
        // SelectedImagesPreview skal selv hente.
      />

      {/* Viser galleriet */}
      {imageError ? (
        <p className="text-red-500">{imageError}</p>
      ) : (
        <KuratorGallery
          // Send de initialt hentede billeder og det totale antal
          initialSmkImages={initialSmkImages}
          totalSmkImages={totalSmkImagesFound}
          categories={categories}
          maxImages={maxImages}
          locationSelected={locationSelected}
          selectedImages={selectedImages} // Disse er stadig ID'erne her
          setSelectedImages={setSelectedImages}
        />
      )}
    </>
  );
}
