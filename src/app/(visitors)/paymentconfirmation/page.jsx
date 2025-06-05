"use client";

import CustomButton from "@/components/global/CustomButton";
import OpacityTextBox from "@/components/global/OpacityTextBox";
import Image from "next/image";
import { useEffect, useState } from "react";
import useCartStore from "@/stores/ticketStore";
import { useRouter } from "next/navigation";

export default function PaymentConfirmation() {
  const mockBackgroundColor = "#401F0C";
  const { items, clearCart } = useCartStore();
  const [confirmedEventDetails, setConfirmedEventDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log(
      "[PaymentConfirmation] useEffect kører. Items i kurven ved start:",
      items
    );
    if (items.length > 0) {
      const eventToConfirm = items[0];
      setConfirmedEventDetails(eventToConfirm);
      console.log(
        "[PaymentConfirmation] Bekræftet event detaljer sat:",
        eventToConfirm.title
      );
    } else {
      setConfirmedEventDetails(null);
      console.log("[PaymentConfirmation] Ingen købsdetaljer fundet i kurven.");
    }
  }, [items, router]);

  const imageUrl =
    "https://iip-thumb.smk.dk/iiif/jp2/9g54xm869_KMS1-cropped.tif.jp2/full/!1024,/0/default.jpg";

  const receiptContent = confirmedEventDetails
    ? `Event: ${confirmedEventDetails.title}
Antal billetter: ${confirmedEventDetails.quantity}
Totalpris: ${confirmedEventDetails.quantity * confirmedEventDetails.pricePerTicket} DKK`
    : "Ingen købsdetaljer fundet.";

  console.log("[PaymentConfirmation] receiptContent:", receiptContent);

  const handleGoHome = () => {
    clearCart();
    console.log(
      "[PaymentConfirmation] Kurv ryddet ved 'Tilbage til forsiden' klik."
    );
    router.push("/");
  };

  return (
    <>
      <div className="home-background-wrapper h-[100%]  ">
        <Image
          src={imageUrl}
          alt="Maleri fra Statens Museum for Kunst"
          width={500}
          height={500}
          className=" w-full h-full object-cover"
          priority
        />
      </div>

      <main className="halfbleed col-[1/3]">
        <section
          className="col-1 row-1 z-10 mt-(--space-4rem) pt-(--space-4rem) pl-(--space-4rem)"
          style={{ backgroundColor: mockBackgroundColor }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">
            Tak for din bestilling!
          </h2>
          <p className="text-lg mb-6 text-white">
            Bekræftelse tilsendt til din email.
          </p>

          <CustomButton text="Tilbage til forsiden" onClick={handleGoHome} />
        </section>
        <aside className="col-2 row-1 justify-self-center mt-20">
          <OpacityTextBox
            title="Kvittering"
            content={receiptContent}
            className="mt-16"
          />
        </aside>
      </main>
    </>
  );
}
