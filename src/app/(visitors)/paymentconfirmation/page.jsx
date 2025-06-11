// src/app/payment-confirmation/page.jsx
"use client";

import CustomButton from "@/components/global/CustomButton";
import OpacityTextBox from "@/components/global/OpacityTextBox";

import useCartStore from "@/stores/ticketStore";
import { useRouter } from "next/navigation";

export default function PaymentConfirmation() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  const confirmedEventDetails = items.length > 0 ? items[0] : null;

  if (confirmedEventDetails?.artImgs) {
    if (confirmedEventDetails.artImgs.length > 0) {
    }
  }

  const dynamicBackgroundColor =
    confirmedEventDetails?.artImgs?.[0]?.suggested_bg_color || "#000000";

  const dynamicImageUrl = confirmedEventDetails?.artImgs?.[0]?.imageUrl;

  const receiptContent = confirmedEventDetails
    ? `Event: ${confirmedEventDetails.title}
Antal billetter: ${confirmedEventDetails.quantity}
Totalpris: ${
        confirmedEventDetails.quantity * confirmedEventDetails.pricePerTicket
      } DKK`
    : "Ingen købsdetaljer fundet.";

  const handleGoHome = () => {
    clearCart();

    router.push("/");
  };

  return (
    <>
      {/* RETTELSE HER: Brug backgroundImage som i EventView */}
      <div
        className="home-background-wrapper w-full h-screen overflow-hidden absolute inset-0 z-0"
        style={{
          backgroundImage: dynamicImageUrl ? `url(${dynamicImageUrl})` : "none",
          backgroundColor: dynamicBackgroundColor,
          backgroundSize: "",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition:
            "background-image 0.5s ease-in-out, background-color 0.5s ease-in-out",
        }}
      ></div>

      <main className="halfbleed col-[1/3] relative z-2">
        <section
          className="col-1 row-1 mt-(--space-4rem) pt-(--space-4rem) pl-(--space-4rem)"
          style={{ backgroundColor: dynamicBackgroundColor }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">
            Tak for din bestilling!
          </h2>

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
