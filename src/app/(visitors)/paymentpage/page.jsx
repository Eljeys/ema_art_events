// app/paymentpage/page.jsx
"use client";

import Step from "@/components/kurator_create_edit/Step";
import PersonalForm from "@/components/paymentpage/PersonalForm";
import OpacityTextBox from "@/components/global/OpacityTextBox";

import { useEffect, useState } from "react";
import useCartStore from "@/stores/ticketStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PaymentPage() {
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const { items } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (items.length > 0) {
      const eventToDisplay = items[0];
      setSelectedEventDetails(eventToDisplay);
    } else {
      router.push("/events");
    }
  }, [items, router]);

  const handleConfirmPayment = () => {
    router.push("/paymentconfirmation");
  };

  const opacityTextBoxContent = selectedEventDetails
    ? `Event: ${selectedEventDetails.title}\n\n` + // Tilføjet \n
      `Dato: ${selectedEventDetails.date || "N/A"}\n\n` + // Tilføjet \n
      `Sted: ${selectedEventDetails.location?.name || "N/A"}, ${
        selectedEventDetails.location?.address || "N/A"
      }\n\n` + // Tilføjet \n
      `Antal billetter: ${selectedEventDetails.quantity}\n\n` + // Tilføjet \n
      `Pris pr. billet: ${selectedEventDetails.pricePerTicket} DKK` // Fjern `\n` her, da det er den sidste linje
    : "Indlæser eventdetaljer eller ingen events valgt...";

  const mockBackgroundColor = "#401F0C";
  const imageUrl =
    "https://iip-thumb.smk.dk/iiif/jp2/9g54xm869_KMS1-cropped.tif.jp2/full/!1024,/0/default.jpg";

  return (
    <>
      <main className="container mx-auto py-8 z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow md:w-2/3">
            <Step number="1" text="Dine informationer" className="mb-4" />

            <PersonalForm
              className="mt-4"
              onPaymentConfirmed={handleConfirmPayment}
              selectedEventDetails={selectedEventDetails}
            />
          </div>

          <aside className="md:w-1/3">
            <OpacityTextBox
              title="Din ordreoversigt"
              content={opacityTextBoxContent}
              className="h-[15rem] flex-col w-[15rem] leading-relaxed" // <--- TILFØJET: leading-relaxed
            />
          </aside>
        </div>
      </main>
    </>
  );
}
